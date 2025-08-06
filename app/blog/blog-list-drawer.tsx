"use client";

import { Blog } from "@/app/_lib/data/blogs";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function BlogListDrawer({ data }: { data: Blog[] }) {
    const [selectedId, setSelectedId] = useState<null | number>(null);

    return (
        <div className="text-left bg-black text-white">
            {data.map((item, i) => (
                <Link href={"/blog/content/" + item.href} key={"item-" + i} className="no-underline">
                    <motion.div layoutId={String(i)} onClick={() => setSelectedId(i)}
                        className={clsx(
                            "border border-white/25 hover:bg-white/10 text-white px-6 py-6",
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