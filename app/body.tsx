"use client";

import React from "react";

import clsx from "clsx";
import { useTheme } from "@lib/data/theme";
import Nav from "@lib/elements/navbar";
import SlideTransition from "./_lib/components/slide-transition";

export default function Body({ children }: {
    children: React.ReactNode;
}) {
    const { theme } = useTheme();
    return (
        <>
            <div className={clsx(theme)}>
                <Nav />
            </div>
            <main className={clsx("text-foreground bg-black", "h-full min-h-screen")}>
                <SlideTransition>
                    {children}
                </SlideTransition>
            </main>
        </>
    );
}

