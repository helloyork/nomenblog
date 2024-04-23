
export const meta = {
    title: "Nomen Blog",
    description: "Nomen Blog",
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
