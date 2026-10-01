/**
 * One character of a title as font outlines, in font units (1000 per em).
 * y grows downward with the baseline at 0, so the em box runs from -880 to 120.
 * Each contour is a list of [x, y, onCurve] TrueType points: two off-curve points
 * in a row imply an on-curve point halfway between them.
 * `cs` is null when the title font lacks the character; it is then drawn from
 * the web font instead.
 */
export type Glyph = {
    ch: string;
    adv: number;
    cs: number[][][] | null;
};

export const EM_TOP = -880;

/** Two colours, swapped from page to page. */
export type Scheme = "paper" | "ink";
export const PAPER = "#f6f6f3";
export const INK = "#0b0b0b";
export const schemeColors = (s: Scheme) => (s === "paper" ? { bg: PAPER, fg: INK } : { bg: INK, fg: PAPER });

/** Which colour a route is printed in. A dive between two routes passes through a stroke when the colours swap and through the paper inside a character when they stay. */
export function routeScheme(pathname: string): Scheme {
    if (pathname === "/") return "paper";
    if (pathname.startsWith("/blog/content/")) return "paper";
    return "ink";
}
