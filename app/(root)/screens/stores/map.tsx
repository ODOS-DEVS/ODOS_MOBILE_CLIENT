import { ProductGridSkeleton } from "@/components/loaders/CommerceSkeletons";
import StoreSocialLinksBar from "@/components/store/StoreSocialLinksBar";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useStore } from "@/hooks/useCommerce";
import { rMS, rS, rV } from "@/styles/responsive";
import { goBackOr } from "@/utils/navigation";
import {
  buildMapsSearchUrl,
  buildMapRegion,
  formatStoreAddress,
  hasStoreCoordinates,
} from "@/utils/location";
import { resolveImageSource } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const StoreMapScreen = () => {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const storeId = getParam(params.storeId);
  const { store, isLoading } = useStore({ storeId });

  const fullAddress = useMemo(
    () => formatStoreAddress([store?.address, store?.city, store?.region]),
    [store?.address, store?.city, store?.region],
  );

  const hasLiveMap = hasStoreCoordinates(store?.latitude, store?.longitude);
  const mapRegion = buildMapRegion(store?.latitude, store?.longitude, 0.018);
  const mapsUrl = buildMapsSearchUrl(fullAddress, store?.latitude, store?.longitude);

  const openExternalMaps = () => {
    if (!mapsUrl) {
      return;
    }

    void Linking.openURL(mapsUrl);
  };

  if (isLoading && !store) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + rV(12) }]}>
        <ProductGridSkeleton count={2} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + rV(12),
          paddingBottom: insets.bottom + rV(24),
        }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              goBackOr(router, { fallback: "/(root)/screens/stores/stores" as any })
            }
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {store?.title || getParam(params.title) || "Store location"}
          </Text>
        </View>

        <View style={styles.mapCard}>
          {Platform.OS === "web" || !hasLiveMap ? (
            <View style={styles.mapFallback}>
              <Ionicons name="map-outline" size={rS(30)} color={AppColors.primary} />
              <Text style={styles.mapFallbackTitle}>
                {hasLiveMap ? "Map preview on mobile" : "Live map pin not added yet"}
              </Text>
              <Text style={styles.mapFallbackText}>
                {hasLiveMap
                  ? "Open this screen on the ODOS mobile app to view the live mini map."
                  : "The vendor has not pinned an exact location yet. Use the address below or open directions in Maps."}
              </Text>
            </View>
          ) : (
            <MapView style={styles.map} initialRegion={mapRegion} region={mapRegion}>
              <Marker
                coordinate={{
                  latitude: store!.latitude!,
                  longitude: store!.longitude!,
                }}
                title={store?.title}
                description={fullAddress || "Store location"}
              />
            </MapView>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.storeIdentity}>
            {store?.image ? (
              <Image
                source={resolveImageSource(store.imageUrl, store.imageKey) ?? store.image}
                style={styles.storeLogo}
              />
            ) : (
              <View style={styles.storeLogoPlaceholder}>
                <Ionicons name="storefront-outline" size={rS(20)} color="#94A3B8" />
              </View>
            )}
            <View style={styles.storeIdentityCopy}>
              <Text style={styles.storeName}>{store?.title || "Store"}</Text>
              {store?.category ? (
                <Text style={styles.storeMeta}>{store.category}</Text>
              ) : null}
            </View>
          </View>

          {fullAddress ? (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={rS(16)} color="#6B7280" />
              <Text style={styles.detailText}>{fullAddress}</Text>
            </View>
          ) : null}

          {store?.distanceKm || store?.travelMinutes ? (
            <View style={styles.metricsRow}>
              {store.distanceKm ? (
                <View style={styles.metricPill}>
                  <Ionicons name="navigate-outline" size={rS(14)} color={AppColors.primary} />
                  <Text style={styles.metricText}>{store.distanceKm}</Text>
                </View>
              ) : null}
              {store.travelMinutes ? (
                <View style={styles.metricPill}>
                  <Ionicons name="time-outline" size={rS(14)} color={AppColors.primary} />
                  <Text style={styles.metricText}>{store.travelMinutes}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {store?.phone ? (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={rS(16)} color="#6B7280" />
              <Text style={styles.detailText}>{store.phone}</Text>
            </View>
          ) : null}

          {store?.email ? (
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={rS(16)} color="#6B7280" />
              <Text style={styles.detailText}>{store.email}</Text>
            </View>
          ) : null}

          {store?.description ? (
            <Text style={styles.description}>{store.description}</Text>
          ) : null}

          <StoreSocialLinksBar
            links={{
              instagramUrl: store?.instagramUrl,
              facebookUrl: store?.facebookUrl,
              tiktokUrl: store?.tiktokUrl,
              twitterUrl: store?.twitterUrl,
              whatsappUrl: store?.whatsappUrl,
              websiteUrl: store?.websiteUrl,
            }}
          />

          {mapsUrl ? (
            <TouchableOpacity style={styles.directionsButton} onPress={openExternalMaps}>
              <Ionicons name="navigate-circle" size={rS(18)} color="#FFFFFF" />
              <Text style={styles.directionsButtonText}>Open directions</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default StoreMapScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingHorizontal: rS(16),
    marginBottom: rV(14),
  },
  backButton: {
    width: rS(40),
    height: rS(40),
    borderRadius: rS(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    color: "#111827",
    fontFamily: "Montserrat-ExtraBold",
    fontSize: rMS(20),
  },
  mapCard: {
    marginHorizontal: rS(16),
    height: rV(280),
    borderRadius: rMS(24),
    overflow: "hidden",
    backgroundColor: "#E8ECF1",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(24),
    gap: rV(8),
  },
  mapFallbackTitle: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    textAlign: "center",
  },
  mapFallbackText: {
    color: "#6B7280",
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    textAlign: "center",
  },
  infoCard: {
    marginTop: rV(16),
    marginHorizontal: rS(16),
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(24),
    padding: rS(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    gap: rV(12),
  },
  storeIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  storeLogo: {
    width: rS(54),
    height: rS(54),
    borderRadius: rS(18),
  },
  storeLogoPlaceholder: {
    width: rS(54),
    height: rS(54),
    borderRadius: rS(18),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  storeIdentityCopy: {
    flex: 1,
    gap: rV(2),
  },
  storeName: {
    color: "#111827",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
  },
  storeMeta: {
    color: "#6B7280",
    fontFamily: Fonts.title,
    fontSize: rMS(12.5),
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
  },
  detailText: {
    flex: 1,
    color: "#374151",
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  metricPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    borderRadius: rS(999),
    backgroundColor: "#F3F4F6",
    paddingHorizontal: rS(12),
    paddingVertical: rV(7),
  },
  metricText: {
    color: "#374151",
    fontFamily: Fonts.title,
    fontSize: rMS(12),
  },
  description: {
    color: "#6B7280",
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  directionsButton: {
    marginTop: rV(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
    borderRadius: rS(999),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(14),
  },
  directionsButtonText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
});
