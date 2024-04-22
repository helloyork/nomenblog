"use client";


import { AnimatePresence } from 'framer-motion';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <AnimatePresence>
                <div className="mt-24 mb-24 mx-12   ">
                    {children}
                </div>
            </AnimatePresence>
        </>
    );
};

