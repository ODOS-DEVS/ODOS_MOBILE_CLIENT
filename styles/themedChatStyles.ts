import { AppColors } from "@/constants/Colors";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export function createChatStyles(c: ThemeColors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.screen,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: rV(12),
  },
  loadingText: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: c.textMuted,
  },
  threadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  avatar: {
    width: rS(48),
    height: rS(48),
    borderRadius: rMS(16),
    backgroundColor: c.surfaceMuted,
  },
  avatarPlaceholder: {
    width: rS(48),
    height: rS(48),
    borderRadius: rMS(16),
    backgroundColor: c.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  threadCopy: {
    flex: 1,
    gap: rV(2),
  },
  threadTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(8),
  },
  threadName: {
    flex: 1,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14.5),
    color: c.text,
  },
  threadTime: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: c.placeholder,
  },
  threadStore: {
    fontFamily: Fonts.title,
    fontSize: rMS(11.5),
    color: c.primary,
  },
  threadPreview: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: c.textMuted,
  },
  header: {
    backgroundColor: c.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.headerBorder,
    paddingHorizontal: rS(16),
    paddingBottom: rV(12),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  backButton: {
    width: rS(40),
    height: rS(40),
    borderRadius: rMS(20),
    backgroundColor: c.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: rS(44),
    height: rS(44),
    borderRadius: rMS(16),
    backgroundColor: c.surfaceMuted,
  },
  headerAvatarSupport: {
    width: rS(44),
    height: rS(44),
    borderRadius: rMS(16),
    backgroundColor: c.text,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    gap: rV(4),
  },
  headerTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: c.text,
  },
  headerSubtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: c.textMuted,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginTop: rV(4),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: 999,
  },
  statusBadgeText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
  },
  contextWrap: {
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
  },
  contextCard: {
    backgroundColor: c.card,
    borderRadius: rMS(20),
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  contextImage: {
    width: rS(48),
    height: rS(48),
    borderRadius: rMS(14),
    backgroundColor: c.surfaceMuted,
  },
  contextCopy: {
    flex: 1,
    gap: rV(2),
  },
  contextLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    color: c.placeholder,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  contextTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
    color: c.text,
  },
  contextSub: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: c.textMuted,
  },
  messagesContent: {
    paddingTop: rV(8),
    paddingBottom: rV(16),
    flexGrow: 1,
  },
  dayWrap: {
    alignItems: "center",
    paddingVertical: rV(10),
  },
  dayPill: {
    backgroundColor: c.border,
    paddingHorizontal: rS(12),
    paddingVertical: rV(4),
    borderRadius: 999,
  },
  dayText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: c.textSecondary,
  },
  messageRow: {
    paddingHorizontal: rS(16),
    paddingVertical: rV(3),
  },
  messageRowMine: {
    alignItems: "flex-end",
  },
  messageRowTheirs: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: rS(12),
    paddingVertical: rV(9),
    borderTopLeftRadius: rMS(16),
    borderTopRightRadius: rMS(16),
  },
  bubbleMine: {
    backgroundColor: AppColors.primary,
    borderBottomLeftRadius: rMS(16),
    borderBottomRightRadius: rMS(6),
  },
  bubbleTheirs: {
    backgroundColor: c.card,
    borderBottomLeftRadius: rMS(6),
    borderBottomRightRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  bubbleText: {
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(20),
  },
  bubbleMeta: {
    marginTop: rV(6),
    fontFamily: Fonts.text,
    fontSize: rMS(10),
    textAlign: "right",
  },
  composerWrap: {
    backgroundColor: c.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
  },
  composerHint: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: c.textMuted,
    marginBottom: rV(8),
    paddingHorizontal: rS(4),
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: rS(10),
  },
  composerInputWrap: {
    flex: 1,
    backgroundColor: c.surfaceMuted,
    borderRadius: rMS(22),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    paddingHorizontal: rS(14),
    paddingVertical: rV(10),
  },
  composerInput: {
    maxHeight: rV(110),
    padding: 0,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(20),
    color: c.text,
  },
  sendButton: {
    width: rS(44),
    height: rS(44),
    borderRadius: rMS(22),
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: c.text,
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  errorBanner: {
    marginHorizontal: rS(16),
    marginTop: rV(12),
    backgroundColor: "#FEF2F2",
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FECACA",
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
  },
  errorText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    color: "#B91C1C",
    lineHeight: rMS(18),
  },
  emptyMessages: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(28),
    paddingVertical: rV(40),
    gap: rV(8),
  },
  emptyMessagesTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: c.text,
    textAlign: "center",
  },
  emptyMessagesText: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: c.textMuted,
    textAlign: "center",
    lineHeight: rMS(20),
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    marginTop: rV(10),
  },
  chip: {
    backgroundColor: c.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  chipText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: c.textSecondary,
  },
});
}

export function useChatStyles() {
  const { colors } = useTheme();
  return useMemo(() => createChatStyles(colors), [colors]);
}
