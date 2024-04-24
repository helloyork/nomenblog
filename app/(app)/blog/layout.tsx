"use client";

import React from "react";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <div className="mt-32 mb-24 mx-12 sm:mx-24 bg-white dark:bg-primary-500">
                {children}
            </div>
        </>
    );
}