
export const meta = {
    title: "AOOS Draft",
    description: "A draft of the AOOS website",
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
        contact: {
            href: "/contact",
            title: "Contact"
        },

    }
}

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
        title: "Contact",
        href: SiteMap.route.contact.href,
    },
];
