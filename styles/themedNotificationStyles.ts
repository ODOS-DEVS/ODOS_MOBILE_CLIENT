import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export function useNotificationStyles() {
  const { colors, isDark } = useTheme();

  return useMemo(
    () =>
      ({
        ...StyleSheet.create({
          container: {
            flex: 1,
            backgroundColor: colors.screen,
          },
          headerAction: {
            fontSize: rMS(13),
            fontFamily: Fonts.titleBold,
          },
          listIntro: {
            marginBottom: rV(4),
            fontSize: rMS(13),
            fontFamily: Fonts.text,
            color: colors.textMuted,
            lineHeight: rMS(19),
          },
          listContent: {
            paddingHorizontal: rS(16),
            paddingTop: rV(8),
            paddingBottom: rV(32),
          },
          sectionTitle: {
            marginTop: rV(14),
            marginBottom: rV(8),
            fontSize: rMS(11),
            fontFamily: Fonts.titleBold,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          },
          itemRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: rS(12),
            backgroundColor: colors.card,
            borderRadius: rMS(16),
            paddingHorizontal: rS(14),
            paddingVertical: rV(12),
            marginBottom: rV(8),
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.cardBorder,
            minHeight: rV(72),
          },
          itemRowUnread: {
            borderColor: isDark ? "#3B82F6" : "#BFDBFE",
            backgroundColor: isDark ? "#0F172A" : "#FAFCFF",
          },
          productThumbWrap: {
            width: rMS(44),
            height: rMS(44),
            borderRadius: rMS(12),
            overflow: "hidden",
            backgroundColor: colors.imagePlaceholder,
          },
          productThumb: {
            width: "100%",
            height: "100%",
          },
          iconCircle: {
            width: rMS(44),
            height: rMS(44),
            borderRadius: rMS(12),
            alignItems: "center",
            justifyContent: "center",
          },
          middle: {
            flex: 1,
            minWidth: 0,
            gap: rV(2),
          },
          titleRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: rS(6),
          },
          itemTitle: {
            flex: 1,
            fontSize: rMS(14),
            fontFamily: Fonts.title,
            color: colors.text,
          },
          itemTitleUnread: {
            fontFamily: Fonts.titleBold,
          },
          unreadDot: {
            width: rMS(7),
            height: rMS(7),
            borderRadius: rMS(4),
            backgroundColor: colors.primary,
          },
          itemBody: {
            fontSize: rMS(12.5),
            lineHeight: rMS(17),
            fontFamily: Fonts.text,
            color: colors.textMuted,
          },
          time: {
            marginTop: rV(1),
            fontSize: rMS(11),
            fontFamily: Fonts.title,
            color: colors.placeholder,
          },
          emptyState: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: rS(32),
            gap: rV(8),
          },
          emptyIconWrap: {
            width: rMS(56),
            height: rMS(56),
            borderRadius: rMS(28),
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
            marginTop: rV(12),
            minHeight: rV(46),
            borderRadius: rMS(14),
            paddingHorizontal: rS(22),
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
        chevronColor: colors.iconMuted,
      }) as ReturnType<typeof StyleSheet.create> & { chevronColor: string },
    [colors, isDark],
  );
}
