import TextInputField from "@/components/TextInputField";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  buildMapRegion,
  DEFAULT_MAP_REGION,
  geocodeStoreAddress,
  hasStoreCoordinates,
  looksLikeGhanaGpsCode,
  reverseGeocodeStoreLocation,
  type StoreCoordinates,
} from "@/utils/location";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, type MapPressEvent } from "react-native-maps";

export type StoreLocationValue = {
  address: string;
  latitude: number | null;
  longitude: number | null;
};

type StoreLocationPickerProps = {
  value: StoreLocationValue;
  onChange: (value: StoreLocationValue) => void;
  errorMessage?: string;
  city?: string;
  region?: string;
};

export default function StoreLocationPicker({
  value,
  onChange,
  errorMessage,
  city,
  region,
}: StoreLocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [canShowUserLocation, setCanShowUserLocation] = useState(false);

  const mapRegion = useMemo(
    () => buildMapRegion(value.latitude, value.longitude, 0.012),
    [value.latitude, value.longitude],
  );

  const hasPin = hasStoreCoordinates(value.latitude, value.longitude);

  const refreshPlaceLabel = useCallback(async (coords: StoreCoordinates) => {
    const label = await reverseGeocodeStoreLocation(coords.latitude, coords.longitude);
    setPlaceLabel(label);
  }, []);

  useEffect(() => {
    if (!hasPin) {
      setPlaceLabel(null);
      return;
    }

    void refreshPlaceLabel({
      latitude: value.latitude!,
      longitude: value.longitude!,
    });
  }, [hasPin, refreshPlaceLabel, value.latitude, value.longitude]);

  useEffect(() => {
    void (async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      setCanShowUserLocation(permission.status === "granted");
    })();
  }, []);

  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onChange({
      ...value,
      latitude,
      longitude,
    });
    setLocationError(null);
    await refreshPlaceLabel({ latitude, longitude });
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationError("Allow location access so we can place your store on the map.");
        return;
      }

      setCanShowUserLocation(true);

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const resolvedAddress = await reverseGeocodeStoreLocation(
        coords.latitude,
        coords.longitude,
      );

      onChange({
        address: resolvedAddress || value.address,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setPlaceLabel(resolvedAddress);
      setLocationError(null);
    } catch {
      setLocationError(
        "We couldn't read your GPS right now. Paste your GhanaPost code or tap the map instead.",
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleLookupAddress = async () => {
    const query = value.address.trim();
    if (!query) {
      setLocationError("Paste your GhanaPost GPS (e.g. GA-144) or type your store landmark first.");
      return;
    }

    setIsLookingUp(true);
    setLocationError(null);

    try {
      const coords = await geocodeStoreAddress(query, { city, region });
      if (!coords) {
        setLocationError(
          looksLikeGhanaGpsCode(query)
            ? "We couldn't find that GPS code. Try the full code, use “I'm at my store”, or tap the map."
            : "We couldn't find that address. Use your current location or tap the map to drop a pin.",
        );
        return;
      }

      onChange({
        address: query,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      await refreshPlaceLabel(coords);
    } catch (lookupError) {
      setLocationError(
        lookupError instanceof Error
          ? lookupError.message
          : "Location lookup failed. Try your current location or tap the map.",
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  const combinedError = errorMessage || locationError;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Where is your store? *</Text>
      <Text style={styles.helper}>
        Paste your GhanaPost GPS (like GA-144), describe the landmark, or use the buttons below.
        You never need to enter map numbers — ODOS handles that for you.
      </Text>

      <TextInputField
        label="GhanaPost GPS or landmark"
        icon="navigate-outline"
        placeholder="e.g. GA-183-8162 or Accra Mall, Ring Road"
        value={value.address}
        onChangeText={(address) => {
          onChange({ ...value, address });
          setLocationError(null);
        }}
        errorMessage={combinedError ?? undefined}
        multiline
        numberOfLines={2}
        autoCapitalize="characters"
      />

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => void handleLookupAddress()}
          activeOpacity={0.86}
          disabled={isLookingUp || isLocating}
        >
          {isLookingUp ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="search-outline" size={rS(18)} color="#FFFFFF" />
          )}
          <Text style={styles.actionButtonPrimaryText}>
            {isLookingUp ? "Finding..." : "Find on map"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => void handleUseCurrentLocation()}
          activeOpacity={0.86}
          disabled={isLocating || isLookingUp}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : (
            <Ionicons name="locate-outline" size={rS(18)} color={AppColors.primary} />
          )}
          <Text style={styles.actionButtonText}>
            {isLocating ? "Locating..." : "I'm at my store"}
          </Text>
        </TouchableOpacity>
      </View>

      {hasPin ? (
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={rS(22)} color="#059669" />
          <View style={styles.successCopy}>
            <Text style={styles.successTitle}>Store location saved</Text>
            <Text style={styles.successText} numberOfLines={3}>
              {placeLabel || value.address || "Pinned on the map"}
            </Text>
          </View>
        </View>
      ) : null}

      {Platform.OS === "web" ? (
        <View style={styles.webMapFallback}>
          <Ionicons name="phone-portrait-outline" size={rS(28)} color={AppColors.primary} />
          <Text style={styles.webMapTitle}>Open in Expo Go on your phone</Text>
          <Text style={styles.webMapText}>
            The live map pin works in Expo Go on iOS and Android. Paste your GPS code above, then
            use “Find on map” or “I&apos;m at my store”.
          </Text>
        </View>
      ) : (
        <View style={styles.mapShell}>
          <MapView
            style={styles.map}
            initialRegion={hasPin ? mapRegion : DEFAULT_MAP_REGION}
            region={hasPin ? mapRegion : undefined}
            onPress={(event) => void handleMapPress(event)}
            showsUserLocation={canShowUserLocation}
            showsMyLocationButton={false}
          >
            {hasPin ? (
              <Marker
                coordinate={{
                  latitude: value.latitude!,
                  longitude: value.longitude!,
                }}
                title="Your store"
                description={placeLabel || value.address || "Store location"}
              />
            ) : null}
          </MapView>
          {!hasPin ? (
            <View style={styles.mapHint} pointerEvents="none">
              <Text style={styles.mapHintText}>Or tap anywhere on the map to drop your pin</Text>
            </View>
          ) : null}
        </View>
      )}

      <Text style={styles.tipText}>
        Tip: If “Find on map” misses your GPS code, stand at your shop and tap “I&apos;m at my store”.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: rV(10),
  },
  label: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  helper: {
    color: "#6B7280",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(10),
  },
  actionButton: {
    flex: 1,
    minWidth: rS(148),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingVertical: rV(12),
    paddingHorizontal: rS(12),
  },
  actionButtonPrimary: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  actionButtonText: {
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(13),
  },
  actionButtonPrimaryText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
  successCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
    borderRadius: rMS(16),
    backgroundColor: "#ECFDF5",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#A7F3D0",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
  },
  successCopy: {
    flex: 1,
    gap: rV(2),
  },
  successTitle: {
    color: "#065F46",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
  successText: {
    color: "#047857",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
  },
  mapShell: {
    height: rV(220),
    borderRadius: rMS(20),
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
    backgroundColor: "#E8ECF1",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapHint: {
    position: "absolute",
    left: rS(12),
    right: rS(12),
    bottom: rS(12),
    borderRadius: rMS(14),
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
  },
  mapHintText: {
    textAlign: "center",
    color: AppColors.text,
    fontFamily: Fonts.title,
    fontSize: rMS(12),
  },
  webMapFallback: {
    minHeight: rV(150),
    borderRadius: rMS(20),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(20),
    gap: rV(8),
  },
  webMapTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    textAlign: "center",
  },
  webMapText: {
    color: "#6B7280",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    textAlign: "center",
  },
  tipText: {
    color: "#9CA3AF",
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    lineHeight: rMS(16),
  },
});
