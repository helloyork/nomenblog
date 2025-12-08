"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type EasterExperienceContextValue = {
    unlocked: boolean;
    markUnlocked: () => void;
};

const EasterExperienceContext = createContext<EasterExperienceContextValue | null>(null);

export function EasterExperienceProvider({ children }: { children: React.ReactNode }) {
    const [unlocked, setUnlocked] = useState(false);

    const markUnlocked = useCallback(() => {
        setUnlocked(true);
    }, []);

    const value = useMemo(() => ({
        unlocked,
        markUnlocked,
    }), [unlocked, markUnlocked]);

    return (
        <EasterExperienceContext.Provider value={value}>
            {children}
        </EasterExperienceContext.Provider>
    );
}

export function useEasterExperience() {
    const context = useContext(EasterExperienceContext);
    if (!context) {
        throw new Error("useEasterExperience must be used within EasterExperienceProvider");
    }
    return context;
}

export default EasterExperienceProvider;

