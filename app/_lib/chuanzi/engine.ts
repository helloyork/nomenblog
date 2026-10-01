import { EM_TOP, type Glyph } from "./types";

/*
 * Drawing titles from their glyph outlines and finding the point the camera
 * dives into. Shared by the home stage and the route transition. Font units:
 * 1000 per em, y down, baseline 0.
 */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const sstep = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function sansFamily(): string {
    if (typeof document === "undefined") return "sans-serif";
    const v = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim();
    return v ? `${v}, "Noto Sans SC", sans-serif` : '"Noto Sans SC", sans-serif';
}

/** TrueType contour: quadratic, with implied on-curve points between two off-curve points. */
export function addQuad(path: Path2D, c: number[][], ox = 0) {
    const n = c.length;
    const s = c.findIndex((p) => p[2]);
    if (s < 0 || n < 2) return;
    const P = (i: number) => c[((i % n) + n) % n];
    path.moveTo(P(s)[0] + ox, P(s)[1]);
    for (let k = 1; k <= n; k++) {
        const p = P(s + k);
        if (p[2]) { path.lineTo(p[0] + ox, p[1]); continue; }
        const q = P(s + k + 1);
        if (q[2]) { path.quadraticCurveTo(p[0] + ox, p[1], q[0] + ox, q[1]); k++; }
        else path.quadraticCurveTo(p[0] + ox, p[1], (p[0] + q[0]) / 2 + ox, (p[1] + q[1]) / 2);
    }
    path.closePath();
}

export function glyphPath(g: Glyph): Path2D {
    const p = new Path2D();
    g.cs?.forEach((c) => addQuad(p, c));
    return p;
}

const CJK = /[⺀-鿿豈-﫿＀-￯　-〿]/;
const NO_START = /[，。、：；！？）」』】》〉,.;:!?)\]}%]/;

/** Greedy line breaking in font units: CJK breaks anywhere, Latin by word, closing punctuation never starts a line. */
export function breakLines(glyphs: Glyph[], maxUnits: number): { g: Glyph; x: number }[][] {
    const words: Glyph[][] = [];
    let cur: Glyph[] = [];
    for (const g of glyphs) {
        if (g.ch === " ") { if (cur.length) words.push(cur); words.push([g]); cur = []; continue; }
        if (CJK.test(g.ch)) {
            if (cur.length && !NO_START.test(g.ch)) { words.push(cur); cur = []; }
            cur.push(g);
            if (!NO_START.test(g.ch)) { words.push(cur); cur = []; }
            continue;
        }
        if (cur.length && CJK.test(cur[cur.length - 1].ch)) { words.push(cur); cur = []; }
        cur.push(g);
    }
    if (cur.length) words.push(cur);

    const lines: { g: Glyph; x: number }[][] = [];
    let line: { g: Glyph; x: number }[] = [], x = 0;
    const width = (w: Glyph[]) => w.reduce((s, g) => s + g.adv, 0);
    for (const w of words) {
        const ww = width(w);
        if (w[0].ch === " ") { if (line.length) { line.push({ g: w[0], x }); x += ww; } continue; }
        if (line.length && x + ww > maxUnits) {
            while (line.length && line[line.length - 1].g.ch === " ") line.pop();
            lines.push(line); line = []; x = 0;
        }
        for (const g of w) { line.push({ g, x }); x += g.adv; }
    }
    while (line.length && line[line.length - 1].g.ch === " ") line.pop();
    if (line.length) lines.push(line);
    return lines;
}

// ---------- the deepest point ----------

/** Chamfer distance transform over `inside`, returning the deepest pixel and its depth. */
function deepestOf(inside: Uint8Array, N: number) {
    const d = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) d[i] = inside[i] ? 1e9 : 0;
    const D2 = 1.4142;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x; if (!d[i]) continue;
        let v = d[i];
        v = Math.min(v, x > 0 ? d[i - 1] + 1 : 1);
        if (y > 0) { v = Math.min(v, d[i - N] + 1); if (x > 0) v = Math.min(v, d[i - N - 1] + D2); if (x < N - 1) v = Math.min(v, d[i - N + 1] + D2); } else v = Math.min(v, 1);
        d[i] = v;
    }
    for (let y = N - 1; y >= 0; y--) for (let x = N - 1; x >= 0; x--) {
        const i = y * N + x; if (!d[i]) continue;
        let v = d[i];
        v = Math.min(v, x < N - 1 ? d[i + 1] + 1 : 1);
        if (y < N - 1) { v = Math.min(v, d[i + N] + 1); if (x < N - 1) v = Math.min(v, d[i + N + 1] + D2); if (x > 0) v = Math.min(v, d[i + N - 1] + D2); } else v = Math.min(v, 1);
        d[i] = v;
    }
    let best = 0, bi = -1;
    for (let i = 0; i < N * N; i++) if (d[i] > best) { best = d[i]; bi = i; }
    return { x: (bi % N) + 0.5, y: ((bi / N) | 0) + 0.5, r: best };
}

export type Target = { x: number; y: number; r: number };

/** Where to dive into a single glyph, in its own font units: the thickest part of a stroke. */
export function glyphStroke(g: Glyph, path: Path2D): Target | null {
    if (!g.cs || !g.cs.length) return null;
    const N = 160, S = N / 1000;
    const cv = document.createElement("canvas");
    cv.width = cv.height = N;
    const x = cv.getContext("2d", { willReadFrequently: true })!;
    x.setTransform(S, 0, 0, S, ((1000 - g.adv) / 2) * S, -EM_TOP * S);
    x.fill(path, "nonzero");
    const a = x.getImageData(0, 0, N, N).data;
    const ink = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) ink[i] = a[i * 4 + 3] > 127 ? 1 : 0;
    const t = deepestOf(ink, N);
    return t.r > 0 ? { x: t.x / S - (1000 - g.adv) / 2, y: t.y / S + EM_TOP, r: t.r / S } : null;
}

/** Same idea for text drawn by the browser: a raster of what is on screen, in its own pixels. */
export function rasterTarget(alpha: Uint8ClampedArray, w: number, h: number, mode: "stroke" | "counter"): Target | null {
    const N = Math.max(w, h);
    const inside = new Uint8Array(N * N);
    const ink = (x: number, y: number) => x < w && y < h && alpha[(y * w + x) * 4 + 3] > 127;
    if (mode === "stroke") {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) inside[y * N + x] = ink(x, y) ? 1 : 0;
    } else {
        // paper between and inside the characters, away from the box edge
        for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) inside[y * N + x] = ink(x, y) ? 0 : 1;
    }
    const t = deepestOf(inside, N);
    return t.r > 0 ? t : null;
}

// ---------- camera ----------

/** S' = T2 + (S - T) * z, in screen pixels. */
export type Cam = { z: number; T: [number, number]; T2: [number, number] };

/** The dive: zoom grows exponentially until a circle of radius r fills the screen, while the target slides to the centre. */
export function diveCam(T: [number, number], r: number, e: number, W: number, H: number): Cam {
    const z1 = Math.hypot(W, H) / 2 / Math.max(1, 0.78 * r);
    const f = sstep(0, 0.5, e);
    return { z: Math.pow(z1, e), T, T2: [lerp(T[0], W / 2, f), lerp(T[1], H / 2, f)] };
}

/** The same dive held on one spot: the target stays where it is on screen and the zoom grows around it. */
export function zoomCam(T: [number, number], r: number, e: number, W: number, H: number): Cam {
    const far = Math.max(Math.hypot(T[0], T[1]), Math.hypot(W - T[0], T[1]), Math.hypot(T[0], H - T[1]), Math.hypot(W - T[0], H - T[1]));
    return { z: Math.pow(far / Math.max(0.5, r), e), T, T2: T };
}

// ---------- a laid-out title ----------

export type Placed = { g: Glyph; path: Path2D; gx: number; by: number };

/** A title set at `s` px per font unit, in local CSS pixels. */
export type Heading = {
    s: number;
    placed: Placed[];
    width: number;
    height: number;
    stroke: Target | null;   // local px
};

export function layoutHeading(glyphs: Glyph[], maxWidth: number, em: number, lineGap = 0.2): Heading {
    const s = em / 1000;
    const lines = breakLines(glyphs, maxWidth / s);
    const placed: Placed[] = [];
    let width = 0;
    lines.forEach((line, li) => {
        const by = (-EM_TOP + li * (1000 + lineGap * 1000)) * s;
        for (const { g, x } of line) {
            if (g.ch !== " ") placed.push({ g, path: glyphPath(g), gx: x * s, by });
            width = Math.max(width, (x + g.adv) * s);
        }
    });
    const height = lines.length ? (lines.length * 1000 + (lines.length - 1) * lineGap * 1000) * s : 0;

    // dive into the glyph with the deepest stroke
    let stroke: Target | null = null;
    for (const p of placed) {
        const t = glyphStroke(p.g, p.path);
        if (t && (!stroke || t.r * s > stroke.r)) stroke = { x: p.gx + t.x * s, y: p.by + t.y * s, r: t.r * s * 0.92 };
    }
    return { s, placed, width, height, stroke };
}

/** Fill a heading at screen position (ox, oy), seen through camera `cam`. */
export function drawHeading(ctx: CanvasRenderingContext2D, h: Heading, ox: number, oy: number, cam: Cam, dpr: number, fg: string, alpha = 1) {
    const k = cam.z * h.s, fam = sansFamily();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fg;
    for (const p of h.placed) {
        ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * (cam.T2[0] + (ox + p.gx - cam.T[0]) * cam.z), dpr * (cam.T2[1] + (oy + p.by - cam.T[1]) * cam.z));
        if (p.g.cs) ctx.fill(p.path, "nonzero");
        else { ctx.font = `900 1000px ${fam}`; ctx.textBaseline = "alphabetic"; ctx.fillText(p.g.ch, 0, 0); }
    }
    ctx.restore();
}
