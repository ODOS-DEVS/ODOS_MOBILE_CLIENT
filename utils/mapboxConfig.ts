import Constants from "expo-constants";
import { NativeModules } from "react-native";
// Type-only: erased at compile time, so it never pulls the native module in.
import type MapboxType from "@rnmapbox/maps";

/**
 * Mapbox wiring, in one place.
 *
 * Replaces the Google Maps setup, which was gated behind
 * `EXPO_PUBLIC_ENABLE_GOOGLE_MAPS` -- a flag that was never set, so the store
 * maps had been falling through to a decorative placeholder on every device.
 *
 * The token is a *public* one (`pk.`) and is meant to ship inside the app;
 * that is what Mapbox issues it for. The secret `sk.` download token is a
 * different thing entirely and is not needed here -- Mapbox dropped the
 * download-auth requirement, and @rnmapbox/maps treats it as optional.
 */

export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "";

/**
 * @rnmapbox/maps throws *at import time* when its native code is absent --
 * see RNMBXModule.js, which checks `NativeModules.RNMBXModule` at module
 * scope and throws "native code not available ... rebuild your app". That is
 * not a missing map, it is an uncaught error that takes the whole screen down
 * with it, which is exactly what happens in Expo Go and in any dev build made
 * before the package was added.
 *
 * So the module is never imported at the top level. It is required lazily,
 * behind this flag, mirroring how hooks/useSpeechInput.ts already guards
 * expo-speech-recognition.
 */
const hasNativeMapbox = NativeModules.RNMBXModule != null;

/** Expo Go can never contain it: Mapbox ships native code, and Expo Go is a
 *  prebuilt binary carrying only Expo's own modules. */
const isExpoGo = Constants.appOwnership === "expo";

/**
 * Token checked by prefix rather than mere presence: a blank or half-pasted
 * value in `.env` would pass a truthiness test and leave the map rendering an
 * empty grey grid with no clue why. Falling back to the illustration is a
 * better answer than a map that looks broken.
 */
export const isMapboxEnabled =
  MAPBOX_TOKEN.startsWith("pk.") && hasNativeMapbox && !isExpoGo;

let cachedMapbox: typeof MapboxType | null | undefined;

/**
 * The Mapbox namespace, or null when it cannot be used here.
 *
 * Callers must handle null and render their fallback -- in Expo Go that is
 * the only outcome, and it must stay a quiet degradation rather than a crash.
 */
export function getMapbox(): typeof MapboxType | null {
  if (cachedMapbox !== undefined) {
    return cachedMapbox;
  }

  if (!isMapboxEnabled) {
    cachedMapbox = null;
    return cachedMapbox;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mapbox = require("@rnmapbox/maps").default as typeof MapboxType;
    // Fire-and-forget: resolves before the first MapView mounts, and there is
    // nothing useful to do with a rejection beyond letting the fallback show.
    void mapbox.setAccessToken(MAPBOX_TOKEN);
    cachedMapbox = mapbox;
  } catch {
    cachedMapbox = null;
  }

  return cachedMapbox;
}

/**
 * The house map style. Light and low-contrast, so store pins stay the loudest
 * thing on screen -- the same intent the old Google custom style had.
 *
 * Written as a literal rather than read from the package's `StyleURL` enum,
 * because importing that enum would drag in the native module and reintroduce
 * the very crash this file exists to avoid.
 */
export const ODOS_MAP_STYLE_URL = "mapbox://styles/mapbox/light-v10";

/**
 * react-native-maps thinks in latitude/longitude *deltas*; Mapbox thinks in
 * zoom levels. Converting keeps every existing caller of `buildMapRegion`
 * working without each screen inventing its own magic number.
 *
 * The web-mercator relationship is zoom = log2(360 / longitudeDelta), offset
 * by one because a delta spans the full viewport width while zoom is measured
 * per tile.
 */
export function zoomFromDelta(delta: number): number {
  if (!Number.isFinite(delta) || delta <= 0) {
    return 14;
  }
  const zoom = Math.log2(360 / delta) - 1;
  // Clamped to sane extremes so a bad delta cannot produce a map zoomed into
  // the void or all the way out to the whole globe.
  return Math.min(20, Math.max(2, zoom));
}

/** Mapbox takes coordinates as [longitude, latitude] -- the reverse of
 *  react-native-maps and of how everyone says them out loud. Funnelling every
 *  conversion through one helper is what stops that costing an afternoon. */
export function toMapboxPosition(
  latitude?: number | null,
  longitude?: number | null,
): [number, number] | null {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return null;
  }
  return [longitude, latitude];
}

/**
 * The reverse of {@link toMapboxPosition}: pull latitude/longitude back out of
 * a Mapbox position or GeoJSON point coordinate pair.
 *
 * GeoJSON -- and therefore every Mapbox event -- orders coordinates
 * `[longitude, latitude]`. Reading them in the order they are written gives a
 * point with latitude and longitude swapped, which is a valid coordinate
 * somewhere else on Earth: no crash, no error, just a store pinned in the
 * wrong hemisphere. Doing the unpacking here, once, is what keeps that from
 * being rediscovered per call site.
 */
export function fromMapboxPosition(
  position?: readonly number[] | null,
): { latitude: number; longitude: number } | null {
  if (!position || position.length < 2) {
    return null;
  }
  const [longitude, latitude] = position;
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}
