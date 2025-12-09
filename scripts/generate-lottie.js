// Generates lottie.json matching the triangles + symbols animations.
// Run: node scripts/generate-lottie.js
const fs = require("fs");
const path = require("path");

const W = 1920;
const H = 1080;
const FR = 60;

// Triangles configuration (mirrors GSAP logic without randomness).
const TRI_CFG = [
  { top: 0.25, left: 0.05, size: 280, color: "#ecc3ff", side: "top-left", sr: 0, er: -5, dev: 10 },
  { top: 0.1, left: 0.2, size: 210, color: "#ecc3ff", side: "top", sr: 35, er: 35 },
  { top: -0.15, left: 0.45, size: 210, color: "#ecc3ff", side: "top", sr: 180, er: 180 },
  { top: 0.05, left: 0.55, size: 300, color: "#ffc0d8", side: "top", sr: -50, er: -40, dev: 2 },
  { top: 0.05, left: 0.65, size: 320, color: "#ecc3ff", side: "top-right", sr: 35, er: 35, dev: -10 },
  { top: 0, left: 0.2, size: 400, color: "#f6e8ff", side: "bottom-left", sr: 180, er: 190, dev: 10 },
  { top: 0.6, left: 0.5, size: 150, color: "#ffc0d8", side: "bottom-right", sr: -15, er: -15 },
  { top: 0.4, left: 0.5, size: 130, color: "#ecc3ff", side: "right", sr: 35, er: 35, dev: 10 },
  { top: 0.3, left: 0, size: 300, color: "#f6e8ff", side: "bottom-left", sr: 170, er: 170, dev: 10 },
  { top: 0.7, left: 0.25, size: 300, color: "#f6e8ff", side: "bottom-right", sr: 25, er: 25 },
  { top: 0.7, left: 0.65, size: 270, color: "#f6e8ff", side: "bottom-right", sr: -10, er: -10, dev: 10 },
];

const MOVE_DUR = Math.round(0.5 * FR);
const ROT_DELAY = Math.round(0.1 * FR);
const ROT_DUR = Math.round(0.6 * FR);
const TRI_SCALE = 1.45;
const LOGO_DELAY = Math.round(0.2 * FR); // start a bit later than initial triangles
const LOGO_FADE_IN = Math.round(0.25 * FR); // 15 frames
const LOGO_FADE_OUT = Math.round(0.2 * FR); // 12 frames
const LOGO_TOTAL = LOGO_DELAY + LOGO_FADE_IN + LOGO_FADE_OUT;

function devPath(dev = 0) {
  const p1 = { x: 5, y: 95 };
  const p2 = { x: 95, y: 95 };
  const A1 = ((60 + dev) * Math.PI) / 180;
  const A2 = (60 * Math.PI) / 180;
  const tanA1 = Math.tan(A1);
  const tanA2 = Math.tan(A2);
  const p3x = (p2.x * tanA2 + p1.x * tanA1) / (tanA1 + tanA2);
  const height = (p3x - p1.x) * tanA1;
  const p3y = p1.y - height;
  return [
    [p1.x, p1.y],
    [p2.x, p2.y],
    [p3x, p3y],
  ];
}

function sideOffset(side) {
  switch (side) {
    case "left":
      return [-W, 0];
    case "right":
      return [W, 0];
    case "top":
      return [0, -H];
    case "bottom":
      return [0, H];
    case "top-left":
      return [-W, -H];
    case "top-right":
      return [W, -H];
    case "bottom-left":
      return [-W, H];
    case "bottom-right":
      return [0.5 * W, H];
    default:
      return [0, 0];
  }
}

function hexToColor(hex) {
  const m = hex.replace("#", "");
  const num = parseInt(m, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return { a: 0, k: [r, g, b, 1] };
}

function keyframe(startFrame, endFrame, startValue, endValue, ease = [0.42, 0, 0.58, 1]) {
  return [
    {
      t: startFrame,
      s: startValue,
      e: endValue,
      o: { x: [ease[0]], y: [ease[1]] },
      i: { x: [ease[2]], y: [ease[3]] },
    },
    { t: endFrame, s: endValue },
  ];
}

function buildTriangleLayers(startInd) {
  return TRI_CFG.map((c, i) => {
    const x = c.left * W;
    const y = c.top * H;
    const target = [x + c.size / 2, y + c.size, 0];
    const [ox, oy] = sideOffset(c.side);
    const start = [target[0] + ox, target[1] + oy, 0];
    const path = devPath(c.dev || 0);
    const ios = path.map(() => [0, 0]);
    const shapes = [
      { ty: "sh", ks: { a: 0, k: { i: ios, o: ios, v: path, c: true } } },
      { ty: "fl", c: hexToColor(c.color), o: { a: 0, k: 100 }, r: 1 },
      {
        ty: "tr",
        p: { a: 0, k: [0, 0] },
        a: { a: 0, k: [50, 100] },
        s: { a: 0, k: [100, 100] },
        r: { a: 0, k: 0 },
        o: { a: 0, k: 100 },
        sk: { a: 0, k: 0 },
        sa: { a: 0, k: 0 },
      },
    ];
    const posKF = keyframe(0, MOVE_DUR, start, target);
    const scaleKF = [
      { t: 0, s: [c.size, c.size, 100], h: 1 },
      {
        t: ROT_DELAY,
        s: [c.size, c.size, 100],
        e: [c.size * TRI_SCALE, c.size * TRI_SCALE, 100],
        o: { x: [0.42], y: [0] },
        i: { x: [0.58], y: [1] },
      },
      { t: ROT_DELAY + ROT_DUR, s: [c.size * TRI_SCALE, c.size * TRI_SCALE, 100] },
    ];
    const rotKF = [
      { t: 0, s: [c.sr], h: 1 },
      {
        t: ROT_DELAY,
        s: [c.sr],
        e: [c.er],
        o: { x: [0.42], y: [0] },
        i: { x: [0.58], y: [1] },
      },
      { t: ROT_DELAY + ROT_DUR, s: [c.er] },
    ];
    const opacityKF = keyframe(0, MOVE_DUR, [0], [50]);
    return {
      ddd: 0,
      ind: startInd + i,
      ty: 4,
      nm: `Triangle ${i + 1}`,
      bm: 2,
      sr: 1,
      ks: {
        o: { a: 1, k: opacityKF },
        r: { a: 1, k: rotKF },
        p: { a: 1, k: posKF },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: scaleKF },
      },
      ao: 0,
      shapes: [{ ty: "gr", it: shapes, nm: "triangle", np: 3, ix: 1 }],
      ip: 0,
      op: ROT_DELAY + ROT_DUR + MOVE_DUR + 1,
      st: 0,
    };
  });
}

// Symbols grid (3x3) generation.
const SYMBOL_COLOR = [0.9725, 0.9137, 1, 1]; // #f8e9ff
const SYMBOL_SIZE = 40;
const STROKE = 3;
const GRID_GAP = 200;
const GRID_OFFSETS = [-GRID_GAP, 0, GRID_GAP];

function makeLineShape(len, thickness, rotation) {
  return {
    ty: "gr",
    it: [
      {
        ty: "rc",
        d: 1,
        s: { a: 0, k: [len, thickness] },
        p: { a: 0, k: [0, 0] },
        r: { a: 0, k: 0 },
      },
      { ty: "fl", c: { a: 0, k: SYMBOL_COLOR }, o: { a: 0, k: 100 }, r: 1 },
      { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: rotation }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
    ],
    nm: "line",
  };
}

function symbolShapes(type) {
  switch (type) {
    case "triangle":
      return [
        {
          ty: "sh",
          ks: {
            a: 0,
            k: {
              i: [
                [0, 0],
                [0, 0],
                [0, 0],
              ],
              o: [
                [0, 0],
                [0, 0],
                [0, 0],
              ],
              v: [
                [0, SYMBOL_SIZE / 2],
                [SYMBOL_SIZE, SYMBOL_SIZE / 2],
                [SYMBOL_SIZE / 2, -SYMBOL_SIZE / 2],
              ],
              c: true,
            },
          },
          nm: "triangle-path",
        },
        {
          ty: "st",
          c: { a: 0, k: SYMBOL_COLOR },
          o: { a: 0, k: 100 },
          w: { a: 0, k: STROKE },
          lc: 1,
          lj: 1,
          ml: 4,
        },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
      ];
    case "circle":
      return [
        { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [SYMBOL_SIZE, SYMBOL_SIZE] }, d: 1 },
        { ty: "st", c: { a: 0, k: SYMBOL_COLOR }, o: { a: 0, k: 100 }, w: { a: 0, k: STROKE }, lc: 1, lj: 1, ml: 4 },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
      ];
    case "cross":
      return [
        makeLineShape(SYMBOL_SIZE, STROKE, 0),
        makeLineShape(SYMBOL_SIZE, STROKE, 90),
      ].flatMap((g) => g.it ? [g] : [g]); // keep groups intact
    case "x":
      return [
        makeLineShape(Math.sqrt(2) * SYMBOL_SIZE, STROKE, 45),
        makeLineShape(Math.sqrt(2) * SYMBOL_SIZE, STROKE, -45),
      ].flatMap((g) => g.it ? [g] : [g]);
    default:
      return [];
  }
}

function makeSymbolLayer({ ind, name, x, y, type, parent }) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [x, y, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [{ ty: "gr", it: symbolShapes(type), nm: type, np: 3, ix: 1 }],
    ip: 0,
    op: 73,
    st: 0,
    parent,
  };
}

function makeGrid(parentInd, originY, scale = 100, opacityTo = 100) {
  const seq = [
    "triangle",
    "x",
    "circle",
    "x",
    "triangle",
    "cross",
    "circle",
    "cross",
    "x",
  ];
  const layers = [];
  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const x = GRID_OFFSETS[c];
      const y = GRID_OFFSETS[r];
      layers.push(
        makeSymbolLayer({
          ind: parentInd + idx + 1,
          name: `Symbol ${idx + 1}`,
          x,
          y,
          type: seq[idx],
          parent: parentInd,
        })
      );
      idx += 1;
    }
  }
  const posFrom = parentInd === 1000 ? [960 - W, originY, 0] : [960 + W, originY, 0];
  const posTo = [960, originY, 0];
  const baseOpacity = opacityTo;
  const moveKF = keyframe(0, 36, posFrom, posTo, [0.22, 1, 0.36, 1]);
  const opacityKF = [
    // fade in during move
    { t: 0, s: [0], e: [baseOpacity], o: { x: [0.42], y: [0] }, i: { x: [0.58], y: [1] } },
    { t: 24, s: [baseOpacity], h: 1 }, // near end of move start flicker
    { t: 28, s: [Math.round(baseOpacity * 0.55)], h: 1 },
    { t: 32, s: [baseOpacity], h: 1 },
    { t: 36, s: [Math.round(baseOpacity * 0.35)], h: 1 }, // move结束附近再闪
    { t: 42, s: [baseOpacity], h: 1 },
    { t: 54, s: [Math.round(baseOpacity * 0.35)], h: 1 },
    { t: 60, s: [baseOpacity], h: 1 },
    { t: 66, s: [0], h: 1 }, // fast out
    { t: 67, s: [0], h: 1 },
  ];
  const parentLayer = {
    ddd: 0,
    ind: parentInd,
    ty: 3,
    nm: parentInd === 1000 ? "Symbols A" : "Symbols B",
    sr: 1,
    ks: {
      o: { a: 1, k: opacityKF },
      r: { a: 0, k: 0 },
      p: { a: 1, k: moveKF },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [scale, scale, 100] },
    },
    ao: 0,
    ip: 0,
    op: 73,
    st: 0,
  };
  return [parentLayer, ...layers];
}

function buildLottie() {
  const layers = [];
  // Logo (image) fades in then out at the very beginning
  const logoOpacity = [
    { t: 0, s: [0], h: 1 },
    { t: LOGO_DELAY, s: [0], e: [100], o: { x: [0.42], y: [0] }, i: { x: [0.58], y: [1] } },
    { t: LOGO_DELAY + LOGO_FADE_IN, s: [100], e: [0], o: { x: [0.42], y: [0] }, i: { x: [0.58], y: [1] } },
    { t: LOGO_TOTAL, s: [0], h: 1 },
  ];
  layers.push({
    ddd: 0,
    ind: 900,
    ty: 2,
    nm: "Logo",
    refId: "logo-img",
    sr: 1,
    ks: {
      o: { a: 1, k: logoOpacity },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [W / 2, H / 2, 0] },
      a: { a: 0, k: [150, 150, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip: 0,
    op: Math.max(LOGO_TOTAL + 1, ROT_DELAY + ROT_DUR + MOVE_DUR + 1),
    st: 0,
  });
  // Triangles first
  layers.push(...buildTriangleLayers(1));
  // Symbols group A (centered, full opacity)
  layers.push(...makeGrid(1000, 540, 100, 100));
  // Symbols group B (lower, scaled, semi-transparent)
  layers.push(...makeGrid(2000, 640, 80, 60));

  const totalFrames = ROT_DELAY + ROT_DUR + MOVE_DUR;
  return {
    v: "5.8.1",
    fr: FR,
    ip: 0,
    op: totalFrames + 1,
    w: W,
    h: H,
    nm: "Triangles+Symbols",
    ddd: 0,
    assets: [],
    layers,
  };
}

const lottie = buildLottie();
lottie.assets.push({
  id: "logo-img",
  w: 300,
  h: 300,
  u: "",
  p: "img/Tran_Shitim_Icon_pink.png",
  e: 0,
});
const outPath = path.join(process.cwd(), "lottie.json");
fs.writeFileSync(outPath, JSON.stringify(lottie, null, 2));
console.log(`lottie.json written to ${outPath}`);

