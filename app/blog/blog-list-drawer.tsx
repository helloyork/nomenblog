"use client";

import { Blog } from "@/app/_lib/data/blogs";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function BlogListDrawer({ data }: { data: Blog[] }) {
    const [selectedId, setSelectedId] = useState<null | number>(null);

    return (
        <div className="text-left bg-black text-white px-4 sm:px-6 md:px-8">
            {data.map((item, i) => (
                <Link href={"/blog/content/" + item.href} key={"item-" + i} className="no-underline">
                    <motion.div layoutId={String(i)} onClick={() => setSelectedId(i)}
                        className={clsx(
                            "border border-white/25 hover:bg-white/10 text-white",
                            "px-4 sm:px-5 md:px-6 py-4 sm:py-5 md:py-6 transition-colors select-none",
                            "w-full min-h-[120px] sm:h-40 md:h-44 shadow-md cursor-pointer mb-4",
                        )}>
                        <motion.div className="flex items-center justify-between gap-2 sm:gap-4">
                            <motion.div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold break-words text-overflow-safe leading-tight">
                                    {item.title}
                                </h2>
                            </motion.div>
                            <motion.span className="flex-shrink-0 inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none select-none text-sm sm:text-base">
                                -&gt;
                            </motion.span>
                        </motion.div>

                        <p className="max-w-full sm:max-w-[30ch] text-xs sm:text-sm opacity-50 mb-2 break-words text-overflow-safe">
                            {item.date}
                        </p>
                        {item.preview ? (
                            <p className="max-w-full sm:max-w-[50ch] text-xs sm:text-sm opacity-70 mb-2 line-clamp-2 break-words text-overflow-safe">
                                {item.preview}
                            </p>
                        ) : (
                            <p className="max-w-full sm:max-w-[50ch] text-xs sm:text-sm opacity-50 mb-2 break-words text-overflow-safe">
                                No preview available
                            </p>
                        )}
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}