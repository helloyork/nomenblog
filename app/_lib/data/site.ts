
import type { Metadata } from "next";

export const meta: Metadata = {
    title: "Nomen Blog",
    description: "Nomen Blog",
    icons: "/static/favicon.ico",
};

export const SiteMap = {
    route: {
        home: {
            href: "/",
            title: "Home"
        },
        blog: {
            href: "/blog",
            title: "Blog"
        },
        about: {
            href: "/about",
            title: "About"
        },
        projects: {
            href: "/projects",
            title: "Projects"
        }

    }
};

export const Projects = [
    {
        title: "AIAPA",
        subtitle: "NodeJS",
        status: "Finished",
        description: "This is a fast and easy Amazon product analysis tool that crawls product information and analyzes it with AI through automated scripts, ultimately generating product reports.",
        link: "https://github.com/helloyork/aiapa",
    },
    {
        title: "NomenBlog",
        subtitle: "NextJS",
        status: "In Progress",
        description: "This is a blog site that uses NextJS and TailwindCSS.",
        link: "https://github.com/helloyork/nomenblog"
    },
    {
        title: "ChatGPT-CLI",
        subtitle: "NodeJS",
        status: "In Progress",
        description: "This is a CLI tool that uses AI to generate text.",
        link: "https://github.com/helloyork/chatgpt-cmd"
    },
    {
        title: "MewBaka/OtherSidePROJECT",
        subtitle: "Nextron",
        status: "In Progress",
        description: "New Otherworldly Adventure Visual Novel powered by Nextron",
        link: "https://github.com/MewBaka/OtherSideProject"
    },
    {
        title: "NarraLeaf-React",
        subtitle: "NodeJS",
        status: "In Progress",
        description: "React-based visual novel framework",
        link: "https://github.com/helloyork/narraleaf-react"
    },
    {
        title: "@helloyork/CommandParser",
        subtitle: "NodeJS",
        status: "In Progress",
        description: "parse minecraft-liked command",
        link: "https://github.com/helloyork/commandparser"
    },
    {
        title: "excel2ts",
        subtitle: "NodeJS",
        status: "In Progress",
        description: "Convert Excel files to TypeScript Static Types and Datas",
        link: "https://github.com/helloyork/excel2ts"
    },
    {
        title: "helloyork/OtherSideProject-Electron",
        subtitle: "Electron",
        status: "Archived",
        description: "Electron version for OtherSideProject",
        link: "https://github.com/helloyork/OtherSideProject-Electron"
    }
];

export const nav = [
    {
        title: "Blog",
        href: SiteMap.route.blog.href,
    },
    {
        title: "About",
        href: SiteMap.route.about.href,
    },
    {
        title: "Projects",
        href: SiteMap.route.projects.href,
    },
];
