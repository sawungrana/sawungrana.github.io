#!/usr/bin/env python3
"""plates.py — turn public-domain Dutch East Indies map scans into navy duotone plates.

Input : assets-src/plates/*.jpg  (not in git; re-downloadable from SOURCES.md)
Output: public/plates/*.webp

Usage: python3 tools/plates.py

Same duotone curve as the sibling site (lantip.space), so the two share a
palette without sharing files.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "plates"
OUT = ROOT / "public" / "plates"
OUT.mkdir(parents=True, exist_ok=True)

PAPER = (245, 240, 230)  # --color-paper
INK = (20, 44, 71)  # --color-ink-deep

# crop = (left, right, top, bottom) as fractions of the source.
# ratio = the aspect the frieze is displayed at; the crop is trimmed to it.
PLATES = [
    dict(
        name="indies",
        src="indies-1873.jpg",
        crop=(0.10, 0.90, 0.44, 0.86),
        ratio=3.0,
        width=1440,
        quality=72,
        black=90,
        gamma=0.62,
        fade=0.62,
        note="Nederlandsch Indie, 1873 - the archipelago",
    ),
    dict(
        name="batavia",
        src="batavia-plan.jpg",
        crop=(0.05, 0.95, 0.14, 0.86),
        ratio=3.0,
        width=1440,
        quality=72,
        fade=0.66,
        note="Plattegrond van Batavia - the city grid",
    ),
    dict(
        name="hondius",
        src="insulae.jpg",
        crop=(0.06, 0.94, 0.10, 0.90),
        ratio=3.0,
        width=1440,
        quality=72,
        black=95,
        gamma=0.58,
        fade=0.5,
        note="Hondius, Insulae Indiae Orientalis",
    ),
    dict(
        # Cheaper copy for the CV PDF: an embedded image costs far more than the
        # same image on a web page, and the print band is only 64 px tall.
        name="batavia-print",
        src="batavia-plan.jpg",
        crop=(0.05, 0.95, 0.14, 0.86),
        ratio=6.0,
        width=900,
        quality=64,
        fade=0.8,
        note="Batavia, narrow band for the designed CV",
    ),
    dict(
        name="java",
        src="java-west.jpg",
        crop=(0.15, 0.95, 0.26, 0.62),
        ratio=3.0,
        width=1440,
        quality=72,
        fade=0.82,
        note="Oudheidkundige kaart van West-Java - the north coast",
    ),
    dict(
        name="footer-strip",
        src="indies-wide.jpg",
        crop=(0.02, 0.98, 0.05, 0.95),
        ratio=2.222,
        width=1600,
        quality=70,
        fade=0.8,
        note="Oudheidkundige kaart van West- en Midden-Java - footer",
    ),
]


def duotone(img: Image.Image, black=70, white=250, gamma=0.72) -> Image.Image:
    """Grayscale scan -> navy-on-paper duotone.

    Luminance <=black maps to INK, >=white maps to PAPER, with a gamma curve in
    between. Maps need a lighter curve than engravings: their sea fields sit at
    mid-luminance and at the engraving settings the whole plate reads as a grey
    slab. Raising black and dropping gamma below 1 floats those fields back to
    paper and leaves the coastline and labels carrying the image.
    """
    g = np.asarray(ImageOps.grayscale(img), dtype=np.float32) / 255.0
    t = np.clip((g - black / 255.0) / ((white - black) / 255.0), 0.0, 1.0)
    t = t**gamma
    ink = np.array(INK, dtype=np.float32)
    paper = np.array(PAPER, dtype=np.float32)
    rgb = ink[None, None, :] + (paper - ink)[None, None, :] * t[..., None]
    return Image.fromarray(rgb.astype(np.uint8))


def fade(img: Image.Image, amount: float) -> Image.Image:
    """Blend toward paper. amount=1 keeps the plate, 0 erases it.

    Backgrounds need to sit behind text, so each plate gets its own amount
    rather than one shared curve: an engraved sea and a lithographed coastline
    have very different ink density to begin with.
    """
    base = Image.new("RGB", img.size, PAPER)
    return Image.blend(base, img, amount)


def crop_fraction(img: Image.Image, crop) -> Image.Image:
    left, right, top, bottom = crop
    w, h = img.size
    return img.crop((int(left * w), int(top * h), int(right * w), int(bottom * h)))


def fit_ratio(img: Image.Image, ratio: float) -> Image.Image:
    """Centre-crop to an exact aspect ratio."""
    w, h = img.size
    if w / h > ratio:
        new_w = int(h * ratio)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    new_h = int(w / ratio)
    top = (h - new_h) // 2
    return img.crop((0, top, w, top + new_h))


def main() -> None:
    for spec in PLATES:
        path = SRC / spec["src"]
        if not path.exists():
            print(f"  skip {spec['name']}: {spec['src']} not found")
            continue
        img = Image.open(path)
        img = crop_fraction(img, spec["crop"])
        img = fit_ratio(img, spec["ratio"])
        img = duotone(
            img,
            black=spec.get("black", 70),
            white=spec.get("white", 250),
            gamma=spec.get("gamma", 0.72),
        )
        img = fade(img, spec.get("fade", 0.7))
        width = spec["width"]
        height = round(width / spec["ratio"])
        img = img.resize((width, height), Image.LANCZOS)
        out = OUT / f"{spec['name']}.webp"
        img.save(out, "WEBP", quality=spec["quality"], method=6)
        kb = out.stat().st_size / 1024
        print(f"  {out.name:22s} {width}x{height} {kb:6.1f} KB  {spec['note']}")


if __name__ == "__main__":
    main()
