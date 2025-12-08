'use client';

const SYMBOL_CONFIG = {
    size: '40px',
    color: '#f8e9ff',
    strokeWidth: '3px',
    margin: '0 auto'
} as const;

function Triangle() {
    const size = parseInt(SYMBOL_CONFIG.size);
    const strokeWidth = parseInt(SYMBOL_CONFIG.strokeWidth);
    const padding = strokeWidth;
    const halfSize = size / 2;
    const points = `${padding},${size - padding} ${size - padding},${size - padding} ${halfSize},${padding}`;
    
    return (
        <div style={{ margin: SYMBOL_CONFIG.margin }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
            >
                <polygon
                    points={points}
                    fill="none"
                    stroke={SYMBOL_CONFIG.color}
                    strokeWidth={strokeWidth}
                />
            </svg>
        </div>
    );
}

function Circle() {
    return (
        <div
            style={{
                width: SYMBOL_CONFIG.size,
                height: SYMBOL_CONFIG.size,
                borderRadius: '50%',
                border: `${SYMBOL_CONFIG.strokeWidth} solid ${SYMBOL_CONFIG.color}`,
                backgroundColor: 'transparent',
                margin: SYMBOL_CONFIG.margin
            }}
        />
    );
}

function Cross() {
    return (
        <div
            style={{
                width: SYMBOL_CONFIG.size,
                height: SYMBOL_CONFIG.size,
                position: 'relative',
                margin: SYMBOL_CONFIG.margin
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '0',
                    width: '100%',
                    height: SYMBOL_CONFIG.strokeWidth,
                    backgroundColor: SYMBOL_CONFIG.color,
                    transform: 'translateY(-50%)'
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '0',
                    width: SYMBOL_CONFIG.strokeWidth,
                    height: '100%',
                    backgroundColor: SYMBOL_CONFIG.color,
                    transform: 'translateX(-50%)'
                }}
            />
        </div>
    );
}

function X() {
    const size = parseInt(SYMBOL_CONFIG.size);
    const strokeWidth = parseInt(SYMBOL_CONFIG.strokeWidth);
    const diagonalLength = Math.sqrt(2) * size;
    const offset = (diagonalLength - size) / 2;
    
    return (
        <div
            style={{
                width: SYMBOL_CONFIG.size,
                height: SYMBOL_CONFIG.size,
                position: 'relative',
                margin: SYMBOL_CONFIG.margin
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${diagonalLength}px`,
                    height: SYMBOL_CONFIG.strokeWidth,
                    backgroundColor: SYMBOL_CONFIG.color,
                    transform: `translate(-50%, -50%) rotate(45deg)`
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${diagonalLength}px`,
                    height: SYMBOL_CONFIG.strokeWidth,
                    backgroundColor: SYMBOL_CONFIG.color,
                    transform: `translate(-50%, -50%) rotate(-45deg)`
                }}
            />
        </div>
    );
}

export function Symbols() {
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '200px',
        width: 'fit-content',
        margin: '0 auto'
    };

    return (
        <div style={gridStyle}>
            <Triangle />
            <X />
            <Circle />
            <X />
            <Triangle />
            <Cross />
            <Circle />
            <Cross />
            <X />
        </div>
    );
}

