import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export function useCommerceSeeAllScreenStyles() {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        scrollContent: {
          paddingTop: rV(10),
          gap: rV(14),
        },
        contentBlock: {
          gap: rV(12),
        },
      }),
    [colors],
  );
}

export function useCommerceSeeAllUiStyles() {
  const { colors, isDark } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        searchBar: {
          marginTop: 0,
          width: "100%",
        },
        heroCard: {
          backgroundColor: colors.card,
          borderRadius: rMS(20),
          paddingHorizontal: rS(16),
          paddingVertical: rV(16),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 2,
        },
        heroBadge: {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingHorizontal: rS(10),
          paddingVertical: rV(5),
          borderRadius: rS(999),
        },
        heroBadgeDefault: {
          backgroundColor: colors.pill,
        },
        heroBadgeGold: {
          backgroundColor: isDark ? "#3D3420" : "#F6EFE1",
        },
        heroBadgeTeal: {
          backgroundColor: isDark ? "#1A3330" : "#E6F6F3",
        },
        heroBadgeText: {
          fontSize: rMS(11),
          fontFamily: Fonts.title,
          letterSpacing: 0.25,
        },
        heroBadgeTextDefault: {
          color: colors.primary,
        },
        heroBadgeTextGold: {
          color: "#8A6A2E",
        },
        heroBadgeTextTeal: {
          color: "#0F766E",
        },
        heroTitle: {
          marginTop: rV(12),
          fontSize: rMS(18),
          fontFamily: Fonts.titleBold,
          color: colors.text,
          lineHeight: rMS(24),
        },
        heroSubtitle: {
          marginTop: rV(8),
          fontSize: rMS(13),
          fontFamily: Fonts.text,
          color: colors.textMuted,
          lineHeight: rMS(19),
        },
        heroStatsRow: {
          flexDirection: "row",
          alignItems: "center",
          marginTop: rV(16),
          gap: rS(8),
        },
        heroStat: {
          flex: 1,
        },
        heroStatValue: {
          fontSize: rMS(16),
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        heroStatLabel: {
          marginTop: rV(4),
          fontSize: rMS(11),
          fontFamily: Fonts.text,
          color: colors.textMuted,
        },
        heroDivider: {
          width: 1,
          height: rV(28),
          backgroundColor: colors.border,
        },
        filterRow: {
          paddingVertical: rV(2),
          gap: rS(10),
          paddingRight: rS(4),
        },
        filterChip: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          paddingHorizontal: rS(14),
          paddingVertical: rV(10),
          borderRadius: rS(999),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        filterChipActive: {
          backgroundColor: colors.text,
          borderColor: colors.text,
        },
        filterChipText: {
          fontSize: rMS(12.5),
          fontFamily: Fonts.title,
          color: colors.textMuted,
        },
        filterChipTextActive: {
          color: colors.onPrimary,
        },
        filterCountPill: {
          minWidth: rS(24),
          alignItems: "center",
          justifyContent: "center",
          borderRadius: rS(999),
          paddingHorizontal: rS(8),
          paddingVertical: rV(2),
          backgroundColor: colors.surfaceMuted,
        },
        filterCountPillActive: {
          backgroundColor: "rgba(255,255,255,0.2)",
        },
        filterCountText: {
          fontSize: rMS(11),
          fontFamily: Fonts.titleBold,
          color: colors.textMuted,
        },
        filterCountTextActive: {
          color: colors.onPrimary,
        },
        resetChip: {
          paddingHorizontal: rS(14),
          paddingVertical: rV(10),
          borderRadius: rS(999),
          backgroundColor: "transparent",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.placeholder,
        },
        resetChipLabel: {
          fontSize: rMS(12.5),
          fontFamily: Fonts.title,
          color: colors.textMuted,
        },
        sectionHeader: {
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: rS(12),
        },
        sectionHeaderText: {
          flex: 1,
        },
        sectionTitle: {
          fontSize: rMS(17),
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        sectionSubtitle: {
          marginTop: rV(4),
          fontSize: rMS(12.5),
          fontFamily: Fonts.text,
          color: colors.textMuted,
          lineHeight: rMS(18),
        },
        sectionCountPill: {
          minWidth: rS(36),
          paddingHorizontal: rS(10),
          paddingVertical: rV(6),
          borderRadius: rS(999),
          backgroundColor: colors.pill,
          alignItems: "center",
          justifyContent: "center",
        },
        sectionCountText: {
          fontSize: rMS(13),
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        emptyState: {
          backgroundColor: colors.card,
          borderRadius: rMS(18),
          paddingVertical: rV(28),
          paddingHorizontal: rS(18),
          alignItems: "center",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
        },
        emptyIconWrap: {
          width: rMS(48),
          height: rMS(48),
          borderRadius: rMS(24),
          backgroundColor: colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
        },
        emptyTitle: {
          marginTop: rV(12),
          fontSize: rMS(15),
          fontFamily: Fonts.titleBold,
          color: colors.text,
          textAlign: "center",
        },
        emptySubtitle: {
          marginTop: rV(7),
          fontSize: rMS(12.5),
          fontFamily: Fonts.text,
          color: colors.textMuted,
          textAlign: "center",
          lineHeight: rMS(18),
        },
      }),
    [colors, isDark],
  );
}

/** @deprecated Use useCommerceSeeAllScreenStyles() inside components */
export const commerceSeeAllScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingTop: rV(10),
    gap: rV(14),
  },
  contentBlock: {
    gap: rV(12),
  },
});

export { AppColors };
