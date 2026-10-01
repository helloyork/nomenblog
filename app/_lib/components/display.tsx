import { glyphsFor } from "@lib/chuanzi/font.server";

/** A page title, sized by its own width (read from the title font) so that a long word still fits the page. */
export default function Display({ children }: { children: string }) {
    const w = glyphsFor(children).reduce((s, g) => s + g.adv, 0) / 1000;
    return <h1 className="n-display" style={{ ["--w" as string]: w.toFixed(3) }}>{children}</h1>;
}
