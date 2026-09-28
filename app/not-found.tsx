import Link from "next/link";
import GlyphTitle from "@lib/components/glyph-title";

export default function NotFound() {
    return (
        <section className="n-page n-404">
            <GlyphTitle text="404" />
            <p><Link href="/">Nomen</Link></p>
        </section>
    );
}
