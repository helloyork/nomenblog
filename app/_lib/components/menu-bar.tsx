"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEasterExperience } from "@lib/data/easter-experience";

const items = [
    { href: "/blog", title: "Blog" },
    { href: "/projects", title: "Projects" },
    { href: "/about", title: "About" },
];

/** Drawn white in difference mode, so it reads on paper and on ink alike. */
export default function MenuBar() {
    const path = usePathname();
    const { unlocked } = useEasterExperience();
    const all = unlocked ? [...items, { href: "/bad-apple", title: "🍎" }] : items;

    return (
        <header className="n-menu">
            <Link href="/" scroll={false} className="n-menu-home" aria-current={path === "/" ? "page" : undefined}>nomen.blog</Link>
            <nav aria-label="Site">
                {all.map((item) => (
                    <Link key={item.href} href={item.href} scroll={false} aria-current={path.startsWith(item.href) ? "page" : undefined}>
                        {item.title}
                    </Link>
                ))}
            </nav>
        </header>
    );
}
