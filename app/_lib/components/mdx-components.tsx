import React, { ComponentPropsWithoutRef } from "react";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { Prism } from "react-syntax-highlighter";
import PostTitle from "./post-title";
import MermaidBlock from "./mermaid-block";

// Cast through unknown to satisfy JSX typing from react-syntax-highlighter.
const SyntaxHighlighter = Prism as unknown as React.ComponentType<SyntaxHighlighterProps>;

// The code panel is printed the other way round from its page; tokens stay in
// that one colour, told apart by weight, underline and a faded tone.
const FG = "inherit";
const DIM = "color-mix(in srgb, currentColor 55%, transparent)";

const oneBit: { [key: string]: React.CSSProperties } = {
    'code[class*="language-"]': { color: FG, background: "none", fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit", whiteSpace: "pre", textShadow: "none" },
    'pre[class*="language-"]': { color: FG, background: "none", margin: 0, padding: "12px 16px 12px 0", overflow: "auto" },
    comment: { color: DIM, fontStyle: "italic" },
    prolog: { color: DIM },
    doctype: { color: DIM },
    cdata: { color: DIM },
    punctuation: { color: DIM },
    operator: { color: DIM },
    "attr-name": { color: DIM },
    keyword: { fontWeight: 700 },
    builtin: { fontWeight: 700 },
    "class-name": { fontWeight: 700 },
    boolean: { fontWeight: 700 },
    tag: { fontWeight: 700 },
    selector: { fontWeight: 700 },
    important: { fontWeight: 700 },
    function: { textDecoration: "underline", textDecorationColor: DIM, textUnderlineOffset: "3px" },
};

function textOf(node: React.ReactNode): string {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(textOf).join("");
    if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
    return "";
}

function CodeBlock(props: ComponentPropsWithoutRef<"pre">) {
    const child = props.children as React.ReactElement<{ children?: React.ReactNode; className?: string }> | undefined;
    const code = textOf(child?.props?.children).replace(/\n$/, "");
    // remark-prism marks fences without a language as "unknown"
    const raw = (child?.props?.className ?? "").replace("language-", "");
    const lang = !raw || raw === "unknown" ? "text" : raw;

    // Mermaid first, before Prism gets a chance to tokenise it
    if (lang === "mermaid" && code) return <MermaidBlock chart={code.trim()} />;

    const lines = code.split("\n").length;
    return (
        <div className="n-code">
            <div className="n-code-bar"><span>{lang} · {lines} {lines === 1 ? "line" : "lines"}</span></div>
            <SyntaxHighlighter
                language={lang}
                style={oneBit}
                showLineNumbers
                lineNumberStyle={{ color: DIM, minWidth: "3.5ch", paddingRight: "14px", textAlign: "right", userSelect: "none" }}
                customStyle={{ background: "none", margin: 0 }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

const MDXComponents = {
    h1: ({ children }: ComponentPropsWithoutRef<"h1">) => <PostTitle>{children}</PostTitle>,
    pre: CodeBlock,
    table: (props: ComponentPropsWithoutRef<"table">) => (
        <div className="n-tbl">
            <table {...props} />
        </div>
    ),
    // eslint-disable-next-line @next/next/no-img-element
    img: ({ src, alt }: ComponentPropsWithoutRef<"img">) => <span className="n-inline-img"><img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" /></span>,
};

export default MDXComponents;
