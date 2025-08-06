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
      <div className="container mx-auto">
        <div className={clsx(
          " text-left",
          "flex flex-col md:flex-row row-auto justify-start items-start pb-4 flex-wrap",
        )}>
          {items.map((item, i) => (
            <div onClick={() => setSelectedId(i)} key={"item-" + i}
              className={clsx(
                "border border-white/25 px-6 py-6 transition-colors hover:bg-white/10 text-white select-none",
                " w-full md:w-64 h-48 shadow-md cursor-pointer mr-4 mb-4",
              )}>
              <div className="flex items-center">
                <div className="flex items-end">
                  <h2 className="text-2xl font-semibold break-all">
                    {item.title}
                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none select-none break-normal font-light text-sm ml-1">
                      {"->"}
                    </span>
                  </h2>
                </div>
              </div>

              <p className="max-w-[30ch] text-sm opacity-50 mr-4 mb-4">
                {item.subtitle}
              </p>
              <p className="m-0 max-w-[30ch] text-sm opacity-50">
                {((function () {
                  let maxDescriptionLength = 80;
                  if (item.description.length > maxDescriptionLength) {
                    return item.description.substring(0, maxDescriptionLength) + "...";
                  } else {
                    return item.description;
                  }
                })())}
              </p>
            </div>
          ))}
          <AnimatePresence>
            {selectedId !== null && ((function () {
              const item = items[selectedId];
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-30 dark:bg-black dark:bg-opacity-50 backdrop-filter backdrop-blur-md"
                  onClick={() => setSelectedId(null)}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <a
                    href={item.link}
                    className={clsx(
                      "border border-white/50 bg-black text-white px-8 py-8",
                      " sm:w-1/2 sm: m-0 h-64 w-full mx-8",
                    )}>
                    <div
                      className={clsx(
                        "flex justify-between"
                      )}>
                      <h2 className=" text-2xl font-semibold break-words">
                        {item.title}{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none select-none">
                          -&gt;
                        </span>
                      </h2>

                      <h2 className=" text-sm font-light text-neutral-500">
                        {item.status}
                      </h2>
                    </div>
                    <p className="m-0 text-sm opacity-50 mb-4">
                      {item.subtitle}
                    </p>
                    <p className="m-0 text-sm opacity-50">
                      {item.description}
                    </p>
                  </a>
                </motion.div>
              );
            })())}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}