import { Link, NavbarItem } from "@nextui-org/react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import React from "react";
import { nav as _nav } from "../data/site";

export default function NavLinks({ nav = _nav, separate = false, wrapper }:
    { nav?: { title: string; href: string; disabled?: boolean }[], separate?: boolean, wrapper?: (node: React.ReactNode) => React.ReactNode }
) {
    const path = usePathname();
    return (
        <>
            {nav.map((item, index) => {
                let isActive = path === item.href;
                return (
                    <React.Fragment key={index}>{(function () {
                        let content = (
                            <>
                                <Link href={item.href} className={clsx(" transition-all group rounded-lg  mx-2",
                                    `dark:hover:text-gray-300 dark:text-gray-500
                                hover:text-gray-300 text-gray-400  
                                 select-none`
                                    , {
                                        "dark:text-gray-300 text-gray-300 ": isActive,
                                        "dark:text-gray-500 text-gray-400": !isActive
                                    })}
                                    aria-current={isActive ? "page" : undefined} isDisabled={item.disabled || false}>{item.title}</Link>
                                {separate && (index < nav.length - 1) && <span className="mx-2 dark:text-gray-700 text-gray-300 select-none">|</span>}
                            </>
                        )
                        if (wrapper) {
                            return wrapper(content);
                        }
                        return content;
                    })()}
                    </React.Fragment>
                )
            })}
        </>
    );
}

