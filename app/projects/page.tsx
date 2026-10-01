import Link from "next/link";
import { Projects } from "@lib/data/site";
import Display from "@lib/components/display";

const GROUPS = [
    { status: "In Progress", label: "In progress" },
    { status: "Planning", label: "Planning" },
    { status: "Finished", label: "Finished" },
];

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

export default function Page() {
    const listed = Projects.filter((p) => p.status);
    const more = Projects.find((p) => !p.status);

    return (
        <section className="n-page">
            <Display>PROJECTS</Display>
            <div className="n-years">
                {GROUPS.map((g) => {
                    const items = listed.filter((p) => p.status === g.status);
                    if (!items.length) return null;
                    return (
                        <div className="n-year" key={g.status}>
                            <h2 className="n-label">{g.label}<small>{items.length}</small></h2>
                            <ul className="n-list">
                                {items.map((p) => (
                                    <li key={p.title}>
                                        <a className="n-proj" href={p.link} target="_blank" rel="noreferrer">
                                            <span className="n-t">{p.title}</span>
                                            <span className="n-k">{p.subtitle}</span>
                                            <span className="n-d">{p.description}</span>
                                            <span className="n-u">{host(p.link)}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
            {more && (
                <p className="n-lead">
                    {more.description} <Link scroll={false} className="n-btn" href={more.link}>About →</Link>
                </p>
            )}
        </section>
    );
}
