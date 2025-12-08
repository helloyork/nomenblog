'use client';

import React from "react";

type CentralProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

// Center wrapper used by EnterLoading animation
const Central = React.forwardRef<HTMLDivElement, CentralProps>(
    ({ children, className = "", style }, ref) => {
        return (
            <div
                ref={ref}
                className={`absolute inset-0 flex h-full w-full items-center justify-center ${className}`}
                style={style}
            >
                {children}
            </div>
        );
    }
);

Central.displayName = "Central";

export default Central;

