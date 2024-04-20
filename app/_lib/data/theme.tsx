"use client";

import React, { createContext } from "react";
import { useContext } from "react";

const ThemeContext = createContext("dark");

export default function ThemeContextProvider({ children, value = "light" }: Readonly<{
    children: React.ReactNode;
    value?: string;
}>) {
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export function useTheme() {
    return useContext(ThemeContext);
};

