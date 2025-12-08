"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export default function BadApplePage() {
    const [frames, setFrames] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const [state, setState] = useState<"loading" | "ready" | "error">("loading");
    const timerRef = useRef<number>();

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await fetch("/static/bad_apple.json");
                if (!res.ok) throw new Error("fetch failed");
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error("invalid format");
                if (cancelled) return;
                setFrames(data as string[]);
                setIndex(0);
                setState("ready");
            } catch (err) {
                console.error(err);
                if (!cancelled) setState("error");
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (state !== "ready" || frames.length === 0) return;
        const interval = window.setInterval(() => {
            setIndex((prev) => {
                const next = prev + 1;
                if (next >= frames.length) {
                    return prev;
                }
                return next;
            });
        }, 1000 / 15);
        timerRef.current = interval;
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [frames, state]);

    const currentFrame = useMemo(() => frames[index] ?? "", [frames, index]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-black text-gray-200 px-4 py-10">
            <pre className="font-mono whitespace-pre text-gray-100 leading-[1.05] text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] w-[60vw] max-w-3xl min-h-[320px]">
                {state === "error" ? "Failed to load frames." : currentFrame}
            </pre>
        </main>
    );
}

