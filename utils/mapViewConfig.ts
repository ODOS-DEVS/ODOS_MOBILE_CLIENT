import { GOOGLE_MAP_LIGHT_STYLE } from "@/utils/googleMapStyle";
import { PROVIDER_GOOGLE } from "react-native-maps";

export const ODOS_MAP_PROVIDER = PROVIDER_GOOGLE;

export const odosGoogleMapProps = {
  provider: ODOS_MAP_PROVIDER,
  customMapStyle: GOOGLE_MAP_LIGHT_STYLE,
  mapType: "standard" as const,
};
