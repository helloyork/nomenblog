import "server-only";

import fs from "fs";
import path from "path";
import type { Glyph } from "./types";

/*
 * Title outlines come from a TrueType file read at build time, so every page
 * ships only the few glyphs its own title uses. A small reader is enough: the
 * file is our own subset (see scripts/subset-title-font.py), static, no hinting.
 */

const FILE = path.join(process.cwd(), "assets/fonts/NotoSansSC-Black-GB2312.ttf");

type Font = {
    dv: DataView;
    locFmt: number;
    numH: number;
    hmtx: number;
    loca: number;
    glyf: number;
    cmap: Map<number, number>;
    cache: Map<string, Glyph>;
};

let font: Font | null = null;

function readCmap(dv: DataView, base: number): Map<number, number> {
    const map = new Map<number, number>();
    const n = dv.getUint16(base + 2);
    let fmt12 = -1, fmt4 = -1;
    for (let i = 0; i < n; i++) {
        const r = base + 4 + i * 8;
        const pid = dv.getUint16(r), eid = dv.getUint16(r + 2), off = base + dv.getUint32(r + 4);
        const fmt = dv.getUint16(off);
        if (fmt === 12 && (pid === 3 || pid === 0)) fmt12 = off;
        if (fmt === 4 && ((pid === 3 && eid === 1) || pid === 0)) fmt4 = off;
    }
    if (fmt12 >= 0) {
        const groups = dv.getUint32(fmt12 + 12);
        for (let g = 0; g < groups; g++) {
            const o = fmt12 + 16 + g * 12;
            const start = dv.getUint32(o), end = dv.getUint32(o + 4), gid = dv.getUint32(o + 8);
            for (let c = start; c <= end; c++) map.set(c, gid + c - start);
        }
    } else if (fmt4 >= 0) {
        const seg = dv.getUint16(fmt4 + 6) / 2;
        const ends = fmt4 + 14, starts = ends + seg * 2 + 2, deltas = starts + seg * 2, ranges = deltas + seg * 2;
        for (let s = 0; s < seg; s++) {
            const end = dv.getUint16(ends + s * 2), start = dv.getUint16(starts + s * 2);
            const delta = dv.getInt16(deltas + s * 2), ro = dv.getUint16(ranges + s * 2);
            for (let c = start; c <= end && c !== 0xffff; c++) {
                let gid: number;
                if (ro === 0) gid = (c + delta) & 0xffff;
                else {
                    gid = dv.getUint16(ranges + s * 2 + ro + (c - start) * 2);
                    if (gid !== 0) gid = (gid + delta) & 0xffff;
                }
                if (gid) map.set(c, gid);
            }
        }
    }
    return map;
}

function load(): Font {
    if (font) return font;
    const b = fs.readFileSync(FILE);
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const tables: Record<string, number> = {};
    const count = dv.getUint16(4);
    for (let i = 0; i < count; i++) {
        const o = 12 + i * 16;
        const tag = String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
        tables[tag] = dv.getUint32(o + 8);
    }
    font = {
        dv,
        locFmt: dv.getInt16(tables.head + 50),
        numH: dv.getUint16(tables.hhea + 34),
        hmtx: tables.hmtx,
        loca: tables.loca,
        glyf: tables.glyf,
        cmap: readCmap(dv, tables.cmap),
        cache: new Map(),
    };
    return font;
}

function advance(f: Font, gid: number) {
    return f.dv.getUint16(f.hmtx + 4 * Math.min(gid, f.numH - 1));
}

/** Contours of one glyph as [x, y, on] with y still pointing up. */
function contours(f: Font, gid: number, depth = 0): number[][][] {
    const { dv } = f;
    const lo = f.locFmt === 0 ? dv.getUint16(f.loca + gid * 2) * 2 : dv.getUint32(f.loca + gid * 4);
    const hi = f.locFmt === 0 ? dv.getUint16(f.loca + gid * 2 + 2) * 2 : dv.getUint32(f.loca + gid * 4 + 4);
    if (hi <= lo) return [];
    let p = f.glyf + lo;
    const nc = dv.getInt16(p);
    p += 10;

    if (nc < 0) {
        if (depth > 4) return [];
        const out: number[][][] = [];
        let flags: number;
        do {
            flags = dv.getUint16(p);
            const sub = dv.getUint16(p + 2);
            p += 4;
            let dx = 0, dy = 0;
            if (flags & 1) { dx = dv.getInt16(p); dy = dv.getInt16(p + 2); p += 4; }
            else { dx = dv.getInt8(p); dy = dv.getInt8(p + 1); p += 2; }
            if (!(flags & 2)) { dx = 0; dy = 0; } // point matching: not used by this font
            let a = 1, b = 0, c = 0, d = 1;
            const f2 = (o: number) => dv.getInt16(o) / 16384;
            if (flags & 8) { a = d = f2(p); p += 2; }
            else if (flags & 0x40) { a = f2(p); d = f2(p + 2); p += 4; }
            else if (flags & 0x80) { a = f2(p); b = f2(p + 2); c = f2(p + 4); d = f2(p + 6); p += 8; }
            for (const ct of contours(f, sub, depth + 1)) {
                out.push(ct.map(([x, y, on]) => [Math.round(x * a + y * c + dx), Math.round(x * b + y * d + dy), on]));
            }
        } while (flags & 0x20);
        return out;
    }

    const ends: number[] = [];
    for (let i = 0; i < nc; i++) ends.push(dv.getUint16(p + i * 2));
    p += nc * 2;
    p += 2 + dv.getUint16(p); // instructions
    const n = nc ? ends[nc - 1] + 1 : 0;
    const fl: number[] = [];
    while (fl.length < n) {
        const v = dv.getUint8(p++);
        fl.push(v);
        if (v & 8) { let r = dv.getUint8(p++); while (r-- > 0) fl.push(v); }
    }
    const xs: number[] = [], ys: number[] = [];
    let x = 0, y = 0;
    for (let i = 0; i < n; i++) {
        const v = fl[i];
        if (v & 2) { const d = dv.getUint8(p++); x += v & 16 ? d : -d; }
        else if (!(v & 16)) { x += dv.getInt16(p); p += 2; }
        xs.push(x);
    }
    for (let i = 0; i < n; i++) {
        const v = fl[i];
        if (v & 4) { const d = dv.getUint8(p++); y += v & 32 ? d : -d; }
        else if (!(v & 32)) { y += dv.getInt16(p); p += 2; }
        ys.push(y);
    }
    const out: number[][][] = [];
    let s = 0;
    for (const e of ends) {
        const ct: number[][] = [];
        for (let i = s; i <= e; i++) ct.push([xs[i], ys[i], fl[i] & 1]);
        out.push(ct);
        s = e + 1;
    }
    return out;
}

function glyphOf(f: Font, ch: string): Glyph {
    const hit = f.cache.get(ch);
    if (hit) return hit;
    const cp = ch.codePointAt(0) ?? 32;
    const gid = f.cmap.get(cp) ?? 0;
    let g: Glyph;
    if (!gid) {
        // missing from the subset: the client draws it from the web font
        g = { ch, adv: cp > 0x2e80 ? 1000 : 600, cs: null };
    } else {
        const cs = contours(f, gid).map((ct) => ct.map(([x, y, on]) => [x, -y, on]));
        g = { ch, adv: advance(f, gid), cs };
    }
    f.cache.set(ch, g);
    return g;
}

/** Outlines for every character of `text`, in order. */
export function glyphsFor(text: string): Glyph[] {
    const f = load();
    return Array.from(text).map((ch) => glyphOf(f, ch));
}
