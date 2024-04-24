
import React from "react";

export default function TestBlock({ children }: { children?: React.ReactNode }) {
    return (
        <>
            <div style={{
                width: "1024px",
                height: "1024px",
                "backgroundColor": "#f0f0f0",
            }}><br />
                {children}
            </div>
        </>
    );
}

