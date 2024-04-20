"use client";


import { AnimatePresence } from 'framer-motion';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <AnimatePresence>
                {children}
            </AnimatePresence>
        </>
    );
};

