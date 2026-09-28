import Link from "next/link";
import { getAllBlogs } from "@/app/_lib/data/blogs";
import GlyphTitle from "@lib/components/glyph-title";
import { DitherCover } from "@lib/components/glyph-art";

function seedKind(slug: string) {
    let h = 0;
    for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
    return h % 5;
}

export default async function Page() {
    const res = await getAllBlogs();
    const posts = res.data ?? [];
    const years = Array.from(new Set(posts.map((p) => p.date.slice(0, 4))));

    return (
        <section className="n-page">
            <GlyphTitle text="Blog" />
            <div className="n-rule" aria-hidden="true" />
            {res.status === "error" && <p className="n-dim">{res.error}</p>}
            {years.map((year) => (
                <div className="n-year" key={year}>
                    <h2>{year}</h2>
                    <div className="n-posts">
                        {posts.filter((p) => p.date.startsWith(year)).map((p) => (
                            <Link className="n-post" href={`/blog/content/${p.href}`} key={p.href}>
                                <DitherCover kind={seedKind(p.href)} seed={p.href} />
                                <div>
                                    <h3>{p.title}</h3>
                                    {p.preview && <p>{p.preview}</p>}
                                    <div className="n-post-m">{p.date.replace(/-/g, ".")} · {p.readMinutes} MIN</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
