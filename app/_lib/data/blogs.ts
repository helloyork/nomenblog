"use server";

import { AppRes, AppResStatus } from "./appReq";
import { Blogs } from "./blogdatas";

export type Blog = {
    title: string;
    date: string;
    href: string;
};

export async function getBlogList(offset: number = 0, limit: number = 10): Promise<AppRes<Blog[], AppResStatus>> {
    if (offset < 0 || limit < 0 || limit > 20) return {
        status: "error",
        data: null,
        error: "Invalid offset or limit."
    };
    return {
        status: "success",
        data: Object.keys(Blogs).map((slug) => ({
            ...Blogs[slug],
        })).slice(offset, offset + limit),
        error: null
    };
}


