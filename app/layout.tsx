

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "@lib/src/stylesheet/base.css";

import { meta } from "./_lib/data/site";

import React from "react";
import clsx from "clsx";
import { Providers } from "./providers";
import Nav from "@lib/elements/navbar";
import { useTheme } from "./_lib/data/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = meta;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full">
            <body className={
                clsx(
                    inter.className,
                    "h-full min-h-screen bg-background dark:bg-primary-500 dark:text-primary-100 transition-colors duration-200 ease-in-out"
                )
            }>
                <Providers>
                    <div className={clsx("dark")}>
                        <Nav />
                    </div>
                    <main className={clsx("text-foreground bg-background", "dark", "h-full min-h-screen")}>
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}

