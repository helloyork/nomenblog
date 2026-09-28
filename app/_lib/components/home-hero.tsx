"use client";

import { useEffect, useRef, useState } from "react";
import { COLORS, clamp, fontsReady, makeAtlas, monoFamily, pixelFamily, pixelRatio, ramp, rampData, reducedMotion } from "@lib/glyph/core";
import { context, lose, program, rgb, texture, upload } from "@lib/glyph/gl";

/** Output of scripts/bake-oc.py; `seat` is where the hips sit, as a fraction of the height. */
const OC = { src: "/static/oc/oc-map.png", w: 377, h: 420, seat: 0.8201 };

// Pass 1 runs once per cell (a glyph cell, or a pixel in pixel mode) and samples the OC map.
const FS_CELLS = `
uniform vec2 uGrid, uCellPx, uLight;
uniform vec4 uArt;
uniform sampler2D uOC;
void main(){
  vec2 cellTL = vec2(floor(gl_FragCoord.x), uGrid.y - 1. - floor(gl_FragCoord.y)) * uCellPx;
  float tone = 0., a = 0., line = 0., mx = 0.;
  for (int j = 0; j < 5; j++) for (int i = 0; i < 5; i++) {
    vec2 uv = (cellTL + (vec2(float(i), float(j)) + .5) / 5. * uCellPx - uArt.xy) / uArt.zw;
    float inb = step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.);
    vec4 s = texture2D(uOC, uv);
    float fa = s.b * inb, ln = s.g * inb;
    tone += s.r * fa; a += fa; line += ln; mx = max(mx, ln);
  }
  tone = a > 0. ? tone / a : 0.; a /= 25.; line /= 25.;
  vec2 uvc = (cellTL + .5 * uCellPx - uArt.xy) / uArt.zw, e = 1.6 * uCellPx / uArt.zw;
  float hl = texture2D(uOC, uvc - vec2(e.x, 0.)).a, hr = texture2D(uOC, uvc + vec2(e.x, 0.)).a;
  float hu = texture2D(uOC, uvc - vec2(0., e.y)).a, hd = texture2D(uOC, uvc + vec2(0., e.y)).a;
  vec3 n = normalize(vec3((hl - hr) * 2.6, (hd - hu) * 2.6, 1.));
  float dif = max(0., dot(n, normalize(vec3(uLight, .9))));
  float lit = clamp(tone * (.6 + .58 * dif), 0., 1.);
  gl_FragColor = vec4(a > .5 ? lit : 0., clamp(mx * .55 + line * .9, 0., 1.), clamp(line * 1.6, 0., 1.), a);
}`;

// Pass 2 runs per screen pixel: a Bayer threshold per cell, or the cell's glyph.
const FS_COMP = `
uniform vec2 uRes, uCell, uGrid, uAtlasGrid, uRampNK;
uniform float uMode;
uniform sampler2D uCells, uAtlas, uRamp, uMask;
uniform vec3 cBg, cFg;
float glyph(float idx, vec2 l){ vec2 g = vec2(mod(idx, uAtlasGrid.x), floor(idx / uAtlasGrid.x)); return texture2D(uAtlas, (g + l) / uAtlasGrid).a; }
void main(){
  vec2 f = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(f / uCell), l = fract(f / uCell), guv = (cell + .5) / uGrid;
  vec4 d = texture2D(uCells, vec2(guv.x, 1. - guv.y));
  float m = texture2D(uMask, guv).r;
  bool fig = d.a > .5, inv = m > .5 && !fig;
  vec3 c;
  if (uMode < .5) {
    // two-sided ramp: bright cells are inverse video, so the drawing keeps its dark lines
    float t = fig ? d.r * (1. - clamp(d.b * 1.5, 0., .85)) : (inv ? .9 : 0.);
    bool hi = t > .5;
    float q = clamp((hi ? 1. - t : t) * 2. + (Bayer4(cell) - .5) / uRampNK.x, 0., .999);
    float idx = floor(texture2D(uRamp, vec2((floor(q * uRampNK.x) + .5) / uRampNK.x, (floor(hash(cell) * uRampNK.y) + .5) / uRampNK.y)).r * 255. + .5);
    float g = glyph(idx, l);
    c = hi ? mix(cFg, cBg, g) : mix(cBg, cFg, g);
  } else {
    bool o = fig && d.r > Bayer8(cell) && d.g < .32;
    if (inv) o = !o;
    c = o ? cFg : cBg;
  }
  gl_FragColor = vec4(c, 1.);
}`;

/**
 * The home hero: the OC sitting on the NOMEN wordmark, reduced to one colour.
 * The pointer is the light source; left alone, the light slowly circles.
 */
export default function HomeHero({ mode = "pixel" }: { mode?: "pixel" | "glyph" }) {
    const host = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const el = host.current;
        if (!el) return;
        // A fresh canvas per mount: a canvas whose context was lost never gets a working one back.
        const cv = document.createElement("canvas");
        cv.setAttribute("aria-hidden", "true");
        el.appendChild(cv);
        const gl = context(cv);
        if (!gl) { cv.remove(); setFailed(true); return; }
        let alive = true, raf = 0;
        let pC: ReturnType<typeof program>, pD: ReturnType<typeof program>;
        try {
            pC = program(gl, FS_CELLS);
            pD = program(gl, FS_COMP);
        } catch (e) {
            console.warn(e);
            lose(gl);
            cv.remove();
            setFailed(true);
            return;
        }
        const units = { oc: 0, cells: 1, atlas: 2, ramp: 3, mask: 4 } as const;
        const T = {
            oc: texture(gl, units.oc, true),
            cells: texture(gl, units.cells),
            atlas: texture(gl, units.atlas),
            ramp: texture(gl, units.ramp),
            mask: texture(gl, units.mask),
        };
        const bind = (k: keyof typeof T) => { gl.activeTexture(gl.TEXTURE0 + units[k]); gl.bindTexture(gl.TEXTURE_2D, T[k]); };
        const fb = gl.createFramebuffer();
        gl.useProgram(pC.p);
        gl.uniform1i(pC.U("uOC"), units.oc);
        gl.useProgram(pD.p);
        gl.uniform1i(pD.U("uCells"), units.cells);
        gl.uniform1i(pD.U("uAtlas"), units.atlas);
        gl.uniform1i(pD.U("uRamp"), units.ramp);
        gl.uniform1i(pD.U("uMask"), units.mask);
        const cb = rgb(COLORS.bg), cf = rgb(COLORS.fg);
        gl.uniform3f(pD.U("cBg"), cb[0], cb[1], cb[2]);
        gl.uniform3f(pD.U("cFg"), cf[0], cf[1], cf[2]);

        const maskC = document.createElement("canvas");
        const mx = maskC.getContext("2d")!;
        let grid: { cols: number; rows: number; ox: number; oy: number; ow: number; oh: number } | null = null;
        let R: Awaited<ReturnType<typeof ramp>> | null = null;

        const layout = () => {
            if (!alive || !R) return;
            const W = el.clientWidth, H = el.clientHeight;
            if (!W || !H) return;
            const glyphs = mode === "glyph", small = W < 700, d = pixelRatio();
            const cw0 = glyphs ? (small ? 4 : 6) : (small ? 2 : 3), ch0 = glyphs ? (small ? 7 : 10) : cw0;
            // whole device pixels per cell, so the canvas is never resampled
            const dw = Math.max(1, Math.round(cw0 * d)), dh = Math.max(1, Math.round(ch0 * d)), cw = dw / d, ch = dh / d;
            const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch);
            cv.width = cols * dw;
            cv.height = rows * dh;
            cv.style.width = `${cols * cw}px`;
            cv.style.height = `${rows * ch}px`;

            upload(gl, units.cells, T.cells, null, cols, rows);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, T.cells, 0);
            const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            if (!ok) { setFailed(true); return; }

            const atlas = makeAtlas(R.chars, dw, dh, `500 ${Math.round(dh * 0.8)}px ${monoFamily()}`);
            upload(gl, units.atlas, T.atlas, atlas.canvas);
            upload(gl, units.ramp, T.ramp, rampData(R), R.N, R.K);

            // wordmark, measured in CSS px and rasterised straight into the cell grid
            const family = pixelFamily();
            const fs = clamp(W * (small ? 0.24 : 0.19), 76, 300), xw = 14, yb = H * 0.9;
            mx.setTransform(1, 0, 0, 1, 0, 0);
            mx.font = `700 ${fs}px ${family}`;
            const tm = mx.measureText("NOMEN"), ww = tm.width, yt = yb - (tm.actualBoundingBoxAscent || fs * 0.7);
            maskC.width = cols;
            maskC.height = rows;
            mx.fillStyle = "#000";
            mx.fillRect(0, 0, cols, rows);
            mx.setTransform(1 / cw, 0, 0, 1 / ch, 0, 0);
            mx.font = `700 ${fs}px ${family}`;
            mx.fillStyle = "#fff";
            mx.textBaseline = "alphabetic";
            mx.fillText("NOMEN", xw, yb);
            upload(gl, units.mask, T.mask, maskC);

            // the OC sits on the right edge of the word; only the last letter is under the legs.
            // A narrow screen sizes it by width, since its hero is only a little taller than wide.
            const ar = OC.w / OC.h;
            const oh = Math.min(small ? W * 0.55 : H * 0.5, (yt - 24) / OC.seat), ow = oh * ar;
            const ox = clamp(xw + ww * 0.97 - ow / 2, 8, Math.max(8, W - ow - 8));
            const oy = yt - oh * OC.seat + oh * 0.012;
            grid = { cols, rows, ox, oy, ow, oh };

            gl.useProgram(pC.p);
            gl.uniform2f(pC.U("uGrid"), cols, rows);
            gl.uniform2f(pC.U("uCellPx"), cw, ch);
            gl.uniform4f(pC.U("uArt"), ox, oy, ow, oh);
            gl.useProgram(pD.p);
            gl.uniform2f(pD.U("uRes"), cv.width, cv.height);
            gl.uniform2f(pD.U("uCell"), dw, dh);
            gl.uniform2f(pD.U("uGrid"), cols, rows);
            gl.uniform2f(pD.U("uAtlasGrid"), atlas.cols, atlas.rows);
            gl.uniform2f(pD.U("uRampNK"), R.N, R.K);
            gl.uniform1f(pD.U("uMode"), glyphs ? 0 : 1);
        };

        const still = reducedMotion();
        const light = { x: 0.9, y: 0.5 }, target = { x: 0, y: 0 };
        let lastMove = -99, last = 0;
        const t0 = performance.now() / 1000;
        const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            target.x = e.clientX - r.left;
            target.y = e.clientY - r.top;
            lastMove = performance.now() / 1000;
        };
        el.addEventListener("pointermove", onMove);

        const frame = (ms: number) => {
            if (!alive) return;
            raf = requestAnimationFrame(frame);
            const g = grid;
            if (!g) return;
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) return;
            const now = ms / 1000, dt = last ? Math.min(0.1, now - last) : 0;
            last = now;
            let lx: number, ly: number;
            if (now - lastMove > 2.5) {
                const a = still ? 0.6 : (now - t0) * 0.35 + 0.6;
                lx = Math.cos(a) * 1.1;
                ly = 0.35 + Math.sin(a) * 0.7;
            } else {
                lx = clamp((target.x - (g.ox + g.ow / 2)) / (g.ow * 0.55), -1.6, 1.6);
                ly = clamp(-(target.y - (g.oy + g.oh * 0.45)) / (g.oh * 0.55), -1.6, 1.6);
            }
            const k = still ? 1 : Math.min(1, dt * 5);
            light.x += (lx - light.x) * k;
            light.y += (ly - light.y) * k;

            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.viewport(0, 0, g.cols, g.rows);
            gl.useProgram(pC.p);
            gl.uniform2f(pC.U("uLight"), light.x, light.y);
            bind("oc");
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, cv.width, cv.height);
            gl.useProgram(pD.p);
            bind("cells"); bind("atlas"); bind("ramp"); bind("mask");
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        const img = new Image();
        img.src = OC.src;
        Promise.all([ramp(), img.decode(), fontsReady([`700 16px ${pixelFamily()}`])])
            .then(([r]) => {
                if (!alive) return;
                R = r;
                upload(gl, units.oc, T.oc, img);
                layout();
                raf = requestAnimationFrame(frame);
            })
            .catch((e) => { console.warn(e); if (alive) setFailed(true); });

        let timer = 0;
        const ro = new ResizeObserver(() => { clearTimeout(timer); timer = window.setTimeout(layout, 120); });
        ro.observe(el);

        return () => {
            alive = false;
            cancelAnimationFrame(raf);
            clearTimeout(timer);
            ro.disconnect();
            el.removeEventListener("pointermove", onMove);
            lose(gl);
            cv.remove();
        };
    }, [mode]);

    return (
        <div ref={host} className="n-hero">
            <h1 className="sr-only">Nomen</h1>
            {failed && <div className="n-hero-word" aria-hidden="true">NOMEN</div>}
        </div>
    );
}
