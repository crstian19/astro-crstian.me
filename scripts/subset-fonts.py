#!/usr/bin/env python3
"""Subsets the self-hosted fonts to the characters the site uses.

The full variable fonts (Cyrillic, Greek, Vietnamese...) weigh ~65 KB each and
are on the critical path of the first paint. This keeps Latin (with Latin
Extended-A), general punctuation, arrows and every character found in the
built site, plus all OpenType features and the weight axis.

Usage: bun run build && python3 scripts/subset-fonts.py && bun run build
Sources stay in src/assets/fonts/source/; the subsets replace src/assets/fonts/*.woff2.
Needs fonttools and brotli (pip install fonttools brotli).
"""
import pathlib
from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "src/assets/fonts/source"
OUT = ROOT / "src/assets/fonts"

# Google Fonts' "latin" range, Latin Extended-A, arrows and a few symbols.
RANGES = [(0x20, 0x7E), (0xA0, 0x17F), (0x2000, 0x206F), (0x2190, 0x21FF)]
EXTRA = "ʻʼˆ˚˜̩̄̈€™−∕•…✓✕﻿�"

codepoints = {cp for lo, hi in RANGES for cp in range(lo, hi + 1)} | {ord(c) for c in EXTRA}
# Everything the built site actually prints (falls back to the ranges if not built).
for path in (ROOT / "dist").rglob("*.html"):
    codepoints |= {ord(c) for c in path.read_text(encoding="utf-8")}

options = subset.Options()
options.flavor = "woff2"
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.notdef_outline = True

for font in sorted(SOURCE.glob("*.woff2")):
    subsetter = subset.Subsetter(options)
    tt = subset.load_font(str(font), options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(tt)
    out = OUT / font.name
    subset.save_font(tt, str(out), options)
    print(f"{font.name}: {font.stat().st_size // 1024} KB -> {out.stat().st_size // 1024} KB")
