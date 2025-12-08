"use client";

import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import Logo from "../components/logo";
import { nav } from "@lib/data/site";
import clsx from "clsx";
import { usePathname } from "next/navigation";

import { SiteMap } from "@lib/data/site";
import { useTheme } from "@lib/data/theme";

import NavLinks from "@lib/components/navlinks";
import { motion } from "framer-motion";
import { useEasterExperience } from "../data/easter-experience";


export default function Nav({ showLogo = false }: { showLogo?: boolean } = {}) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { unlocked } = useEasterExperience();
    const navItems = React.useMemo(() => {
        if (!unlocked) return nav;
        return [
            ...nav,
            { title: "🍎", href: "/bad-apple" },
        ];
    }, [unlocked]);

    const state = {
        path: usePathname(),
        theme: useTheme().theme,
    };

    return (
        <motion.div
            initial="hidden"
            animate="enter"
            exit="exit"
            variants={{
                hidden: { opacity: 0 },
                enter: { opacity: 1 },
                exit: { opacity: 0 },
            }}
            transition={{ ease: 'easeInOut', duration: 0.3 }}
        >
            <Navbar className={clsx({
                "hidden": state.path === SiteMap.route.home.href
            }, "bg-transparent fixed z-10")} onMenuOpenChange={setIsMenuOpen} id="navbar">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />
                {showLogo && (<NavbarBrand>
                    <Link href={SiteMap.route.home.href}><Logo light={false} className={" min-h-10 w-24 h-24"} /></Link>
                </NavbarBrand>)}
                <NavbarContent className="hidden sm:flex gap-4 justify-items-center" justify="center">
                    <NavLinks nav={navItems} wrapper={(node) => (<NavbarItem>{node}</NavbarItem>)} />
                </NavbarContent>
                <NavbarMenu className={clsx(
                    {
                        "dark": state.theme === "dark",
                    },
                    "m-8"
                )}>
                    {navItems.map((item, index) => (
                        <NavbarMenuItem key={`${item.href}-${index}`}>
                            <Link
                                className={clsx(
                                    "w-full text-white",
                                    {
                                        "text-white": state.path.startsWith(item.href),
                                        "text-neutral-400": !state.path.startsWith(item.href)
                                    }
                                )}
                                href={item.href}
                                size="lg"
                            >
                                {item.title}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>
            </Navbar>
        </motion.div>
    );
}
