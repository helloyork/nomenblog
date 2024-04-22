"use client";

import React, { useEffect } from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import Logo from "../components/logo";
import { nav } from "@lib/data/site";
import clsx from "clsx";
import { usePathname } from "next/navigation";

import { SiteMap } from "@lib/data/site";
import { useTheme } from "@lib/data/theme";

import NavLinks from "@lib/components/navlinks";


export default function Nav() {
    const [_isOnTop, _setIsOnTop] = React.useState(true);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const state = {
        path: usePathname(),
        theme: useTheme(),
        getIsOnTop: () => _isOnTop,
    }
    const controller = {
        setIsOnTop: _setIsOnTop
    }

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                controller.setIsOnTop(false);
            } else {
                controller.setIsOnTop(true);
            }
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    });
    

    return (
        <Navbar className={clsx({
            "hidden": state.path === SiteMap.route.home.href
        }, {
            "bg-transparent": state.getIsOnTop(),
        }, "transition-color fixed")} onMenuOpenChange={setIsMenuOpen}
        id="navbar" isBordered={!state.getIsOnTop()}>
            <NavbarMenuToggle
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                className="sm:hidden"
            />
            {/* <NavbarBrand>
                <Link href={SiteMap.route.home.href}><Logo light={false} className={" min-h-10 w-24 h-24"} /></Link>
            </NavbarBrand> */}
            <NavbarContent className="hidden sm:flex gap-4 justify-items-center" justify="center">
                <NavLinks wrapper={(node)=>(<NavbarItem>{node}</NavbarItem>)} />
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
