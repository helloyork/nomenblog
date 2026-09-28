/*
 * Minimal WebGL 1 helpers: every effect on the site is one or two passes of a
 * full-screen triangle and a fragment shader.
 */

export const GLSL_HEAD = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float Bayer2(vec2 a){ a = floor(a); return fract(a.x / 2. + a.y * a.y * .75); }
#define Bayer4(a) (Bayer2(.5 * (a)) * .25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5 * (a)) * .25 + Bayer2(a))
`;

const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error("shader: " + log);
    }
    return s;
}

export type Program = { p: WebGLProgram; U: (name: string) => WebGLUniformLocation | null };

/** Links a fragment shader against the shared vertex shader; attribute 0 is the triangle. */
export function program(gl: WebGLRenderingContext, fs: string): Program {
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, GLSL_HEAD + fs));
    gl.bindAttribLocation(p, 0, "p");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link: " + gl.getProgramInfoLog(p));
    const cache = new Map<string, WebGLUniformLocation | null>();
    return {
        p,
        U: (name) => {
            if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name));
            return cache.get(name) ?? null;
        },
    };
}

export function context(canvas: HTMLCanvasElement, alpha = false): WebGLRenderingContext | null {
    const gl = canvas.getContext("webgl", {
        alpha,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
    });
    if (!gl) return null;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    return gl;
}

export function texture(gl: WebGLRenderingContext, unit: number, linear = false): WebGLTexture {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    const f = linear ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
}

export type TexSource = TexImageSource | Uint8Array | null;

export function upload(gl: WebGLRenderingContext, unit: number, t: WebGLTexture, src: TexSource, w = 0, h = 0) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    if (src === null || src instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, src);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    }
}

export function rgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function lose(gl: WebGLRenderingContext | null) {
    try {
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
        /* already gone */
    }
}
