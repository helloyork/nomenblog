import type { Config } from "tailwindcss";

import { NextUIPluginConfig, nextui } from "@nextui-org/react";

const nextUIConfig: NextUIPluginConfig = {
    addCommonColors: false,
    themes: {
        light: {
            layout: {

            },
            colors: {
                background: "#ffffff",
                primary: {
                    100: "#ffffff",
                    200: "#f3f3f3",
                    300: "#e7e7e7",
                    400: "#b8b8b8",
                    500: "#727272",
                    600: "#141414",
                    700: "#110e0e",
                    800: "#0e0a0a",
                    900: "#0b0607",
                }
            }
        },
        dark: {
            colors: {
                background: "#141414",
                primary: {
                    100: "#F3F3F3",
                    200: "#E7E7E7",
                    300: "#B8B8B8",
                    400: "#727272",
                    500: "#141414",
                    600: "#110E0E",
                    700: "#0E0A0A",
                    800: "#0B0607",
                    900: "#090305",
                }
            }
        }
    }
}

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    darkMode: "class",
    plugins: [
        nextui(nextUIConfig)
    ],
};
export default config;
