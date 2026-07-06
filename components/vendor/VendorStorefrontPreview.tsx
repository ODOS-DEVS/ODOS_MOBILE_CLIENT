import VerifiedSeal from "@/components/badges/VerifiedSeal";
import VendorStoreShareSheet from "@/components/vendor/VendorStoreShareSheet";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { ManagedStoreProfile } from "@/types/store";
import { resolveApiMediaUrl } from "@/utils/media";
import { rMS, rS, rV } from "@/styles/responsive";
import { useCommerceTheme } from "@/styles/themedCommerce";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LOGO_SIZE = rMS(60);
/** How far the logo rises into the cover image */
const LOGO_OVERLAP = rV(22);
/** Keeps store name + verified seal fully below the cover */
const IDENTITY_TEXT_TOP = LOGO_OVERLAP + rV(12);

type VendorStorefrontPreviewProps = {
  store: ManagedStoreProfile;
  businessName?: string | null;
  onPress: () => void;
  onEditPress: () => void;
};

export default function VendorStorefrontPreview({
  store,
  businessName,
  onPress,
  onEditPress,
}: VendorStorefrontPreviewProps) {
  const { colors, isDark } = useTheme();
  const { cardShell, colors: commerceColors } = useCommerceTheme();
  const [shareVisible, setShareVisible] = useState(false);
  const bannerUri = resolveApiMediaUrl(store.bannerImage);
  const logoUri = resolveApiMediaUrl(store.logoImage);
  const isLive = store.status === "active";
  const locationLine = [store.location, store.city, store.region]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={[styles.card, cardShell]}>
      <TouchableOpacity activeOpacity={0.94} onPress={onPress}>
        <View style={[styles.cover, { backgroundColor: commerceColors.imagePlaceholder }]}>
          {bannerUri ? (
            <Image source={{ uri: bannerUri }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverFallback}>
              <Ionicons name="image-outline" size={rMS(24)} color={colors.iconMuted} />
              <Text style={[styles.coverFallbackText, { color: colors.textMuted }]}>
                Add a cover image in store profile
              </Text>
            </View>
          )}

          <LinearGradient
            colors={["transparent", "rgba(15, 23, 42, 0.65)"]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={[styles.statusPill, isLive ? styles.livePill : styles.draftPill]}>
            {isLive ? <View style={styles.liveDot} /> : null}
            <Text style={styles.statusPillText}>
              {isLive ? "Live on ODOS" : "Draft storefront"}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.identityRow}>
            <View
              style={[
                styles.logoShell,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImage} />
              ) : (
                <Ionicons name="storefront" size={rMS(26)} color={colors.primary} />
              )}
            </View>

            <View style={styles.identityText}>
              <View style={styles.titleLine}>
                <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={2}>
                  {store.name}
                </Text>
                {isLive ? (
                  <View style={styles.sealWrap}>
                    <VerifiedSeal size={rS(18)} />
                  </View>
                ) : null}
              </View>

              {businessName ? (
                <Text
                  style={[styles.businessName, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {businessName}
                </Text>
              ) : null}

              {store.category ? (
                <Text style={[styles.category, { color: colors.textSecondary }]} numberOfLines={1}>
                  {store.category}
                </Text>
              ) : null}
            </View>
          </View>

          {locationLine || store.description ? (
            <View
              style={[
                styles.details,
                {
                  borderTopColor: colors.border,
                  backgroundColor: isDark ? colors.surfaceSubtle : "#F8FAFC",
                },
              ]}
            >
              {locationLine ? (
                <View style={styles.detailRow}>
                  <View style={[styles.detailIconShell, { backgroundColor: isDark ? colors.pill : "#EEF2FF" }]}>
                    <Ionicons name="location-outline" size={rMS(14)} color={colors.primary} />
                  </View>
                  <Text
                    style={[styles.detailText, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {locationLine}
                  </Text>
                </View>
              ) : null}

              {store.description ? (
                <Text
                  style={[styles.description, { color: colors.textMuted }]}
                  numberOfLines={3}
                >
                  {store.description}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.border,
            backgroundColor: isDark ? colors.surfaceSubtle : "#F8FAFC",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.footerButton}
          onPress={onPress}
          activeOpacity={0.88}
        >
          <Ionicons name="eye-outline" size={rMS(18)} color={colors.primary} />
          <Text style={[styles.footerLabel, { color: colors.text }]}>View as shopper</Text>
        </TouchableOpacity>

        <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => setShareVisible(true)}
          activeOpacity={0.88}
        >
          <Ionicons name="share-social-outline" size={rMS(18)} color={colors.primary} />
          <Text style={[styles.footerLabel, { color: colors.text }]}>Share store</Text>
        </TouchableOpacity>

        <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={styles.footerButton}
          onPress={onEditPress}
          activeOpacity={0.88}
        >
          <Ionicons name="create-outline" size={rMS(18)} color={colors.primary} />
          <Text style={[styles.footerLabel, { color: colors.text }]}>Edit profile</Text>
        </TouchableOpacity>
      </View>

      <VendorStoreShareSheet
        store={store}
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: rMS(20),
    overflow: "hidden",
  },
  cover: {
    height: rV(136),
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: rV(6),
    paddingHorizontal: rS(20),
  },
  coverFallbackText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    textAlign: "center",
  },
  statusPill: {
    position: "absolute",
    top: rV(12),
    left: rS(12),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: rMS(999),
  },
  livePill: {
    backgroundColor: "rgba(22, 163, 74, 0.92)",
  },
  draftPill: {
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  liveDot: {
    width: rS(6),
    height: rS(6),
    borderRadius: rS(3),
    backgroundColor: "#FFFFFF",
  },
  statusPillText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.2,
  },
  body: {
    paddingHorizontal: rS(16),
    paddingBottom: rV(0),
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(12),
    marginTop: -LOGO_OVERLAP,
    paddingBottom: rV(14),
  },
  logoShell: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: rMS(16),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    paddingTop: IDENTITY_TEXT_TOP,
    gap: rV(4),
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(6),
  },
  sealWrap: {
    marginTop: rV(1),
  },
  storeName: {
    flex: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    lineHeight: rMS(22),
  },
  businessName: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(17),
  },
  category: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
    lineHeight: rMS(16),
  },
  details: {
    marginHorizontal: -rS(16),
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
    paddingBottom: rV(14),
    gap: rV(10),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  detailIconShell: {
    width: rMS(32),
    height: rMS(32),
    borderRadius: rMS(10),
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
  },
  description: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: rV(52),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(6),
    paddingVertical: rV(14),
    paddingHorizontal: rS(10),
  },
  footerLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
  },
  footerDivider: {
    width: StyleSheet.hairlineWidth,
    height: rV(28),
  },
});
