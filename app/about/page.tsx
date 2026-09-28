import GlyphTitle from "@lib/components/glyph-title";
import OCPortrait from "@lib/components/oc-portrait";
import { getAllBlogs } from "@/app/_lib/data/blogs";

const sections = [
    {
        title: "About Me",
        content: `Hi, I'm Nomen (helloyork), a passionate full-stack developer focused on creating modern, efficient, and user-friendly web applications.
I specialize in front-end frameworks like React, Next.js, and Svelte, and have hands-on experience with Node.js, serverless architectures, and cloud services.
I love turning complex problems into elegant solutions and continuously learning new technologies.`,
    },
    {
        title: "Contact Me",
        content: `Email: helloyork@icloud.com
GitHub: https://github.com/helloyork
Blog: https://www.nomen.blog/

I'm always open to collaboration, project discussions, or tech conversations. Feel free to reach out!`,
    },
    {
        title: "Technical Skills",
        content: `Frontend: React, Next.js, Svelte, TypeScript, JavaScript, HTML, CSS, Tailwind CSS
Backend: Node.js, Serverless Functions, RESTful APIs, WebSocket, GraphQL
Database: SQL, ORM
Cloud & DevOps: Google Cloud, Azure, Laf, Docker, GitHub Actions
Tools & Libraries: Webpack, EsBuild, Babel, Puppeteer, Electron, Tauri (learning), Jest, ESLint, Husky
Other: Rust (learning)

I enjoy building scalable applications and exploring emerging web technologies.`,
    },
    {
        title: "Experience",
        content: `I have developed a variety of applications ranging from lightweight websites to complex web platforms.
My expertise lies in creating responsive, accessible, and high-performance interfaces, while ensuring clean, maintainable code.
I also contribute to open-source projects, enhancing both my skills and the developer community.`,
    },
    {
        title: "Projects",
        content: `Key projects include:

- NarraLeaf / narraleaf-react: A lightweight React framework for creating visual novels.
- NarraLeaf Engine: A new visual novel engine written in TypeScript.

You can find more of my work and contributions on my GitHub. Each project represents my dedication to learning, experimenting, and building impactful tools.`,
    },
];

export default async function Page() {
    const posts = (await getAllBlogs()).data ?? [];
    const total = posts.reduce((s, p) => s + p.bytes, 0) || 1;
    const years = Array.from(new Set(posts.map((p) => p.date.slice(0, 4)))).map((year) => {
        const inYear = posts.filter((p) => p.date.startsWith(year));
        const bytes = inYear.reduce((s, p) => s + p.bytes, 0);
        return { year, share: bytes / total, label: `${(bytes / 1024).toFixed(1)} KB · ${inYear.length} 篇` };
    });

    return (
        <section className="n-page n-about">
            <GlyphTitle text="About" />
            <div className="n-win n-aboutwin">
                <div className="n-win-bar"><span className="n-win-ttl">About This Nomen</span></div>
                <div className="n-doc">
                    <div className="n-ab-top">
                        <OCPortrait />
                        <div>
                            <b className="n-ab-name">Nomen</b><br />
                            <span className="n-dim">helloyork · full-stack developer</span><br />
                            <a href="mailto:helloyork@icloud.com">helloyork@icloud.com</a><br />
                            <a href="https://github.com/helloyork" target="_blank" rel="noreferrer">github.com/helloyork</a>
                        </div>
                    </div>
                    {years.map((y) => (
                        <div className="n-memrow" key={y.year}>
                            <span>{y.year}</span>
                            <div className="n-mem"><i style={{ width: `${(y.share * 100).toFixed(1)}%` }} /></div>
                            <span>{y.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="n-about-secs">
                {sections.map((s) => (
                    <section key={s.title}>
                        <h2>{s.title}</h2>
                        <p>{s.content}</p>
                    </section>
                ))}
            </div>
        </section>
    );
}
