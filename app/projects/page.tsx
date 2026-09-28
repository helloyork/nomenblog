import GlyphTitle from "@lib/components/glyph-title";
import ProjectDesk from "@lib/components/project-desk";

export default function Page() {
    return (
        <section className="n-page">
            <GlyphTitle text="Projects" />
            <ProjectDesk />
        </section>
    );
}
