#!/usr/bin/env python3
"""Build TestFlight-safe opaque app icons from assets/images/splash.png."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
SPLASH = ASSETS / "splash.png"
ICON = ASSETS / "icon.png"
ADAPTIVE = ASSETS / "adaptive-icon.png"

CANVAS = 1024
ICON_LOGO_SIZE = 760
ADAPTIVE_LOGO_SIZE = 660
BACKGROUND = (0, 0, 0)


def crop_logo(source: Image.Image) -> Image.Image:
    rgba = source.convert("RGBA")
    bbox = rgba.getbbox()
    if not bbox:
        raise RuntimeError("Could not detect logo bounds in splash artwork.")

    cropped = rgba.crop(bbox)
    width, height = cropped.size
    side = max(width, height)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(cropped, ((side - width) // 2, (side - height) // 2), cropped)
    return square


def compose_icon(logo: Image.Image, logo_size: int) -> Image.Image:
    resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (CANVAS, CANVAS), BACKGROUND)
    offset = (CANVAS - logo_size) // 2
    canvas.paste(resized, (offset, offset), resized)
    return canvas


def main() -> None:
    if not SPLASH.exists():
        raise SystemExit(f"Missing splash artwork: {SPLASH}")

    logo = crop_logo(Image.open(SPLASH))
    icon = compose_icon(logo, ICON_LOGO_SIZE)
    adaptive = compose_icon(logo, ADAPTIVE_LOGO_SIZE)

    icon.save(ICON, format="PNG", optimize=True)
    adaptive.save(ADAPTIVE, format="PNG", optimize=True)

    print(f"Wrote {ICON} ({icon.mode}, {icon.size[0]}x{icon.size[1]})")
    print(f"Wrote {ADAPTIVE} ({adaptive.mode}, {adaptive.size[0]}x{adaptive.size[1]})")


if __name__ == "__main__":
    main()
