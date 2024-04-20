// app/providers.tsx
"use client";

import React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import ThemeContextProvider from "./_lib/data/theme";

import { useTheme } from "@lib/data/theme";

export function Providers({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    return (
        <NextUIProvider>
            <ThemeContextProvider>
                <NextThemesProvider attribute="class" defaultTheme={theme}>
                    {children}
                </NextThemesProvider>
            </ThemeContextProvider>
        </NextUIProvider>
    );
}



