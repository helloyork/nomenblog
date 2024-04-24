

export default function Logo({ className, color = "white", light = true }: { className?: string, color?: string, light?: boolean }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="104.603" height="23.07" viewBox="0 0 104.603 23.07" className={`${className} glow`}>
            {light && (
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4.5" result="coloredBlur" />
                        <feFlood floodColor="lightblue" floodOpacity="1" result="glowColor" />
                        <feComposite operator="in" in="glowColor" in2="coloredBlur" result="glowComposite" />
                        <feMerge>
                            <feMergeNode in="glowComposite" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            )}
            <path fill={color} id="path_22" data-name="path 22" d="M20.416-6.062,6.736-24.292a13.609,13.609,0,0,1-.921-1.418H5.75a16.5,16.5,0,0,1,.066,1.788V-6.062h-2.1V-28.73H5.9L19.38-10.715q.46.632.987,1.495h.1q-.132-1.433-.132-2.435V-28.73h2.121V-6.062Zm14.995.4a8.9,8.9,0,0,1-4.349-1.033,7.1,7.1,0,0,1-2.9-2.936,9.177,9.177,0,0,1-1.019-4.4,8.539,8.539,0,0,1,2.294-6.28,8.4,8.4,0,0,1,6.256-2.319,7.763,7.763,0,0,1,5.886,2.25,8.634,8.634,0,0,1,2.154,6.226A8.529,8.529,0,0,1,41.494-8,8.026,8.026,0,0,1,35.411-5.661Zm.148-15.334a6,6,0,0,0-4.62,1.842,7.219,7.219,0,0,0-1.71,5.109,6.927,6.927,0,0,0,1.694,4.916A5.964,5.964,0,0,0,35.509-7.31a5.765,5.765,0,0,0,4.546-1.8,7.3,7.3,0,0,0,1.6-5.024,7.392,7.392,0,0,0-1.578-5.1A5.764,5.764,0,0,0,35.559-20.994ZM69.774-6.062v-9.57a6.893,6.893,0,0,0-.954-4.1,3.643,3.643,0,0,0-3.107-1.264,4.263,4.263,0,0,0-2.392.732,5.064,5.064,0,0,0-1.751,2.019,6.15,6.15,0,0,0-.641,2.782v9.4H58.922v-9.755q0-5.178-4.127-5.178a4.254,4.254,0,0,0-3.387,1.564,6.07,6.07,0,0,0-1.332,4.076v9.293H48.071v-16.2h2.006v2.651h.066a5.776,5.776,0,0,1,5.311-3.02,5.241,5.241,0,0,1,3.149.979,4.781,4.781,0,0,1,1.833,2.6,6.559,6.559,0,0,1,2.351-2.658,6.094,6.094,0,0,1,3.3-.917q5.689,0,5.689,6.58v9.986Zm8.073-7.813a6.955,6.955,0,0,0,1.57,4.808A5.573,5.573,0,0,0,83.8-7.31,9.138,9.138,0,0,0,89.34-9.251v1.88a10.414,10.414,0,0,1-6,1.711,7.059,7.059,0,0,1-5.566-2.288,9.057,9.057,0,0,1-2.031-6.234,9.246,9.246,0,0,1,1.011-4.323,7.49,7.49,0,0,1,2.812-3.036,7.569,7.569,0,0,1,3.987-1.086A6.325,6.325,0,0,1,88.6-20.563a8.537,8.537,0,0,1,1.792,5.779v.909ZM88.32-15.539A6.175,6.175,0,0,0,87-19.561a4.4,4.4,0,0,0-3.5-1.433,5.13,5.13,0,0,0-3.765,1.464A6.777,6.777,0,0,0,77.9-15.539Zm17.987,9.478V-15.4q0-5.594-4.308-5.594a5.032,5.032,0,0,0-3.839,1.626,5.694,5.694,0,0,0-1.521,4.045v9.262H94.634v-16.2H96.64v2.851h.066a6.3,6.3,0,0,1,5.8-3.221,5.387,5.387,0,0,1,4.316,1.726,7.411,7.411,0,0,1,1.488,4.978v9.863Z" transform="translate(-3.711 28.73)" />
        </svg>
    );
}

