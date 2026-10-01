import { getAllBlogs } from "@lib/data/blogs";
import { Projects } from "@lib/data/site";
import { glyphsFor } from "@lib/chuanzi/font.server";
import HomeStage from "@lib/components/home-stage";

export default async function Home() {
    const posts = (await getAllBlogs()).data ?? [];
    const titles = Object.fromEntries(["NOMEN", "BLOGS", "PROJECTS", "ABOUT", "END"].map((t) => [t, glyphsFor(t)]));

    return (
        <HomeStage
            titles={titles}
            total={posts.length}
            posts={posts.slice(0, 5).map((p) => ({ title: p.title, href: p.href, date: p.date, preview: p.preview }))}
            projects={Projects.filter((p) => p.status === "In Progress").slice(0, 5).map((p) => ({ title: p.title, subtitle: p.subtitle, description: p.description, link: p.link }))}
        />
    );
}
