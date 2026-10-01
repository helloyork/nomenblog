"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useIsPresent } from "framer-motion";
import { diveCam, drawHeading, layoutHeading, lerp, sstep, clamp01, type Cam, type Heading } from "@lib/chuanzi/engine";
import { schemeColors, type Glyph, type Scheme } from "@lib/chuanzi/types";
import CopyButton from "./copy-button";

export type HomePost = { title: string; href: string; date: string; preview?: string };
export type HomeProject = { title: string; subtitle: string; description: string; link: string };

type Screen = { key: string; title: string; scheme: Scheme; last?: boolean };
const SCREENS: Screen[] = [
    { key: "hero", title: "NOMEN", scheme: "paper" },
    { key: "recent", title: "BLOGS", scheme: "ink" },
    { key: "projects", title: "PROJECTS", scheme: "paper" },
    { key: "about", title: "ABOUT", scheme: "ink" },
    { key: "end", title: "END", scheme: "paper", last: true },
];
// [enter, hold, dive] in viewport heights of scrolling
const PLAN = [[0, 0.35, 1.6], [0.45, 0.9, 1.6], [0.45, 1.0, 1.6], [0.45, 0.8, 1.6], [0.45, 0.9, 0]];

type Placed = { h: Heading; ox: number; oy: number; box?: { x: number; y: number; w: number; h: number; side: boolean } };
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/**
 * The home page: one pinned screen. Scrolling never moves it; it drives a
 * timeline in which each screen's title is drawn from its outlines and the
 * camera dives into its thickest stroke until that stroke's ink is the next
 * screen's ground.
 */
export default function HomeStage({ titles, posts, total, projects }: {
    titles: Record<string, Glyph[]>;
    posts: HomePost[];
    total: number;
    projects: HomeProject[];
}) {
    const track = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const cvs = useRef<HTMLCanvasElement>(null);
    const nodes = useRef<(HTMLElement | null)[]>([]);
    // once a route change takes this page away, it stops answering to the scroll offset
    const present = useIsPresent();
    const leaving = useRef(false);
    leaving.current = !present;

    useEffect(() => {
        const cv = cvs.current!, st = stage.current!, tr = track.current!;
        const ctx = cv.getContext("2d")!;
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        let W = 0, H = 0, DPR = 1, raf = 0;
        let placed: Placed[] = [];
        let TL: { e0: number; h0: number; d0: number; end: number }[] = [];

        const layout = () => {
            W = window.innerWidth; H = window.innerHeight;
            DPR = Math.min(window.devicePixelRatio || 1, 2);
            cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
            const g = Math.max(16, Math.round(W * 0.05));
            placed = SCREENS.map((s, i) => {
                const glyphs = titles[s.title];
                const units = glyphs.reduce((a, c) => a + c.adv, 0);
                if (i === 0) {
                    const em = Math.min((W * 0.9) / (units / 1000), H * 0.34);
                    const h = layoutHeading(glyphs, 1e6, em);
                    return { h, ox: (W - h.width) / 2, oy: H * 0.5 - h.height / 2 };
                }
                // the title's width in ems: short words sit beside their content, long ones above it
                const wide = units / 1000, side = W >= 900 && H >= 560 && wide <= 3;
                if (side) {
                    const em = Math.min(H * 0.5, (W * 0.48 - g) / wide);
                    const h = layoutHeading(glyphs, 1e6, em);
                    const bx = Math.round(g + h.width + 56);
                    return { h, ox: g, oy: H / 2 - h.height / 2, box: { x: bx, y: 84, w: W - g - bx, h: H - 84 - 64, side } };
                }
                const em = Math.min(H * 0.22, (W - 2 * g) / wide);
                const h = layoutHeading(glyphs, 1e6, em);
                const oy = 70, by = Math.round(oy + h.height + 22);
                return { h, ox: g, oy, box: { x: g, y: by, w: W - 2 * g, h: H - by - 52, side } };
            });
            placed.forEach((p, i) => {
                const n = nodes.current[i], box = n?.querySelector<HTMLElement>(".n-box");
                if (box && p.box) {
                    box.style.cssText = `left:${p.box.x}px;top:${p.box.y}px;width:${p.box.w}px;height:${p.box.h}px`;
                    box.classList.toggle("side", p.box.side);
                }
            });
            let y = 0;
            TL = PLAN.map(([en, ho, dv]) => { const s = { e0: y, h0: 0, d0: 0, end: 0 }; y += en * H; s.h0 = y; y += ho * H; s.d0 = y; y += dv * H; s.end = y; return s; });
            tr.style.height = `${Math.round(y + H)}px`;
        };

        const stateAt = (y: number) => {
            for (let i = 0; i < TL.length; i++) {
                const s = TL[i];
                if (y < s.end || i === TL.length - 1) {
                    if (y < s.h0) return { i, ph: "enter" as const, u: clamp01((y - s.e0) / Math.max(1, s.h0 - s.e0)) };
                    if (y < s.d0 || s.end === s.d0) return { i, ph: "hold" as const, u: 0 };
                    return { i, ph: "dive" as const, u: clamp01((y - s.d0) / (s.end - s.d0)) };
                }
            }
            return { i: 0, ph: "hold" as const, u: 0 };
        };

        const frame = () => {
            raf = 0;
            if (leaving.current) return;
            const y = window.scrollY - (tr.getBoundingClientRect().top + window.scrollY);
            const s = stateAt(Math.max(0, y));
            const p = placed[s.i], scr = SCREENS[s.i], { bg, fg } = schemeColors(scr.scheme);
            const C: [number, number] = [W / 2, H / 2];
            let cam: Cam = { z: 1, T: C, T2: C }, e = 0, a = 1;
            if (s.ph === "enter") { a = ease(s.u); cam = { z: lerp(0.86, 1, a), T: C, T2: C }; }
            else if (s.ph === "dive" && p.h.stroke) {
                const q = clamp01((s.u - 0.03) / 0.94);
                e = q * q * (3 - 2 * q);
                cam = diveCam([p.ox + p.h.stroke.x, p.oy + p.h.stroke.y], p.h.stroke.r, e, W, H);
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = 1;
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, cv.width, cv.height);
            drawHeading(ctx, p.h, p.ox, p.oy, cam, DPR, fg, a);

            nodes.current.forEach((n, j) => {
                if (!n) return;
                const on = j === s.i;
                n.classList.toggle("on", on);
                n.classList.toggle("live", on && (s.ph === "hold" || (s.ph === "enter" && s.u > 0.6)));
                if (!on) return;
                const op = a * (1 - sstep(0.02, 0.3, e));
                n.style.opacity = op.toFixed(3);
                n.style.visibility = op < 0.01 ? "hidden" : "";
                n.style.transform = `matrix(${cam.z},0,0,${cam.z},${cam.T2[0] - cam.T[0] * cam.z},${cam.T2[1] - cam.T[1] * cam.z})`;
            });
            st.dataset.scheme = scr.scheme;
            document.documentElement.dataset.scheme = scr.scheme;
        };
        const schedule = () => { if (!raf && !leaving.current) raf = requestAnimationFrame(frame); };
        const refresh = () => { layout(); schedule(); };

        refresh();

        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", refresh);
        document.documentElement.dataset.home = "1";
        if (reduce) st.dataset.reduced = "1";
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", refresh);
            delete document.documentElement.dataset.home;
        };
    }, [titles]);

    const glide = (to: number) => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) { window.scrollTo(0, to); return; }
        const from = window.scrollY, t0 = performance.now(), dur = Math.min(5200, 900 + Math.abs(to - from) / 4);
        const step = (now: number) => {
            const t = Math.min(1, (now - t0) / dur);
            const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            window.scrollTo(0, from + (to - from) * e);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const scr = (i: number) => ({ ref: (el: HTMLElement | null) => { nodes.current[i] = el; }, "data-scheme": SCREENS[i].scheme });

    return (
        <div ref={track} className="n-home">
            <div ref={stage} className="n-stage" data-scheme="paper">
                <canvas ref={cvs} aria-hidden="true" />

                <section className="n-screen" {...scr(0)}>
                    <h1 className="sr-only">NOMEN</h1>
                </section>

                <section className="n-screen" {...scr(1)} aria-labelledby="h-recent">
                    <div className="n-box">
                        <h2 className="sr-only" id="h-recent">Blogs</h2>
                        <ol className="n-list">
                            {posts.map((p) => (
                                <li key={p.href}>
                                    <Link scroll={false} className="n-row" href={`/blog/content/${p.href}`}>
                                        <time dateTime={p.date}>{p.date.replace(/-/g, ".")}</time>
                                        <span className="n-t">{p.title}</span>
                                        {p.preview && <span className="n-d n-clip">{p.preview}</span>}
                                    </Link>
                                </li>
                            ))}
                        </ol>
                        <p className="n-foot-row"><Link scroll={false} className="n-btn" href="/blog">All {total} posts →</Link></p>
                    </div>
                </section>

                <section className="n-screen" {...scr(2)} aria-labelledby="h-projects">
                    <div className="n-box">
                        <h2 className="sr-only" id="h-projects">Projects in progress</h2>
                        <ul className="n-list">
                            {projects.map((p) => (
                                <li key={p.title}>
                                    <a className="n-row" href={p.link} target="_blank" rel="noreferrer">
                                        <span className="n-k">{p.subtitle}</span>
                                        <span className="n-t">{p.title}</span>
                                        <span className="n-d n-clip">{p.description}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <p className="n-foot-row"><Link scroll={false} className="n-btn" href="/projects">All projects →</Link></p>
                    </div>
                </section>

                <section className="n-screen" {...scr(3)} aria-labelledby="h-about">
                    <div className="n-box">
                        <h2 className="sr-only" id="h-about">About</h2>
                        <dl className="n-facts">
                            <dt>Name</dt><dd>helloyork</dd>
                            <dt>Role</dt><dd>Full-stack developer</dd>
                            <dt>Email</dt><dd><span id="n-home-mail">helloyork@icloud.com</span><CopyButton text="helloyork@icloud.com" target="n-home-mail" /></dd>
                            <dt>GitHub</dt><dd><a href="https://github.com/helloyork" target="_blank" rel="noreferrer">github.com/helloyork</a></dd>
                        </dl>
                        <p className="n-foot-row"><Link scroll={false} className="n-btn" href="/about">More →</Link></p>
                    </div>
                </section>

                <section className="n-screen" {...scr(4)} aria-labelledby="h-end">
                    <div className="n-box">
                        <h2 className="sr-only" id="h-end">The end</h2>
                        <p><button type="button" className="n-btn n-btn-lg" onClick={() => glide(0)}>Back to NOMEN ↑</button></p>
                    </div>
                </section>
            </div>
        </div>
    );
}
