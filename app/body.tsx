"use client";

import React from "react";

import clsx from "clsx";
import { useTheme } from "@lib/data/theme";
import Nav from "@lib/elements/navbar";

export default function Body({ children }: {
    children: React.ReactNode;
}) {
    const { theme } = useTheme();
    return (
        <>
            <div className={clsx(theme)}>
                <Nav />
            </div>
            <main className={clsx("text-foreground bg-background", {
                "dark:bg-primary-500": theme === "dark",
            }, "h-full min-h-screen")}>
                {children}
            </main>
        </>
    );
}

