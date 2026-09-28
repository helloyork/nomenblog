import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Pixelify_Sans, Silkscreen } from "next/font/google";

import "./globals.css";
import "@lib/src/stylesheet/base.css";
import "@lib/src/stylesheet/nomen.css";

import { meta } from "./_lib/data/site";

import React from "react";
import clsx from "clsx";
import { Providers } from "./providers";
import EasterEgg from "./_lib/components/easter-egg";
import Body from "./body";
import { Analytics } from "@vercel/analytics/react"
import { EasterExperienceProvider } from "./_lib/data/easter-experience";

// Inter stays on <body> for the easter egg overlay; the site itself uses the faces below.
const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "700"], variable: "--font-mono", display: "swap" });
const pixel = Pixelify_Sans({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-pixel", display: "swap" });
const label = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-label", display: "swap" });

export const metadata: Metadata = meta;
export const viewport: Viewport = { themeColor: "#07090d" };

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // next-themes sets its class on <html> before hydration
        <html lang="zh-CN" className={clsx("h-full", mono.variable, pixel.variable, label.variable)} suppressHydrationWarning>
            <body className={clsx(inter.className, "min-h-screen overflow-x-hidden")}>
                <Analytics />
                <Providers>
                    <EasterExperienceProvider>
                        <EasterEgg />
                        <Body>
                            {children}
                        </Body>
                    </EasterExperienceProvider>
                </Providers>
            </body>
        </html>
    );
}
