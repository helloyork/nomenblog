"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { COLORS, lumaRange, makeAtlas, monoFamily, pixelRatio, ramp, rampData, reducedMotion } from "@lib/glyph/core";
import { context, lose, program, rgb, texture, upload } from "@lib/glyph/gl";

const FS_FIG = `
uniform vec2 uRes, uCell, uGrid, uAtlasGrid, uRampNK;
uniform float uReveal, uLo, uHi;
uniform sampler2D uImg, uAtlas, uRamp;
uniform vec3 cBg, cFg;
float glyph(float idx, vec2 l){ vec2 g = vec2(mod(idx, uAtlasGrid.x), floor(idx / uAtlasGrid.x)); return texture2D(uAtlas, (g + l) / uAtlasGrid).a; }
void main(){
  vec2 f = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(f / uCell), l = fract(f / uCell);
  float k = (cell.y + .5) / uGrid.y * .6 + hash(cell) * .4;
  if (k < uReveal) { gl_FragColor = vec4(texture2D(uImg, f / uRes).rgb, 1.); return; }
  vec3 cc = texture2D(uImg, (cell + .5) / uGrid).rgb;
  float L = clamp((dot(cc, vec3(.299, .587, .114)) - uLo) / max(.05, uHi - uLo), 0., 1.);
  float q = clamp(L + (Bayer4(cell) - .5) / uRampNK.x, 0., .999);
  float idx = floor(texture2D(uRamp, vec2((floor(q * uRampNK.x) + .5) / uRampNK.x, (floor(hash(cell.yx) * uRampNK.y) + .5) / uRampNK.y)).r * 255. + .5);
  gl_FragColor = vec4(mix(cBg, cFg, glyph(idx, l)), 1.);
}`;

type State = "plain" | "proof" | "done";

/**
 * An image that first appears as a one-colour character proof and decodes
 * into the photo the first time it scrolls into view. At rest it is a normal
 * <img>. Images already on screen when the page loads are left alone, and so
 * is everything when the reader prefers reduced motion.
 *
 * Rendered with spans so it stays valid inside a markdown paragraph.
 */
export default function GlyphFigure({ src, alt, className, imgStyle }: { src: string; alt: string; className?: string; imgStyle?: CSSProperties }) {
    const wrap = useRef<HTMLSpanElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [state, setState] = useState<State>("plain");

    useEffect(() => {
        const el = wrap.current, img = imgRef.current;
        if (!el || !img || reducedMotion()) return;
        const r = el.getBoundingClientRect();
        if (img.complete && img.naturalWidth && r.top < window.innerHeight && r.bottom > 0) return;

        let alive = true, started = false, seen = false, raf = 0, last = 0, reveal = 0;
        let gl: WebGLRenderingContext | null = null, cv: HTMLCanvasElement | null = null;
        setState("proof");

        const stop = () => {
            alive = false;
            cancelAnimationFrame(raf);
            near.disconnect();
            view.disconnect();
            lose(gl);
            cv?.remove();
            gl = null;
        };
        const finish = () => { if (!alive) return; stop(); setState("done"); };

        const start = async () => {
            if (started || !alive) return;
            started = true;
            try {
                await img.decode();
                const R = await ramp();
                if (!alive) return;
                const W = img.clientWidth, H = img.clientHeight;
                if (!W || !H) return finish();
                cv = document.createElement("canvas");
                cv.setAttribute("aria-hidden", "true");
                el.appendChild(cv);
                gl = context(cv);
                if (!gl) return finish();
                const p = program(gl, FS_FIG);
                const d = pixelRatio(), w = Math.round(W * d), h = Math.round(H * d);
                const cw = Math.max(3, Math.round(5 * d)), ch = Math.max(5, Math.round(9 * d));
                cv.width = w;
                cv.height = h;
                cv.style.width = `${W}px`;
                cv.style.height = `${H}px`;
                cv.style.left = `${img.offsetLeft + img.clientLeft}px`;
                cv.style.top = `${img.offsetTop + img.clientTop}px`;
                gl.viewport(0, 0, w, h);
                gl.useProgram(p.p);
                const atlas = makeAtlas(R.chars, cw, ch, `500 ${Math.round(ch * 0.8)}px ${monoFamily()}`);
                upload(gl, 0, texture(gl, 0), atlas.canvas);
                upload(gl, 1, texture(gl, 1, true), img);
                upload(gl, 2, texture(gl, 2), rampData(R), R.N, R.K);
                const [lo, hi] = lumaRange(img);
                const bg = rgb(COLORS.bg), fg = rgb(COLORS.fg);
                gl.uniform1i(p.U("uAtlas"), 0);
                gl.uniform1i(p.U("uImg"), 1);
                gl.uniform1i(p.U("uRamp"), 2);
                gl.uniform2f(p.U("uRes"), w, h);
                gl.uniform2f(p.U("uCell"), cw, ch);
                gl.uniform2f(p.U("uGrid"), w / cw, h / ch);
                gl.uniform2f(p.U("uAtlasGrid"), atlas.cols, atlas.rows);
                gl.uniform2f(p.U("uRampNK"), R.N, R.K);
                gl.uniform1f(p.U("uLo"), lo);
                gl.uniform1f(p.U("uHi"), hi);
                gl.uniform3f(p.U("cBg"), bg[0], bg[1], bg[2]);
                gl.uniform3f(p.U("cFg"), fg[0], fg[1], fg[2]);
                const u = p.U("uReveal");
                const draw = () => { gl!.uniform1f(u, reveal); gl!.drawArrays(gl!.TRIANGLES, 0, 3); };
                draw();
                const tick = (ms: number) => {
                    if (!alive || !gl) return;
                    const dt = last ? Math.min(0.1, (ms - last) / 1000) : 0;
                    last = ms;
                    if (seen) {
                        reveal = Math.min(1.05, reveal + dt / 0.9);
                        draw();
                        if (reveal >= 1.05) return finish();
                    }
                    raf = requestAnimationFrame(tick);
                };
                raf = requestAnimationFrame(tick);
            } catch (e) {
                console.warn(e);
                finish();
            }
        };

        // Build the proof shortly before the figure arrives; reveal once a third of it is visible.
        const near = new IntersectionObserver((es) => {
            if (!es.some((e) => e.isIntersecting)) return;
            if (img.complete && img.naturalWidth) start();
            else img.addEventListener("load", start, { once: true });
        }, { rootMargin: "300px 0px" });
        const view = new IntersectionObserver((es) => {
            if (es.some((e) => e.isIntersecting && e.intersectionRatio >= 0.3)) seen = true;
        }, { threshold: [0, 0.3] });
        near.observe(el);
        view.observe(el);
        img.addEventListener("error", finish, { once: true });
        return stop;
    }, [src]);

    return (
        <span ref={wrap} className={clsx("n-gfig", className)} data-state={state}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={src} alt={alt} style={imgStyle} loading="lazy" decoding="async" />
        </span>
    );
}
