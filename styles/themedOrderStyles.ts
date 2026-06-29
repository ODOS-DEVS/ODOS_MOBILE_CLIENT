import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/constants/theme";

export function buildOrderStyles(c: ThemeColors) {
  return StyleSheet.create({
    tabContent: {
      paddingBottom: rV(16),
      gap: rV(12),
    },
    orderTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
    },
    orderInfo: {
      flex: 1,
      gap: rV(2),
    },
    orderNumber: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: c.textMuted,
    },
    orderTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: c.text,
    },
    orderMeta: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: c.textMuted,
    },
    orderMetaSuccess: {
      color: c.successText,
      fontFamily: Fonts.title,
    },
    orderMetaDanger: {
      color: c.dangerText,
      fontFamily: Fonts.title,
    },
    imageWrap: {
      width: rS(64),
      height: rS(64),
      borderRadius: rMS(14),
      backgroundColor: c.imagePlaceholder,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    rightColumn: {
      alignItems: "flex-end",
      justifyContent: "space-between",
      minHeight: rS(64),
      gap: rV(6),
    },
    price: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(16),
      color: c.text,
    },
    progressHeader: {
      marginTop: rV(12),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressEta: {
      fontFamily: Fonts.title,
      fontSize: rMS(12),
      color: c.textMuted,
    },
    progressPercent: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: c.text,
    },
    trackBar: {
      marginTop: rV(8),
      height: rV(6),
      borderRadius: 999,
      backgroundColor: c.surfaceMuted,
      overflow: "hidden",
    },
    trackFill: {
      height: "100%",
      backgroundColor: c.text,
      borderRadius: 999,
    },
    reasonRow: {
      marginTop: rV(10),
      flexDirection: "row",
      alignItems: "center",
      gap: rS(6),
    },
    reasonText: {
      flex: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: c.textMuted,
    },
    cardFooterRow: {
      marginTop: rV(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rS(12),
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: rS(12),
      paddingVertical: rV(10),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    summaryRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    summaryLabel: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      color: c.textMuted,
    },
    summaryValue: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: c.text,
    },
    summaryValueAccent: {
      color: c.successText,
    },
    summaryDiscount: {
      color: c.successText,
    },
    selectableRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
      paddingVertical: rV(4),
    },
    selectableIcon: {
      width: rS(44),
      height: rS(44),
      borderRadius: rMS(14),
      backgroundColor: c.infoSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    selectableCopy: {
      flex: 1,
      gap: rV(2),
    },
    selectableTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
      color: c.text,
    },
    selectableSub: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      lineHeight: rMS(17),
      color: c.textMuted,
    },
    selectableTag: {
      alignSelf: "flex-start",
      paddingHorizontal: rS(8),
      paddingVertical: rV(3),
      borderRadius: 999,
      backgroundColor: c.pill,
    },
    selectableTagText: {
      fontFamily: Fonts.title,
      fontSize: rMS(10.5),
      color: c.pillText,
    },
    stickyFooter: {
      backgroundColor: c.bottomBar,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.bottomBarBorder,
      paddingHorizontal: rS(16),
      paddingTop: rV(12),
      paddingBottom: rV(24),
      gap: rV(8),
    },
    footerHint: {
      textAlign: "center",
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: c.textMuted,
    },
  });
}

export function useOrderStyles() {
  const { colors } = useTheme();
  return useMemo(() => buildOrderStyles(colors), [colors]);
}
