import Link from "next/link";
import Display from "@lib/components/display";

export default function NotFound() {
    return (
        <section className="n-page n-404">
            <Display>404</Display>
            <p className="n-lead">Nothing lives at this address.</p>
            <p><Link scroll={false} className="n-btn" href="/">Back to NOMEN →</Link></p>
        </section>
    );
}
