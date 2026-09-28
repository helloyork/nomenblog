"use client";

import { useEffect, useRef } from "react";
import { PBG, PFG, atkinson, clamp } from "@lib/glyph/core";

/** The OC's head and shoulders, Atkinson-dithered to one bit, 128x96 shown at 2x. */
export default function OCPortrait() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const cv = ref.current;
        if (!cv) return;
        let alive = true;
        const img = new Image();
        img.src = "/static/oc/oc-map.png";
        img.decode().then(() => {
            if (!alive) return;
            const w = 128, h = 96, iw = img.naturalWidth, crop = iw * 0.9;
            const s = document.createElement("canvas");
            s.width = w;
            s.height = h;
            const sx = s.getContext("2d", { willReadFrequently: true })!;
            sx.drawImage(img, iw * 0.05, img.naturalHeight * 0.04, crop, crop * 0.75, 0, 0, w, h);
            const d = sx.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
            // tone minus outline strength, inside the figure only
            for (let i = 0; i < w * h; i++) g[i] = d[i * 4 + 2] > 127 ? clamp((d[i * 4] / 255) * 1.08 - (d[i * 4 + 1] / 255) * 0.9, 0, 1) * 255 : 0;
            const bits = atkinson(g, w, h);
            const x = cv.getContext("2d")!, out = x.createImageData(w, h), o = new Uint32Array(out.data.buffer);
            for (let i = 0; i < w * h; i++) o[i] = bits[i] ? PFG : PBG;
            x.putImageData(out, 0, 0);
        }).catch(() => { /* the frame stays empty */ });
        return () => { alive = false; };
    }, []);

    return <canvas ref={ref} width={128} height={96} className="n-portrait" aria-hidden="true" />;
}
