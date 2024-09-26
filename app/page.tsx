/* eslint-disable indent */
"use client";

import Logo from "@lib/components/logo";
import { useEffect, useState } from "react";

import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

import NavLinks from "@lib/components/navlinks";


export default function Home() {

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            setMousePosition({
                x: event.clientX - window.innerWidth / 2,
                y: event.clientY - window.innerHeight / 2
            });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const { x, y } = mousePosition;

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
            </div>

            <motion.div style={{
                position: "relative",
                transform: `translate(${x / 50}px, ${y / 50}px)`
            }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={clsx(
                    ` justify-center align-middle relative flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full 
                    before:content-[''] after:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 

                    before:from-white before:to-transparent before:blur-2xl
                    before:dark:to-blue-700 before:dark:opacity-10
                    before:dark:bg-gradient-to-br before:dark:from-transparent 
                    before:bg-gradient-radial after:bg-gradient-conic
                    after:from-sky-200 after:via-blue-200 after:blur-2xl 
                    after:dark:from-sky-800 after:dark:via-[#0141ff] after:dark:opacity-40

                    sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]`,
                )}>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
                <div>
                    <Logo className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:drop-shadow-[0_0_0.8rem_#ffffff70] w-32 h-32 transition-all" />
                    {/* <LogoAnimation className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:drop-shadow-[0_0_0.8rem_#ffffff70] w-32 h-32" /> */}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <div className=" flex mb-16 text-center lg:mb-0 lg:w-full lg:max-w-5xl items-center justify-center">
                    <NavLinks separate={true} />
                </div>
            </motion.div>
        </main>
    );
}

