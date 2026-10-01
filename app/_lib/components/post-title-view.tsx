"use client";

import { usePost } from "./post-shell";

export default function PostTitleView({ text }: { text: string }) {
    const post = usePost();
    return (
        <header className="n-post-head">
            <h1 className="n-display n-display-post">{text}</h1>
            {post && (
                <div className="n-meta">
                    <span>{post.date.replace(/-/g, ".")}</span>
                    <span>{post.readMinutes} min read</span>
                </div>
            )}
            {post?.description && <p className="n-desc">{post.description}</p>}
        </header>
    );
}
