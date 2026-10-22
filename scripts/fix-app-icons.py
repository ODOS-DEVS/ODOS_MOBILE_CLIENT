#!/usr/bin/env python3
"""Build the iOS icon, Android adaptive foreground and splash mark from the ODOS logo.

Run with: npm run generate-icons

Why this was rewritten
----------------------
The previous version asked Pillow for ``getbbox()`` to find the mark, but
preferred ``logo-mark-source.png`` — an **RGB** image with a solid black
background. ``getbbox()`` reports the bounding box of non-zero pixels, and an
opaque black background is non-zero, so it returned the whole canvas. The mark
occupied only ~45% of that canvas, so "92% fill" produced an icon whose actual
artwork covered ~44% of the tile: small, timid, and nothing like the other
icons on a home screen.

Finding the mark is therefore done by **colour distance from the background**,
not by alpha alone, so it works whether the source is transparent or matted.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"

# Highest-resolution master first. logo-mark.png is 1536x1536 RGBA with a real
# alpha channel; the -source file is a matted RGB render kept only as a
# fallback. Scaling down from the master keeps edges crisp.
SOURCES = [ASSETS / "logo-mark.png", ASSETS / "logo-mark-source.png", ASSETS / "splash.png"]

ICON = ASSETS / "icon.png"
ADAPTIVE = ASSETS / "adaptive-icon.png"
SPLASH_MARK = ASSETS / "splash.png"

CANVAS = 1024
BACKGROUND = (0, 0, 0)

# Share of the tile the artwork spans on iOS. Real first-party icons sit around
# 0.55-0.70; below that a mark reads as timid next to its neighbours.
IOS_MARK_FILL = 0.64

# Android masks adaptive icons to a device-chosen shape. Of the 108dp
# foreground only a centred 66dp circle is guaranteed to survive every mask, so
# the artwork is scaled by its *enclosing circle* rather than its bounding box.
# Anything larger risks a circular launcher clipping the mark.
ANDROID_SAFE_FRACTION = 66 / 108

# The splash is shown on a plain background with no mask, so it can be smaller
# and calmer than the icon — it is a moment, not a permanent fixture.
SPLASH_CANVAS = 1024
SPLASH_MARK_FILL = 0.46


def find_mark(image: Image.Image) -> Image.Image:
    """Crop to the artwork, ignoring transparency *and* any matted backdrop.

    Corner sampling is not enough: logo-mark.png has transparent margins around
    an opaque black rectangle, so its corners say "transparent" while the real
    backdrop is the black panel inside. Picking the dominant opaque colour
    finds the backdrop in both layouts.
    """
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    opaque: dict[tuple[int, int, int], int] = {}
    opaque_total = 0
    for x in range(0, width, 2):
        for y in range(0, height, 2):
            px = pixels[x, y]
            if px[3] >= 24:
                key = (px[0], px[1], px[2])
                opaque[key] = opaque.get(key, 0) + 1
                opaque_total += 1

    backdrop: tuple[int, int, int] | None = None
    if opaque_total:
        colour, count = max(opaque.items(), key=lambda item: item[1])
        # A backdrop fills a lot of the frame; a mark's own fill colour does not.
        if count / opaque_total > 0.30:
            backdrop = colour

    def is_content(px: tuple[int, int, int, int]) -> bool:
        if px[3] < 24:
            return False
        if backdrop is None:
            return True
        return (
            abs(px[0] - backdrop[0]) + abs(px[1] - backdrop[1]) + abs(px[2] - backdrop[2])
        ) > 48

    xs: list[int] = []
    ys: list[int] = []
    for x in range(width):
        for y in range(height):
            if is_content(pixels[x, y]):
                xs.append(x)
                ys.append(y)

    if not xs:
        raise SystemExit("Could not find any artwork in the logo source.")

    cropped = rgba.crop((min(xs), min(ys), max(xs) + 1, max(ys) + 1))

    # Drop the backdrop colour so the mark composites cleanly onto any canvas.
    if backdrop is not None:
        flat = cropped.load()
        for x in range(cropped.width):
            for y in range(cropped.height):
                px = flat[x, y]
                if (
                    abs(px[0] - backdrop[0])
                    + abs(px[1] - backdrop[1])
                    + abs(px[2] - backdrop[2])
                ) <= 48:
                    flat[x, y] = (px[0], px[1], px[2], 0)

    return cropped


def enclosing_radius(mark: Image.Image) -> float:
    """Radius of the smallest circle about the mark's centre that covers it."""
    pixels = mark.load()
    cx, cy = mark.width / 2, mark.height / 2
    worst = 0.0
    for x in range(mark.width):
        for y in range(mark.height):
            if pixels[x, y][3] > 24:
                worst = max(worst, math.hypot(x - cx, y - cy))
    return worst


def scaled(mark: Image.Image, target_height: int) -> Image.Image:
    ratio = target_height / mark.height
    size = (max(1, round(mark.width * ratio)), target_height)
    out = mark.resize(size, Image.Resampling.LANCZOS)
    # Downscaling a large master is already crisp; only an upscale needs help,
    # and sharpening a downscale just adds halos around the strokes.
    if ratio > 1.02:
        out = out.filter(ImageFilter.UnsharpMask(radius=1.0, percent=110, threshold=3))
    return out


def centred(mark: Image.Image, canvas_size: int, background) -> Image.Image:
    mode = "RGB" if background is not None else "RGBA"
    fill = background if background is not None else (0, 0, 0, 0)
    canvas = Image.new(mode, (canvas_size, canvas_size), fill)
    canvas.paste(
        mark,
        ((canvas_size - mark.width) // 2, (canvas_size - mark.height) // 2),
        mark,
    )
    return canvas


def main() -> None:
    source = next((path for path in SOURCES if path.exists()), None)
    if source is None:
        raise SystemExit("No logo source found in assets/images.")

    mark = find_mark(Image.open(source))
    print(f"Source      : {source.name} -> mark {mark.width}x{mark.height}")

    # --- iOS: opaque, no alpha channel (the App Store rejects icons with one).
    ios_mark = scaled(mark, round(CANVAS * IOS_MARK_FILL))
    ICON.parent.mkdir(parents=True, exist_ok=True)
    centred(ios_mark, CANVAS, BACKGROUND).save(ICON, format="PNG", optimize=True)
    print(f"icon.png    : mark {ios_mark.width}x{ios_mark.height} ({IOS_MARK_FILL:.0%} of tile), opaque")

    # --- Android: transparent foreground, sized so no mask can clip it.
    safe_diameter = CANVAS * ANDROID_SAFE_FRACTION
    radius = enclosing_radius(mark)
    android_height = round(mark.height * (safe_diameter / (2 * radius)))
    android_mark = scaled(mark, android_height)
    centred(android_mark, CANVAS, None).save(ADAPTIVE, format="PNG", optimize=True)
    print(
        f"adaptive    : mark {android_mark.width}x{android_mark.height} "
        f"({android_height / CANVAS:.0%} of tile), inside the {safe_diameter:.0f}px safe circle"
    )

    # --- Splash mark.
    splash_mark = scaled(mark, round(SPLASH_CANVAS * SPLASH_MARK_FILL))
    centred(splash_mark, SPLASH_CANVAS, None).save(SPLASH_MARK, format="PNG", optimize=True)
    print(f"splash.png  : mark {splash_mark.width}x{splash_mark.height}, transparent")


if __name__ == "__main__":
    main()
