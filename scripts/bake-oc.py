"""Bake the OC illustration into the 4-channel map the home hero samples.

    python scripts/bake-oc.py path/to/narra-chibi-avatar.png

Writes public/static/oc/oc-map.png and prints the metadata the hero needs
(width, height, and the seat line as a fraction of the height). Needs numpy,
scipy and Pillow.

Channels:
    R  tone: luminance pulled down by saturation, so hair, eyes and the leaf
       separate once everything is reduced to one colour
    G  outline strength: a black top-hat, which keeps the thin dark strokes
       and drops filled dark areas such as the shorts
    B  figure alpha: the paper is removed with a flood fill from the border.
       The line art is closed, so the white hoodie is not mistaken for paper.
    A  height: blurred alpha, a pillow shape used for pointer lighting. It is
       stored in alpha because it is high wherever the figure is, so a browser
       that decodes the PNG premultiplied cannot erase the other channels.
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'static', 'oc', 'oc-map.png')
TARGET_H = 420


def bake(src_path):
    src = Image.open(src_path).convert('RGB')
    a = np.asarray(src).astype(np.float32)
    h0, w0, _ = a.shape

    # Paper: close to the background colour, bright, and connected to the border.
    paper = np.array([245, 242, 243], np.float32)
    dist = np.sqrt(((a - paper) ** 2).sum(-1))
    lum = a @ np.array([0.299, 0.587, 0.114], np.float32)
    lab, _ = ndi.label((dist < 16) & (lum > 226))
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fig = ~np.isin(lab, border[border > 0])
    fig = ndi.binary_opening(fig, iterations=2)
    lab, n = ndi.label(fig)
    sizes = ndi.sum(fig, lab, range(1, n + 1))
    fig = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 800])
    fig = ndi.binary_fill_holes(fig)

    ys, xs = np.nonzero(fig)
    pad = 10
    y0, y1 = max(0, ys.min() - pad), min(h0, ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(w0, xs.max() + pad + 1)

    # Seat line: the bottom of the largest filled dark region (the shorts).
    dark = ndi.binary_opening(fig & (lum < 70), iterations=3)
    dl, dn = ndi.label(dark)
    if dn:
        biggest = int(np.argmax(ndi.sum(dark, dl, range(1, dn + 1)))) + 1
        seat_y = np.nonzero(dl == biggest)[0].max()
    else:
        seat_y = y0 + (y1 - y0) * 0.85

    tw = round((x1 - x0) * TARGET_H / (y1 - y0))
    rgb = np.asarray(src.crop((x0, y0, x1, y1)).resize((tw, TARGET_H), Image.LANCZOS)).astype(np.float32) / 255
    alpha = np.asarray(Image.fromarray((fig[y0:y1, x0:x1] * 255).astype(np.uint8)).resize((tw, TARGET_H), Image.BOX)).astype(np.float32) / 255

    L = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    mx, mn = rgb.max(-1), rgb.min(-1)
    sat = np.where(mx > 1e-3, (mx - mn) / np.maximum(mx, 1e-3), 0)
    tone = np.clip((np.clip(L - 0.35 * sat, 0, 1) - 0.04) / 0.94, 0, 1)
    line = np.clip((ndi.grey_closing(tone, size=(7, 7)) - tone) * 2.6, 0, 1) * (alpha > 0.5)
    height = ndi.gaussian_filter(alpha, 14)
    height = np.maximum(height / max(height.max(), 1e-6), alpha * 0.5)

    def q(x, levels):
        return np.round(x * (levels - 1)) / (levels - 1)

    out = np.dstack([q(tone, 64), q(line, 32), q(alpha, 16), np.maximum(q(height, 64), 1 / 255)])
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGBA').save(OUT, optimize=True)
    return dict(w=tw, h=TARGET_H, seat=round(float((seat_y - y0) / (y1 - y0)), 4))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    meta = bake(sys.argv[1])
    print(json.dumps(meta), os.path.getsize(OUT), 'bytes ->', os.path.relpath(OUT, ROOT))
