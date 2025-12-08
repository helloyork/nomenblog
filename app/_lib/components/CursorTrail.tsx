import React, { useEffect, useRef, useState, useCallback } from 'react';

// Cursor trail configuration constants
const CURSOR_TRAIL_CONFIG = {
    // Size constants
    SCALE_BASE_MIN: 0.2,
    SCALE_BASE_MAX: 1.3,
    SCALE_ADDITIONAL_MAX: 0.4,
    Z_RANGE: 20,
    Z_BOUNDS: 50,

    // Speed constants
    VELOCITY_XY_MAX: 2.4,
    VELOCITY_Z_MAX: 0.6,
    ROTATION_VELOCITY_XY_MAX: 5,
    ROTATION_VELOCITY_Z_MAX: 3.5,

    // Position constants
    OFFSET_BASE: 4,
    OFFSET_VELOCITY_MULTIPLIER: 0.08,

    // Animation constants
    SPEED_THRESHOLD: 1.0,
    SPEED_FACTOR_MAX_SPEED: 10,
    SPEED_COUNT_DIVISOR: 4,
    MAX_TRIANGLES_PER_FRAME: 1,

    // Life constants
    LIFE_MIN: 120,
    LIFE_VARIATION: 30,

    // Opacity constants
    OPACITY_BASE: 0.8,
    OPACITY_VARIATION: 0.2,
    OPACITY_MULTIPLIER: 0.8,

    // Generation constants
    REFRESH_INTERVAL_MIN: 10,
    REFRESH_INTERVAL_MAX: 15,
    TOTAL_TRIANGLES_LIMIT: 120,
    BOUNDS_MARGIN: 50,
} as const;

interface TrailTriangle {
    id: number;
    x: number;
    y: number;
    z: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    scale: number;
    color: string;
    velocity: {
        x: number;
        y: number;
        z: number;
        rotationX: number;
        rotationY: number;
        rotationZ: number;
    };
    opacity: number;
    life: number;
    maxLife: number;
}

// Throttle function for mouse events
const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

const CursorTrail: React.FC = () => {
    const [trailTriangles, setTrailTriangles] = useState<TrailTriangle[]>([]);
    const animationRef = useRef<number>();
    const nextId = useRef(0);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const mouseVelocity = useRef({ x: 0, y: 0 });
    const lastTrailTime = useRef(0);
    
    // Lower the rendering frame-rate to ease CPU load
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    const lastFrameTime = useRef(0);

    // Generate trail triangle at mouse position
    const generateTrailTriangle = (x: number, y: number, velocity: { x: number, y: number }): TrailTriangle => {
        const colors = ['#f8d4ff', '#fce4ff', '#e8c4ff', '#d8b4ff', '#c8a4ff']; // Brighter purple variants matching cursor
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Calculate velocity-based offset
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        const offsetX = (Math.random() - 0.5) * CURSOR_TRAIL_CONFIG.OFFSET_BASE + velocity.x * CURSOR_TRAIL_CONFIG.OFFSET_VELOCITY_MULTIPLIER;
        const offsetY = (Math.random() - 0.5) * CURSOR_TRAIL_CONFIG.OFFSET_BASE + velocity.y * CURSOR_TRAIL_CONFIG.OFFSET_VELOCITY_MULTIPLIER;

        // Add some randomness to scale based on speed
        const speedFactor = Math.min(speed / CURSOR_TRAIL_CONFIG.SPEED_FACTOR_MAX_SPEED, 1);
        const baseScale = CURSOR_TRAIL_CONFIG.SCALE_BASE_MIN + Math.random() * (CURSOR_TRAIL_CONFIG.SCALE_BASE_MAX - CURSOR_TRAIL_CONFIG.SCALE_BASE_MIN);

        return {
            id: nextId.current++,
            x: x + offsetX,
            y: y + offsetY,
            z: Math.random() * CURSOR_TRAIL_CONFIG.Z_RANGE - CURSOR_TRAIL_CONFIG.Z_RANGE / 2,
            rotationX: Math.random() * 360,
            rotationY: Math.random() * 360,
            rotationZ: Math.random() * 360,
            scale: baseScale + Math.random() * CURSOR_TRAIL_CONFIG.SCALE_ADDITIONAL_MAX,
            color,
            velocity: {
                x: (Math.random() - 0.5) * CURSOR_TRAIL_CONFIG.VELOCITY_XY_MAX,
                y: (Math.random() - 0.5) * CURSOR_TRAIL_CONFIG.VELOCITY_XY_MAX,
                z: (Math.random() - 0.5) * CURSOR_TRAIL_CONFIG.VELOCITY_Z_MAX,
                rotationX: (Math.random() - 0.5) * CURSOR_TRAIL_CONFIG.ROTATION_VELOCITY_XY_MAX,
                rotationY: (Math.random() - 0.5) * CURSOR_TRAIL_CONFIG.ROTATION_VELOCITY_XY_MAX,
                rotationZ: (Math.random() - 0.5) * CURSOR_TRAIL_CONFIG.ROTATION_VELOCITY_Z_MAX,
            },
            opacity: CURSOR_TRAIL_CONFIG.OPACITY_BASE + Math.random() * CURSOR_TRAIL_CONFIG.OPACITY_VARIATION,
            life: 0,
            maxLife: CURSOR_TRAIL_CONFIG.LIFE_MIN + Math.random() * CURSOR_TRAIL_CONFIG.LIFE_VARIATION,
        };
    };

    // Update mouse position and velocity
    const updateMousePosition = useCallback((e: MouseEvent) => {
        const currentPos = { x: e.clientX, y: e.clientY };
        mouseVelocity.current = {
            x: currentPos.x - lastMousePos.current.x,
            y: currentPos.y - lastMousePos.current.y,
        };
        lastMousePos.current = currentPos;
    }, []);

    // Generate trail triangles based on mouse movement
    const generateTrail = useCallback((x: number, y: number) => {
        const now = Date.now();
        const speed = Math.sqrt(mouseVelocity.current.x * mouseVelocity.current.x + mouseVelocity.current.y * mouseVelocity.current.y);

        // Random refresh interval between min-max ms (faster generation)
        const refreshInterval = CURSOR_TRAIL_CONFIG.REFRESH_INTERVAL_MIN + Math.random() * (CURSOR_TRAIL_CONFIG.REFRESH_INTERVAL_MAX - CURSOR_TRAIL_CONFIG.REFRESH_INTERVAL_MIN);

        // Optimized settings for better performance and subtle effect
        if (speed > CURSOR_TRAIL_CONFIG.SPEED_THRESHOLD && now - lastTrailTime.current > refreshInterval) {
            const triangleCount = Math.min(Math.floor(speed / CURSOR_TRAIL_CONFIG.SPEED_COUNT_DIVISOR), CURSOR_TRAIL_CONFIG.MAX_TRIANGLES_PER_FRAME);

            setTrailTriangles(prev => {
                const newTriangles = Array.from({ length: triangleCount }, () =>
                    generateTrailTriangle(x, y, mouseVelocity.current)
                );
                const updated = [...prev, ...newTriangles];
                // Limit total triangles to prevent memory & paint overhead
                return updated.slice(-CURSOR_TRAIL_CONFIG.TOTAL_TRIANGLES_LIMIT);
            });

            lastTrailTime.current = now;
        }
    }, []);

    // Animation loop with frame rate limiting
    const animate = (currentTime: number) => {
        // Frame rate limiting
        if (currentTime - lastFrameTime.current < frameInterval) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }
        lastFrameTime.current = currentTime;

        setTrailTriangles(prevTriangles => {
            // Remove dead triangles
            let updatedTriangles = prevTriangles.filter(t => t.life < t.maxLife);
            
            // Update existing triangles
            updatedTriangles = updatedTriangles.map(triangle => {
                const newTriangle = { ...triangle };
                
                // Update position
                newTriangle.x += newTriangle.velocity.x;
                newTriangle.y += newTriangle.velocity.y;
                newTriangle.z += newTriangle.velocity.z;
                
                // Update rotation
                newTriangle.rotationX += newTriangle.velocity.rotationX;
                newTriangle.rotationY += newTriangle.velocity.rotationY;
                newTriangle.rotationZ += newTriangle.velocity.rotationZ;
                
                // Mark triangles that go out of bounds for removal
                if (newTriangle.x < -CURSOR_TRAIL_CONFIG.BOUNDS_MARGIN ||
                    newTriangle.x > window.innerWidth + CURSOR_TRAIL_CONFIG.BOUNDS_MARGIN ||
                    newTriangle.y < -CURSOR_TRAIL_CONFIG.BOUNDS_MARGIN ||
                    newTriangle.y > window.innerHeight + CURSOR_TRAIL_CONFIG.BOUNDS_MARGIN ||
                    newTriangle.z < -CURSOR_TRAIL_CONFIG.Z_BOUNDS ||
                    newTriangle.z > CURSOR_TRAIL_CONFIG.Z_BOUNDS) {
                    newTriangle.life = newTriangle.maxLife;
                }

                // Update life and opacity
                newTriangle.life++;
                newTriangle.opacity = (newTriangle.maxLife - newTriangle.life) / newTriangle.maxLife * CURSOR_TRAIL_CONFIG.OPACITY_MULTIPLIER;
                
                return newTriangle;
            });
            
            return updatedTriangles;
        });
        
        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        // Throttled mouse event handler
        const throttledMouseHandler = throttle((e: MouseEvent) => {
            updateMousePosition(e);
            generateTrail(e.clientX, e.clientY);
        }, 16); // ~60fps

        // Add mouse move event listener
        document.addEventListener('mousemove', throttledMouseHandler);

        // Start animation
        animationRef.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            document.removeEventListener('mousemove', throttledMouseHandler);
        };
    }, [updateMousePosition, generateTrail, animate]);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden cursor-trail-container" style={{ zIndex: 10000 }}>
            {trailTriangles.map(triangle => (
                <div
                    key={triangle.id}
                    className="absolute trail-triangle"
                    style={{
                        left: triangle.x,
                        top: triangle.y,
                        transform: `
                            translateZ(${triangle.z}px)
                            rotateX(${triangle.rotationX}deg)
                            rotateY(${triangle.rotationY}deg)
                            rotateZ(${triangle.rotationZ}deg)
                            scale(${triangle.scale})
                        `,
                        opacity: triangle.opacity,
                        transition: 'none',
                    }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        style={{
                            filter: 'drop-shadow(0 0 4px rgba(236, 195, 255, 0.3))',
                        }}
                    >
                        <polygon
                            points="12,3 20,20 4,20"
                            fill={triangle.color}
                            stroke={triangle.color}
                            strokeWidth="0.5"
                            opacity="0.8"
                        />
                    </svg>
                </div>
            ))}
        </div>
    );
};

export default CursorTrail; 