import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export function useNotificationStyles() {
  const { colors, isDark } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        topBanner: {
          marginHorizontal: rS(16),
          marginTop: rV(14),
          marginBottom: rV(6),
          backgroundColor: colors.card,
          borderRadius: rMS(20),
          paddingHorizontal: rS(16),
          paddingVertical: rV(14),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
        },
        bannerHeader: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: rS(12),
        },
        bannerIcon: {
          width: rMS(40),
          height: rMS(40),
          borderRadius: rMS(14),
          backgroundColor: colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
        },
        bannerCopy: {
          flex: 1,
          gap: rV(4),
        },
        markAllButton: {
          alignSelf: "flex-start",
          marginTop: rV(12),
          borderRadius: rMS(999),
          backgroundColor: colors.surfaceMuted,
          paddingHorizontal: rS(12),
          paddingVertical: rV(7),
        },
        markAllButtonText: {
          fontSize: rMS(11.5),
          fontFamily: Fonts.titleBold,
          color: colors.primary,
        },
        bannerTitle: {
          fontSize: rMS(15),
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        bannerText: {
          fontSize: rMS(12.5),
          lineHeight: rMS(18),
          fontFamily: Fonts.text,
          color: colors.textMuted,
        },
        listContent: {
          paddingHorizontal: rS(16),
          paddingBottom: rV(28),
        },
        sectionTitle: {
          marginTop: rV(16),
          marginBottom: rV(10),
          fontSize: rMS(12),
          fontFamily: Fonts.titleBold,
          color: colors.textMuted,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        itemRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
          backgroundColor: colors.card,
          borderRadius: rMS(18),
          paddingHorizontal: rS(14),
          paddingVertical: rV(14),
          marginBottom: rV(10),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
        },
        itemRowUnread: {
          borderColor: isDark ? "#3B82F6" : "#BFDBFE",
          backgroundColor: isDark ? "#172554" : "#FCFDFF",
        },
        productThumbWrap: {
          width: rMS(52),
          height: rMS(52),
          borderRadius: rMS(14),
          overflow: "hidden",
          backgroundColor: colors.imagePlaceholder,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        productThumb: {
          width: "100%",
          height: "100%",
        },
        iconCircle: {
          width: rMS(52),
          height: rMS(52),
          borderRadius: rMS(16),
          alignItems: "center",
          justifyContent: "center",
        },
        middle: {
          flex: 1,
          gap: rV(3),
        },
        titleRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
        },
        itemTitle: {
          flex: 1,
          fontSize: rMS(14),
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        itemTitleUnread: {
          color: colors.text,
        },
        unreadPill: {
          width: rMS(8),
          height: rMS(8),
          borderRadius: rMS(4),
          backgroundColor: "#2563EB",
        },
        itemBody: {
          fontSize: rMS(12.5),
          lineHeight: rMS(18),
          fontFamily: Fonts.text,
          color: colors.textMuted,
        },
        time: {
          marginTop: rV(2),
          fontSize: rMS(11),
          fontFamily: Fonts.title,
          color: colors.placeholder,
        },
        actionPill: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
          borderRadius: rMS(999),
          backgroundColor: colors.accentSoft,
          paddingHorizontal: rS(10),
          paddingVertical: rV(6),
        },
        actionText: {
          fontSize: rMS(11),
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        emptyState: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: rS(28),
          gap: rV(10),
        },
        emptyIconWrap: {
          width: rMS(64),
          height: rMS(64),
          borderRadius: rMS(32),
          backgroundColor: colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: rV(4),
        },
        emptyTitle: {
          fontSize: rMS(17),
          fontFamily: Fonts.titleBold,
          color: colors.text,
          textAlign: "center",
        },
        emptyText: {
          fontSize: rMS(13),
          lineHeight: rMS(20),
          fontFamily: Fonts.text,
          color: colors.textMuted,
          textAlign: "center",
        },
        primaryButton: {
          marginTop: rV(8),
          minHeight: rV(48),
          borderRadius: rMS(16),
          paddingHorizontal: rS(18),
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        },
        primaryButtonText: {
          fontSize: rMS(14),
          fontFamily: Fonts.titleBold,
          color: colors.onPrimary,
        },
      }),
    [colors, isDark],
  );
}

export { AppColors };
