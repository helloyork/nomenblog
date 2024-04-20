/* eslint-disable indent */
"use client";

import Image from "next/image";
import Logo from "@lib/components/logo";
import Link from "next/link";
import { useEffect, useState } from "react";

import React from "react";
import { motion } from "framer-motion"
import clsx from "clsx";

import { nav } from "@lib/data/site";

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

            <div style={{
                position: 'relative',
                "--tw-translate-x": `${x / 50}px`,
                "--tw-translate-y": `${y / 50}px`,
                transform: "translate(var(--tw-translate-x), var(--tw-translate-y))"
            }}
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
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
                <div>
                    <Logo className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 dark:drop-shadow-[0_0_0.8rem_#ffffff70] w-32 h-32 transition-all" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <div className=" flex mb-16 text-center lg:mb-0 lg:w-full lg:max-w-5xl items-center justify-center">
                    {nav.map((item, index) => (
                        <React.Fragment key={index}>
                            <Link href={item.href} className={clsx(" transition-all group rounded-lg  mx-2",
                                `dark:hover:text-gray-300 dark:text-gray-500
                            hover:text-gray-300 text-gray-400  
                             select-none`
                            )}>{item.title}</Link>
                            {index < nav.length - 1 && <span className="mx-2 dark:text-gray-700 text-gray-300 select-none">|</span>}
                        </React.Fragment>
                    ))}
                </div>
            </motion.div>
            {/* <a
                    href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <h2 className="mb-3 text-2xl font-semibold">
                        Docs{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50">
                        Find in-depth information about Next.js features and API.
                    </p>
                </a>*/}
        </main>
    );
}

