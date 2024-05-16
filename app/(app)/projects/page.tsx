"use client";

import { Projects } from "@/app/_lib/data/site";
import Title from "@/app/_lib/elements/title";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Page() {
    const items = Projects;
    const [selectedId, setSelectedId] = useState<null | number>(null);
    return (
        <>
            <Title title="Projects" subtitle="My Projects" />
            <div className={clsx(
                " text-left",
                "flex flex-col md:flex-row row-auto justify-start items-start pb-4",
            )}>
                {items.map((item, i) => (
                    <motion.div layoutId={String(i)} onClick={() => setSelectedId(i)} key={"item-" + i}
                        className={clsx(
                            "group rounded-md border border-gray-300 dark:border-neutral-600 sm:dark:border-neutral-800 px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 select-none",
                            " w-full md:w-64 h-48 shadow-md cursor-pointer mr-4 mb-4",
                        )}>
                        <motion.div className="flex items-center">
                            <motion.div className="flex items-end">
                                <h2 className="text-2xl font-semibold break-all">
                                    {item.title}
                                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none select-none break-normal font-light text-sm ml-1">
                                        {"->"}
                                    </span>
                                </h2>
                            </motion.div>
                        </motion.div>

                        <motion.p className="max-w-[30ch] text-sm opacity-50 mr-4 mb-4">
                            {item.subtitle}
                        </motion.p>
                        <motion.p className="m-0 max-w-[30ch] text-sm opacity-50">
                            {((function () {
                                let maxDescriptionLength = 80;
                                if (item.description.length > maxDescriptionLength) {
                                    return item.description.substring(0, maxDescriptionLength) + "...";
                                } else {
                                    return item.description;
                                }
                            })())}
                        </motion.p>
                    </motion.div>
                ))}
                <AnimatePresence>
                    {selectedId !== null && ((function () {
                        const item = items[selectedId];
                        return (
                            <motion.div
                                className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-30 dark:bg-black dark:bg-opacity-50 backdrop-filter backdrop-blur-md"
                                onClick={() => setSelectedId(null)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.a layoutId={String(selectedId)}
                                    href={item.link}
                                    className={clsx(
                                        "group rounded-md border bg-neutral-100 dark:bg-transparent border-gray-300 dark:border-neutral-500 px-5 py-4 transition-colors hover:border-gray-400 hover:bg-neutral-200 dark:hover:bg-neutral-300 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30",
                                        " sm:w-1/2 sm: m-0 h-64 w-full mx-8",
                                    )}>
                                    <motion.div
                                        className={clsx(
                                            "flex justify-between"
                                        )}>
                                        <motion.h2 className=" text-2xl font-semibold break-words">
                                            {item.title}{" "}
                                            <motion.span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none select-none">
                                                -&gt;
                                            </motion.span>
                                        </motion.h2>
                                        
                                        <motion.h2 className=" text-sm font-light text-neutral-500">
                                            {item.status}
                                        </motion.h2>
                                    </motion.div>
                                    <motion.p className="m-0 text-sm opacity-50 mb-4">
                                        {item.subtitle}
                                    </motion.p>
                                    <motion.p className="m-0 text-sm opacity-50">
                                        {item.description}
                                    </motion.p>
                                </motion.a>
                            </motion.div>
                        );
                    })())}
                </AnimatePresence>
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
                </a> */}
            </div>
        </>
    );
}

