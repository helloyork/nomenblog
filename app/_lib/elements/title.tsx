"use client";

import clsx from "clsx";

import { useTheme } from "@lib/data/theme";

export default function Title({ title, subtitle }: {
    title?: string;
    subtitle?: string;
}) {
    const state = {
        theme: useTheme().theme,
    };
    return (
        <div id="page-title" className={clsx(
            "border-b border-primary-400 pb-12 mt-4 mb-4",
            {
                "dark": state.theme === "dark",
            },
            "bg-white dark:bg-primary-500"
        )}>
            <h1 className={clsx(
                "text-4xl font-bold text-left mb-2",
                "text-black dark:text-primary-100"
            )}>{title}</h1>
            <h2 className={clsx(
                "text-lg text-left mb-4 text-primary-400"
            )}>{subtitle}</h2>
        </div>
    );
}


