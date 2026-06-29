import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ThemeColors } from "@/constants/theme";

export function buildReviewStyles(c: ThemeColors) {
  return StyleSheet.create({
    productRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
    },
    imageWrap: {
      width: rS(64),
      height: rS(64),
      borderRadius: rMS(16),
      backgroundColor: c.imagePlaceholder,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    info: {
      flex: 1,
      gap: rV(2),
    },
    title: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14.5),
      color: c.text,
    },
    sub: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: c.textMuted,
    },
    meta: {
      fontFamily: Fonts.text,
      fontSize: rMS(11),
      color: c.textMuted,
    },
    orderText: {
      fontFamily: Fonts.title,
      fontSize: rMS(11),
      color: c.textSecondary,
    },
    starsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(4),
      marginTop: rV(10),
    },
    starsValue: {
      marginLeft: rS(6),
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: c.text,
    },
    commentPreview: {
      marginTop: rV(8),
      fontFamily: Fonts.text,
      fontSize: rMS(12.5),
      lineHeight: rMS(18),
      color: c.textBody,
    },
    ratingSection: {
      gap: rV(10),
    },
    ratingHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rS(12),
    },
    ratingValuePill: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11.5),
      color: c.ratingText,
      backgroundColor: c.ratingSoft,
      paddingHorizontal: rS(10),
      paddingVertical: rV(5),
      borderRadius: 999,
      overflow: "hidden",
    },
    ratingControlWrap: {
      alignItems: "center",
      gap: rV(10),
    },
    ratingGestureArea: {
      alignSelf: "stretch",
      paddingHorizontal: rS(12),
      paddingVertical: rV(14),
      borderRadius: rMS(20),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.ratingBorder,
      backgroundColor: c.ratingSoft,
    },
    ratingTrack: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    ratingTrackStar: {
      width: rS(44),
      height: rS(44),
      alignItems: "center",
      justifyContent: "center",
    },
    ratingMoodPill: {
      paddingHorizontal: rS(12),
      paddingVertical: rV(6),
      borderRadius: 999,
      backgroundColor: c.warningSoft,
    },
    ratingMoodText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11),
      color: c.warningText,
    },
    ratingHint: {
      fontFamily: Fonts.text,
      fontSize: rMS(11.5),
      color: c.textMuted,
      textAlign: "center",
      lineHeight: rMS(17),
    },
    commentInput: {
      minHeight: rV(128),
      borderRadius: rMS(18),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.inputBorder,
      backgroundColor: c.inputBg,
      paddingHorizontal: rS(14),
      paddingVertical: rV(12),
      color: c.text,
      fontFamily: Fonts.text,
      fontSize: rMS(13.5),
      lineHeight: rMS(20),
      textAlignVertical: "top",
    },
    composerProductCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
      backgroundColor: c.surfaceSubtle,
      borderRadius: rMS(18),
      padding: rS(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    sectionLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12),
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    ratingStepWrap: {
      gap: rV(14),
      paddingVertical: rV(4),
    },
    ratingStepPrompt: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(20),
      color: c.textMuted,
      textAlign: "center",
    },
    ratingStepPromptHighlight: {
      fontFamily: Fonts.titleBold,
      color: c.text,
    },
    ratingRequiredHint: {
      textAlign: "center",
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: c.dangerText,
    },
    commentStepCard: {
      gap: rV(12),
      marginTop: rV(4),
      padding: rS(14),
      borderRadius: rMS(20),
      backgroundColor: c.surfaceSubtle,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    ratingSummaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rS(10),
    },
    changeRatingButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(4),
      paddingHorizontal: rS(10),
      paddingVertical: rV(6),
      borderRadius: 999,
      backgroundColor: c.ratingSoft,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.ratingBorder,
    },
    changeRatingText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11),
      color: c.ratingText,
    },
  });
}

export function useReviewStyles() {
  const { colors } = useTheme();
  return useMemo(() => buildReviewStyles(colors), [colors]);
}
