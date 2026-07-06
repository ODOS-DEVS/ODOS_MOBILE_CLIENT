#!/usr/bin/env python3
"""Build standard full-bleed app icons from the ODOS logo mark (no in-icon text)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
SPLASH = ASSETS / "splash.png"
LOGO_SOURCE = ASSETS / "logo-mark-source.png"
LOGO_MARK = ASSETS / "logo-mark.png"
ICON = ASSETS / "icon.png"
ADAPTIVE = ASSETS / "adaptive-icon.png"

CANVAS = 1024
IOS_LOGO_FILL = 0.92
ADAPTIVE_LOGO_FILL = 0.8
BACKGROUND = (0, 0, 0)


def _square_logo_mark(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    bbox = rgba.getbbox()
    if not bbox:
        raise RuntimeError("Could not detect logo bounds in artwork.")

    cropped = rgba.crop(bbox)
    crop_width, crop_height = cropped.size
    side = max(crop_width, crop_height)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(
        cropped,
        ((side - crop_width) // 2, (side - crop_height) // 2),
        cropped,
    )
    return square


def extract_logo_mark(source: Image.Image) -> Image.Image:
    """Use only the bag mark from splash artwork — never the wordmark or tagline."""
    rgba = source.convert("RGBA")
    width, height = rgba.size
    logo_band = rgba.crop((0, 0, width, int(height * 0.52)))
    return _square_logo_mark(logo_band)


def load_logo_mark() -> Image.Image:
    if LOGO_SOURCE.exists():
        return _square_logo_mark(Image.open(LOGO_SOURCE))
    if not SPLASH.exists():
        raise SystemExit(f"Missing splash artwork: {SPLASH}")
    return extract_logo_mark(Image.open(SPLASH))


def upscale_logo(logo: Image.Image, target_size: int) -> Image.Image:
    upscaled = logo.resize((target_size, target_size), Image.Resampling.LANCZOS)
    return upscaled.filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=3))


def compose_ios_icon(logo: Image.Image) -> Image.Image:
    logo_size = int(CANVAS * IOS_LOGO_FILL)
    mark = upscale_logo(logo, logo_size)
    canvas = Image.new("RGB", (CANVAS, CANVAS), BACKGROUND)
    offset = (CANVAS - logo_size) // 2
    canvas.paste(mark, (offset, offset), mark)
    return canvas


def compose_adaptive_foreground(logo: Image.Image) -> Image.Image:
    logo_size = int(CANVAS * ADAPTIVE_LOGO_FILL)
    mark = upscale_logo(logo, logo_size)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    offset = (CANVAS - logo_size) // 2
    canvas.paste(mark, (offset, offset), mark)
    return canvas


def main() -> None:
    logo = load_logo_mark()
    logo.save(LOGO_MARK, format="PNG", optimize=True)

    icon = compose_ios_icon(logo)
    adaptive = compose_adaptive_foreground(logo)

    icon.save(ICON, format="PNG", optimize=True)
    adaptive.save(ADAPTIVE, format="PNG", optimize=True)

    source = LOGO_SOURCE.name if LOGO_SOURCE.exists() else SPLASH.name
    print(f"Source artwork: {source}")
    print(f"Wrote {LOGO_MARK} ({logo.size[0]}x{logo.size[1]} source mark)")
    print(f"Wrote {ICON} ({icon.mode}, {icon.size[0]}x{icon.size[1]}, fill {IOS_LOGO_FILL:.0%})")
    print(
        f"Wrote {ADAPTIVE} ({adaptive.mode}, {adaptive.size[0]}x{adaptive.size[1]}, "
        f"fill {ADAPTIVE_LOGO_FILL:.0%}, transparent background)"
    )


if __name__ == "__main__":
    main()
