"use client";

import React from "react";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <div className="min-h-screen bg-black text-white flex justify-center py-24">
                <div className="container px-6">
                {children}
            </div>
            </div>
        </>
    );
}

