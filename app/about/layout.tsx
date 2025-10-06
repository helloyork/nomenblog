"use client";

import React from "react";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <div className="h-screen bg-black text-white flex justify-center">
                <div className="container px-6 flex-1 flex flex-col">
                    {children}
                </div>
            </div>
        </>
    );
}

