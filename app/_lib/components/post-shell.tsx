"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type PostInfo = {
    slug: string;
    title: string;
    date: string;
    description: string;
    readMinutes: number;
};

const PostContext = createContext<PostInfo | null>(null);
export const usePost = () => useContext(PostContext);

/** The page every post is shown in, plus links to its neighbours. */
export default function PostShell({ posts, children }: { posts: PostInfo[]; children: React.ReactNode }) {
    const pathname = usePathname();
    // The route transition remounts this per page. Keep the slug it mounted
    // with, so an outgoing post keeps its own neighbours while it is covered.
    const [slug] = useState(() => pathname.split("/").filter(Boolean).pop() ?? "");
    const i = posts.findIndex((p) => p.slug === slug);
    const post = i >= 0 ? posts[i] : null;
    const prev = i >= 0 ? posts[i + 1] : undefined;
    const next = i > 0 ? posts[i - 1] : undefined;

    useEffect(() => {
        if (!post) return;
        document.title = `${post.title} - Nomen Blog`;
        if (post.description) {
            let meta = document.querySelector('meta[name="description"]');
            if (!meta) {
                meta = document.createElement("meta");
                meta.setAttribute("name", "description");
                document.head.appendChild(meta);
            }
            meta.setAttribute("content", post.description);
        }
    }, [post]);

    return (
        <PostContext.Provider value={post}>
            <section className="n-page n-post-page">
                <article className="n-md" lang="zh-CN">{children}</article>
                <nav className="n-pn" aria-label="Older and newer posts">
                    {prev ? (
                        <Link scroll={false} href={`/blog/content/${prev.slug}`}><span>← Older</span><b className="n-t" lang="zh-CN">{prev.title}</b></Link>
                    ) : <span />}
                    {next && (
                        <Link scroll={false} className="n-pn-next" href={`/blog/content/${next.slug}`}><span>Newer →</span><b className="n-t" lang="zh-CN">{next.title}</b></Link>
                    )}
                </nav>
            </section>
        </PostContext.Provider>
    );
}
