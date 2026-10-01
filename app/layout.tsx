import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Noto_Sans_SC } from "next/font/google";

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
const sans = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500", "700", "900"], variable: "--font-sans", display: "swap", preload: false });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = meta;
export const viewport: Viewport = { themeColor: "#0b0b0b" };

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // next-themes sets its class on <html> before hydration
        <html lang="en" className={clsx("h-full", sans.variable, mono.variable)} suppressHydrationWarning>
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
