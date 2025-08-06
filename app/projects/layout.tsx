"use client";

import React from "react";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            {/* Full screen layout for projects page - no container margins */}
            {children}
        </>
    );
}

