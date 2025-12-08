

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "@lib/src/stylesheet/base.css";

import { meta } from "./_lib/data/site";

import React from "react";
import clsx from "clsx";
import { Providers } from "./providers";
import EasterEgg from "./_lib/components/easter-egg";
import Body from "./body";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = meta;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={clsx("h-full")}>
            <body className={
                clsx(
                    inter.className,
                    "h-full min-h-screen bg-black dark:text-primary-100 transition-colors duration-200 ease-in-out overflow-x-hidden",
                )
            }>
                <Analytics />
                <Providers>
                    <EasterEgg />
                    <Body>
                        {children}
                    </Body>
                </Providers>
            </body>
        </html>
    );
}

