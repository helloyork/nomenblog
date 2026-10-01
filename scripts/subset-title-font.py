"""
Rebuild assets/fonts/NotoSansSC-Black-GB2312.ttf, the font the site reads title
outlines from at build time (app/_lib/chuanzi/font.server.ts).

It is Noto Sans SC (SIL OFL 1.1) pinned to weight 900 and cut down to GB2312
(6,763 hanzi plus symbols), printable ASCII and common CJK punctuation. A title
character outside that set still renders, from the web font, just without its
control points.

    pip install fonttools
    curl -L -o NotoSansSC-VF.ttf "https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"
    python scripts/subset-title-font.py NotoSansSC-VF.ttf
"""

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

OUT = Path(__file__).resolve().parent.parent / "assets" / "fonts" / "NotoSansSC-Black-GB2312.ttf"


def charset():
    chars = set()
    for b1 in range(0xA1, 0xF8):
        for b2 in range(0xA1, 0xFF):
            try:
                chars.add(bytes([b1, b2]).decode("gb2312"))
            except UnicodeDecodeError:
                pass
    chars |= {chr(c) for c in range(0x20, 0x7F)}
    chars |= set("·—–…‘’“”、。，：；！？（）《》「」『』【】〈〉￥％＋－×÷＝")
    return chars


def main(src):
    font = instantiateVariableFont(TTFont(src), {"wght": 900})
    opts = subset.Options()
    opts.layout_features = []
    opts.hinting = False
    opts.notdef_outline = True
    opts.name_IDs = ["*"]
    opts.drop_tables += ["GSUB", "GPOS", "GDEF", "BASE", "VORG", "vhea", "vmtx", "STAT", "MVAR", "HVAR"]
    sub = subset.Subsetter(opts)
    sub.populate(text="".join(charset()))
    sub.subset(font)
    font.save(OUT)
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "NotoSansSC-VF.ttf")
