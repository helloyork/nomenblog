
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
        title: "NarraLeaf Studio",
        subtitle: "Electron",
        status: "In Progress",
        description: "A zero-code, all-in-one visual novel IDE.",
        link: "https://github.com/NarraLeaf/NarraLeaf-Studio"
    },
    {
        title: "AnimeLogon",
        subtitle: "C++ / Win32",
        status: "In Progress",
        description: "Replaces the Windows 10/11 lock screen with an animated wallpaper.",
        link: "https://github.com/helloyork/AnimeLogon"
    },
    {
        title: "AnimeBoot",
        subtitle: "C",
        status: "In Progress",
        description: "A proof-of-concept project that plays animations (looking like animated GIFs) before Windows Boot Manager or custom UEFI bootloaders, making your PC startup process more personalized.",
        link: "https://github.com/helloyork/AnimeBoot"
    },
    {
        title: "Micula",
        subtitle: "C++17",
        status: "In Progress",
        description: "Fluent-style controls for Win32 programs. Header-only, drawn with Direct2D into a DirectComposition swap chain so Windows 11 can show Mica behind the window.",
        link: "https://github.com/helloyork/micula"
    },
    {
        title: "Shittim Logon",
        subtitle: "C++ / Win32",
        status: "In Progress",
        description: "Replaces the Windows 11 logon screen with a live Spine-rendered Shittim Chest scene: a zero-tile credential provider as the wake signal, a DirectComposition overlay on the secure desktop, and a Hyper-V lab to measure what it costs.",
        link: "https://github.com/helloyork/shittim-logon"
    },
    {
        title: "driftfield",
        subtitle: "TypeScript",
        status: "In Progress",
        description: "Deterministic, seamlessly looping procedural particle fields (snow, rain, falling petals), rasterised to RGBA with zero dependencies.",
        link: "https://github.com/helloyork/driftfield"
    },
    {
        title: "Wayfo",
        subtitle: "NodeJS",
        status: "Finished",
        description: "Automates the full workflow of migrating home‑goods product data from Amazon to Wayfair, from data extraction to transformation and listing.",
        link: "https://github.com/helloyork/wayfo"
    },
    {
        title: "@NarraLeaf/CharPack",
        subtitle: "NodeJS",
        status: "Finished",
        description: "Image compression tool for optimizing character assets",
        link: "https://github.com/NarraLeaf/CharPack"
    },{
        title: "@NarraLeaf/Sound",
        subtitle: "JavaScript",
        status: "Finished",
        description: "A lightweight and modern HTML audio management solution, suitable for simple web games.",
        link: "https://github.com/NarraLeaf/Sound"
    },
    {
        title: "NarraLang",
        subtitle: "NodeJS",
        status: "In Progress",
        description: "NarraLeaf's own programming language",
        link: "https://github.com/NarraLeaf/NarraLang"
    },
    {
        title: "NarraLeaf-Team",
        subtitle: "TypeScript",
        status: "In Progress",
        description: "A self-hosted project server for teams working in NarraLeaf Studio: shared projects, accounts and access checks, run on the team's own network.",
        link: "https://github.com/NarraLeaf/NarraLeaf-Team"
    },
    {
        title: "Studio-Shell",
        subtitle: "Kotlin / Swift",
        status: "In Progress",
        description: "The native WebView shells NarraLeaf Studio repacks into Android and iOS builds of a game, so an author never installs a mobile SDK.",
        link: "https://github.com/NarraLeaf/Studio-Shell"
    },
    {
        title: "NarraLeaf Plugins",
        subtitle: "TypeScript",
        status: "In Progress",
        description: "The official plugin registry for NarraLeaf Studio.",
        link: "https://github.com/NarraLeaf/Plugins"
    },
    {
        title: "narraleaf.com",
        subtitle: "Fumadocs",
        status: "In Progress",
        description: "NarraLeaf's website: documentation and a blog in Chinese, English and Japanese.",
        link: "https://github.com/NarraLeaf/narraleaf.com"
    },
    {
        title: "NarraUI",
        subtitle: "React",
        status: "Planning",
        description: "NarraLeaf's UI framework",
        link: "https://github.com/NarraLeaf/NarraUI"
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
        title: "excel2ts",
        subtitle: "NodeJS",
        status: "Finished",
        description: "Convert Excel files to TypeScript Static Types and Datas",
        link: "https://github.com/helloyork/excel2ts"
    },
    {
        title: "react.narraleaf.com",
        subtitle: "Nextra",
        status: "Finished",
        description: "Documentation for NarraLeaf-React",
        link: "https://github.com/NarraLeaf/react.narraleaf.com"
    },
    {
        title: "MORE",
        subtitle: "",
        status: "",
        description: "Contact me and make something cool together!",
        link: "/about"
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
