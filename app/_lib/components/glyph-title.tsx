"use client";

import { createElement, useEffect, useRef } from "react";
import clsx from "clsx";
import { CJK_FAMILY, COLORS, bayer, clamp, fontsReady, ihash, isCJK, monoFamily, pixelFamily, pixelRatio, ramp, rasterize } from "@lib/glyph/core";

/**
 * A heading drawn as a matrix of characters. The text itself stays in the
 * heading for search engines and screen readers; the canvas is decoration.
 */
export default function GlyphTitle({ text, as = "h1", className }: { text: string; as?: "h1" | "h2"; className?: string }) {
    const host = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = host.current;
        if (!el) return;
        const cv = document.createElement("canvas");
        cv.setAttribute("aria-hidden", "true");
        el.appendChild(cv);
        let alive = true, lastW = 0, timer = 0;

        const build = async () => {
            const cjk = isCJK(text), mono = monoFamily(), pixel = pixelFamily();
            await fontsReady([`700 16px ${mono}`, `700 16px ${pixel}`]);
            const R = await ramp();
            if (!alive) return;
            const avail = el.clientWidth || 700, small = avail < 600;
            lastW = avail;
            const cell = cjk ? (small ? 4 : 5) : (small ? 4 : 6);
            const M = rasterize(text, {
                family: cjk ? CJK_FAMILY : pixel,
                weight: 700,
                px: cjk ? (small ? 12 : 15) : (small ? 18 : 24),
                maxCols: Math.floor(avail / cell),
                lineH: cjk ? 1.3 : 1.12,
                threshold: cjk ? 96 : 110,
            });
            const dpr = pixelRatio(), d = Math.max(3, Math.round(cell * dpr));
            cv.width = M.w * d;
            cv.height = M.h * d;
            cv.style.width = `${(M.w * d) / dpr}px`;
            cv.style.height = `${(M.h * d) / dpr}px`;
            const x = cv.getContext("2d")!;
            x.clearRect(0, 0, cv.width, cv.height);
            x.fillStyle = COLORS.fg;
            x.font = `700 ${Math.round(d * 0.98)}px ${mono}`;
            x.textAlign = "center";
            x.textBaseline = "middle";
            const on = (i: number, j: number) => (i >= 0 && j >= 0 && i < M.w && j < M.h && M.data[j * M.w + i] ? 1 : 0);
            for (let j = 0; j < M.h; j++) {
                for (let i = 0; i < M.w; i++) {
                    if (!on(i, j)) continue;
                    // lit from the upper left; edge cells a little lighter
                    let tone = 1 - 0.3 * ((i / M.w) * 0.7 + (j / M.h) * 0.3);
                    if (on(i - 1, j) + on(i + 1, j) + on(i, j - 1) + on(i, j + 1) < 4) tone *= 0.8;
                    const lv = clamp(Math.round(tone * (R.N - 1) + (bayer(i, j) - 0.5) * 1.5), 1, R.N - 1);
                    x.fillText(R.levels[lv][ihash(i, j) % R.K], (i + 0.5) * d, (j + 0.55) * d);
                }
            }
        };
        build();

        const ro = new ResizeObserver(() => {
            clearTimeout(timer);
            timer = window.setTimeout(() => { if (Math.abs((el.clientWidth || 0) - lastW) > 8) build(); }, 200);
        });
        ro.observe(el);
        return () => {
            alive = false;
            clearTimeout(timer);
            ro.disconnect();
            cv.remove();
        };
    }, [text]);

    return createElement(as, { className: clsx("n-gtitle", className) },
        <span className="sr-only">{text}</span>,
        <span ref={host} className="n-gtitle-art" aria-hidden="true" />,
    );
}
