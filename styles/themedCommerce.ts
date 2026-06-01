import { AppColors } from "@/constants/Colors";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMemo } from "react";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

export function createCardShell(colors: ThemeColors, isDark: boolean): ViewStyle {
  return {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    ...(isDark
      ? {}
      : {
          shadowColor: colors.shadow,
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }),
  };
}

export function useCommerceTheme() {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      colors,
      isDark,
      cardShell: createCardShell(colors, isDark),
      imageArea: { backgroundColor: colors.imagePlaceholder } as ViewStyle,
      textPrimary: { color: colors.text } as TextStyle,
      textMuted: { color: colors.textMuted } as TextStyle,
      textSecondary: { color: colors.textSecondary } as TextStyle,
    }),
    [colors, isDark],
  );
}

export function useSearchFieldStyles() {
  const { colors, isDark } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          marginTop: rV(12),
          minHeight: rMS(46),
          borderRadius: rMS(999),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.inputBorder,
          backgroundColor: colors.card,
          paddingHorizontal: rS(12),
          paddingVertical: rV(9),
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
          ...(isDark
            ? {}
            : {
                shadowColor: colors.shadow,
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
              }),
        },
        wrapperLarge: {
          minHeight: rMS(56),
          paddingHorizontal: rS(14),
          paddingVertical: rV(11),
          borderRadius: rMS(18),
          borderColor: colors.borderStrong,
          ...(isDark
            ? {}
            : {
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }),
        },
        wrapperEmbedded: {
          marginTop: 0,
          width: "100%",
          alignSelf: "stretch",
          minHeight: rMS(46),
        },
        iconShell: {
          width: rS(36),
          height: rS(36),
          borderRadius: rS(18),
          backgroundColor: colors.pill,
          alignItems: "center",
          justifyContent: "center",
        },
        iconShellLarge: {
          width: rS(42),
          height: rS(42),
          borderRadius: rS(14),
          backgroundColor: colors.segmentBg,
        },
        input: {
          flex: 1,
          fontSize: rMS(13.5),
          color: colors.text,
          fontFamily: Fonts.text,
          paddingVertical: rV(4),
        },
        inputLarge: {
          fontSize: rMS(15),
          paddingVertical: rV(6),
        },
        placeholder: {
          flex: 1,
          fontSize: rMS(13.5),
          fontFamily: Fonts.text,
          color: colors.placeholder,
        },
        placeholderLarge: {
          fontSize: rMS(15),
        },
        clearBtn: {
          padding: rS(2),
        },
      }),
    [colors, isDark],
  );
}

export function useCommerceEmptyStyles() {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: rV(28),
          paddingHorizontal: rS(24),
          paddingVertical: rV(32),
          borderRadius: rMS(28),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          alignItems: "center",
        },
        iconShell: {
          width: rS(76),
          height: rS(76),
          borderRadius: rS(38),
          backgroundColor: colors.pill,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: rV(18),
        },
        title: {
          color: colors.text,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(21),
          textAlign: "center",
          marginBottom: rV(8),
        },
        message: {
          color: colors.textMuted,
          fontFamily: Fonts.text,
          fontSize: rMS(13.5),
          lineHeight: rMS(20),
          textAlign: "center",
          marginBottom: rV(22),
        },
        primaryButton: {
          minWidth: "100%",
          minHeight: rV(50),
          borderRadius: rMS(16),
          backgroundColor: colors.text,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: rS(20),
        },
        primaryButtonText: {
          color: colors.onPrimary,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
        },
        secondaryButton: {
          marginTop: rV(12),
          paddingVertical: rV(8),
        },
        secondaryButtonText: {
          color: colors.primary,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
        },
      }),
    [colors],
  );
}

export function useMenuItemStyles() {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        menuItem: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: rV(14),
          paddingHorizontal: rS(16),
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        menuLeft: {
          flexDirection: "row",
          alignItems: "center",
        },
        menuText: {
          fontSize: rMS(15),
          marginLeft: rS(12),
          color: colors.text,
          fontFamily: Fonts.title,
        },
      }),
    [colors],
  );
}

export function useEmptySectionStyles() {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: rV(8),
          marginHorizontal: rS(6),
          paddingHorizontal: rS(20),
          paddingVertical: rV(24),
          borderRadius: rMS(24),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          alignItems: "center",
        },
        iconShell: {
          width: rS(48),
          height: rS(48),
          borderRadius: rS(24),
          backgroundColor: colors.pill,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: rV(12),
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(16),
          color: colors.text,
          textAlign: "center",
          marginBottom: rV(6),
        },
        message: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(19),
          color: colors.textMuted,
          textAlign: "center",
        },
      }),
    [colors],
  );
}

/** Shared product/store card text styles */
export function useCatalogCardTextStyles() {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        category: {
          color: colors.textMuted,
        },
        price: {
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        oldPrice: {
          color: "#F87171",
        },
        rating: {
          color: colors.textSecondary,
        },
        placeholderLabel: {
          color: colors.textMuted,
          fontWeight: "600" as const,
        },
      }),
    [colors],
  );
}

export { AppColors };
