import Link from "next/link";
import { getAllBlogs } from "@/app/_lib/data/blogs";
import Display from "@lib/components/display";

export default async function Page() {
    const res = await getAllBlogs();
    const posts = res.data ?? [];
    const years = Array.from(new Set(posts.map((p) => p.date.slice(0, 4))));

    return (
        <section className="n-page">
            <Display>BLOGS</Display>
            {res.status === "error" && <p className="n-dim">{res.error}</p>}
            <div className="n-years">
                {years.map((year) => {
                    const inYear = posts.filter((p) => p.date.startsWith(year));
                    return (
                        <div className="n-year" key={year}>
                            <h2>{year}<small>{inYear.length} {inYear.length === 1 ? "post" : "posts"}</small></h2>
                            <ol className="n-list">
                                {inYear.map((p) => (
                                    <li key={p.href}>
                                        <Link scroll={false} className="n-row short" href={`/blog/content/${p.href}`}>
                                            <time dateTime={p.date}>{p.date.slice(5).replace("-", ".")}</time>
                                            <span className="n-t">{p.title}</span>
                                            {p.preview && <span className="n-d">{p.preview}</span>}
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
