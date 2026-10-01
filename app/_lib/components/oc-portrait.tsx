"use client";

import { useEffect, useRef } from "react";

/**
 * The OC's head and shoulders in the page's two colours. The source map keeps
 * tone in red, outline strength in green and the figure mask in blue; the
 * figure is printed where tone outweighs outline, at the map's own resolution.
 */
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
            const iw = img.naturalWidth, crop = iw * 0.9;
            const w = Math.round(crop), h = Math.round(crop * 0.75);
            cv.width = w;
            cv.height = h;
            const x = cv.getContext("2d", { willReadFrequently: true })!;
            x.drawImage(img, iw * 0.05, img.naturalHeight * 0.04, crop, crop * 0.75, 0, 0, w, h);
            const style = getComputedStyle(cv);
            const parse = (c: string) => (c.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"]).slice(0, 3).map(Number);
            const fg = parse(style.color), bg = parse(style.getPropertyValue("--bg-rgb") || "246,246,243");
            const data = x.getImageData(0, 0, w, h), d = data.data;
            for (let i = 0; i < w * h; i++) {
                const tone = d[i * 4 + 2] > 127 ? (d[i * 4] / 255) * 1.08 - (d[i * 4 + 1] / 255) * 0.9 : 0;
                const c = tone > 0.42 ? fg : bg;
                d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = tone > 0.42 ? 255 : 0;
            }
            x.putImageData(data, 0, 0);
        }).catch(() => { /* the frame stays empty */ });
        return () => { alive = false; };
    }, []);

    return <canvas ref={ref} width={339} height={254} className="n-portrait" aria-hidden="true" />;
}
