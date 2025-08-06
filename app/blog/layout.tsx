"use client";

import React from "react";
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../_lib/components/mdx-components';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <div className="min-h-screen bg-black text-white flex justify-center py-24">
            <div className="container px-6">
                <MDXProvider components={MDXComponents}>
                    {children}
                </MDXProvider>
            </div>
            </div>
        </>
    );
}