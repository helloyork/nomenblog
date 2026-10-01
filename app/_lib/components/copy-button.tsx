"use client";

import { useState } from "react";

/** Copies `text`; if the clipboard refuses, selects the element with id `target` instead. */
export default function CopyButton({ text, target }: { text: string; target?: string }) {
    const [label, setLabel] = useState("Copy");
    const fallback = () => {
        const el = target ? document.getElementById(target) : null;
        if (el) {
            const r = document.createRange();
            r.selectNodeContents(el);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(r);
        }
        setLabel("Selected, press Ctrl+C");
    };
    return (
        <button
            type="button"
            className="n-btn"
            onClick={() => {
                try {
                    navigator.clipboard.writeText(text).then(() => {
                        setLabel("Copied");
                        setTimeout(() => setLabel("Copy"), 1600);
                    }, fallback);
                } catch {
                    fallback();
                }
            }}
        >
            {label}
        </button>
    );
}
