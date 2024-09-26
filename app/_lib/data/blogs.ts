"use server";

import { AppRes, AppResStatus } from "./appReq";
import { Blogs } from "./blogdatas";

export type Blog = {
    title: string;
    date: string;
    href: string;
};

// eslint-disable-next-line no-unused-vars
function toSeoFriendly(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}



export async function getBlog(slug: string): Promise<AppRes<Blog|undefined, AppResStatus>> {
    return {
        status: "success",
        data: Blogs[slug],
        error: null
    };
}

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


