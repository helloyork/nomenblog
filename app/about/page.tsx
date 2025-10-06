
import Title from "@/app/_lib/elements/title";
"use client";
import ScrollList from "../_lib/components/scroll-list";
import { useState, useEffect } from "react";

export default function Page() {
    const scrollItems = [
        {
            id: "about-me",
            title: "About Me",
            content: `Hi, I'm Nomen (helloyork), a passionate full-stack developer focused on creating modern, efficient, and user-friendly web applications. 
    I specialize in front-end frameworks like React, Next.js, and Svelte, and have hands-on experience with Node.js, serverless architectures, and cloud services. 
    I love turning complex problems into elegant solutions and continuously learning new technologies.`
        },
        {
            id: "contact-me",
            title: "Contact Me",
            content: `Email: helloyork@icloud.com
    GitHub: https://github.com/helloyork
    Blog: https://www.nomen.blog/
    
    I'm always open to collaboration, project discussions, or tech conversations. Feel free to reach out!`
        },
        {
            id: "skills",
            title: "Technical Skills",
            content: `Frontend: React, Next.js, Svelte, TypeScript, JavaScript, HTML, CSS, Tailwind CSS
    Backend: Node.js, Serverless Functions, RESTful APIs, WebSocket, GraphQL
    Database: SQL, ORM
    Cloud & DevOps: Google Cloud, Azure, Laf, Docker, GitHub Actions
    Tools & Libraries: Webpack, EsBuild, Babel, Puppeteer, Electron, Tauri (learning), Jest, ESLint, Husky
    Other: Rust (learning)
    
    I enjoy building scalable applications and exploring emerging web technologies.`
        },
        {
            id: "experience",
            title: "Experience",
            content: `I have developed a variety of applications ranging from lightweight websites to complex web platforms. 
    My expertise lies in creating responsive, accessible, and high-performance interfaces, while ensuring clean, maintainable code. 
    I also contribute to open-source projects, enhancing both my skills and the developer community.`
        },
        {
            id: "projects",
            title: "Projects",
            content: `Key projects include:
    
    - NarraLeaf / narraleaf-react: A lightweight React framework for creating visual novels.
    - NarraLeaf Engine: A new visual novel engine written in TypeScript.
    
    You can find more of my work and contributions on my GitHub. Each project represents my dedication to learning, experimenting, and building impactful tools.`
        }
    ];
    

    // State for list scrollTop
    const [listScrollTop, setListScrollTop] = useState(0);

    // 动态计算主标题透明度，滚动越多越淡
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const fadeStartPoint = viewportHeight * 0.1;
    const fadeEndPoint = viewportHeight * 0.5;
    let titleOpacity = 1;
    if (listScrollTop < fadeStartPoint) {
        titleOpacity = 1;
    } else if (listScrollTop > fadeEndPoint) {
        titleOpacity = 0.05;
    } else {
        const fadeRange = fadeEndPoint - fadeStartPoint;
        const scrollInRange = listScrollTop - fadeStartPoint;
        const ratio = scrollInRange / fadeRange;
        titleOpacity = 1 - ratio * 0.99;
    }

    return (
        <>
            {/* Centered fixed title */}
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-20 pointer-events-none px-4 sm:px-6 md:px-8"
                style={{ opacity: titleOpacity }}
            >
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-[12rem] font-bold text-white break-words leading-tight text-overflow-safe">
                        NOMEN
                    </h1>
                </div>
            </div>
            {/* Scrollable list section */}
            <div style={{ height: '100vh' }}>
                <ScrollList items={scrollItems} className="h-full" onScroll={setListScrollTop} />
            </div>
        </>
    );
}

