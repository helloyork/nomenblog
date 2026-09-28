"use client";

import { useEffect, useRef } from "react";
import { BAYER8, PBG, reducedMotion } from "@lib/glyph/core";

/*
 * The page transition: the old page dissolves into the background along an
 * 8x8 Bayer order, the route swaps underneath, and the new page dissolves in.
 * One overlay canvas below the menu bar; the transition drives it through
 * `dissolve.cover()` and `dissolve.reveal()`.
 */

let canvas: HTMLCanvasElement | null = null;
let covered = false;
let run = 0;

function frame(p: number, cover: boolean) {
    const cv = canvas;
    if (!cv) return;
    const W = cv.width, H = cv.height, x = cv.getContext("2d")!, img = x.createImageData(W, H), d = new Uint32Array(img.data.buffer);
    for (let y = 0; y < H; y++) {
        for (let i = 0; i < W; i++) {
            const th = BAYER8[(y & 7) * 8 + (i & 7)];
            d[y * W + i] = (cover ? th < p : th >= p) ? PBG : 0;
        }
    }
    x.putImageData(img, 0, 0);
}

function animate(cover: boolean, ms: number): Promise<void> {
    const cv = canvas;
    if (!cv || reducedMotion()) return Promise.resolve();
    const id = ++run;
    cv.width = Math.ceil(window.innerWidth / 4);
    cv.height = Math.ceil(window.innerHeight / 4);
    cv.style.display = "block";
    frame(0, cover); // first frame now, so there is never a gap before the route swaps
    return new Promise((resolve) => {
        const start = performance.now();
        const done = () => {
            if (id === run && !cover) cv.style.display = "none";
            resolve();
        };
        const tick = (now: number) => {
            if (id !== run) return resolve();
            const k = Math.min(1, (now - start) / ms);
            frame(k, cover);
            if (k < 1) requestAnimationFrame(tick);
            else done();
        };
        requestAnimationFrame(tick);
        // a hidden tab pauses requestAnimationFrame; the route must not wait on it
        setTimeout(done, ms + 400);
    });
}

export const dissolve = {
    cover(ms = 240) {
        covered = true;
        const p = animate(true, ms);
        // if no page ever mounts to reveal itself, do not leave the screen covered
        p.then(() => setTimeout(() => { if (covered) dissolve.reveal(); }, 1500));
        return p;
    },
    reveal(ms = 300) {
        if (!covered) return Promise.resolve();
        covered = false;
        return animate(false, ms);
    },
};

export default function DissolveOverlay() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        canvas = ref.current;
        return () => { canvas = null; };
    }, []);
    return <canvas ref={ref} className="n-dissolve" aria-hidden="true" />;
}
