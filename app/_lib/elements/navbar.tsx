"use client";

import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import Logo from "../components/logo";
import { nav } from "@lib/data/site";
import clsx from "clsx";
import { usePathname } from "next/navigation";

import { SiteMap } from "@lib/data/site";
import { useTheme } from "@lib/data/theme";


export default function Nav() {
    const state = {
        path: usePathname(),
        theme: useTheme()
    }

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <Navbar className={clsx({
            "hidden": state.path === SiteMap.route.home.href
        })} position={"sticky"} onMenuOpenChange={setIsMenuOpen}
        id="navbar">
            <NavbarMenuToggle
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                className="sm:hidden"
            />
            {/* <NavbarBrand>
                <Link href={SiteMap.route.home.href}><Logo light={false} className={" min-h-10 w-24 h-24"} /></Link>
            </NavbarBrand> */}
            <NavbarContent className="hidden sm:flex gap-4 justify-items-center" justify="center">
                {nav.map((item, index) => {
                    let isActive = state.path === item.href;
                    return (
                        <React.Fragment key={index}>
                            <NavbarItem>
                                <Link href={item.href} className={clsx(" transition-all group rounded-lg  mx-2",
                                    `dark:hover:text-gray-300 dark:text-gray-500
                            hover:text-gray-300 text-gray-400  
                             select-none`
                                    , {
                                        "dark:text-gray-300 text-gray-300 ": isActive,
                                        "dark:text-gray-500 text-gray-400": !isActive
                                    })}
                                    aria-current={isActive ? "page" : undefined}>{item.title}</Link>
                            </NavbarItem>
                        </React.Fragment>
                    )
                })}
            </NavbarContent>
            {/* <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <Link href="#">Login</Link>
                </NavbarItem>
                <NavbarItem>
                    <Button as={Link} color="primary" href="#" variant="flat">
                        Sign Up
                    </Button>
                </NavbarItem>
            </NavbarContent> */}
            <NavbarMenu className={clsx(
                state.theme
            )}>
                {nav.map((item, index) => (
                    <NavbarMenuItem key={`${item.href}-${index}`}>
                        <Link
                            color={
                                index === 2 ? "primary" : index === nav.length - 1 ? "danger" : "foreground"
                            }
                            className="w-full"
                            href="#"
                            size="lg"
                        >
                            {item.title}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
}
