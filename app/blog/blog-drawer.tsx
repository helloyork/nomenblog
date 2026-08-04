
"use server";

import { getAllBlogs } from "@/app/_lib/data/blogs";

import BlogListDrawer from "./blog-list-drawer";

export default async function BlogDrawer() {
    const blogs = await getAllBlogs();

    if (blogs.status === "error" || !blogs.data) return <div>{blogs.error}</div>;
    return <BlogListDrawer data={blogs.data} />;
}

