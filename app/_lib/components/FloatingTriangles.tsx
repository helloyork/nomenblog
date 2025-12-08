import React, { useEffect, useRef, useCallback, useMemo } from 'react';

// Triangle configuration constants
const TRIANGLE_CONFIG = {
    // Size constants
    TRIANGLE_HEIGHT: 20,
    TRIANGLE_BASE: 17,
    SCALE_MIN: 0.4,
    SCALE_MAX: 2.4,
    SHADOW_BLUR_FIRST_LAYER: 15,
    SHADOW_BLUR_SECOND_LAYER: 25,

    // Speed constants
    VELOCITY_XY_MAX: 1.5,
    VELOCITY_Z_MAX: 0.1,
    ROTATION_VELOCITY_MAX: 2,

    // Quantity constants
    MAX_TRIANGLES: 30,
    INITIAL_TRIANGLES_COUNT: 8,

    // Animation constants
    SPAWN_PROBABILITY: 0.2,
    FADE_IN_FRAMES: 30,
    LIFE_MIN: 250,
    LIFE_VARIATION: 150,
    EDGE_DISTANCE: 100,
    BOUNDS_MARGIN: 200,
    Z_BOUNDS: 100,
} as const;

interface Triangle {
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
    active: boolean;
}

// Object pool for triangles
class TrianglePool {
    private pool: Triangle[] = [];
    private nextId = 0;

    get(): Triangle {
        if (this.pool.length > 0) {
            const triangle = this.pool.pop()!;
            triangle.active = true;
            return triangle;
        }
        return this.createTriangle();
    }

    release(triangle: Triangle): void {
        triangle.active = false;
        this.pool.push(triangle);
    }

    private createTriangle(): Triangle {
        return {
            id: this.nextId++,
            x: 0,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            scale: 1,
            color: '#ecc3ff',
            velocity: { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0 },
            opacity: 0,
            life: 0,
            maxLife: 300,
            active: true
        };
    }
}

const FloatingTriangles: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const trianglesRef = useRef<Triangle[]>([]);
    const poolRef = useRef(new TrianglePool());

    // Performance optimizations
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    const lastFrameTime = useRef(0);

    const colors = useMemo(() => ['#ecc3ff', '#ffc0d8', '#f6e8ff'], []);

    // Canvas dimensions cache
    const dimensionsRef = useRef({ width: 0, height: 0 });

    // Pre-rendered triangle path for better performance
    const trianglePath = useMemo(() => {
        const path = new Path2D();
        path.moveTo(0, -TRIANGLE_CONFIG.TRIANGLE_HEIGHT);
        path.lineTo(-TRIANGLE_CONFIG.TRIANGLE_BASE, TRIANGLE_CONFIG.TRIANGLE_BASE);
        path.lineTo(TRIANGLE_CONFIG.TRIANGLE_BASE, TRIANGLE_CONFIG.TRIANGLE_BASE);
        path.closePath();
        return path;
    }, []);

    // Generate triangle with optimized positioning
    const generateTriangle = useCallback((): Triangle => {
        const triangle = poolRef.current.get();
        const { width, height } = dimensionsRef.current;

        const colorIndex = Math.floor(Math.random() * colors.length);
        const edge = Math.floor(Math.random() * 4);

        switch (edge) {
            case 0: // top
                triangle.x = Math.random() * (width + TRIANGLE_CONFIG.EDGE_DISTANCE * 2) - TRIANGLE_CONFIG.EDGE_DISTANCE;
                triangle.y = -TRIANGLE_CONFIG.EDGE_DISTANCE;
                break;
            case 1: // right
                triangle.x = width + TRIANGLE_CONFIG.EDGE_DISTANCE;
                triangle.y = Math.random() * (height + TRIANGLE_CONFIG.EDGE_DISTANCE * 2) - TRIANGLE_CONFIG.EDGE_DISTANCE;
                break;
            case 2: // bottom
                triangle.x = Math.random() * (width + TRIANGLE_CONFIG.EDGE_DISTANCE * 2) - TRIANGLE_CONFIG.EDGE_DISTANCE;
                triangle.y = height + TRIANGLE_CONFIG.EDGE_DISTANCE;
                break;
            case 3: // left
                triangle.x = -TRIANGLE_CONFIG.EDGE_DISTANCE;
                triangle.y = Math.random() * (height + TRIANGLE_CONFIG.EDGE_DISTANCE * 2) - TRIANGLE_CONFIG.EDGE_DISTANCE;
                break;
        }

        triangle.z = Math.random() * TRIANGLE_CONFIG.Z_BOUNDS - TRIANGLE_CONFIG.Z_BOUNDS / 2;
        triangle.rotationX = Math.random() * 360;
        triangle.rotationY = Math.random() * 360;
        triangle.rotationZ = Math.random() * 360;
        triangle.scale = TRIANGLE_CONFIG.SCALE_MIN + Math.random() * (TRIANGLE_CONFIG.SCALE_MAX - TRIANGLE_CONFIG.SCALE_MIN);
        triangle.color = colors[colorIndex];
        triangle.velocity = {
            x: (Math.random() - 0.5) * TRIANGLE_CONFIG.VELOCITY_XY_MAX,
            y: (Math.random() - 0.5) * TRIANGLE_CONFIG.VELOCITY_XY_MAX,
            z: (Math.random() - 0.5) * TRIANGLE_CONFIG.VELOCITY_Z_MAX,
            rotationX: (Math.random() - 0.5) * TRIANGLE_CONFIG.ROTATION_VELOCITY_MAX,
            rotationY: (Math.random() - 0.5) * TRIANGLE_CONFIG.ROTATION_VELOCITY_MAX,
            rotationZ: (Math.random() - 0.5) * TRIANGLE_CONFIG.ROTATION_VELOCITY_MAX,
        };
        triangle.opacity = 0;
        triangle.life = 0;
        triangle.maxLife = TRIANGLE_CONFIG.LIFE_MIN + Math.random() * TRIANGLE_CONFIG.LIFE_VARIATION;

        return triangle;
    }, [colors]);

    // Optimized triangle rendering function
    const renderTriangle = useCallback((ctx: CanvasRenderingContext2D, triangle: Triangle) => {
        if (triangle.opacity <= 0) return;

        ctx.translate(triangle.x, triangle.y);
        ctx.scale(triangle.scale, triangle.scale);
        ctx.rotate((triangle.rotationZ * Math.PI) / 180);

        // Set properties once to avoid repeated context switches
        ctx.globalAlpha = Math.max(0, Math.min(1, triangle.opacity));
        ctx.fillStyle = triangle.color;

        // Set shadow properties once, avoid repeated reflows
        ctx.shadowColor = triangle.color;
        ctx.shadowBlur = TRIANGLE_CONFIG.SHADOW_BLUR_FIRST_LAYER;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.lineWidth = 2;

        ctx.fill(trianglePath);

        // Second layer glow
        ctx.shadowBlur = TRIANGLE_CONFIG.SHADOW_BLUR_SECOND_LAYER;
        ctx.globalAlpha = triangle.opacity * 0.3;
        ctx.fill(trianglePath);
    }, [trianglePath]);

    // Main animation loop with optimized rendering
    const animate = useCallback((currentTime: number) => {
    
        if (currentTime - lastFrameTime.current < frameInterval) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }
        lastFrameTime.current = currentTime;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        const triangles = trianglesRef.current;
        const { width, height } = dimensionsRef.current;

        // Add new triangles
        if (Math.random() < TRIANGLE_CONFIG.SPAWN_PROBABILITY && triangles.length < TRIANGLE_CONFIG.MAX_TRIANGLES) {
            triangles.push(generateTriangle());
        }

        // Update and render triangles
        for (let i = triangles.length - 1; i >= 0; i--) {
            const t = triangles[i];

            // Update position and rotation
            t.x += t.velocity.x;
            t.y += t.velocity.y;
            t.z += t.velocity.z;
            t.rotationX += t.velocity.rotationX;
            t.rotationY += t.velocity.rotationY;
            t.rotationZ += t.velocity.rotationZ;
            t.life++;

            // Optimized bounds checking
            const outOfBounds = t.x < -TRIANGLE_CONFIG.BOUNDS_MARGIN ||
                t.x > width + TRIANGLE_CONFIG.BOUNDS_MARGIN ||
                t.y < -TRIANGLE_CONFIG.BOUNDS_MARGIN ||
                t.y > height + TRIANGLE_CONFIG.BOUNDS_MARGIN ||
                t.z < -TRIANGLE_CONFIG.Z_BOUNDS ||
                t.z > TRIANGLE_CONFIG.Z_BOUNDS;

            if (outOfBounds || t.life >= t.maxLife) {
                poolRef.current.release(t);
                triangles.splice(i, 1);
                continue;
            }

            // Optimized opacity calculation
            t.opacity = t.life < TRIANGLE_CONFIG.FADE_IN_FRAMES
                ? (t.life / TRIANGLE_CONFIG.FADE_IN_FRAMES) * 0.8
                : Math.max(0, ((t.maxLife - t.life) / (t.maxLife - TRIANGLE_CONFIG.FADE_IN_FRAMES)) * 0.8);

            ctx.save();
            renderTriangle(ctx, t);
            ctx.restore();
        }

        ctx.restore();
        animationRef.current = requestAnimationFrame(animate);
    }, [generateTriangle, renderTriangle, frameInterval]);

    // Handle canvas resize
    const updateCanvasSize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { innerWidth, innerHeight } = window;

        canvas.width = innerWidth;
        canvas.height = innerHeight;
        canvas.style.width = `${innerWidth}px`;
        canvas.style.height = `${innerHeight}px`;

        dimensionsRef.current = { width: innerWidth, height: innerHeight };
    }, []);

    useEffect(() => {
        updateCanvasSize();

        // Initialize with some triangles for immediate visibility
        const initialTriangles = Array.from({ length: TRIANGLE_CONFIG.INITIAL_TRIANGLES_COUNT }, () => {
            const triangle = generateTriangle();
            triangle.x = Math.random() * dimensionsRef.current.width;
            triangle.y = Math.random() * dimensionsRef.current.height;
            triangle.opacity = 0.6;
            return triangle;
        });
        trianglesRef.current = initialTriangles;

        animationRef.current = requestAnimationFrame(animate);

        // Throttled resize handler
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateCanvasSize, 100);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);

            // Cleanup
            trianglesRef.current.forEach(triangle => {
                poolRef.current.release(triangle);
            });
            trianglesRef.current = [];
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
                style={{ background: 'transparent' }}
            />
        </div>
    );
};

export default FloatingTriangles; 