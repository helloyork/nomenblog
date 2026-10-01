"use client";

import React from "react";
import MenuBar from "@lib/components/menu-bar";
import DiveOverlay from "@lib/components/dive";
import FadeTransition from "./_lib/components/fade-transition";


export default function Body({ children }: {
    children: React.ReactNode;
}) {
    return (
        <div className="n-site">
            <MenuBar />
            <main className="n-main">
                <FadeTransition>
                    {children}
                </FadeTransition>
            </main>
            <DiveOverlay />
        </div>
    );
}
