// A line break inside a paragraph renders as a space. Between two Chinese characters
// that space is wrong; CSS Text 3 says to drop the break there, but Chromium keeps it.
// Drop it in the tree instead, only where both neighbours are wide East Asian
// characters, so a break next to a Latin word still reads as a space.

// CJK punctuation, kana, bopomofo, ideographs and fullwidth forms. Hangul is left out,
// since Korean puts spaces between words.
const WIDE = /[⺀-〿぀-ㄯ㆐-鿿豈-﫿︐-︟︰-﹯＀-ﾟ￠-￦\u{20000}-\u{3fffd}]/u;
// Curly quotes, dashes and ellipses have no width of their own; they side with the
// character beyond them, so “甲”⏎“乙” joins and “one”⏎“two” keeps its space.
const SIDES = /[—‘’“”…]/u;

const before = (s, at) => {
    const c = s.charCodeAt(at - 1);
    return c >= 0xdc00 && c < 0xe000 ? s.slice(at - 2, at) : s.charAt(at - 1);
};
const after = (s, at) => (at < s.length ? String.fromCodePoint(s.codePointAt(at)) : "");

function wideBefore(s, at = s.length) {
    let c = before(s, at);
    while (SIDES.test(c)) c = before(s, (at -= c.length));
    return WIDE.test(c);
}

function wideAfter(s, at = 0) {
    let c = after(s, at);
    while (SIDES.test(c)) c = after(s, (at += c.length));
    return WIDE.test(c);
}

// The text a node shows at its start or end, looking through emphasis, links and the like.
function leaf(node, end) {
    if (!node) return "";
    if (typeof node.value === "string") return node.value;
    const kids = node.children ?? [];
    return kids.length ? leaf(kids[end ? kids.length - 1 : 0], end) : "";
}

function join(node) {
    const kids = node.children;
    if (!kids) return;
    kids.forEach((kid, i) => {
        if (kid.type !== "text") {
            join(kid);
            return;
        }
        kid.value = kid.value.replace(/[ \t]*\n[ \t]*/g, (m, at, s) => {
            const end = at + m.length;
            const a = at > 0 ? wideBefore(s, at) : wideBefore(leaf(kids[i - 1], true));
            const b = end < s.length ? wideAfter(s, end) : wideAfter(leaf(kids[i + 1], false));
            return a && b ? "" : m;
        });
    });
}

export default function remarkCjkBreaks() {
    return join;
}
