'use client';

import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Central from "./easter-assets/Central";
import { LogoPink } from "./easter-assets/enter-loading/Logo";
import { Symbols } from "./easter-assets/enter-loading/Symbols";
import { Triangles } from "./easter-assets/enter-loading/Triangles";
import { useAnimationControl } from "./easter-assets/AnimationControl";

type Props = {
    children?: ReactNode;
    onDone?: () => void;
};

// A trimmed EnterLoading variant dedicated to the easter egg.
const EasterEnterLoading: React.FC<Props> = ({ children, onDone }) => {
    const symbolsRef = useRef<HTMLDivElement>(null);
    const secondSymbolsRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const trianglesRef = useAnimationControl();
    const loadingImageRef = useRef<HTMLDivElement>(null);
    const [showChildren, setShowChildren] = useState(false);
    const [finished, setFinished] = useState(false);

    useLayoutEffect(() => {
        if (logoRef.current) {
            gsap.set(logoRef.current, { opacity: 0 });
        }
        if (symbolsRef.current) {
            gsap.set(symbolsRef.current, { x: "-100vw", opacity: 0 });
        }
        if (secondSymbolsRef.current) {
            gsap.set(secondSymbolsRef.current, { x: "100vw", y: 100, scale: 0.8, opacity: 0 });
        }
        if (loadingImageRef.current) {
            gsap.set(loadingImageRef.current, { opacity: 0, scale: 1, pointerEvents: "none" });
        }

        const play = () => {
            if (logoRef.current) {
                gsap.timeline({ delay: 0.05 })
                    .to(logoRef.current, { opacity: 1, duration: 0.25 })
                    .to(logoRef.current, { opacity: 0, duration: 0.2 });
            }

            // Start triangles first
            trianglesRef.current?.play();
            setShowChildren(true);

            const gridTl = gsap.timeline();
            gridTl.to(symbolsRef.current, {
                x: 0, opacity: 1, duration: 0.6, ease: "quint.out",
            }).to(symbolsRef.current, {
                duration: 0.5,
                ease: "none",
                onUpdate: function () {
                    const random = Math.random();
                    let opacity = 0;
                    if (random > 0.8) opacity = 1;
                    else if (random > 0.1) opacity = Math.random() * 0.4;
                    gsap.set(symbolsRef.current, { opacity });
                }
            }, 0.3).to(symbolsRef.current, { opacity: 0, duration: 0 });

            const secondTl = gsap.timeline();
            secondTl.to(secondSymbolsRef.current, {
                x: 0, opacity: 0.6, duration: 0.6, ease: "quint.out",
            }).to(secondSymbolsRef.current, { opacity: 0.6, duration: 0.5 }, 0.6)
            .to(secondSymbolsRef.current, { opacity: 0, duration: 0 });

            if (loadingImageRef.current) {
                // Delay 0.7s before showing loading image to match original timing
                setTimeout(() => {
                    if (!loadingImageRef.current) return;
                    gsap.set(loadingImageRef.current, { opacity: 0.01, pointerEvents: "auto", scale: 1 });
                    requestAnimationFrame(() => {
                        if (!loadingImageRef.current) return;
                        gsap.set(loadingImageRef.current, { opacity: 1 });
                        gsap.to(loadingImageRef.current, {
                            scale: 1.05,
                            duration: 0.5,
                            ease: "power2.out",
                            onComplete: () => {
                                // Wait 2s then compress to line, align with original flow
                                setTimeout(() => {
                                    if (!loadingImageRef.current) return;
                                    gsap.to(loadingImageRef.current, {
                                        scaleY: 0.01,
                                        duration: 0.1,
                                        ease: "power2.inOut",
                                        onComplete: () => {
                                            gsap.set(loadingImageRef.current, { opacity: 0, pointerEvents: "none" });
                                            // Hide triangles/symbols to avoid lingering
                                            gsap.set([symbolsRef.current, secondSymbolsRef.current], { opacity: 0 });
                                            setFinished(true);
                                            onDone?.();
                                        }
                                    });
                                }, 2000);
                            }
                        });
                    });
                }, 700);
            }
        };

        play();
    }, [onDone, trianglesRef]);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}>
            {showChildren && children}

            <Central ref={logoRef as React.RefObject<HTMLDivElement>} style={{ opacity: 0 }}>
                <LogoPink />
            </Central>

            <Central ref={symbolsRef as React.RefObject<HTMLDivElement>} style={{ opacity: 0, transform: "translateX(-100vw)" }}>
                <Symbols />
            </Central>

            <Central
                ref={secondSymbolsRef as React.RefObject<HTMLDivElement>}
                className="pointer-events-none"
                style={{ opacity: 0, transform: "translateX(100vw) translateY(100px) scale(0.8)" }}
            >
                <div style={{ transform: "translateY(100px) scale(0.8)", opacity: 0.6 }}>
                    <Symbols />
                </div>
            </Central>

            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: finished ? 0 : 1 }}>
                <Triangles ref={trianglesRef} />
            </div>

            <div
                ref={loadingImageRef}
                data-loading-image="true"
                style={{
                    display: 'flex',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: 10000,
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    isolation: 'isolate',
                    willChange: 'transform'
                }}
            >
                <img
                    src="/img/loading.png"
                    alt="Loading"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden'
                    }}
                />
            </div>
        </div>
    );
};

export default EasterEnterLoading;

