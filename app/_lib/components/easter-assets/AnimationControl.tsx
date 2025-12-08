'use client';

import { RefObject, useRef } from "react";

export type AnimationControl = {
    play: (onComplete?: () => void) => void;
};

export function useAnimationControl(): RefObject<AnimationControl | null> {
    const ref = useRef<AnimationControl | null>(null);
    return ref;
}

