import Link from "next/link";
import HomeHero from "@lib/components/home-hero";
import { GlyphArt } from "@lib/components/glyph-art";

const doors = [
    { href: "/blog", title: "Blog", kind: 2 },
    { href: "/projects", title: "Projects", kind: 0 },
    { href: "/about", title: "About", kind: 3 },
];

export default function Home() {
    return (
        <>
            <HomeHero />
            <nav className="n-doors" aria-label="Sections">
                {doors.map((d) => (
                    <Link className="n-door" href={d.href} key={d.href}>
                        <GlyphArt kind={d.kind} seed={`door-${d.title.toLowerCase()}`} />
                        <h2>{d.title}</h2>
                    </Link>
                ))}
            </nav>
        </>
    );
}
