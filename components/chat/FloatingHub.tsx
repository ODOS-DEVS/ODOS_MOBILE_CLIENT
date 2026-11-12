import CommerceImage from "@/components/media/CommerceImage";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useChatInbox, useChatInboxSync } from "@/hooks/useChatInbox";
import { useAppChromeStore } from "@/stores/appChromeStore";
import type { ChatThread } from "@/types/chat";
import {
  assistantContextToParams,
  buildStoreAssistantContext,
  extractStoreIdFromPath,
} from "@/utils/assistantContext";
import { deriveAssistantScreen } from "@/utils/assistantQuickPrompts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * One floating button for everything that floats.
 *
 * The assistant FAB and a separate chat bubble were two controls fighting for
 * the same corner. This is the website's speed-dial pattern brought to the
 * app: a single button where the assistant has always lived; tapping it fans
 * out labelled actions — Assistant and Messages — and tapping Messages swaps
 * the dial for the inbox sheet. Unread replies show on the closed button, so
 * a seller's answer is visible from any screen without opening anything.
 *
 * Sellers have no assistant, so for them the button skips the dial and opens
 * Messages directly — a one-option menu is a worse tap, not a feature.
 */

const HIDDEN_PATH_SNIPPETS = [
  "chat",
  "assistant",
  "Checkout",
  "payments/",
  "wallet/topup-return",
  "signin",
  "signup",
  "onboarding",
  "verification",
  "forgotpassword",
  "createpassword",
  "splash",
];

const FAB_SIZE = rMS(52);
const OPTION_SIZE = rMS(46);

function relativeTime(iso?: string | null): string {
  if (!iso) {
    return "";
  }
  const then = Date.parse(iso);
  if (Number.isNaN(then)) {
    return "";
  }
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) {
    return "now";
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }
  return new Date(then).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function UnreadBadge({ count, borderColor }: { count: number; borderColor: string }) {
  if (count < 1) {
    return null;
  }
  return (
    <View style={[styles.badge, { borderColor }]}>
      <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

function ThreadRow({
  thread,
  isSelling,
  expanded,
  onToggleExpand,
  onOpenThread,
}: {
  thread: ChatThread;
  isSelling: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenThread: (thread: ChatThread) => void;
}) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { sendMessage, loadMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const unread = thread.unreadCount ?? 0;

  const quickReply = useCallback(async () => {
    const text = draft.trim();
    if (!text || isSending) {
      return;
    }
    setIsSending(true);
    try {
      await sendMessage(thread.id, text);
      setDraft("");
      // Fetching the thread marks it read server-side; silent, so no spinner
      // appears anywhere. Realtime then clears the badge on its own.
      void loadMessages(thread.id, { silent: true });
      showToast("Sent", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Your message didn't send.", "error");
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, loadMessages, sendMessage, showToast, thread.id]);

  return (
    <View
      style={[
        styles.rowWrap,
        { borderColor: colors.cardBorder, backgroundColor: colors.card },
        unread > 0 && { borderColor: colors.primary + "55" },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Conversation with ${thread.counterpart.name || thread.store.title}`}
        onPress={() => onOpenThread(thread)}
        style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.75 }]}
      >
        {thread.counterpart.avatarUrl || thread.store.imageUrl ? (
          <CommerceImage
            source={{ uri: thread.counterpart.avatarUrl ?? thread.store.imageUrl ?? undefined }}
            style={styles.rowAvatar}
            contentFit="cover"
            participateInReadyGate={false}
          />
        ) : (
          <View style={[styles.rowAvatar, styles.rowAvatarFallback, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.rowAvatarInitial, { color: colors.textMuted }]}>
              {(thread.counterpart.name || thread.store.title || "S").trim().charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.rowCopy}>
          <View style={styles.rowTitleLine}>
            <Text numberOfLines={1} style={[styles.rowName, { color: colors.text }]}>
              {thread.counterpart.name?.trim() || thread.store.title?.trim() || "Seller"}
            </Text>
            <Text style={[styles.rowTime, { color: colors.textMuted }]}>
              {relativeTime(thread.lastMessageAt ?? thread.updatedAt)}
            </Text>
          </View>
          <View style={styles.rowPreviewLine}>
            <Text
              numberOfLines={1}
              style={[
                styles.rowPreview,
                { color: unread > 0 ? colors.text : colors.textMuted },
                unread > 0 && { fontFamily: Fonts.textBold },
              ]}
            >
              {thread.lastMessageText ?? (isSelling ? "A customer reached out" : "Say hello")}
            </Text>
            {unread > 0 ? (
              <View style={[styles.rowUnreadPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.rowUnreadPillText}>{unread > 99 ? "99+" : unread}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Hide quick reply" : "Quick reply"}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onToggleExpand}
          style={[
            styles.rowReplyToggle,
            {
              backgroundColor: expanded ? colors.primary : colors.surface,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Ionicons
            name="arrow-undo-outline"
            size={rMS(14)}
            color={expanded ? "#FFFFFF" : colors.textMuted}
          />
        </TouchableOpacity>
      </Pressable>

      {expanded ? (
        <View style={[styles.replyRow, { borderTopColor: colors.cardBorder }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Reply to ${thread.counterpart.name || thread.store.title}…`}
            placeholderTextColor={colors.textMuted}
            autoFocus
            style={[
              styles.replyInput,
              { color: colors.text, backgroundColor: colors.surface, borderColor: colors.cardBorder },
            ]}
            editable={!isSending}
            returnKeyType="send"
            onSubmitEditing={() => void quickReply()}
          />
          <TouchableOpacity
            accessibilityLabel="Send reply"
            disabled={isSending || !draft.trim()}
            onPress={() => void quickReply()}
            style={[
              styles.replySend,
              { backgroundColor: colors.primary },
              (isSending || !draft.trim()) && { opacity: 0.45 },
            ]}
          >
            <Ionicons name="arrow-up" size={rMS(16)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

export default function FloatingHub() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  useChatInboxSync();
  const { threads, unreadCount, hasThreads, isSelling } = useChatInbox();
  const tabBarHeight = useAppChromeStore((state) => state.tabBarHeight);

  const [dialOpen, setDialOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const hidden = useMemo(
    () => HIDDEN_PATH_SNIPPETS.some((snippet) => pathname.includes(snippet)),
    [pathname],
  );

  const animateDial = useCallback(
    (open: boolean) => {
      setDialOpen(open);
      Animated.timing(progress, {
        toValue: open ? 1 : 0,
        duration: 190,
        easing: open ? Easing.out(Easing.back(1.4)) : Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [progress],
  );

  const openAssistant = useCallback(() => {
    animateDial(false);
    const screen = deriveAssistantScreen(pathname);
    const storeContext = buildStoreAssistantContext({
      storeId: extractStoreIdFromPath(pathname),
    });
    router.push({
      pathname: "/screens/assistant",
      params: { screen, ...assistantContextToParams(storeContext) },
    } as never);
  }, [animateDial, pathname]);

  const openMessages = useCallback(() => {
    // The dial makes way for the sheet — two overlays at once is noise.
    animateDial(false);
    if (!user) {
      showToast("Sign in to see your messages.", "info");
      router.push("/(root)/(auth)/signin" as never);
      return;
    }
    setSheetOpen(true);
  }, [animateDial, showToast, user]);

  const onMainPress = useCallback(() => {
    if (isSelling) {
      // No assistant on the seller side; the button IS messages.
      setSheetOpen(true);
      return;
    }
    animateDial(!dialOpen);
  }, [animateDial, dialOpen, isSelling]);

  const sorted = useMemo(
    () =>
      [...threads].sort((a, b) => {
        const aUnread = (a.unreadCount ?? 0) > 0;
        const bUnread = (b.unreadCount ?? 0) > 0;
        if (aUnread !== bUnread) {
          return aUnread ? -1 : 1;
        }
        return (
          Date.parse(b.lastMessageAt ?? b.updatedAt) - Date.parse(a.lastMessageAt ?? a.updatedAt)
        );
      }),
    [threads],
  );

  const openThread = useCallback(
    (thread: ChatThread) => {
      setSheetOpen(false);
      setExpandedId(null);
      router.push({
        pathname: "/screens/productDetails/chat/[vendorId]" as never,
        params: {
          vendorId: thread.store.id,
          vendorName: thread.counterpart.name,
          threadId: thread.id,
          ...(isSelling ? { viewer: "vendor" } : {}),
        } as never,
      });
    },
    [isSelling],
  );

  // Signed-out shoppers keep the assistant; Messages asks them to sign in.
  if (hidden) {
    return null;
  }

  const bottom = (tabBarHeight || insets.bottom) + rS(12);
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] });
  const optionStyle = (index: number) => ({
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [rV(14) * (index + 1), 0],
        }),
      },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
    ],
  });

  return (
    <>
      {/* Tapping anywhere else folds the dial away. */}
      {dialOpen ? (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 44 }]}
          accessibilityLabel="Close quick actions"
          onPress={() => animateDial(false)}
        />
      ) : null}

      <View style={[styles.wrap, { bottom }]} pointerEvents="box-none">
        {!isSelling ? (
          <View pointerEvents={dialOpen ? "auto" : "none"} style={styles.options}>
            <Animated.View style={[styles.optionRow, optionStyle(1)]}>
              <View style={[styles.optionLabel, { backgroundColor: colors.inverseSurface }]}>
                <Text style={[styles.optionLabelText, { color: colors.onInverseSurface }]}>
                  Assistant
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open ODOS Assistant"
                activeOpacity={0.85}
                onPress={openAssistant}
                style={styles.optionButtonShadow}
              >
                <LinearGradient
                  colors={[colors.primary, colors.textSecondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionButton}
                >
                  <Ionicons name="sparkles" size={rMS(19)} color={colors.onPrimary} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.optionRow, optionStyle(0)]}>
              <View style={[styles.optionLabel, { backgroundColor: colors.inverseSurface }]}>
                <Text style={[styles.optionLabelText, { color: colors.onInverseSurface }]}>
                  Messages
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  unreadCount > 0 ? `Messages, ${unreadCount} unread` : "Open messages"
                }
                activeOpacity={0.85}
                onPress={openMessages}
                style={[
                  styles.optionButton,
                  styles.optionButtonShadow,
                  { backgroundColor: colors.inverseSurface },
                ]}
              >
                <Ionicons name="chatbubbles" size={rMS(18)} color={colors.onInverseSurface} />
                <UnreadBadge count={unreadCount} borderColor={colors.screen} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isSelling
              ? unreadCount > 0
                ? `Messages, ${unreadCount} unread`
                : "Open messages"
              : dialOpen
                ? "Close quick actions"
                : "Open quick actions"
          }
          onPress={onMainPress}
          style={({ pressed }) => [
            styles.fabShadow,
            { shadowColor: colors.shadow },
            pressed && { transform: [{ scale: 0.94 }] },
          ]}
        >
          <LinearGradient
            colors={[colors.primary, colors.textSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            {isSelling ? (
              <Ionicons name="chatbubbles" size={rMS(21)} color={colors.onPrimary} />
            ) : (
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="add" size={rMS(28)} color={colors.onPrimary} />
              </Animated.View>
            )}
          </LinearGradient>
          {/* Hidden while the dial is open — the count moves to the Messages option. */}
          {!dialOpen ? <UnreadBadge count={unreadCount} borderColor={colors.screen} /> : null}
        </Pressable>
      </View>

      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Close messages"
            onPress={() => setSheetOpen(false)}
          />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View
              style={[
                styles.sheet,
                { backgroundColor: colors.screen, paddingBottom: insets.bottom + rV(12) },
              ]}
            >
              <View style={[styles.grabber, { backgroundColor: colors.cardBorder }]} />

              <View style={styles.sheetHeader}>
                <View>
                  <Text style={[styles.sheetTitle, { color: colors.text }]}>
                    {isSelling ? "Customer chats" : "Messages"}
                  </Text>
                  <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>
                    {unreadCount > 0
                      ? `${unreadCount} unread · reply right here`
                      : hasThreads
                        ? "All caught up"
                        : "Conversations with sellers live here"}
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityLabel="Open full chat screen"
                  onPress={() => {
                    setSheetOpen(false);
                    router.push(
                      (isSelling
                        ? "/vendor/chats"
                        : "/(root)/screens/profileScreens/Account/Chats") as never,
                    );
                  }}
                  style={[styles.seeAll, { borderColor: colors.cardBorder }]}
                >
                  <Text style={[styles.seeAllText, { color: colors.text }]}>See all</Text>
                  <Ionicons name="arrow-forward" size={rMS(12)} color={colors.text} />
                </TouchableOpacity>
              </View>

              {hasThreads ? (
                <FlatList
                  data={sorted.slice(0, 20)}
                  keyExtractor={(thread) => thread.id}
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    paddingHorizontal: rS(16),
                    paddingTop: rV(2),
                    paddingBottom: rV(16),
                  }}
                  ItemSeparatorComponent={() => <View style={{ height: rV(8) }} />}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <ThreadRow
                      thread={item}
                      isSelling={isSelling}
                      expanded={expandedId === item.id}
                      onToggleExpand={() =>
                        setExpandedId((cur) => (cur === item.id ? null : item.id))
                      }
                      onOpenThread={openThread}
                    />
                  )}
                />
              ) : (
                <View style={styles.empty}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
                    <Ionicons name="chatbubbles-outline" size={rMS(22)} color={colors.textMuted} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No chats yet</Text>
                  <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
                    Message a seller from any product or store page, and the conversation stays
                    here — replies show up on this button wherever you are in the app.
                  </Text>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: rS(16),
    zIndex: 45,
    alignItems: "flex-end",
  },
  options: {
    alignItems: "flex-end",
    gap: rV(10),
    marginBottom: rV(10),
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  optionLabel: {
    borderRadius: 999,
    paddingHorizontal: rS(12),
    paddingVertical: rV(6),
  },
  optionLabelText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
  optionButton: {
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    borderRadius: OPTION_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionButtonShadow: {
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.2 : 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderRadius: OPTION_SIZE / 2,
  },
  fabShadow: {
    shadowOpacity: Platform.OS === "ios" ? 0.24 : 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    borderRadius: FAB_SIZE / 2,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: -rV(3),
    right: -rS(3),
    minWidth: rMS(19),
    height: rMS(19),
    borderRadius: rMS(10),
    paddingHorizontal: rS(4),
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10),
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(10, 10, 12, 0.5)",
  },
  // A fixed-height panel, not a content-sized one: with maxHeight alone the
  // sheet collapsed around however much the list happened to measure, clipping
  // rows mid-card (the screenshot that prompted this). A determinate height
  // with a flexed list inside is boring and correct.
  sheet: {
    height: rV(520),
    borderTopLeftRadius: rMS(26),
    borderTopRightRadius: rMS(26),
    paddingTop: rV(8),
  },
  grabber: {
    alignSelf: "center",
    width: rS(40),
    height: rV(4.5),
    borderRadius: 999,
    marginBottom: rV(8),
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(16),
    paddingBottom: rV(12),
  },
  sheetTitle: { fontFamily: Fonts.titleBold, fontSize: rMS(17) },
  sheetSubtitle: { fontFamily: Fonts.text, fontSize: rMS(11.5), marginTop: rV(2) },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: rS(12),
    paddingVertical: rV(7),
  },
  seeAllText: { fontFamily: Fonts.textBold, fontSize: rMS(12) },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(32),
    paddingBottom: rV(40),
    gap: rV(8),
  },
  emptyIcon: {
    width: rMS(52),
    height: rMS(52),
    borderRadius: rMS(26),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(4),
  },
  emptyTitle: { fontFamily: Fonts.titleBold, fontSize: rMS(14.5) },
  emptyBody: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    textAlign: "center",
  },
  rowWrap: { borderWidth: 1, borderRadius: rMS(16), overflow: "hidden" },
  // Margins rather than flex gap inside the row: the geometry must hold on
  // every RN version this app has shipped on.
  rowMain: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: rV(64),
    paddingHorizontal: rS(12),
    paddingVertical: rV(10),
  },
  rowAvatar: {
    width: rMS(42),
    height: rMS(42),
    borderRadius: rMS(21),
    marginRight: rS(10),
  },
  rowAvatarFallback: { alignItems: "center", justifyContent: "center" },
  rowAvatarInitial: { fontFamily: Fonts.titleBold, fontSize: rMS(16) },
  rowCopy: { flex: 1, minWidth: 0, marginRight: rS(8) },
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(8),
  },
  rowName: { fontFamily: Fonts.textBold, fontSize: rMS(13.5), flexShrink: 1 },
  rowTime: { fontFamily: Fonts.text, fontSize: rMS(10.5) },
  rowPreviewLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    marginTop: rV(2),
  },
  rowPreview: { fontFamily: Fonts.text, fontSize: rMS(12), flex: 1 },
  rowUnreadPill: {
    minWidth: rMS(18),
    height: rMS(18),
    borderRadius: rMS(9),
    paddingHorizontal: rS(4),
    alignItems: "center",
    justifyContent: "center",
  },
  rowUnreadPillText: { color: "#FFFFFF", fontFamily: Fonts.titleBold, fontSize: rMS(9.5) },
  rowReplyToggle: {
    width: rMS(32),
    height: rMS(32),
    borderRadius: rMS(16),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  replyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    borderTopWidth: 1,
    paddingHorizontal: rS(10),
    paddingVertical: rV(9),
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: rS(14),
    paddingVertical: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
  },
  replySend: {
    width: rMS(34),
    height: rMS(34),
    borderRadius: rMS(17),
    alignItems: "center",
    justifyContent: "center",
  },
});
