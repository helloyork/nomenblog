import { getAllBlogs } from "@/app/_lib/data/blogs";
import PostShell, { PostInfo } from "@lib/components/post-shell";

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const res = await getAllBlogs();
    const posts: PostInfo[] = (res.data ?? []).map((b) => ({
        slug: b.href,
        title: b.title,
        date: b.date,
        description: typeof b.frontmatter?.description === "string" ? b.frontmatter.description : "",
        readMinutes: b.readMinutes,
    }));
    return <PostShell posts={posts}>{children}</PostShell>;
}
