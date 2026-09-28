"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Projects } from "@lib/data/site";
import { PBG, PFG, clamp, hashStr, rng } from "@lib/glyph/core";

/** A mirrored 12x12 one-bit identicon, shown at 4x. */
function Identicon({ seed, inverted = false }: { seed: string; inverted?: boolean }) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const cv = ref.current;
        if (!cv) return;
        const x = cv.getContext("2d")!, img = x.createImageData(12, 12), d = new Uint32Array(img.data.buffer), r = rng(hashStr(seed));
        const on = inverted ? PBG : PFG, off = inverted ? PFG : PBG;
        for (let y = 0; y < 12; y++) {
            for (let i = 0; i < 6; i++) {
                const edge = y === 0 || y === 11 || i === 0;
                const b = edge ? (y + i) % 2 === 0 && r() > 0.4 : r() > 0.5;
                d[y * 12 + i] = d[y * 12 + 11 - i] = b ? on : off;
            }
        }
        x.putImageData(img, 0, 0);
    }, [seed, inverted]);
    return <canvas ref={ref} width={12} height={12} aria-hidden="true" />;
}

type Win = { i: number; x: number; y: number; z: number };

function InfoWindow({ win, onClose, onFront, onMoved }: {
    win: Win;
    onClose: () => void;
    onFront: () => void;
    onMoved: (x: number, y: number) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
    const p = Projects[win.i];

    return (
        <div ref={ref} className="n-info" role="dialog" aria-label={p.title} style={{ left: win.x, top: win.y, zIndex: win.z }} onPointerDown={onFront}>
            <div className="n-win">
                <div
                    className="n-win-bar n-drag"
                    onPointerDown={(e) => {
                        if ((e.target as HTMLElement).closest(".n-win-x") || window.innerWidth <= 640 || !ref.current) return;
                        drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: ref.current.offsetLeft, oy: ref.current.offsetTop };
                        e.currentTarget.setPointerCapture(e.pointerId);
                        e.preventDefault();
                    }}
                    onPointerMove={(e) => {
                        const d = drag.current, el = ref.current, box = el?.parentElement;
                        if (!d || d.id !== e.pointerId || !el || !box) return;
                        el.style.left = `${clamp(d.ox + e.clientX - d.sx, 60 - el.offsetWidth, box.clientWidth - 60)}px`;
                        el.style.top = `${clamp(d.oy + e.clientY - d.sy, 0, box.clientHeight - 30)}px`;
                    }}
                    onPointerUp={() => {
                        if (drag.current && ref.current) onMoved(ref.current.offsetLeft, ref.current.offsetTop);
                        drag.current = null;
                    }}
                >
                    <button type="button" className="n-win-x" aria-label="关闭" onClick={onClose} />
                    <span className="n-win-ttl">{p.title}</span>
                </div>
                <div className="n-info-body">
                    <div className="n-info-top">
                        <Identicon seed={p.title} />
                        <div><b>{p.title}</b><br /><span className="n-dim">{p.subtitle}</span></div>
                    </div>
                    <dl>
                        <dt>KIND</dt><dd>{p.subtitle}</dd>
                        <dt>STATUS</dt><dd>{p.status}</dd>
                        <dt>WHERE</dt><dd><a href={p.link} target="_blank" rel="noreferrer">{p.link.replace(/^https?:\/\//, "")}</a></dd>
                    </dl>
                    <p>{p.description}</p>
                </div>
            </div>
        </div>
    );
}

/** Projects as desktop icons; each opens a small window that can be dragged by its title bar. */
export default function ProjectDesk() {
    const desk = useRef<HTMLDivElement>(null);
    const top = useRef(10);
    const router = useRouter();
    const [wins, setWins] = useState<Win[]>([]);
    const [sel, setSel] = useState<number | null>(null);

    const open = useCallback((i: number, from?: HTMLElement | null) => {
        const p = Projects[i];
        setSel(i);
        if (!/^https?:/.test(p.link)) {
            router.push(p.link);
            return;
        }
        const box = desk.current?.getBoundingClientRect();
        const at = from?.getBoundingClientRect();
        setWins((ws) => {
            const z = ++top.current;
            if (ws.some((w) => w.i === i)) return ws.map((w) => (w.i === i ? { ...w, z } : w));
            const n = ws.length;
            const x = box && at ? clamp(at.left - box.left + 44 + n * 18, 8, Math.max(8, box.width - 376)) : 8;
            const y = box && at ? clamp(at.top - box.top + 24 + n * 18, 8, Math.max(8, box.height - 260)) : 8;
            return [...ws, { i, x, y, z }];
        });
    }, [router]);

    // One window open on a wide screen, so the desk shows what it does without a caption.
    // It opens in the free strip under the icons so it covers none of them. The label
    // font decides how the names wrap, and so how tall the rows are; wait for it.
    useEffect(() => {
        if (window.innerWidth <= 640) return;
        let live = true;
        document.fonts.ready.then(() => {
            const icons = desk.current?.querySelectorAll<HTMLElement>(".n-icon");
            const last = icons?.[icons.length - 1];
            if (!live || !icons || !last) return;
            const win = { i: 0, x: icons[0].offsetLeft, y: last.offsetTop + last.offsetHeight + 28, z: ++top.current };
            setWins((ws) => (ws.length ? ws : [win]));
            setSel((s) => s ?? 0);
        });
        return () => { live = false; };
    }, []);

    return (
        <div ref={desk} className="n-desk">
            {Projects.map((p, i) => (
                <button type="button" key={p.title} className="n-icon" aria-pressed={sel === i} onClick={(e) => open(i, e.currentTarget)}>
                    <Identicon seed={p.title} inverted={sel === i} />
                    <span>{p.title}</span>
                </button>
            ))}
            {wins.map((w) => (
                <InfoWindow
                    key={w.i}
                    win={w}
                    onClose={() => setWins((ws) => ws.filter((o) => o.i !== w.i))}
                    onFront={() => setWins((ws) => ws.map((o) => (o.i === w.i ? { ...o, z: ++top.current } : o)))}
                    onMoved={(x, y) => setWins((ws) => ws.map((o) => (o.i === w.i ? { ...o, x, y } : o)))}
                />
            ))}
        </div>
    );
}
