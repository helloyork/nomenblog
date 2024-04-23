"use client";

import { marked } from "marked";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";


export default function MarkDown({ data, className }: { data: string; className?: string }) {
    const [sanitizedDescription, setSanitizedDescription] = useState<string | undefined>(undefined);

    useEffect(() => {
        const sanitizeDescription = async () => {
            try {
                const md = marked(data);
                console.log(md);
                console.log(data)
                const sanitized = DOMPurify.sanitize(md);
                setSanitizedDescription(sanitized);
            } catch (error) {
                console.error("Failed to sanitize description", error);
            }
        };
        sanitizeDescription();
    }, [data]);

    return (
        <div id="blog-dangerousContentWrapper">
            <div id="blog-md" className={className}>
                <div dangerouslySetInnerHTML={{ __html: sanitizedDescription || "" }} />
            </div>
        </div>
    );

}

