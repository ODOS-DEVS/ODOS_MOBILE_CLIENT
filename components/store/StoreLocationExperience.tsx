import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  buildMapsSearchUrl,
  buildMapRegion,
  formatStoreAddress,
  hasStoreCoordinates,
} from "@/utils/location";
import { isGoogleMapsEnabled, odosGoogleMapProps } from "@/utils/mapViewConfig";
import { resolveImageSource } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import MapView, { Marker } from "react-native-maps";
import Animated, {
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_EXPANDED = Math.min(SCREEN_HEIGHT * 0.74, rV(620));
const SHEET_PEEK = rV(196);
const SHEET_TRAVEL = SHEET_EXPANDED - SHEET_PEEK;

const SPRING = { damping: 24, stiffness: 260, mass: 0.85 };

export type StoreLocationData = {
  id?: string;
  title?: string;
  category?: string;
  description?: string;
  address?: string;
  city?: string;
  region?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews?: string;
  distanceKm?: string;
  travelMinutes?: string;
  image?: any;
  imageUrl?: string;
  imageKey?: string;
  imageBanner?: any;
  imageBannerUrl?: string;
  imageBannerKey?: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  twitterUrl?: string | null;
  websiteUrl?: string | null;
};

type StoreLocationExperienceProps = {
  store?: StoreLocationData | null;
  fallbackTitle?: string;
  onBack: () => void;
};

function StoreMapPin({
  logoSource,
  title,
}: {
  logoSource: ReturnType<typeof resolveImageSource> | null;
  title?: string;
}) {
  return (
    <View style={pinStyles.wrap} accessibilityLabel={`${title ?? "Store"} location pin`}>
      <View style={[pinStyles.pulse, { opacity: 0.22, transform: [{ scale: 1 }] }]} />
      <View style={pinStyles.bubble}>
        {logoSource ? (
          <Image source={logoSource} style={pinStyles.logo} />
        ) : (
          <Ionicons name="storefront" size={rMS(22)} color={AppColors.primary} />
        )}
      </View>
      <View style={pinStyles.stem} />
      <View style={pinStyles.shadowDot} />
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  primary = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[actionStyles.chip, primary ? actionStyles.chipPrimary : null]}
    >
      <Ionicons
        name={icon}
        size={rMS(16)}
        color={primary ? "#FFFFFF" : AppColors.primary}
      />
      <Text style={[actionStyles.chipLabel, primary ? actionStyles.chipLabelPrimary : null]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function StoreLocationExperience({
  store,
  fallbackTitle = "Store location",
  onBack,
}: StoreLocationExperienceProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const fullAddress = useMemo(
    () => formatStoreAddress([store?.address, store?.city, store?.region]),
    [store?.address, store?.city, store?.region],
  );

  const hasLiveMap = hasStoreCoordinates(store?.latitude, store?.longitude);
  const mapRegion = buildMapRegion(store?.latitude, store?.longitude, 0.012);
  const mapsUrl = buildMapsSearchUrl(fullAddress, store?.latitude, store?.longitude);
  const storeTitle = store?.title || fallbackTitle;
  const showNativeMap =
    Platform.OS !== "web" && hasLiveMap && isGoogleMapsEnabled;

  const logoSource =
    store?.image != null || store?.imageUrl || store?.imageKey
      ? resolveImageSource(store?.imageUrl, store?.imageKey) ?? store?.image
      : null;
  const bannerSource =
    store?.imageBanner != null || store?.imageBannerUrl || store?.imageBannerKey
      ? resolveImageSource(store?.imageBannerUrl, store?.imageBannerKey) ?? store?.imageBanner
      : logoSource;

  const sheetOffset = useSharedValue(SHEET_TRAVEL);
  const dragStart = useSharedValue(SHEET_TRAVEL);

  useEffect(() => {
    return () => {
      cancelAnimation(sheetOffset);
      cancelAnimation(dragStart);
    };
  }, [dragStart, sheetOffset]);

  const snapTo = useCallback(
    (expanded: boolean) => {
      const target = expanded ? 0 : SHEET_TRAVEL;
      sheetOffset.value = withSpring(target, SPRING);
      setSheetExpanded(expanded);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [sheetOffset],
  );

  const snapToNearest = useCallback(
    (offset: number) => {
      const expanded = offset < SHEET_TRAVEL * 0.45;
      snapTo(expanded);
    },
    [snapTo],
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragStart.value = sheetOffset.value;
    })
    .onUpdate((event) => {
      const next = dragStart.value + event.translationY;
      sheetOffset.value = Math.min(Math.max(next, 0), SHEET_TRAVEL);
    })
    .onEnd((event) => {
      const projected = sheetOffset.value + event.velocityY * 0.08;
      runOnJS(snapToNearest)(projected);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetOffset.value }],
  }));

  const topScrimOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      sheetOffset.value,
      [0, SHEET_TRAVEL],
      [0.95, 0.55],
      Extrapolation.CLAMP,
    ),
  }));

  const focusStore = useCallback(() => {
    if (!hasLiveMap || !mapRef.current) {
      return;
    }

    mapRef.current.animateToRegion(mapRegion, 520);
    void Haptics.selectionAsync();
  }, [hasLiveMap, mapRegion]);

  useEffect(() => {
    if (showNativeMap) {
      const timer = setTimeout(focusStore, 350);
      return () => clearTimeout(timer);
    }
  }, [focusStore, showNativeMap]);

  const openExternalMaps = () => {
    if (!mapsUrl) return;
    void Linking.openURL(mapsUrl);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const callStore = () => {
    if (!store?.phone?.trim()) return;
    void Linking.openURL(`tel:${store.phone.trim()}`);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const mapBottomPadding = SHEET_PEEK + insets.bottom + rV(24);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {showNativeMap ? (
        <MapView
          ref={mapRef}
          {...odosGoogleMapProps}
          style={StyleSheet.absoluteFillObject}
          initialRegion={mapRegion}
          showsUserLocation
          showsCompass={false}
          showsScale={false}
          toolbarEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          mapPadding={{
            top: insets.top + rV(72),
            right: rS(16),
            bottom: mapBottomPadding,
            left: rS(16),
          }}
        >
          <Marker
            coordinate={{
              latitude: store!.latitude!,
              longitude: store!.longitude!,
            }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
          >
            <StoreMapPin logoSource={logoSource} title={storeTitle} />
          </Marker>
        </MapView>
      ) : (
        <View style={styles.fallbackCanvas}>
          <LinearGradient
            colors={["#eef6fb", "#f5f5f1", "#eef3e8"]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.fallbackWater} />
          <View style={styles.fallbackGrid}>
            {Array.from({ length: 8 }).map((_, row) => (
              <View key={`row-${row}`} style={styles.fallbackGridRow}>
                {Array.from({ length: 6 }).map((__, col) => (
                  <View key={`cell-${row}-${col}`} style={styles.fallbackGridCell} />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.fallbackPin}>
            <StoreMapPin logoSource={logoSource} title={storeTitle} />
          </View>
        </View>
      )}

      <Animated.View pointerEvents="none" style={[styles.topScrim, topScrimOpacity]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.92)", "rgba(255,255,255,0.45)", "transparent"]}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <View
        pointerEvents="box-none"
        style={[styles.topChrome, { paddingTop: insets.top + rV(10) }]}
      >
        <TouchableOpacity activeOpacity={0.88} onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={rMS(22)} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.topCopy}>
          <Text style={styles.topEyebrow}>Store location</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            {storeTitle}
          </Text>
        </View>
      </View>

      {showNativeMap ? (
        <View
          pointerEvents="box-none"
          style={[styles.mapControls, { bottom: mapBottomPadding + rV(12) }]}
        >
          <TouchableOpacity style={styles.mapControlBtn} onPress={focusStore} activeOpacity={0.9}>
            <Ionicons name="locate" size={rMS(20)} color="#111827" />
          </TouchableOpacity>
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.sheet,
          { height: SHEET_EXPANDED, paddingBottom: insets.bottom },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <View style={styles.sheetGrabArea}>
            <View style={styles.sheetHandle} />
            <Pressable
              onPress={() => snapTo(!sheetExpanded)}
              style={styles.peekHeader}
              accessibilityRole="button"
              accessibilityLabel={sheetExpanded ? "Collapse store details" : "Expand store details"}
            >
              <View style={styles.peekIdentity}>
                {logoSource ? (
                  <Image source={logoSource} style={styles.peekLogo} />
                ) : (
                  <View style={styles.peekLogoPlaceholder}>
                    <Ionicons name="storefront-outline" size={rMS(20)} color="#94A3B8" />
                  </View>
                )}
                <View style={styles.peekCopy}>
                  <Text style={styles.peekName} numberOfLines={1}>
                    {storeTitle}
                  </Text>
                  <Text style={styles.peekMeta} numberOfLines={1}>
                    {[store?.category, store?.city].filter(Boolean).join(" · ") ||
                      "Verified ODOS store"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={sheetExpanded ? "chevron-down" : "chevron-up"}
                size={rMS(20)}
                color="#9CA3AF"
              />
            </Pressable>

            <View style={styles.quickActions}>
              {mapsUrl ? (
                <QuickAction
                  icon="navigate"
                  label="Directions"
                  primary
                  onPress={openExternalMaps}
                />
              ) : null}
              {store?.phone ? (
                <QuickAction icon="call-outline" label="Call" onPress={callStore} />
              ) : null}
            </View>
          </View>
        </GestureDetector>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={sheetExpanded}
          scrollEnabled={sheetExpanded}
          contentContainerStyle={styles.sheetScrollContent}
        >
          {bannerSource ? (
            <View style={styles.bannerWrap}>
              <Image source={bannerSource} style={styles.bannerImage} />
              <LinearGradient
                colors={["transparent", "rgba(255,255,255,0.95)"]}
                style={styles.bannerFade}
              />
            </View>
          ) : null}

          <View style={styles.detailBlock}>
            <Text style={styles.sectionLabel}>Address</Text>
            {fullAddress ? (
              <View style={styles.addressCard}>
                <View style={styles.addressIcon}>
                  <Ionicons name="location" size={rMS(18)} color="#FFFFFF" />
                </View>
                <Text style={styles.addressText}>{fullAddress}</Text>
              </View>
            ) : (
              <Text style={styles.mutedCopy}>
                This store has not shared a full address yet. Try directions or contact the store
                directly.
              </Text>
            )}
          </View>

          {store?.distanceKm || store?.travelMinutes || store?.rating ? (
            <View style={styles.statsRow}>
              {store.distanceKm ? (
                <View style={styles.statCard}>
                  <Ionicons name="navigate-outline" size={rMS(16)} color={AppColors.primary} />
                  <Text style={styles.statValue}>{store.distanceKm}</Text>
                  <Text style={styles.statLabel}>distance</Text>
                </View>
              ) : null}
              {store.travelMinutes ? (
                <View style={styles.statCard}>
                  <Ionicons name="time-outline" size={rMS(16)} color={AppColors.primary} />
                  <Text style={styles.statValue}>{store.travelMinutes}</Text>
                  <Text style={styles.statLabel}>travel</Text>
                </View>
              ) : null}
              {typeof store.rating === "number" ? (
                <View style={styles.statCard}>
                  <Ionicons name="star" size={rMS(16)} color="#F59E0B" />
                  <Text style={styles.statValue}>{store.rating.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>rating</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {store?.description ? (
            <View style={styles.detailBlock}>
              <Text style={styles.sectionLabel}>About this store</Text>
              <Text style={styles.bodyCopy}>{store.description}</Text>
            </View>
          ) : null}

          {store?.phone || store?.email ? (
            <View style={styles.detailBlock}>
              <Text style={styles.sectionLabel}>Contact</Text>
              {store.phone ? (
                <TouchableOpacity style={styles.contactRow} onPress={callStore}>
                  <Ionicons name="call-outline" size={rMS(18)} color={AppColors.primary} />
                  <Text style={styles.contactText}>{store.phone}</Text>
                </TouchableOpacity>
              ) : null}
              {store.email ? (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => void Linking.openURL(`mailto:${store.email}`)}
                >
                  <Ionicons name="mail-outline" size={rMS(18)} color={AppColors.primary} />
                  <Text style={styles.contactText}>{store.email}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {mapsUrl ? (
            <TouchableOpacity style={styles.primaryCta} onPress={openExternalMaps}>
              <LinearGradient
                colors={["#4B5563", "#374151"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryCtaGradient}
              >
                <Ionicons name="map" size={rMS(20)} color="#FFFFFF" />
                <Text style={styles.primaryCtaText}>Open in Google Maps</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          {!showNativeMap ? (
            <View style={styles.fallbackNote}>
              <Ionicons name="phone-portrait-outline" size={rMS(18)} color={AppColors.primary} />
              <Text style={styles.fallbackNoteText}>
                {hasLiveMap
                  ? "Live map navigation works best in the ODOS mobile app."
                  : "Exact map pin not available yet — use the address or contact options above."}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const pinStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    width: rS(72),
    height: rV(92),
  },
  pulse: {
    position: "absolute",
    top: rV(8),
    width: rS(56),
    height: rS(56),
    borderRadius: rS(28),
    backgroundColor: AppColors.primary,
  },
  bubble: {
    width: rS(52),
    height: rS(52),
    borderRadius: rS(26),
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  stem: {
    width: rS(4),
    height: rV(14),
    marginTop: rV(-2),
    borderRadius: rS(2),
    backgroundColor: AppColors.primary,
  },
  shadowDot: {
    width: rS(16),
    height: rS(6),
    borderRadius: rS(8),
    backgroundColor: "rgba(15,23,42,0.18)",
    marginTop: rV(2),
  },
});

const actionStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingHorizontal: rS(14),
    paddingVertical: rV(10),
    borderRadius: rS(999),
    backgroundColor: "#F3F4F6",
  },
  chipPrimary: {
    backgroundColor: AppColors.primary,
  },
  chipLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
    color: AppColors.text,
  },
  chipLabelPrimary: {
    color: "#FFFFFF",
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f1",
  },
  fallbackCanvas: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: "#f5f5f1",
  },
  fallbackWater: {
    position: "absolute",
    right: -rS(40),
    bottom: rV(80),
    width: rS(220),
    height: rV(180),
    borderRadius: rMS(120),
    backgroundColor: "rgba(162, 218, 242, 0.55)",
  },
  fallbackGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    justifyContent: "space-evenly",
    paddingHorizontal: rS(8),
  },
  fallbackGridRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  fallbackGridCell: {
    width: rS(42),
    height: rV(42),
    borderRadius: rS(6),
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E0E0E0",
  },
  fallbackPin: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: rV(120),
  },
  topScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  topChrome: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(16),
    gap: rS(12),
  },
  backButton: {
    width: rS(44),
    height: rS(44),
    borderRadius: rS(22),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  topCopy: {
    flex: 1,
    gap: rV(2),
  },
  topEyebrow: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    color: "#6B7280",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  topTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    color: "#111827",
  },
  mapControls: {
    position: "absolute",
    right: rS(16),
  },
  mapControlBtn: {
    width: rS(48),
    height: rS(48),
    borderRadius: rS(16),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: rMS(28),
    borderTopRightRadius: rMS(28),
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -10 },
    elevation: 20,
    overflow: "hidden",
  },
  sheetGrabArea: {
    paddingTop: rV(10),
    paddingHorizontal: rS(18),
    paddingBottom: rV(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2F6",
  },
  sheetHandle: {
    alignSelf: "center",
    width: rS(46),
    height: rV(5),
    borderRadius: rS(999),
    backgroundColor: "#D1D5DB",
    marginBottom: rV(14),
  },
  peekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
  },
  peekIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  peekLogo: {
    width: rS(54),
    height: rS(54),
    borderRadius: rS(18),
  },
  peekLogoPlaceholder: {
    width: rS(54),
    height: rS(54),
    borderRadius: rS(18),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  peekCopy: {
    flex: 1,
    gap: rV(3),
  },
  peekName: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: "#111827",
  },
  peekMeta: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: "#6B7280",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginTop: rV(14),
  },
  sheetScrollContent: {
    paddingHorizontal: rS(18),
    paddingTop: rV(16),
    paddingBottom: rV(28),
    gap: rV(18),
  },
  bannerWrap: {
    height: rV(140),
    borderRadius: rMS(20),
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerFade: {
    ...StyleSheet.absoluteFillObject,
  },
  detailBlock: {
    gap: rV(10),
  },
  sectionLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: "#6B7280",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(12),
    backgroundColor: "#F8FAFC",
    borderRadius: rMS(18),
    padding: rS(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
  },
  addressIcon: {
    width: rS(36),
    height: rS(36),
    borderRadius: rS(12),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addressText: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(21),
    color: "#1F2937",
  },
  mutedCopy: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
    color: "#6B7280",
  },
  statsRow: {
    flexDirection: "row",
    gap: rS(10),
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: rMS(16),
    paddingVertical: rV(12),
    paddingHorizontal: rS(10),
    alignItems: "center",
    gap: rV(4),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
  },
  statValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: "#111827",
  },
  statLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(10.5),
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  bodyCopy: {
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
    lineHeight: rMS(20),
    color: "#374151",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    paddingVertical: rV(8),
  },
  contactText: {
    fontFamily: Fonts.title,
    fontSize: rMS(13.5),
    color: AppColors.text,
  },
  primaryCta: {
    borderRadius: rMS(18),
    overflow: "hidden",
  },
  primaryCtaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
    paddingVertical: rV(16),
  },
  primaryCtaText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14.5),
    color: "#FFFFFF",
  },
  fallbackNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
    backgroundColor: "#F3F4F6",
    borderRadius: rMS(16),
    padding: rS(14),
  },
  fallbackNoteText: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#4B5563",
  },
});
