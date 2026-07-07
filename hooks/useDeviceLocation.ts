import type { StoreCoordinates } from "@/utils/location";
import { ensureLocationPermission } from "@/utils/location";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

type DeviceLocationState = {
  coords: StoreCoordinates | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useDeviceLocation(enabled: boolean): DeviceLocationState {
  const [coords, setCoords] = useState<StoreCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCoords(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const granted = await ensureLocationPermission();
      if (!granted) {
        setCoords(null);
        setError("Location permission is required to sort stores near you.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      setCoords(null);
      setError("We couldn't read your location right now.");
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { coords, isLoading, error, refresh };
}
