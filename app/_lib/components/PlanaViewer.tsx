'use client';

import React, { useEffect, useRef } from "react";

type PlanaViewerProps = {
    onReady?: () => void;
};

const PlanaViewer: React.FC<PlanaViewerProps> = ({ onReady }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        let disposed = false;

        const loadPlayer = async () => {
            if (typeof window === "undefined") return;
            try {
                const mod = await import("./easter-assets/3.8.js");
                const spine = (mod as any).spine || (window as any).spine;

                if (!spine || !containerRef.current) return;

                const player = new spine.SpinePlayer(containerRef.current, {
                    skelUrl: "/easter-assets/NP0035_spr.skel",
                    atlasUrl: "/easter-assets/NP0035_spr.atlas",
                    animation: "Idle_01",
                    alpha: true,
                    backgroundColor: "#00000000",
                    premultipliedAlpha: true,
                    showControls: false,
                    preserveDrawingBuffer: false,
                    success(p: any) {
                        // Resize canvas to fill container
                        const container = containerRef.current;
                        const canvas = container?.querySelector("canvas") as HTMLCanvasElement | null;
                        if (canvas && container) {
                            canvas.style.width = "100%";
                            canvas.style.height = "100%";
                            const ratio = window.devicePixelRatio || 1;
                            canvas.width = container.clientWidth * ratio;
                            canvas.height = container.clientHeight * ratio;
                            canvas.style.pointerEvents = "none";
                        }
                        playerRef.current = p;
                        onReady?.();
                    },
                    error(_p: any, msg: string) {
                        console.error("Spine player error:", msg);
                    },
                } as any);

                // Immediately dispose if component unmounted before init
                if (disposed) {
                    player.dispose?.();
                }
            } catch (err) {
                console.error("Failed to load spine player", err);
            }
        };

        loadPlayer();

        return () => {
            disposed = true;
            if (playerRef.current?.dispose) {
                playerRef.current.dispose();
            }
            playerRef.current = null;
        };
    }, [onReady]);

    return <div ref={containerRef} className="relative h-full w-full character-glow" />;
};

export default PlanaViewer;

