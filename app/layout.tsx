

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "@lib/src/stylesheet/base.css";

import { meta } from "./_lib/data/site";

import React from "react";
import clsx from "clsx";
import { Providers } from "./providers";
import Nav from "@lib/elements/navbar";

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
                    "h-full"
                )
            }>
                <Providers>
                    <div className={clsx("dark")}>
                        <Nav />
                    </div>
                    <main className="text-foreground bg-background dark">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}

