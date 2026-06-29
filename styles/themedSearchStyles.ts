import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/constants/theme";

export function buildSearchScreenStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.screen,
    },
    header: {
      backgroundColor: c.header,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.headerBorder,
      paddingBottom: rV(10),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(10),
    },
    backButton: {
      width: rMS(40),
      height: rMS(40),
      borderRadius: rMS(20),
      backgroundColor: c.overlayControl,
      alignItems: "center",
      justifyContent: "center",
    },
    toolbar: {
      marginTop: rV(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rS(8),
    },
    resultCount: {
      fontSize: rMS(13),
      fontFamily: Fonts.titleBold,
      color: c.text,
    },
    toolbarActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(8),
    },
    toolbarChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(5),
      paddingHorizontal: rS(10),
      paddingVertical: rV(7),
      borderRadius: 999,
      backgroundColor: c.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    toolbarChipText: {
      fontSize: rMS(12),
      fontFamily: Fonts.title,
      color: c.text,
      maxWidth: rS(88),
    },
    badge: {
      minWidth: rS(18),
      height: rS(18),
      borderRadius: rS(9),
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: rS(4),
    },
    badgeText: {
      fontSize: rMS(10),
      fontFamily: Fonts.titleBold,
      color: c.onPrimary,
    },
    pillScroller: {
      marginTop: rV(10),
      marginHorizontal: -rS(4),
    },
    pillRow: {
      gap: rS(8),
      paddingRight: rS(8),
      alignItems: "center",
    },
    activePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(5),
      paddingHorizontal: rS(12),
      paddingVertical: rV(7),
      borderRadius: 999,
      backgroundColor: c.infoSoft,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.infoBorder,
    },
    activePillText: {
      fontSize: rMS(11.5),
      fontFamily: Fonts.title,
      color: c.text,
    },
    clearPillsText: {
      fontSize: rMS(12),
      fontFamily: Fonts.title,
      color: c.link,
      paddingHorizontal: rS(6),
    },
    idleLabel: {
      fontSize: rMS(12),
      fontFamily: Fonts.titleBold,
      color: c.textMuted,
      marginBottom: rV(10),
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    suggestionRow: {
      gap: rS(8),
      paddingRight: rS(4),
    },
  });
}

export function useSearchScreenStyles() {
  const { colors } = useTheme();
  return useMemo(() => buildSearchScreenStyles(colors), [colors]);
}
