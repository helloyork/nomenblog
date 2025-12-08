'use client';

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { AnimationControl } from "../AnimationControl";

interface TriangleConfig {
    top: string;
    left?: string;
    right?: string;
    size: number;
    color: string;
    side: "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
    startRotate: number;
    endRotate: number;
    angleDeviation?: number;
}

const TRIANGLE_CONFIG: TriangleConfig[] = [
    { top: "25%", left: "5%", size: 280, color: "#ecc3ff", side: "top-left", startRotate: 0, endRotate: -5, angleDeviation: 10 },
    { top: "10%", left: "20%", size: 210, color: "#ecc3ff", side: "top", startRotate: 35, endRotate: 35 },
    { top: "-15%", left: "45%", size: 210, color: "#ecc3ff", side: "top", startRotate: 180, endRotate: 180 },
    { top: "5%", left: "55%", size: 300, color: "#ffc0d8", side: "top", startRotate: -50, endRotate: -40, angleDeviation: 2 },
    { top: "5%", left: "65%", size: 320, color: "#ecc3ff", side: "top-right", startRotate: 35, endRotate: 35, angleDeviation: -10 },

    { top: "-0%", left: "20%", size: 400, color: "#f6e8ff", side: "bottom-left", startRotate: 180, endRotate: 190, angleDeviation: 10 },
    { top: "60%", left: "50%", size: 150, color: "#ffc0d8", side: "bottom-right", startRotate: -15, endRotate: -15 },
    { top: "40%", left: "50%", size: 130, color: "#ecc3ff", side: "right", startRotate: 35, endRotate: 35, angleDeviation: 10 },

    { top: "30%", left: "0%", size: 300, color: "#f6e8ff", side: "bottom-left", startRotate: 170, endRotate: 170, angleDeviation: 10 },
    { top: "70%", left: "25%", size: 300, color: "#f6e8ff", side: "bottom-right", startRotate: 25, endRotate: 25 },
    { top: "70%", left: "65%", size: 270, color: "#f6e8ff", side: "bottom-right", startRotate: -10, endRotate: -10, angleDeviation: 10 },
];

const getTrianglePath = (angleDeviation: number = 0): string => {
    const p1 = { x: 5, y: 95 };
    const p2 = { x: 95, y: 95 };
    const cornerRadius = 1.1;
    const A1 = (60 + angleDeviation) * Math.PI / 180;
    const A2 = 60 * Math.PI / 180;
    const tanA1 = Math.tan(A1);
    const tanA2 = Math.tan(A2);
    const p3x = (p2.x * tanA2 + p1.x * tanA1) / (tanA1 + tanA2);
    const height = (p3x - p1.x) * tanA1;
    const p3y = p1.y - height;
    const p3 = { x: p3x, y: p3y };
    const points = [p1, p2, p3];
    const pathParts = [];

    for (let i = 0; i < points.length; i++) {
        const p_i = points[i];
        const p_prev = points[(i + points.length - 1) % points.length];
        const p_next = points[(i + 1) % points.length];

        const v_prev = { x: p_prev.x - p_i.x, y: p_prev.y - p_i.y };
        const v_prev_len = Math.sqrt(v_prev.x ** 2 + v_prev.y ** 2);
        const u_prev = { x: v_prev.x / v_prev_len, y: v_prev.y / v_prev_len };

        const v_next = { x: p_next.x - p_i.x, y: p_next.y - p_i.y };
        const v_next_len = Math.sqrt(v_next.x ** 2 + v_next.y ** 2);
        const u_next = { x: v_next.x / v_next_len, y: v_next.y / v_next_len };

        const point_on_prev = { x: p_i.x + cornerRadius * u_prev.x, y: p_i.y + cornerRadius * u_prev.y };
        const point_on_next = { x: p_i.x + cornerRadius * u_next.x, y: p_i.y + cornerRadius * u_next.y };

        if (i === 0) {
            pathParts.push(`M ${point_on_prev.x} ${point_on_prev.y}`);
        }

        pathParts.push(`Q ${p_i.x} ${p_i.y} ${point_on_next.x} ${point_on_next.y}`);

        const next_p_i = points[(i + 1) % points.length];
        const next_p_prev = p_i;
        const v_next_prev = { x: next_p_prev.x - next_p_i.x, y: next_p_prev.y - next_p_i.y };
        const v_next_prev_len = Math.sqrt(v_next_prev.x ** 2 + v_next_prev.y ** 2);
        const u_next_prev = { x: v_next_prev.x / v_next_prev_len, y: v_next_prev.y / v_next_prev_len };
        const next_point_on_prev = { x: next_p_i.x + cornerRadius * u_next_prev.x, y: next_p_i.y + cornerRadius * u_next_prev.y };

        pathParts.push(`L ${next_point_on_prev.x} ${next_point_on_prev.y}`);
    }

    pathParts.push("Z");
    return pathParts.join(" ");
};

const MOVE_DURATION = 0.5;
const SCALE_DURATION = 0.6;
const ROTATE_DELAY = 0.1;

export const Triangles = React.forwardRef<AnimationControl | null, {}>((_, ref) => {
    const triangleRefs = useRef<(HTMLDivElement | null)[]>([]);
    const configRef = useRef<TriangleConfig[]>(TRIANGLE_CONFIG);

    useLayoutEffect(() => {
        const triangles = triangleRefs.current;
        const configs = configRef.current;
        
        triangles.forEach((triangle, idx) => {
            if (!triangle) return;
            const cfg = configs[idx];
            const fromVars: gsap.TweenVars = { opacity: 0 };
            switch (cfg.side) {
                case "left": fromVars.x = "-100vw"; break;
                case "right": fromVars.x = "100vw"; break;
                case "top": fromVars.y = "-100vh"; break;
                case "bottom": fromVars.y = "100vh"; break;
                case "top-left": fromVars.x = "-100vw"; fromVars.y = "-100vh"; break;
                case "top-right": fromVars.x = "100vw"; fromVars.y = "-100vh"; break;
                case "bottom-left": fromVars.x = "-100vw"; fromVars.y = "100vh"; break;
                case "bottom-right": fromVars.x = "50vw"; fromVars.y = "100vh"; break;
            }
            gsap.set(triangle, {
                ...fromVars,
                scale: 1,
                rotation: cfg.startRotate,
                mixBlendMode: "screen",
            });
        });

        const play = (onComplete?: () => void) => {
            const triangles = triangleRefs.current;
            const configs = configRef.current;
            let hasCalled = false;
            const safeComplete = () => {
                if (hasCalled) return;
                hasCalled = true;
                onComplete?.();
            };
            const tl = gsap.timeline({ onComplete: safeComplete });

            triangles.forEach((triangle, idx) => {
                if (!triangle) return;
                const cfg = configs[idx];
                const fromVars: gsap.TweenVars = { opacity: 0 };
                switch (cfg.side) {
                    case "left": fromVars.x = "-100vw"; break;
                    case "right": fromVars.x = "100vw"; break;
                    case "top": fromVars.y = "-100vh"; break;
                    case "bottom": fromVars.y = "100vh"; break;
                    case "top-left": fromVars.x = "-100vw"; fromVars.y = "-100vh"; break;
                    case "top-right": fromVars.x = "100vw"; fromVars.y = "-100vh"; break;
                    case "bottom-left": fromVars.x = "-100vw"; fromVars.y = "100vh"; break;
                    case "bottom-right": fromVars.x = "50vw"; fromVars.y = "100vh"; break;
                }

                gsap.set(triangle, {
                    ...fromVars,
                    scale: 1,
                    rotation: cfg.startRotate,
                    mixBlendMode: "screen",
                });

                tl.to(triangle, {
                    x: 0,
                    y: 0,
                    opacity: 0.5,
                    duration: MOVE_DURATION,
                    ease: "sine.out",
                }, 0);

                tl.to(triangle, {
                    scale: 1.3,
                    rotation: cfg.endRotate,
                    duration: SCALE_DURATION,
                    ease: "power4.in",
                }, ROTATE_DELAY);
            });

            const totalDuration = Math.max(MOVE_DURATION, ROTATE_DELAY + SCALE_DURATION);
            tl.add(safeComplete, totalDuration - 0.1);
        };

        if (ref) {
            if (typeof ref === "function") {
                ref({ play });
            } else {
                (ref as React.MutableRefObject<AnimationControl | null>).current = { play };
            }
        }

        return () => {
            if (ref) {
                if (typeof ref === "function") {
                    ref(null);
                } else {
                    (ref as React.MutableRefObject<AnimationControl | null>).current = null;
                }
            }
        };
    }, [ref]);

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                overflow: "hidden",
                isolation: "isolate",
            }}
        >
            {configRef.current.map((cfg, idx) => (
                <div
                    key={idx}
                    ref={(el) => { triangleRefs.current[idx] = el; }}
                    style={{
                        position: "absolute",
                        top: cfg.top,
                        left: cfg.left,
                        right: cfg.right,
                        width: cfg.size,
                        height: cfg.size,
                        mixBlendMode: "screen",
                        transformOrigin: "50% 100%",
                        opacity: 0,
                    }}
                    className="triangle-blend"
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{ display: "block" }}
                    >
                        <path
                            d={getTrianglePath(cfg.angleDeviation)}
                            fill={cfg.color}
                        />
                    </svg>
                </div>
            ))}
        </div>
    );
});

Triangles.displayName = "Triangles";

