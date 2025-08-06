
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
        },
    }
};

export const Projects = [
    {
        title: "NarraLeaf",
        subtitle: "NodeJS",
        status: "In Progress",
        description: "A new definition of Visual Novel Engine",
        link: "https://github.com/NarraLeaf/NarraLeaf"
    },
    {
        title: "NarraLeaf-React",
        subtitle: "React",
        status: "In Progress",
        description: "React-based visual novel framework",
        link: "https://github.com/NarraLeaf/narraleaf-react"
    },
    {
        title: "NarraLang",
        subtitle: "NodeJS",
        status: "In Progress",
        description: "NarraLeaf's own programming language",
        link: "https://github.com/NarraLeaf/NarraLang"
    },
    {
        title: "NarraUI",
        subtitle: "React",
        status: "Planning",
        description: "NarraLeaf's UI framework",
        link: "https://github.com/NarraLeaf/NarraUI"
    },
    {
        title: "NarraLeaf Editor",
        subtitle: "React",
        status: "Planning",
        description: "NarraLeaf Visual Novel Editor",
        link: "https://github.com/NarraLeaf/NarraLeaf-Editor"
    },
    {
        title: "NarraLang VSCode Extension",
        subtitle: "React",
        status: "Planning",
        description: "NarraLang VSCode Extension",
        link: "https://github.com/NarraLeaf"
    },
    {
        title: "AIAPA",
        subtitle: "NodeJS",
        status: "Finished",
        description: "This is a fast and easy Amazon product analysis tool that crawls product information and analyzes it with AI through automated scripts, ultimately generating product reports.",
        link: "https://github.com/helloyork/aiapa",
    },
    {
        title: "MewBaka/OtherSidePROJECT",
        subtitle: "Nextron",
        status: "In Progress",
        description: "New Otherworldly Adventure Visual Novel powered by Nextron",
        link: "https://github.com/MewBaka/OtherSideProject"
    },
    {
        title: "excel2ts",
        subtitle: "NodeJS",
        status: "In Progress",
        description: "Convert Excel files to TypeScript Static Types and Datas",
        link: "https://github.com/helloyork/excel2ts"
    },
    {
        title: "react.narraleaf.com",
        subtitle: "Nextra",
        status: "In Progress",
        description: "Documentation for NarraLeaf-React",
        link: "https://github.com/NarraLeaf/react.narraleaf.com"
    },
    {
        title: "oIndex",
        subtitle: "NodeJS",
        status: "In Progress",
        description: "New desktop tool that uses AI to recognize and index files",
        link: "https://github.com/helloyork/oIndex"
    },
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
