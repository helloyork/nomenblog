"use client";

import React from "react";
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../_lib/components/mdx-components';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <div className="mt-32 mb-24 mx-12 sm:mx-24 bg-white dark:bg-primary-500 pb-24">
                <MDXProvider components={MDXComponents}>
                    {children}
                </MDXProvider>
            </div>
        </>
    );
}