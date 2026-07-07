import { isGoogleMapsEnabled } from "@/constants/maps";
import { GOOGLE_MAP_LIGHT_STYLE } from "@/utils/googleMapStyle";
import type { MapViewProps } from "react-native-maps";
import { PROVIDER_GOOGLE } from "react-native-maps";

export { isGoogleMapsEnabled };

export const odosGoogleMapProps: Partial<MapViewProps> = isGoogleMapsEnabled
  ? {
      provider: PROVIDER_GOOGLE,
      customMapStyle: GOOGLE_MAP_LIGHT_STYLE,
      mapType: "standard",
    }
  : {};
