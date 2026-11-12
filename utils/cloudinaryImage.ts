import { PixelRatio } from "react-native";

/**
 * Right-sized, modern-format Cloudinary URLs for the app.
 *
 * The app used to request the stored original everywhere — a ~235KB JPEG for
 * a 160pt card — because nothing ever built a transformation URL. The website
 * has had a loader doing this for a while; this is the mobile half.
 *
 * Every variant is derived by Cloudinary from the untouched original, cached
 * at its CDN edge, and never upscaled (`c_limit`), so a small source stays
 * small rather than being stretched into a soft larger one.
 */

/** Cloudinary caps transformation width at 5000px; nothing we ship needs more. */
const MAX_VARIANT_WIDTH = 4000;

/** Device pixel ratio, clamped: a 3x phone genuinely needs 3x, 4x buys nothing visible. */
function pixelRatio(): number {
  return Math.min(Math.max(PixelRatio.get(), 1), 3);
}

/**
 * Width buckets. Requesting an exact per-device width would give Cloudinary (and
 * its CDN) a near-unique URL per handset, so nothing would ever be warm. Snapping
 * to a ladder keeps the cache shared while never serving less than asked for.
 */
const WIDTH_LADDER = [160, 240, 320, 480, 640, 828, 1080, 1440, 1920, 2560, 3200, MAX_VARIANT_WIDTH];

function snapWidth(target: number): number {
  return WIDTH_LADDER.find((w) => w >= target) ?? MAX_VARIANT_WIDTH;
}

export type ImageQuality =
  /** Product photography and anything the shopper may inspect closely. */
  | "best"
  /** Everything else: banners, avatars, list thumbnails. */
  | "auto";

function isTransformable(url: string): boolean {
  return url.includes("res.cloudinary.com") && url.includes("/upload/");
}

/**
 * A delivery URL for displaying `url` in a box `displayWidth` points wide.
 *
 * Pass the layout width in points, not pixels — the device pixel ratio is
 * applied here, which is the whole reason a 160pt card looks sharp on a 3x
 * screen instead of soft.
 */
export function cloudinaryImageUrl(
  url: string | null | undefined,
  displayWidth: number,
  quality: ImageQuality = "auto",
): string | undefined {
  if (!url?.trim()) {
    return undefined;
  }
  const trimmed = url.trim();
  if (!isTransformable(trimmed)) {
    // Non-Cloudinary sources (local files, Google avatars) pass through untouched.
    return trimmed;
  }

  const width = snapWidth(Math.ceil(displayWidth * pixelRatio()));
  // "auto" must emit a bare q_auto — Cloudinary rejects `q_auto:auto` outright
  // with a 400, which would have broken every image that is not product detail.
  const q = quality === "best" ? "q_auto:best" : "q_auto";
  // f_auto: WebP/AVIF where the OS decoder supports it. q_auto:best for product
  // detail, which holds texture and edges the default perceptual setting drops.
  // c_limit: never upscale a small original into a soft large one.
  const transformation = `f_auto,${q},w_${width},c_limit`;
  return trimmed.replace("/upload/", `/upload/${transformation}/`);
}

/**
 * The sharpest sensible version, for full-screen viewers and pinch-zoom.
 *
 * Still a transformation rather than the raw original: `f_auto` alone typically
 * halves the bytes at a quality no one can distinguish, and `c_limit` means a
 * modest original is delivered at its own size rather than stretched.
 */
export function cloudinaryFullscreenUrl(
  url: string | null | undefined,
  screenWidth: number,
): string | undefined {
  return cloudinaryImageUrl(url, screenWidth, "best");
}
