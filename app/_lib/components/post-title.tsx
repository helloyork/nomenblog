"use client";

import { Children, isValidElement, ReactNode } from "react";
import GlyphTitle from "./glyph-title";
import { usePost } from "./post-shell";

function textOf(node: ReactNode): string {
    return Children.toArray(node).map((c) => {
        if (typeof c === "string" || typeof c === "number") return String(c);
        if (isValidElement<{ children?: ReactNode }>(c)) return textOf(c.props.children);
        return "";
    }).join("");
}

/** A post's `# title`: drawn in characters, followed by its date and reading time. */
export default function PostTitle({ children }: { children?: ReactNode }) {
    const post = usePost();
    return (
        <header className="n-post-head">
            <GlyphTitle text={textOf(children)} />
            {post && (
                <div className="n-meta">
                    <span>{post.date.replace(/-/g, ".")}</span>
                    <span>{post.readMinutes} MIN READ</span>
                </div>
            )}
            {post?.description && <p className="n-desc">{post.description}</p>}
        </header>
    );
}
