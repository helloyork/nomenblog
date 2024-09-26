"use client";

import React, { createContext, useEffect } from "react";
import { useContext } from "react";

const ThemeContext = createContext({
    theme: "light",
    // eslint-disable-next-line no-unused-vars
    setTheme: (theme: string) => { },
});


export default function ThemeContextProvider({ children, value = "light" }: Readonly<{
    children: React.ReactNode;
    value?: string;
}>) {
    const [theme, setTheme] = React.useState(value);
    useEffect(() => {
        setTheme(value);
        if (typeof window !== "undefined") {
            const localTheme = localStorage.getItem("app-theme");
            if (localTheme && localTheme !== theme && ["light", "dark"].includes(localTheme)) {
                setTheme(localTheme);
            } else {
                localStorage.setItem("theme", theme);
                setTheme(theme);
            }
        }
    }, [theme, value]);


    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

