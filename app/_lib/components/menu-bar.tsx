"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEasterExperience } from "@lib/data/easter-experience";

const items = [
    { href: "/", title: "Nomen" },
    { href: "/blog", title: "Blog" },
    { href: "/projects", title: "Projects" },
    { href: "/about", title: "About" },
];

export default function MenuBar() {
    const path = usePathname();
    const { unlocked } = useEasterExperience();
    const all = unlocked ? [...items, { href: "/bad-apple", title: "🍎" }] : items;

    return (
        <nav className="n-menu" aria-label="Site">
            {all.map((item, i) => {
                const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
                return (
                    <Link key={item.href} href={item.href} scroll={false} className={i === 0 ? "n-menu-home" : undefined} aria-current={active ? "page" : undefined}>
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
