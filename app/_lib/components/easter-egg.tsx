'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import FloatingTriangles from "./FloatingTriangles";
import CursorTrail from "./CursorTrail";
import PlanaViewer from "./PlanaViewer";
import EasterEnterLoading from "./EasterEnterLoading";
import { useEasterExperience } from "../data/easter-experience";

// Easter egg: type the secret sequence to enter a loading scene,
// then reveal the PLANA Spine model with simple overlay effects.

const SECRET_SEQUENCE = "nomen";
const HAT_MAX_TILT_DEG = 30;
const hatSpringConfig = { stiffness: 500, damping: 30, mass: 0.4 };
const hatRotateConfig = { stiffness: 350, damping: 15, mass: 0.5 };

type Stage = "idle" | "loading" | "ready";

const EasterEgg: React.FC = () => {
    const [active, setActive] = useState(false);
    const [stage, setStage] = useState<Stage>("idle");
    const [progress, setProgress] = useState(0);
    const hatX = useSpring(0, hatSpringConfig);
    const hatY = useSpring(0, hatSpringConfig);
    const hatRotate = useSpring(0, hatRotateConfig);
    const lastMouseXRef = useRef(0);
    const bufferRef = useRef("");
    const timersRef = useRef<{ progress?: NodeJS.Timeout; toReady?: NodeJS.Timeout }>({});
    const startTimeRef = useRef<number>(0);
    const finishedRef = useRef(false);
    const hasMarkedRef = useRef(false);
    const { markUnlocked } = useEasterExperience();

    const stopTimers = useCallback(() => {
        if (timersRef.current.progress) {
            clearInterval(timersRef.current.progress);
        }
        if (timersRef.current.toReady) {
            clearTimeout(timersRef.current.toReady);
        }
        timersRef.current = {};
    }, []);

    const finishLoading = useCallback(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        stopTimers();
        setProgress(100);
        setStage("ready");
    }, [stopTimers]);

    const startLoading = useCallback(() => {
        startTimeRef.current = performance.now();
        finishedRef.current = false;
        setActive(true);
        setStage("loading");
        setProgress(0);
        stopTimers();

        const progressTimer = setInterval(() => {
            setProgress((prev) => Math.min(prev + 6 + Math.random() * 6, 92));
        }, 140);

        const fallbackTimer = setTimeout(() => {
            finishLoading();
        }, 3500);

        timersRef.current = {
            progress: progressTimer,
            toReady: fallbackTimer,
        };
    }, [finishLoading, stopTimers]);

    useEffect(() => {
        // Global key listener
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();

            if (key === "escape" && active) {
                stopTimers();
                setActive(false);
                setStage("idle");
                setProgress(0);
                bufferRef.current = "";
                finishedRef.current = false;
                return;
            }

            if (!/^[a-z]$/.test(key)) return;

            bufferRef.current = (bufferRef.current + key).slice(-SECRET_SEQUENCE.length);

            if (bufferRef.current === SECRET_SEQUENCE && !active) {
                startLoading();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [active, startLoading, stopTimers]);

    useEffect(() => {
        if (stage !== "loading") {
            stopTimers();
        }
    }, [stage, stopTimers]);

    useEffect(() => {
        return () => {
            stopTimers();
        };
    }, [stopTimers]);

    // Defer the model reveal to keep a short loading animation
    const handleModelReady = useCallback(() => {
        const elapsed = performance.now() - startTimeRef.current;
        const delay = Math.max(0, 900 - elapsed);
        setTimeout(() => {
            finishLoading();
        }, delay);
    }, [finishLoading]);

    useEffect(() => {
        if (stage === "ready" && !hasMarkedRef.current) {
            hasMarkedRef.current = true;
            markUnlocked();
        }
    }, [stage, markUnlocked]);

    // Hat cursor follower; do not hide system cursor
    useEffect(() => {
        if (!active) return;

        const currentMouseX = lastMouseXRef.current || window.innerWidth / 2;
        const currentMouseY = window.innerHeight / 2;
        hatX.set(currentMouseX);
        hatY.set(currentMouseY);
        hatRotate.set(0);

        const handleMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event;
            const deltaX = clientX - lastMouseXRef.current;
            lastMouseXRef.current = clientX;
            const rawTilt = deltaX * 0.4;
            const clampedTilt = Math.max(-HAT_MAX_TILT_DEG, Math.min(HAT_MAX_TILT_DEG, rawTilt));
            hatX.set(clientX);
            hatY.set(clientY);
            hatRotate.set(clampedTilt);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [active, hatX, hatY, hatRotate]);

    if (!active) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[9998]">
            <FloatingTriangles />

            <div className="relative h-full w-full">
                <AnimatePresence mode="wait">
                    {stage === "loading" && (
                        <motion.div
                            key="loading"
                            className="pointer-events-none absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                            <EasterEnterLoading onDone={finishLoading} />
                        </motion.div>
                    )}

                    {stage === "ready" && (
                        <motion.div
                            key="ready"
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <div className="absolute inset-0 z-[9999]">
                                <div
                                    className="pointer-events-auto absolute bottom-0 -left-4 h-[880px] w-[620px]"
                                    style={{ transform: "translateY(180px)" }}
                                >
                                    <PlanaViewer onReady={handleModelReady} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Christmas hat cursor overlay (keeps system cursor visible) */}
            <motion.div
                aria-hidden="true"
                className="pointer-events-none fixed left-0 top-0 z-[10000]"
                style={{
                    x: hatX,
                    y: hatY,
                    rotate: hatRotate,
                    transformOrigin: "50% 0%",
                }}
            >
                <Image
                    src="/static/img/hat.png"
                    alt=""
                    width={128}
                    height={128}
                    style={{ height: "auto", transformOrigin: "50% 0%" }}
                    priority
                />
            </motion.div>
        </div>
    );
};

export default EasterEgg;