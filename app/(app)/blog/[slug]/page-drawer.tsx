"use client";

import { Blog } from "@lib/data/blogs";

import { notFound } from "next/navigation";
import type { AppRes, AppResStatus } from "@lib/data/appReq";
import Title from "@lib/elements/title";
import MarkDown from "../md-parser";


export default function PageDrawer({ data, className }: { data: AppRes<Blog | undefined, AppResStatus>; className?: string }) {

    if (!data.data || !data.data.content) {
        return notFound();
    }

    return (
        <div className="text-left pb-12">
            <Title title={data.data?.title || "Blog"} subtitle={data.data?.date || ""} />
            <MarkDown data={data.data.content} className={className} />
        </div>
    );

}

