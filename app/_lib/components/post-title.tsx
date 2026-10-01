import { Children, isValidElement, ReactNode } from "react";
import PostTitleView from "./post-title-view";

function textOf(node: ReactNode): string {
    return Children.toArray(node).map((c) => {
        if (typeof c === "string" || typeof c === "number") return String(c);
        if (isValidElement<{ children?: ReactNode }>(c)) return textOf(c.props.children);
        return "";
    }).join("");
}

/** A post's `# title`, followed by its date and reading time. */
export default function PostTitle({ children }: { children?: ReactNode }) {
    return <PostTitleView text={textOf(children).trim()} />;
}
