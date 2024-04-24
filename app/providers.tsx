"use client";

import React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import ThemeContextProvider, { useTheme } from "@lib/data/theme";


export function Providers({ children }: { children: React.ReactNode }) {
    "use client";

    let theme = "light";
    if (typeof window !== "undefined") {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            theme = "dark";
        }
    }
    return (
        <NextUIProvider>
            <ThemeContextProvider value={theme}>
                <NextTheme theme={theme}>
                    {children}
                </NextTheme>
            </ThemeContextProvider>
        </NextUIProvider>
    );
}

function NextTheme({ children, theme }: { children: React.ReactNode; theme: string }) {
    "use client";
    return (
        <NextThemesProvider attribute="class" defaultTheme={theme}>
            {children}
        </NextThemesProvider>
    );
}



