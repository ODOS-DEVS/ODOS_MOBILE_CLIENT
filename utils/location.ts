import * as Location from "expo-location";
import type { Region } from "react-native-maps";

export const DEFAULT_MAP_REGION = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export type StoreCoordinates = {
  latitude: number;
  longitude: number;
};

const GHANA_GPS_CODE_PATTERN = /^[A-Z]{2}-[A-Z0-9]{2,8}(-[A-Z0-9]{2,8})?$/i;

export function hasStoreCoordinates(
  latitude?: number | null,
  longitude?: number | null,
): latitude is number {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  );
}

export function normalizeGhanaGpsCode(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function looksLikeGhanaGpsCode(value: string) {
  const normalized = normalizeGhanaGpsCode(value);
  return GHANA_GPS_CODE_PATTERN.test(normalized);
}

export function buildMapRegion(
  latitude?: number | null,
  longitude?: number | null,
  delta = 0.02,
): Region {
  if (!hasStoreCoordinates(latitude, longitude)) {
    return DEFAULT_MAP_REGION;
  }

  return {
    latitude: latitude as number,
    longitude: longitude as number,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export function buildMapsSearchUrl(
  address?: string | null,
  latitude?: number | null,
  longitude?: number | null,
) {
  if (hasStoreCoordinates(latitude, longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  const query = address?.trim();
  if (!query) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function formatStoreAddress(parts: Array<string | null | undefined>) {
  return parts
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

export function formatGeocodedAddress(
  entry: Location.LocationGeocodedAddress | null | undefined,
) {
  if (!entry) {
    return null;
  }

  if (entry.formattedAddress?.trim()) {
    return entry.formattedAddress.trim();
  }

  return formatStoreAddress([
    entry.name,
    entry.street,
    entry.streetNumber,
    entry.district,
    entry.city,
    entry.region,
    entry.country,
  ]);
}

export async function ensureLocationPermission() {
  const permission = await Location.requestForegroundPermissionsAsync();
  return permission.status === "granted";
}

export async function geocodeStoreAddress(
  query: string,
  context?: { city?: string | null; region?: string | null },
): Promise<StoreCoordinates | null> {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const granted = await ensureLocationPermission();
  if (!granted) {
    throw new Error(
      "Allow location access so ODOS can find your store on the map.",
    );
  }

  const normalizedGps = looksLikeGhanaGpsCode(trimmed)
    ? normalizeGhanaGpsCode(trimmed)
    : null;
  const locality = [context?.city?.trim(), context?.region?.trim()]
    .filter(Boolean)
    .join(", ");

  const attempts = [
    normalizedGps && locality ? `${normalizedGps}, ${locality}, Ghana` : null,
    normalizedGps ? `${normalizedGps}, Ghana` : null,
    locality ? `${trimmed}, ${locality}, Ghana` : null,
    `${trimmed}, Ghana`,
    trimmed,
  ].filter(
    (value, index, list): value is string =>
      Boolean(value) && list.indexOf(value) === index,
  );

  for (const attempt of attempts) {
    try {
      const results = await Location.geocodeAsync(attempt);
      const match = results.find(
        (entry) =>
          Number.isFinite(entry.latitude) &&
          Number.isFinite(entry.longitude) &&
          Math.abs(entry.latitude) <= 90 &&
          Math.abs(entry.longitude) <= 180,
      );

      if (match) {
        return {
          latitude: match.latitude,
          longitude: match.longitude,
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

export async function reverseGeocodeStoreLocation(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const granted = await ensureLocationPermission();
  if (!granted) {
    return null;
  }

  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    return formatGeocodedAddress(results[0]);
  } catch {
    return null;
  }
}

export function getStoreLocationValidationError(
  address?: string | null,
  latitude?: number | null,
  longitude?: number | null,
) {
  if (!address?.trim()) {
    return "Paste your GhanaPost GPS (e.g. GA-144) or describe where your store is.";
  }

  if (!hasStoreCoordinates(latitude, longitude)) {
    return "Tap “Find on map”, use your current location, or drop a pin on the map below.";
  }

  return undefined;
}

/** Great-circle distance in kilometres between two coordinates. */
export function distanceKmBetween(
  from: StoreCoordinates,
  to: StoreCoordinates,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(distanceKm: number) {
  if (!Number.isFinite(distanceKm)) {
    return null;
  }
  if (distanceKm < 1) {
    return `${Math.max(100, Math.round(distanceKm * 1000))} m away`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km away`;
  }
  return `${Math.round(distanceKm)} km away`;
}

type StoreWithCoords = {
  latitude?: number | null;
  longitude?: number | null;
};

export function sortStoresByDistance<T extends StoreWithCoords>(
  stores: T[],
  origin: StoreCoordinates,
) {
  return stores
    .map((store) => {
      if (!hasStoreCoordinates(store.latitude, store.longitude)) {
        return { store, distanceKm: Number.POSITIVE_INFINITY };
      }
      return {
        store,
        distanceKm: distanceKmBetween(origin, {
          latitude: store.latitude,
          longitude: store.longitude!,
        }),
      };
    })
    .sort((left, right) => left.distanceKm - right.distanceKm);
}
