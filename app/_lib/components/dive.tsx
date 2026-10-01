"use client";

import { useEffect, useRef } from "react";
import { clamp01, rasterTarget, sstep, zoomCam, type Cam } from "@lib/chuanzi/engine";
import { routeScheme, schemeColors, type Scheme } from "@lib/chuanzi/types";

/*
 * Route transitions. Going forward, the camera dives into the character you
 * clicked, holding it where it is on screen: into its stroke when the next
 * page swaps colours (the stroke's ink becomes the new ground), into the
 * ground around it when it does not. Going back, the page you leave sinks
 * away and the camera comes back out of the same character on the page you
 * return to, at the scroll offset you left it at.
 */

type Char = { ch: string; x: number; y: number; w: number; h: number; font: string };
type Snap = {
    chars: Char[];
    fg: string;
    back: { color: string; rect: DOMRect } | null;
    el: HTMLElement;   // the text on the page, hidden while its copy is on the overlay
};

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let norm: CanvasRenderingContext2D | null = null;
/** Colours as the canvas spells them, so "rgb(246, 246, 243)" and "#f6f6f3" compare equal. */
function same(a: string, b: string) {
    norm ??= document.createElement("canvas").getContext("2d");
    if (!norm) return a === b;
    norm.fillStyle = "#000"; norm.fillStyle = a; const x = norm.fillStyle;
    norm.fillStyle = "#000"; norm.fillStyle = b;
    return x === norm.fillStyle;
}
const opaque = (c: string) => !!c && c !== "transparent" && !/rgba\(.*,\s*0\)$/.test(c);

/** Where a link's text sits and how it is coloured. A link with a title (`.n-t`) is read through its title. */
function snapshot(link: HTMLAnchorElement): Snap | null {
    const a = link.querySelector<HTMLElement>(".n-t") ?? link;
    const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
    const chars: Char[] = [];
    const vw = window.innerWidth, vh = window.innerHeight;
    const range = document.createRange();
    let node: Node | null;
    while ((node = walker.nextNode()) && chars.length < 120) {
        const text = node.textContent ?? "";
        const parent = node.parentElement;
        if (!parent || !text.trim()) continue;
        const cs = getComputedStyle(parent);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        for (let i = 0; i < text.length && chars.length < 120; i++) {
            if (/\s/.test(text[i])) continue;
            const n = text.codePointAt(i)! > 0xffff ? 2 : 1;
            range.setStart(node, i); range.setEnd(node, i + n);
            const r = range.getBoundingClientRect();
            if (n === 2) i++;
            if (r.width < 1 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
            chars.push({ ch: text.slice(i + 1 - n, i + 1), x: r.left, y: r.top, w: r.width, h: r.height, font });
        }
    }
    if (!chars.length) return null;

    // the menu is drawn white in difference mode, so it shows as the page's own ink
    if (link.closest(".n-menu")) {
        const s = document.documentElement.dataset.scheme === "ink" ? "ink" : "paper";
        return { chars, fg: schemeColors(s).fg, back: null, el: a };
    }
    let back: Snap["back"] = null;
    for (let el: HTMLElement | null = a; el && el !== link.parentElement; el = el.parentElement) {
        const c = getComputedStyle(el).backgroundColor;
        if (opaque(c)) { back = { color: c, rect: el.getBoundingClientRect() }; break; }
    }
    return { chars, fg: getComputedStyle(a).color, back, el: a };
}

/** The character under the pointer, or the nearest one; the middle one for a keyboard click. */
function pick(chars: Char[], x: number, y: number): number {
    if (!Number.isFinite(x)) return Math.floor(chars.length / 2);
    let best = 0, bd = Infinity;
    chars.forEach((c, i) => {
        const d = Math.hypot(Math.max(c.x - x, 0, x - c.x - c.w), Math.max(c.y - y, 0, y - c.y - c.h));
        if (d < bd) { bd = d; best = i; }
    });
    return best;
}

/** Draw one character where the browser put it: on the baseline the line box implies. */
function put(ctx: CanvasRenderingContext2D, c: Char) {
    ctx.font = c.font;
    ctx.textBaseline = "alphabetic";
    const m = ctx.measureText(c.ch);
    const asc = m.fontBoundingBoxAscent ?? c.h * 0.8, desc = m.fontBoundingBoxDescent ?? c.h * 0.2;
    ctx.fillText(c.ch, c.x, c.y + (c.h - asc - desc) / 2 + asc);
}

type Dive = {
    cam: (e: number) => Cam;
    end: string;
    el: HTMLElement;
    /** The ground at opacity `a` (around the link's own background, which fades in in its place) and the link's text on top. */
    draw: (ctx: CanvasRenderingContext2D, cam: Cam, dpr: number, ground: string, a: number) => void;
};

/**
 * The camera path into one character of a snapshot. `ground` is the colour the
 * screen should end up (going in) or start from (coming out).
 */
function diveInto(snap: Snap, ci: number, ground: string, pageBg: string, W: number, H: number): Dive | null {
    const { chars, fg, back } = snap;
    const c = chars[Math.min(ci, chars.length - 1)];
    const behind = back?.color ?? pageBg;
    const mode = same(fg, ground) ? "stroke" : same(behind, ground) ? "counter" : "stroke";

    // raster that one character at about 160px to find its deepest point
    const K = 160 / Math.max(c.w, c.h, 1);
    const w = Math.max(2, Math.ceil(c.w * K)), h = Math.max(2, Math.ceil(c.h * K));
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const cx = cv.getContext("2d", { willReadFrequently: true })!;
    cx.setTransform(K, 0, 0, K, -c.x * K, -c.y * K);
    put(cx, c);
    const t = rasterTarget(cx.getImageData(0, 0, w, h).data, w, h, mode);
    if (!t) return null;
    const T: [number, number] = [c.x + t.x / K, c.y + t.y / K], r = (t.r / K) * 0.9;
    return {
        cam: (e) => zoomCam(T, r, e, W, H),
        end: mode === "stroke" ? fg : behind,
        el: snap.el,
        draw(ctx, cam, dpr, color, a) {
            const m = [dpr * cam.z, 0, 0, dpr * cam.z, dpr * (cam.T2[0] - cam.T[0] * cam.z), dpr * (cam.T2[1] - cam.T[1] * cam.z)] as const;
            ctx.save();
            if (a > 0) {
                const R = back && [m[0] * back.rect.left + m[4], m[3] * back.rect.top + m[5], m[0] * back.rect.width, m[3] * back.rect.height] as const;
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalAlpha = a;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
                if (R) ctx.rect(R[0], R[1], R[2], R[3]);
                ctx.fill("evenodd");
                if (R) { ctx.fillStyle = back.color; ctx.fillRect(R[0], R[1], R[2], R[3]); }
                ctx.globalAlpha = 1;
            }
            ctx.setTransform(...m);
            ctx.fillStyle = fg;
            chars.forEach((ch) => put(ctx, ch));
            ctx.restore();
        },
    };
}

// ---------- the overlay ----------
let canvas: HTMLCanvasElement | null = null;
let run = 0;

function size() {
    const cv = canvas!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    return { dpr, W, H, ctx: cv.getContext("2d")! };
}

function flat(color: string, a = 1) {
    const { ctx } = size();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 1;
}

function paint(d: Dive, cam: Cam, ground: string, a: number) {
    const { ctx, dpr } = size();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    d.draw(ctx, cam, dpr, ground, a);
}

const show = (on: boolean) => {
    if (!canvas) return;
    canvas.style.display = on ? "block" : "none";
    canvas.style.opacity = "1";
};

/** Where a page's top-left corner sits on screen when nothing moves it. */
function cornerOf(el: HTMLElement | null): [number, number] {
    if (!el) return [0, 0];
    const t = el.style.transform;
    el.style.transform = "";
    const r = el.getBoundingClientRect();
    el.style.transform = t;
    return [r.left, r.top];
}

/** Put a page where the camera says; `L` is its corner at rest. */
function setPage(el: HTMLElement | null, cam: Cam | null, opacity = 1, L: [number, number] = [0, 0]) {
    if (!el) return;
    if (!cam) { el.style.transform = ""; el.style.opacity = ""; el.style.transformOrigin = ""; el.style.visibility = ""; return; }
    el.style.transformOrigin = "0 0";
    el.style.transform = `matrix(${cam.z},0,0,${cam.z},${cam.T2[0] - L[0] + cam.z * (L[0] - cam.T[0])},${cam.T2[1] - L[1] + cam.z * (L[1] - cam.T[1])})`;
    el.style.opacity = String(opacity);
}

function animate(ms: number, step: (u: number) => void): Promise<void> {
    const id = ++run;
    return new Promise((resolve) => {
        const t0 = performance.now();
        let finished = false;
        const finish = () => { if (finished) return; finished = true; resolve(); };
        const tick = (now: number) => {
            if (id !== run) return finish();
            const u = clamp01((now - t0) / ms);
            step(u);
            if (u < 1) requestAnimationFrame(tick); else finish();
        };
        requestAnimationFrame(tick);
        // a hidden tab pauses requestAnimationFrame; the route must not wait on it
        setTimeout(() => { if (!finished && id === run) step(1); finish(); }, ms + 400);
    });
}
const frames = (n: number) => new Promise<void>((r) => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });

/** Going in: slow at first, so you see which character it is, then falling through. */
function diveDown(page: HTMLElement | null, d: Dive, pageBg: string): Promise<string> {
    const L = cornerOf(page);
    d.el.style.visibility = "hidden";
    show(true);
    return animate(620, (u) => {
        const e = Math.pow(u, 1.6);
        const cam = d.cam(e), a = sstep(0.04, 0.3, e);
        // the overlay's ground fades over the page, so the page itself stays opaque until it is gone
        setPage(page, cam, a < 1 ? 1 : 0, L);
        paint(d, cam, pageBg, a);
        if (u >= 1) flat(d.end);
    }).then(() => { d.el.style.visibility = ""; return d.end; });
}

/** Coming out: the same path backwards, fast at first and settling on the page. */
function diveUp(page: HTMLElement | null, d: Dive, pageBg: string): Promise<void> {
    const L = cornerOf(page);
    d.el.style.visibility = "hidden";
    if (page) page.style.visibility = "";
    return animate(620, (u) => {
        const e = Math.pow(1 - u, 1.6);
        const cam = d.cam(e), a = sstep(0.04, 0.3, e);
        setPage(page, cam, a < 1 ? 1 : 0, L);
        paint(d, cam, pageBg, a);
    }).finally(() => { d.el.style.visibility = ""; });
}

/** Going back: the page sinks into its own ground. */
function sink(page: HTMLElement | null, color: string): Promise<string> {
    const { W, H } = size();
    const L = cornerOf(page);
    show(true);
    return animate(240, (u) => {
        const k = sstep(0, 1, u);
        setPage(page, { z: 1 - 0.06 * k, T: [W / 2, H / 2], T2: [W / 2, H / 2] }, 1 - k, L);
        flat(color, k);
    }).then(() => color);
}

/** No text to dive into: a plain fade to the next page's ground. */
function fade(page: HTMLElement | null, color: string): Promise<string> {
    show(true);
    return animate(280, (u) => {
        if (page) page.style.opacity = String(1 - u);
        flat(color, sstep(0, 1, u));
    }).then(() => color);
}

/** The incoming page comes up out of the flat colour. */
function rise(page: HTMLElement | null): Promise<void> {
    const { W, H } = size();
    const L = cornerOf(page);
    if (page) page.style.visibility = "";
    return animate(360, (u) => {
        const k = 1 - Math.pow(1 - u, 3), o = 1 - Math.pow(1 - clamp01(u / 0.6), 2);
        setPage(page, { z: 0.95 + 0.05 * k, T: [W / 2, H / 2], T2: [W / 2, H / 2] }, o, L);
        if (canvas) canvas.style.opacity = String(1 - o);
    });
}

// ---------- what happened before the route changed ----------
const pageOf = (path: string) => Array.from(document.querySelectorAll<HTMLElement>("[data-route]")).find((p) => p.dataset.route === path) ?? null;
/** The colour the screen is printed in now. The home page changes it screen by screen, so the document is asked rather than the route. */
const schemeNow = (path: string): Scheme => {
    const s = document.documentElement.dataset.scheme;
    return s === "paper" || s === "ink" ? s : routeScheme(path);
};

/** A dive started at the click, before the next page has arrived. */
let started: { to: string; done: Promise<string>; page: HTMLElement | null; snap: Snap } | null = null;
let popped = false;
/** For each page, the link it was last left through, so going back can come out of it. */
const exits = new Map<string, { to: string; ci: number }>();
/** Scroll offsets per page, restored when the page is returned to with back or forward. */
const scrolls = new Map<string, number>();
let shown = "";
let busy = false;
let nav = 0;
let covering: Promise<void> = Promise.resolve();

const findLink = (page: HTMLElement | null, to: string) => {
    const links = [...Array.from(page?.querySelectorAll("a") ?? []), ...Array.from(document.querySelectorAll<HTMLAnchorElement>(".n-menu a"))];
    return links.find((a) => {
        if (a.pathname !== to || a.origin !== location.origin) return false;
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && getComputedStyle(a).visibility !== "hidden";
    }) ?? null;
};

/** The click: start falling into the clicked character right away, while the next page loads. */
function onLinkClick(link: HTMLAnchorElement, to: string, x: number, y: number) {
    const from = location.pathname;
    scrolls.set(from, window.scrollY);
    const snap = snapshot(link);
    const ci = snap ? pick(snap.chars, x, y) : 0;
    exits.set(from, { to, ci });
    if (!canvas || reduced() || !snap) return;
    const { W, H } = size();
    const fromS = schemeNow(from), toS = routeScheme(to);
    const d = diveInto(snap, ci, schemeColors(toS).bg, schemeColors(fromS).bg, W, H);
    if (!d) return;
    busy = true;
    const page = pageOf(from);
    const done = diveDown(page, d, schemeColors(fromS).bg);
    const mine = { to, done, page, snap };
    started = mine;
    // a click that never turns into a route change gives the page back
    void done.then(() => new Promise((r) => setTimeout(r, 10000))).then(() => {
        if (started !== mine) return;
        started = null;
        busy = false;
        setPage(page, null);
        animate(240, (u) => { if (canvas) canvas.style.opacity = String(1 - u); }).then(() => show(false));
    });
}

export const dive = {
    /** Resolves once the outgoing page is covered and can be taken away. */
    covered: () => covering,

    /** Called as the route changes, with both pages mounted: the old one still showing, the new one not yet. */
    navigate(from: string, to: string) {
        const id = ++nav;
        const back = popped;
        popped = false;
        const begun = !back && started?.to === to ? started : null;
        started = null;
        busy = true;

        const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-route]"));
        const old = pages.find((p) => p.dataset.route === from) ?? null;
        const next = pages.filter((p) => p.dataset.route === to).pop() ?? null;
        const fromS = schemeNow(from), toS = routeScheme(to);
        const target = back ? scrolls.get(to) ?? 0 : 0;
        if (!back && !begun) scrolls.set(from, window.scrollY);

        if (!canvas || reduced()) {
            covering = Promise.resolve();
            window.scrollTo({ top: target, left: 0, behavior: "instant" as ScrollBehavior });
            document.documentElement.dataset.scheme = toS;
            shown = to; busy = false;
            return;
        }
        if (next) next.style.visibility = "hidden";

        let ground = schemeColors(toS).bg;
        const cover = begun ? begun.done : back ? sink(old, schemeColors(fromS).bg) : fade(old, schemeColors(toS).bg);
        covering = cover.then((c) => { ground = c; });
        void covering.then(async () => {
            if (id !== nav) return;
            window.scrollTo({ top: target, left: 0, behavior: "instant" as ScrollBehavior });
            document.documentElement.dataset.scheme = toS;
            shown = to;
            if (next) { next.style.opacity = "0"; next.style.visibility = ""; }
            // let the new page settle at its offset (the home stage draws on the next frame)
            await frames(2);
            if (id !== nav) return;
            const { W, H } = size();
            const pageBg = schemeColors(schemeNow(to)).bg;
            const ex = back ? exits.get(to) : undefined;
            const link = ex && ex.to === from ? findLink(next, from) : null;
            const snap = link ? snapshot(link) : null;
            const d = snap && ex ? diveInto(snap, ex.ci, ground, pageBg, W, H) : null;
            if (d) await diveUp(next, d, pageBg);
            else await rise(next);
            if (id !== nav) return;
            setPage(next, null);
            show(false);
            busy = false;
        });
    },
};

export default function DiveOverlay() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        canvas = ref.current;
        shown = location.pathname;
        // the browser would restore the offset on the page that is leaving; the transition does it on the one arriving
        const restoration = history.scrollRestoration;
        history.scrollRestoration = "manual";
        const onClick = (ev: MouseEvent) => {
            if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
            const a = (ev.target as Element | null)?.closest?.("a");
            if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
            const url = new URL(a.href, location.href);
            if (url.origin !== location.origin || url.pathname === location.pathname) return;
            onLinkClick(a, url.pathname, ev.detail ? ev.clientX : NaN, ev.clientY);
        };
        const onPop = () => { popped = true; };
        const onScroll = () => { if (!busy) scrolls.set(shown, window.scrollY); };
        document.addEventListener("click", onClick, true);
        window.addEventListener("popstate", onPop);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            canvas = null;
            history.scrollRestoration = restoration;
            document.removeEventListener("click", onClick, true);
            window.removeEventListener("popstate", onPop);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);
    return <canvas ref={ref} className="n-dive" aria-hidden="true" />;
}
