"use client";

import { Blog } from "@/app/_lib/data/blogs";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import MarkDown from "./md-parser";

export default function BlogListDrawer({ data }: { data: Blog[] }) {
    const [selectedId, setSelectedId] = useState<null | number>(null);

    return (
        <div className="text-left bg-white dark:bg-primary-500">
            {data.map((item, i) => (
                <motion.div layoutId={String(i)} onClick={() => setSelectedId(i)} key={"item-" + i}
                    className={clsx(
                        "bg-white dark:bg-transparent hover:bg-neutral-100 group rounded-md border border-gray-300 dark:border-neutral-600 sm:dark:border-neutral-800 hover:border-gray-300 dark:hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30",
                        " px-5 py-4 transition-colors  select-none",
                        " w-full h-64 sm:h-48 shadow-md cursor-pointer mr-4 mb-4",
                    )}>
                    <motion.div className="flex items-center">
                        <motion.div className="flex items-end">
                            <motion.h2 className="text-2xl font-semibold">
                                {item.title}
                            </motion.h2>
                        </motion.div>
                        <motion.span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none select-none">
                            -&gt;
                        </motion.span>
                    </motion.div>

                    <motion.p className="max-w-[30ch] text-sm opacity-50 mr-4 mb-4">
                        {item.date}
                    </motion.p>
                    <motion.div className="overflow-hidden h-24">
                        {((function () {
                            let maxDescriptionLength = 120, data;
                            if (item.content.length > maxDescriptionLength) {
                                data = item.content.substring(0, maxDescriptionLength) + "...";
                            } else {
                                data = item.content;
                            }
                            return (<div className="overflow-hidden w-full h-full m-4">
                                <MarkDown data={data} className="m-0 text-sm opacity-50" />
                            </div>);
                        })())}
                    </motion.div>
                </motion.div>
            ))}
            <AnimatePresence>
                {selectedId !== null && ((function () {
                    const item = data[selectedId];
                    return (
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-30 dark:bg-black dark:bg-opacity-50 backdrop-filter backdrop-blur-md"
                            onClick={() => setSelectedId(null)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.a layoutId={String(selectedId)}
                                href={"/blog/" + item.href}
                                className={clsx(
                                    "group rounded-md border bg-neutral-100 dark:bg-transparent border-gray-300 dark:border-neutral-500 px-5 py-4 transition-colors hover:border-gray-400 hover:bg-neutral-200 dark:hover:bg-neutral-300 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30",
                                    " sm:w-4/6 sm: m-0 h-4/6 sm:h-1/2 w-full mx-8 overflow-auto",
                                )}>
                                <motion.div
                                    className={clsx(
                                        "flex justify-between"
                                    )}>
                                    <motion.h2 className=" text-2xl font-semibold">
                                        {item.title}{" "}
                                        <motion.span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none select-none">
                                            -&gt;
                                        </motion.span>
                                    </motion.h2>
                                </motion.div>
                                <motion.p className="m-0 text-sm opacity-50 mb-4">
                                    {item.date}
                                </motion.p>
                                {((function () {
                                    let maxDescriptionLength = 360, data;
                                    if (item.content.length > maxDescriptionLength) {
                                        data = item.content.substring(0, maxDescriptionLength) + "...";
                                    } else {
                                        data = item.content;
                                    }
                                    return (<MarkDown data={data} className="m-0  text-sm opacity-50" />);
                                })())}
                                
                                <motion.p className="m-0 text-sm opacity-50 mt-12">
                                    {"..."}
                                </motion.p>
                                <motion.p className="m-0 text-sm opacity-50 font-bold">
                                    {"read more by clicking here ->"}
                                </motion.p>
                            </motion.a>
                        </motion.div>
                    );
                })())}
            </AnimatePresence>
        </div>
    );
}

