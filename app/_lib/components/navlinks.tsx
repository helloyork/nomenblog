import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import React from "react";
import { SiteMap, nav as _nav } from "../data/site";

export default function NavLinks({ nav = _nav, separate = false, wrapper }:
    // eslint-disable-next-line no-unused-vars
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
                                <Link href={item.href} scroll={false} className={clsx(" transition-all group rounded-lg  mx-2",
                                    `dark:hover:text-gray-300 dark:text-gray-500
                                hover:text-gray-300
                                 select-none`
                                    , {
                                        "dark:text-gray-300 text-gray-300 ": isActive,
                                        "dark:text-gray-500 text-gray-300": !isActive
                                    })} aria-current={isActive ? "page" : undefined}>{item.title}</Link>
                                {separate && (index < nav.length - 1) && <span className={clsx(
                                    "mx-2 dark:text-gray-700 select-none text-gray-300",
                                    {
                                        "text-gray-200": path === SiteMap.route.home.href
                                    }
                                )}>|</span>}
                            </>
                        );
                        if (wrapper) {
                            return wrapper(content);
                        }
                        return content;
                    })()}
                    </React.Fragment>
                );
            })}
        </>
    );
}

