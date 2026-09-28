/*
 * Shared pieces of the 1-bit look: the palette, ordered dithering, text
 * rasterisation into cell masks, and the glyph tone ramp.
 *
 * Everything here is browser-only apart from the constants; call the
 * functions from effects, never during render.
 */

export const COLORS = { bg: "#07090d", fg: "#d6ecff", dim: "#8398ad" } as const;
export const FG: readonly [number, number, number] = [214, 236, 255];
export const BG: readonly [number, number, number] = [7, 9, 13];

/** RGBA bytes packed for a little-endian Uint32Array view over ImageData. */
export const pack = (c: readonly number[]) => ((255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0;
export const PFG = pack(FG);
export const PBG = pack(BG);

/** 8x8 ordered-dither thresholds in (0, 1). */
export const BAYER8: Float32Array = (() => {
    let m: number[][] = [[0]];
    for (let n = 1; n < 8; n *= 2) {
        const next = Array.from({ length: n * 2 }, () => new Array<number>(n * 2).fill(0));
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                const v = m[y][x] * 4;
                next[y][x] = v;
                next[y][x + n] = v + 2;
                next[y + n][x] = v + 3;
                next[y + n][x + n] = v + 1;
            }
        }
        m = next;
    }
    return Float32Array.from(m.flat(), (v) => (v + 0.5) / 64);
})();
export const bayer = (x: number, y: number) => BAYER8[(y & 7) * 8 + (x & 7)];

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export function hashStr(s: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/** Integer hash of a cell, for picking between equivalent glyphs. */
export function ihash(x: number, y: number): number {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
}

/** mulberry32 */
export function rng(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export const isCJK = (s: string) => /[　-鿿＀-￯]/.test(s);

export const CJK_FAMILY =
    '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", "Noto Sans SC", sans-serif';

export const reducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const pixelRatio = () => Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);

/** A font family list from a next/font CSS variable, usable in canvas font strings. */
function cssFamily(variable: string, fallback: string): string {
    if (typeof document === "undefined") return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return v ? `${v}, ${fallback}` : fallback;
}
export const monoFamily = () => cssFamily("--font-mono", "monospace");
export const pixelFamily = () => cssFamily("--font-pixel", "monospace");

const fontLoads = new Map<string, Promise<unknown>>();
/** Resolves once the given faces are loaded, or after `ms`, whichever is first. */
export function fontsReady(specs: string[], ms = 1500): Promise<unknown> {
    if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
    const all = Promise.all(
        specs.map((s) => {
            let p = fontLoads.get(s);
            if (!p) {
                p = document.fonts.load(s).catch(() => null);
                fontLoads.set(s, p);
            }
            return p;
        }),
    );
    return Promise.race([all, new Promise((r) => setTimeout(r, ms))]).catch(() => null);
}

/* ---------------- text -> 1-bit cell mask ---------------- */

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
    const tokens = text.match(/[　-鿿＀-￯]|[^\s　-鿿＀-￯]+|\s+/g) ?? [];
    const lines: string[] = [];
    let cur = "";
    for (const tk of tokens) {
        const test = cur + tk;
        if (ctx.measureText(test).width > maxW && cur.trim()) {
            lines.push(cur.trimEnd());
            cur = /^\s+$/.test(tk) ? "" : tk;
        } else {
            cur = test;
        }
    }
    if (cur.trim()) lines.push(cur.trimEnd());
    return lines.length ? lines : [text];
}

export type Mask = { w: number; h: number; data: Uint8Array };

/**
 * Rasterise text at `px` so that one canvas pixel becomes one cell. CJK wraps
 * anywhere, Latin at spaces; a single word that is too wide shrinks instead.
 */
export function rasterize(
    text: string,
    { family, weight = 700, px = 16, maxCols = 200, lineH = 1.25, threshold = 110 }:
        { family: string; weight?: number; px?: number; maxCols?: number; lineH?: number; threshold?: number },
): Mask {
    const c = document.createElement("canvas");
    const x = c.getContext("2d", { willReadFrequently: true })!;
    const setFont = () => { x.font = `${weight} ${px}px ${family}`; };
    setFont();
    const widest = (ls: string[]) => Math.ceil(Math.max(...ls.map((l) => x.measureText(l).width)));
    let lines = wrapText(x, text, maxCols - 2);
    let w = widest(lines);
    if (w > maxCols - 2) {
        px = Math.max(6, Math.floor((px * (maxCols - 2)) / w));
        setFont();
        lines = wrapText(x, text, maxCols - 2);
        w = widest(lines);
    }
    const m = x.measureText(isCJK(text) ? "国" : "HG");
    const asc = m.actualBoundingBoxAscent || px * 0.88;
    const desc = m.actualBoundingBoxDescent || px * 0.12;
    const lh = Math.ceil(Math.max(px * lineH, asc + desc + 1));
    const W = Math.min(maxCols, w + 2);
    const H = lh * lines.length + 2;
    c.width = W;
    c.height = H;
    setFont();
    x.fillStyle = "#fff";
    x.textBaseline = "alphabetic";
    lines.forEach((l, i) => x.fillText(l, 1, 1 + i * lh + (lh - (asc + desc)) / 2 + asc));
    const d = x.getImageData(0, 0, W, H).data;
    const data = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) data[i] = d[i * 4 + 3] > threshold ? 1 : 0;
    return { w: W, h: H, data };
}

/* ---------------- glyph tone ramp ---------------- */

export type Ramp = { levels: string[][]; N: number; K: number; chars: string; index: Map<string, number> };

const ASCII = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i));
let rampPromise: Promise<Ramp> | null = null;

/**
 * Printable ASCII ordered by how much ink each glyph actually puts in its
 * cell, measured from the loaded mono face, then quantised to N tone levels.
 */
export function ramp(): Promise<Ramp> {
    if (rampPromise) return rampPromise;
    rampPromise = (async () => {
        const family = monoFamily();
        await fontsReady([`500 16px ${family}`]);
        const cw = 20, ch = 34;
        const c = document.createElement("canvas");
        c.width = cw;
        c.height = ch;
        const x = c.getContext("2d", { willReadFrequently: true })!;
        x.font = `500 27px ${family}`;
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillStyle = "#fff";
        const cov: [string, number][] = [];
        for (const g of ASCII) {
            if ("_|\\/-~^".includes(g)) continue; // directional glyphs streak across flat areas
            x.clearRect(0, 0, cw, ch);
            x.fillText(g, cw / 2, ch / 2 + 1);
            const d = x.getImageData(0, 0, cw, ch).data;
            let s = 0;
            for (let i = 3; i < d.length; i += 4) s += d[i];
            cov.push([g, s / (255 * cw * ch)]);
        }
        cov.sort((a, b) => a[1] - b[1]);
        const max = cov[cov.length - 1][1];
        const N = 14, K = 1;
        const levels: string[][] = [[" "]];
        for (let k = 1; k < N; k++) {
            const t = (k / (N - 1)) * max;
            levels.push(
                cov.slice().sort((a, b) => Math.abs(a[1] - t) - Math.abs(b[1] - t)).slice(0, K).map((a) => a[0]),
            );
        }
        const chars = Array.from(new Set(levels.flat())).join("");
        return { levels, N, K, chars, index: new Map(Array.from(chars).map((g, i) => [g, i])) };
    })();
    return rampPromise;
}

/** The ramp as an N x K RGBA texture whose red channel is the atlas index. */
export function rampData(R: Ramp): Uint8Array {
    const d = new Uint8Array(R.N * R.K * 4);
    R.levels.forEach((lv, n) => lv.forEach((g, k) => {
        const i = (k * R.N + n) * 4;
        d[i] = R.index.get(g) ?? 0;
        d[i + 3] = 255;
    }));
    return d;
}

/** White glyphs on transparent, 16 per row, one cell each. */
export function makeAtlas(chars: string, cw: number, ch: number, font: string) {
    const list = Array.from(chars), cols = 16, rows = Math.ceil(list.length / cols);
    const c = document.createElement("canvas");
    c.width = cols * cw;
    c.height = rows * ch;
    const x = c.getContext("2d")!;
    x.fillStyle = "#fff";
    x.font = font;
    x.textAlign = "center";
    x.textBaseline = "middle";
    list.forEach((g, i) => x.fillText(g, (i % cols) * cw + cw / 2, Math.floor(i / cols) * ch + ch / 2 + ch * 0.04));
    return { canvas: c, cols, rows };
}

/* ---------------- procedural fields for covers ---------------- */

export type Field = (u: number, v: number, aspect: number) => number;

/** Five small lit shapes, picked by `kind`, varied by `seed`. */
export function makeField(kind: number, seed: string): Field {
    const r = rng(hashStr(seed)), pa = r() * 6.28, pb = r(), pc = r();
    return (u, v, ar) => {
        switch (kind % 5) {
            case 0: {
                const cx = 0.5 + (pb - 0.5) * 0.3, rr = 0.36, dx = (u - cx) * ar, dy = v - 0.55, q = dx * dx + dy * dy;
                if (q < rr * rr) {
                    const nz = Math.sqrt(rr * rr - q) / rr;
                    return Math.max(0, (dx / rr) * Math.cos(pa) * 0.6 - (dy / rr) * 0.45 + nz * 0.6);
                }
                return 0.05 + 0.12 * (1 - v);
            }
            case 1: {
                const dx = (u - 0.5) * ar, dy = v - 0.5, rad = Math.sqrt(dx * dx + dy * dy);
                return (0.5 + 0.5 * Math.sin(rad * (18 + pb * 20))) * (1 - Math.min(1, rad * 1.4));
            }
            case 2:
                return (0.5 + 0.5 * Math.sin(u * (8 + pc * 10) + Math.sin(v * 6 + pa) * 2.2 + pa)) * (0.3 + 0.7 * v);
            case 3: {
                const dx = ((u - 0.5) * ar) / 0.42, dy = (v - 0.5) / 0.15, e = Math.sqrt(dx * dx + dy * dy);
                return Math.exp(-Math.pow((e - 1) / 0.2, 2)) * (dy < 0 ? 0.62 : 1) + 0.03;
            }
            default:
                return ((Math.sin(u * 12 + pa) * Math.cos(v * 9) + 1) * 0.5) * (1 - Math.abs(u - 0.5) * 1.2);
        }
    };
}

/* ---------------- images ---------------- */

/** Atkinson error diffusion; `g` holds 0..255 and is consumed. */
export function atkinson(g: Float32Array, w: number, h: number): Uint8Array {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = y * w + x, o = g[i], n = o < 128 ? 0 : 255, e = (o - n) / 8;
            out[i] = n ? 1 : 0;
            if (x + 1 < w) g[i + 1] += e;
            if (x + 2 < w) g[i + 2] += e;
            if (y + 1 < h) {
                if (x > 0) g[i + w - 1] += e;
                g[i + w] += e;
                if (x + 1 < w) g[i + w + 1] += e;
            }
            if (y + 2 < h) g[i + 2 * w] += e;
        }
    }
    return out;
}

/** 2nd and 98th percentile of luminance, so dark screenshots still use the full ramp. */
export function lumaRange(img: CanvasImageSource): [number, number] {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 36;
    const x = c.getContext("2d", { willReadFrequently: true })!;
    x.drawImage(img, 0, 0, 64, 36);
    const d = x.getImageData(0, 0, 64, 36).data, L: number[] = [];
    for (let i = 0; i < d.length; i += 4) L.push((0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255);
    L.sort((a, b) => a - b);
    return [L[Math.floor(L.length * 0.02)], L[Math.floor(L.length * 0.98)]];
}
