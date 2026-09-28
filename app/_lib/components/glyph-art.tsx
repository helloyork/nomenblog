"use client";

import { useEffect, useRef } from "react";
import { COLORS, PBG, PFG, BAYER8, bayer, clamp, ihash, makeField, monoFamily, pixelRatio, ramp } from "@lib/glyph/core";

/** A small lit shape drawn in characters, 4:3, filling its parent's width. Static. */
export function GlyphArt({ kind, seed }: { kind: number; seed: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const cv = ref.current, box = cv?.parentElement;
        if (!cv || !box) return;
        const field = makeField(kind, seed);
        let alive = true, lastW = 0, timer = 0;
        const draw = async () => {
            const R = await ramp();
            if (!alive) return;
            const W = box.clientWidth || 360, d = pixelRatio(), cw = 7, ch = 12;
            lastW = W;
            const cols = Math.floor(W / cw), rows = Math.round((cols * cw * 0.75) / ch), dw = cw * d, dh = ch * d;
            cv.width = Math.round(cols * dw);
            cv.height = Math.round(rows * dh);
            const x = cv.getContext("2d")!;
            x.fillStyle = COLORS.bg;
            x.fillRect(0, 0, cv.width, cv.height);
            x.fillStyle = COLORS.fg;
            x.font = `500 ${Math.round(dh * 0.8)}px ${monoFamily()}`;
            x.textAlign = "center";
            x.textBaseline = "middle";
            const ar = (cols * cw) / (rows * ch);
            for (let j = 0; j < rows; j++) {
                for (let i = 0; i < cols; i++) {
                    const L = clamp(field((i + 0.5) / cols, (j + 0.5) / rows, ar) + (BAYER8[(j & 3) * 8 + (i & 3)] - 0.5) / R.N, 0, 0.999);
                    const g = R.levels[Math.floor(L * R.N)][ihash(i, j) % R.K];
                    if (g !== " ") x.fillText(g, (i + 0.5) * dw, (j + 0.54) * dh);
                }
            }
        };
        draw();
        const ro = new ResizeObserver(() => {
            clearTimeout(timer);
            timer = window.setTimeout(() => { if (Math.abs((box.clientWidth || 0) - lastW) > 8) draw(); }, 200);
        });
        ro.observe(box);
        return () => { alive = false; clearTimeout(timer); ro.disconnect(); };
    }, [kind, seed]);

    return <canvas ref={ref} className="n-art" aria-hidden="true" />;
}

/** A 68x42 one-bit thumbnail, ordered-dithered, shown at 2x. Static. */
export function DitherCover({ kind, seed }: { kind: number; seed: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const cv = ref.current;
        if (!cv) return;
        const w = 68, h = 42, field = makeField(kind, seed);
        cv.width = w;
        cv.height = h;
        const x = cv.getContext("2d")!, img = x.createImageData(w, h), d = new Uint32Array(img.data.buffer);
        for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) d[y * w + i] = field(i / w, y / h, w / h) > bayer(i, y) ? PFG : PBG;
        x.putImageData(img, 0, 0);
    }, [kind, seed]);

    return <canvas ref={ref} className="n-cover" aria-hidden="true" />;
}
