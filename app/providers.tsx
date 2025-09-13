"use client";

import React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import ThemeContextProvider from "@lib/data/theme";


export function Providers({ children }: { children: React.ReactNode }) {
    "use client";

    return (
        <NextUIProvider>
            <ThemeContextProvider value="dark">
                <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
                    {children}
                </NextThemesProvider>
            </ThemeContextProvider>
        </NextUIProvider>
    );
}



