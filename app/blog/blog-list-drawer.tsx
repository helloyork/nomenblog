"use client";

import { Blog } from "@/app/_lib/data/blogs";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function BlogListDrawer({ data }: { data: Blog[] }) {
    const [selectedId, setSelectedId] = useState<null | number>(null);

    return (
        <div className="text-left bg-white dark:bg-primary-500">
            {data.map((item, i) => (
                <Link href={"/blog/content/" + item.href} key={"item-" + i} className="no-underline">
                    <motion.div layoutId={String(i)} onClick={() => setSelectedId(i)}
                        className={clsx(
                            "bg-white dark:bg-transparent hover:bg-neutral-100 group rounded-md border border-gray-300 dark:border-neutral-600 sm:dark:border-neutral-800 hover:border-gray-300 dark:hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30",
                            " px-5 py-4 transition-colors  select-none",
                            " w-full h-32 sm:h-32 shadow-md cursor-pointer mr-4 mb-4",
                        )}>
                        <motion.div className="flex items-center">
                            <motion.div className="flex items-end">
                                <h2 className="text-2xl font-semibold">
                                    {item.title}
                                </h2>
                            </motion.div>
                            <motion.span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none select-none">
                                -&gt;
                            </motion.span>
                        </motion.div>

                        <p className="max-w-[30ch] text-sm opacity-50 mr-4 mb-4">
                            {item.date}
                        </p>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}