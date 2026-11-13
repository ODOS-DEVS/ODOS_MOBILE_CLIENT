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

/**
 * Unsharp mask strength, applied only when the image is actually being
 * downscaled (see the conditional below).
 *
 * Cloudinary's resampler is softer than a good Lanczos filter: measured
 * against a product photo, a downscale kept only 65-84% of the original's
 * edge energy depending on the factor, and that deficit is exactly the
 * "slightly blurry" look on cards and list rows. 80 lands the result at
 * 103-125% of a Lanczos resample across every width on the ladder, and it
 * raises PSNR at the larger sizes rather than lowering it — it is restoring
 * detail the resampler lost, not inventing crispness.
 */
const DOWNSCALE_SHARPEN = 80;

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
  // q_95 is the measured point where a delivered image stops being
  // distinguishable from the stored original (PSNR 46.5dB, edge energy
  // identical); q_auto:best sits a little below it at 44.2dB and is kept for
  // chrome, where the saving is worth more than the last decibel. A bare
  // `q_auto:auto` is rejected by Cloudinary with a 400, which is why neither
  // branch can be built by interpolating the tier name.
  const q = quality === "best" ? "q_95" : "q_auto:best";
  // f_auto: WebP/AVIF where the OS decoder supports it.
  // c_limit: never upscale a small original into a soft large one.
  const transformation = `f_auto,${q},w_${width},c_limit`;
  // Sharpen ONLY when the source is genuinely larger than what we are asking
  // for. Applied unconditionally it would crisp an image that was never
  // resized — measured at 161% of the original's edge energy, with PSNR
  // falling from 46.5 to 42.9. The conditional is a separate transformation
  // component, so it is slash-separated rather than part of the comma list.
  const sharpen = `if_iw_gt_${width}/e_sharpen:${DOWNSCALE_SHARPEN}/if_end`;
  return trimmed.replace("/upload/", `/upload/${sharpen}/${transformation}/`);
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
