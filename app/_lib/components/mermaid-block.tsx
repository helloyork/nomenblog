"use client";

import dynamic from "next/dynamic";

// mermaid touches window on import, so it only loads in the browser
const MermaidChart = dynamic(() => import("./mermaid-chart"), {
    ssr: false,
    loading: () => <div className="n-dim">Loading diagram...</div>,
});

export default function MermaidBlock({ chart }: { chart: string }) {
    return (
        <div className="n-mermaid">
            <MermaidChart chart={chart} />
        </div>
    );
}
