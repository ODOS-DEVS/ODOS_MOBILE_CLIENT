import Fonts from "@/constants/Fonts";
import { lightTheme, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMemo } from "react";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

function buildAccountStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.screen,
    },
    content: {
      paddingHorizontal: rS(16),
      paddingTop: rV(14),
      paddingBottom: rV(120),
      gap: rV(12),
    },
    insightCard: {
      backgroundColor: c.card,
      borderRadius: rMS(22),
      paddingHorizontal: rS(18),
      paddingVertical: rV(18),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.cardBorder,
      shadowColor: c.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    insightTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(17),
      color: c.text,
    },
    insightSubtitle: {
      marginTop: rV(6),
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(18),
      color: c.textMuted,
    },
    statsRow: {
      marginTop: rV(16),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(20),
      color: c.text,
    },
    statLabel: {
      marginTop: rV(4),
      fontFamily: Fonts.title,
      fontSize: rMS(11),
      color: c.textMuted,
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: rV(34),
      backgroundColor: c.border,
    },
    listCard: {
      backgroundColor: c.card,
      borderRadius: rMS(20),
      paddingHorizontal: rS(16),
      paddingVertical: rV(16),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.cardBorder,
      shadowColor: c.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: rS(10),
    },
    cardTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: c.text,
    },
    cardSubtitle: {
      marginTop: rV(3),
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: c.textMuted,
    },
    cardBody: {
      marginTop: rV(12),
      gap: rV(4),
    },
    cardLine: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(19),
      color: c.textBody,
    },
    cardMuted: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: c.textMuted,
    },
    pill: {
      alignSelf: "flex-start",
      paddingHorizontal: rS(10),
      paddingVertical: rV(5),
      borderRadius: 999,
      backgroundColor: c.pill,
    },
    pillText: {
      fontFamily: Fonts.title,
      fontSize: rMS(10.5),
      color: c.pillText,
    },
    pillDark: {
      backgroundColor: c.text,
    },
    pillDarkText: {
      color: c.onPrimary,
    },
    actionRow: {
      marginTop: rV(14),
      flexDirection: "row",
      gap: rS(8),
    },
    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: rS(8),
    },
    filterChip: {
      paddingHorizontal: rS(14),
      paddingVertical: rV(8),
      borderRadius: 999,
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    filterChipActive: {
      backgroundColor: c.text,
      borderColor: c.text,
    },
    filterChipText: {
      fontFamily: Fonts.title,
      fontSize: rMS(12),
      color: c.textSecondary,
    },
    filterChipTextActive: {
      color: c.onPrimary,
    },
    segmentRow: {
      flexDirection: "row",
      backgroundColor: c.segmentBg,
      borderRadius: rMS(14),
      padding: rS(4),
      gap: rS(4),
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: rV(10),
      borderRadius: rMS(11),
      alignItems: "center",
    },
    segmentBtnActive: {
      backgroundColor: c.segmentActive,
      shadowColor: c.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    segmentText: {
      fontFamily: Fonts.title,
      fontSize: rMS(12.5),
      color: c.textMuted,
    },
    segmentTextActive: {
      fontFamily: Fonts.titleBold,
      color: c.text,
    },
    sectionTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: rV(12),
    },
  });
}

function buildEmptyStyles(c: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: rS(28),
      paddingVertical: rV(40),
    },
    iconShell: {
      width: rS(76),
      height: rS(76),
      borderRadius: rS(38),
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: rV(16),
    },
    title: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(18),
      color: c.text,
      textAlign: "center",
    },
    message: {
      marginTop: rV(8),
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(19),
      color: c.textMuted,
      textAlign: "center",
    },
    button: {
      marginTop: rV(20),
      minWidth: "72%",
      minHeight: rV(48),
      borderRadius: rMS(14),
      backgroundColor: c.text,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: rS(20),
    },
    buttonText: {
      color: c.onPrimary,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
    },
  });
}

function buildBadgeStyles(c: ThemeColors) {
  const shared = StyleSheet.create({
    base: {
      borderRadius: 999,
      paddingHorizontal: rS(10),
      paddingVertical: rV(5),
    },
    text: {
      fontFamily: Fonts.title,
      fontSize: rMS(10.5),
    },
  });

  const tones: Record<
    "neutral" | "dark" | "success" | "warning" | "danger" | "info",
    { wrap: ViewStyle; text: TextStyle }
  > = {
    neutral: { wrap: { backgroundColor: c.pill }, text: { color: c.pillText } },
    dark: { wrap: { backgroundColor: c.text }, text: { color: c.onPrimary } },
    success: {
      wrap: { backgroundColor: "#DCFCE7" },
      text: { color: "#166534" },
    },
    warning: {
      wrap: { backgroundColor: "#FEF3C7" },
      text: { color: "#92400E" },
    },
    danger: {
      wrap: { backgroundColor: "#FEE2E2" },
      text: { color: "#B91C1C" },
    },
    info: { wrap: { backgroundColor: "#DBEAFE" }, text: { color: "#1D4ED8" } },
  };

  return { ...shared, ...tones };
}

function buildActionStyles(c: ThemeColors) {
  const shared = StyleSheet.create({
    base: {
      minHeight: rV(44),
      borderRadius: rMS(14),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: rS(10),
      paddingVertical: rV(8),
    },
    label: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11.5),
      textAlign: "center",
    },
    disabled: {
      opacity: 0.45,
    },
  });

  const variants: Record<
    "primary" | "secondary" | "danger" | "ghost",
    { btn: ViewStyle; text: TextStyle; iconColor: string }
  > = {
    primary: {
      btn: { backgroundColor: c.text },
      text: { color: c.onPrimary },
      iconColor: c.onPrimary,
    },
    secondary: {
      btn: {
        backgroundColor: c.pill,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.border,
      },
      text: { color: c.text },
      iconColor: c.text,
    },
    danger: {
      btn: {
        backgroundColor: "#FEF2F2",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#FECACA",
      },
      text: { color: "#DC2626" },
      iconColor: "#DC2626",
    },
    ghost: {
      btn: { backgroundColor: "transparent" },
      text: { color: c.primary },
      iconColor: c.primary,
    },
  };

  return { ...shared, ...variants };
}

function buildIconShellStyles() {
  return StyleSheet.create({
    wrap: {
      width: rS(44),
      height: rS(44),
      borderRadius: rMS(14),
      alignItems: "center",
      justifyContent: "center",
    },
  });
}

function buildFabStyles(c: ThemeColors) {
  return StyleSheet.create({
    fab: {
      position: "absolute",
      right: rS(20),
      width: rS(56),
      height: rS(56),
      borderRadius: rS(28),
      backgroundColor: c.text,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  });
}

function buildSheetStyles(c: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: c.backdrop,
    },
    backdropTap: {
      ...StyleSheet.absoluteFillObject,
    },
    sheet: {
      width: "100%",
      maxHeight: "92%",
      backgroundColor: c.card,
      borderTopLeftRadius: rMS(24),
      borderTopRightRadius: rMS(24),
      paddingTop: rV(8),
      overflow: "hidden",
    },
    sheetContent: {
      maxHeight: "100%",
    },
    sheetScroll: {
      flexGrow: 0,
      flexShrink: 1,
    },
    handle: {
      alignSelf: "center",
      width: rS(42),
      height: rV(4),
      borderRadius: rS(2),
      backgroundColor: c.border,
      marginBottom: rV(10),
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: rS(18),
      paddingBottom: rV(12),
      gap: rS(10),
    },
    closeBtn: {
      width: rS(40),
      height: rS(40),
      borderRadius: rS(20),
      backgroundColor: c.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCopy: {
      flex: 1,
      paddingTop: rV(6),
    },
    title: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(18),
      color: c.text,
    },
    subtitle: {
      marginTop: rV(6),
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(18),
      color: c.textMuted,
    },
    body: {
      paddingHorizontal: rS(18),
      paddingTop: rV(4),
      paddingBottom: rV(20),
      gap: rV(4),
    },
    saveBtn: {
      marginHorizontal: rS(18),
      marginTop: rV(8),
      minHeight: rV(50),
      borderRadius: rMS(14),
      backgroundColor: c.text,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtnDisabled: {
      opacity: 0.7,
    },
    saveBtnText: {
      color: c.onPrimary,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14),
    },
    // Nested pickers (region/city) render inside the form modal — iOS blocks second Modals.
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.card,
      zIndex: 20,
      paddingTop: rV(8),
    },
    overlayHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: rS(14),
      paddingBottom: rV(10),
      gap: rS(8),
    },
    overlayBackBtn: {
      width: rS(40),
      height: rS(40),
      borderRadius: rS(20),
      backgroundColor: c.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    overlayTitle: {
      flex: 1,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(17),
      color: c.text,
    },
    overlayScroll: {
      flex: 1,
      paddingHorizontal: rS(18),
    },
    overlayHint: {
      paddingHorizontal: rS(18),
      paddingBottom: rV(10),
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      color: c.textMuted,
    },
  });
}

function buildFieldStyles(c: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      marginBottom: rV(12),
    },
    label: {
      marginBottom: rV(6),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: c.textSecondary,
    },
    inputRow: {
      minHeight: rV(48),
      borderRadius: rMS(14),
      backgroundColor: c.inputBg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.inputBorder,
      paddingHorizontal: rS(14),
      flexDirection: "row",
      alignItems: "center",
    },
    inputIcon: {
      marginRight: rS(10),
    },
    input: {
      flex: 1,
      paddingVertical: rV(12),
      fontFamily: Fonts.text,
      fontSize: rMS(14),
      color: c.text,
    },
    inputError: {
      borderColor: "#FCA5A5",
      backgroundColor: "#FEF2F2",
    },
    pickerValue: {
      flex: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(14),
      color: c.text,
      paddingVertical: rV(12),
    },
    pickerPlaceholder: {
      color: c.placeholder,
    },
    clearLink: {
      alignSelf: "flex-end",
      marginTop: rV(6),
    },
    clearLinkText: {
      fontFamily: Fonts.title,
      fontSize: rMS(12),
      color: c.primary,
    },
    error: {
      marginTop: rV(4),
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: "#DC2626",
    },
  });
}

function buildProfileHeroStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: {
      alignItems: "center",
      paddingHorizontal: rS(16),
      paddingTop: rV(20),
      paddingBottom: rV(22),
    },
    avatarWrap: {
      position: "relative",
      zIndex: 2,
    },
    editBtn: {
      position: "absolute",
      right: -rS(2),
      bottom: rS(2),
      width: rS(36),
      height: rS(36),
      borderRadius: rS(18),
      backgroundColor: c.text,
      borderWidth: 3,
      borderColor: c.editAvatarBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      marginTop: rV(14),
      paddingHorizontal: rS(16),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(18),
      color: c.text,
      textAlign: "center",
    },
    email: {
      marginTop: rV(4),
      paddingHorizontal: rS(16),
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      color: c.textMuted,
      textAlign: "center",
    },
  });
}

function buildChoiceSheetStyles(c: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.backdrop,
    },
    sheet: {
      backgroundColor: c.card,
      borderTopLeftRadius: rMS(24),
      borderTopRightRadius: rMS(24),
      paddingHorizontal: rS(18),
      paddingTop: rV(8),
      maxHeight: "78%",
    },
    handle: {
      alignSelf: "center",
      width: rS(42),
      height: rV(4),
      borderRadius: rS(2),
      backgroundColor: c.border,
      marginBottom: rV(14),
    },
    title: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(17),
      color: c.text,
      textAlign: "center",
      marginBottom: rV(14),
    },
    option: {
      minHeight: rV(50),
      borderRadius: rMS(14),
      paddingHorizontal: rS(14),
      marginBottom: rV(8),
      backgroundColor: c.inputBg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.inputBorder,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    optionSelected: {
      backgroundColor: c.pill,
      borderColor: c.text,
    },
    optionText: {
      fontFamily: Fonts.text,
      fontSize: rMS(14),
      color: c.text,
    },
    optionTextSelected: {
      fontFamily: Fonts.titleBold,
    },
  });
}

export function useAccountUiStyles() {
  const { colors } = useTheme();

  return useMemo(
    () => ({
      accountStyles: buildAccountStyles(colors),
      emptyStyles: buildEmptyStyles(colors),
      badgeStyles: buildBadgeStyles(colors),
      actionStyles: buildActionStyles(colors),
      iconShellStyles: buildIconShellStyles(),
      fabStyles: buildFabStyles(colors),
      sheetStyles: buildSheetStyles(colors),
      fieldStyles: buildFieldStyles(colors),
      profileHeroStyles: buildProfileHeroStyles(colors),
      choiceSheetStyles: buildChoiceSheetStyles(colors),
      colors,
    }),
    [colors],
  );
}

export function useAccountStyles() {
  return useAccountUiStyles().accountStyles;
}

/** @deprecated Use useAccountStyles() inside components instead. */
export const accountStyles = buildAccountStyles(lightTheme);
