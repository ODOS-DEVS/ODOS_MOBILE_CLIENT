import CommerceImage from "@/components/media/CommerceImage";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useChatInbox, useChatInboxSync } from "@/hooks/useChatInbox";
import { useAppChromeStore } from "@/stores/appChromeStore";
import type { ChatThread } from "@/types/chat";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
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
 * Chat, reachable and answerable from any screen.
 *
 * A fixed bubble rides above the assistant FAB in the bottom-right corner —
 * the one corner the thumb already knows — with a numbered badge when replies
 * are waiting. Tapping opens the inbox as a sheet over the current screen:
 * every conversation, newest and unread first, each expandable into a quick
 * reply right there. The full thread screen (attachments, voice notes) stays
 * one tap away. The dock exists whenever the shopper is signed in, because
 * the moment a seller replies must be visible from wherever the shopper
 * happens to be standing.
 */

const HIDDEN_PATH_SNIPPETS = [
  "chat",
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

/** Matches AssistantFab: width 52 + its 12pt gap off the tab bar. */
const ASSISTANT_SIZE = rMS(52);
const STACK_GAP = rV(10);

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
        rowStyles.wrap,
        { borderColor: colors.cardBorder, backgroundColor: colors.card },
        unread > 0 && { borderColor: colors.primary + "55" },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Conversation with ${thread.counterpart.name || thread.store.title}`}
        onPress={() => onOpenThread(thread)}
        style={({ pressed }) => [rowStyles.main, pressed && { opacity: 0.75 }]}
      >
        <CommerceImage
          source={{ uri: thread.counterpart.avatarUrl ?? thread.store.imageUrl ?? undefined }}
          style={rowStyles.avatar}
          contentFit="cover"
          participateInReadyGate={false}
        />
        <View style={rowStyles.copy}>
          <View style={rowStyles.titleRow}>
            <Text numberOfLines={1} style={[rowStyles.name, { color: colors.text }]}>
              {thread.counterpart.name || thread.store.title}
            </Text>
            <Text style={[rowStyles.time, { color: colors.textMuted }]}>
              {relativeTime(thread.lastMessageAt ?? thread.updatedAt)}
            </Text>
          </View>
          <View style={rowStyles.previewRow}>
            <Text
              numberOfLines={1}
              style={[
                rowStyles.preview,
                { color: unread > 0 ? colors.text : colors.textMuted },
                unread > 0 && { fontFamily: Fonts.textBold },
              ]}
            >
              {thread.lastMessageText ?? (isSelling ? "A customer reached out" : "Say hello")}
            </Text>
            {unread > 0 ? (
              <View style={[rowStyles.unreadPill, { backgroundColor: colors.primary }]}>
                <Text style={rowStyles.unreadPillText}>{unread > 99 ? "99+" : unread}</Text>
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
            rowStyles.replyToggle,
            { backgroundColor: expanded ? colors.primary : colors.surface, borderColor: colors.cardBorder },
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
        <View style={[rowStyles.replyRow, { borderTopColor: colors.cardBorder }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Reply to ${thread.counterpart.name || thread.store.title}…`}
            placeholderTextColor={colors.textMuted}
            autoFocus
            style={[
              rowStyles.replyInput,
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
              rowStyles.replySend,
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

export default function ChatDock() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  useChatInboxSync();
  const { threads, unreadCount, hasThreads, isSelling } = useChatInbox();
  // Published by the tab bar; 0 on pushed screens, which have no tab bar.
  const tabBarHeight = useAppChromeStore((state) => state.tabBarHeight);
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hidden = useMemo(
    () => HIDDEN_PATH_SNIPPETS.some((snippet) => pathname.includes(snippet)),
    [pathname],
  );

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
      setOpen(false);
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

  // Anchored to the same corner as the assistant, stacked just above it so
  // the two read as one control cluster. The assistant FAB only exists on
  // shopper tab screens, so the clearance applies exactly there; on pushed
  // screens and for sellers the bubble takes the corner itself.
  const baseBottom = (tabBarHeight || insets.bottom) + rS(12);
  const bottom =
    tabBarHeight && !isSelling ? baseBottom + ASSISTANT_SIZE + STACK_GAP : baseBottom;

  if (hidden || !user) {
    return null;
  }

  return (
    <>
      <View style={[dockStyles.wrap, { bottom }]} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unreadCount > 0
              ? `${unreadCount} new message${unreadCount === 1 ? "" : "s"}. Open chats`
              : "Open chats"
          }
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            dockStyles.bubble,
            {
              backgroundColor: colors.inverseSurface,
              shadowColor: colors.shadow,
              borderColor: colors.screen,
            },
            pressed && { transform: [{ scale: 0.94 }], opacity: 0.9 },
          ]}
        >
          <Ionicons name="chatbubbles" size={rMS(21)} color={colors.onInverseSurface} />
          {unreadCount > 0 ? (
            <View style={[dockStyles.badge, { borderColor: colors.screen }]}>
              <Text style={dockStyles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={sheetStyles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Close chats"
            onPress={() => setOpen(false)}
          />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View
              style={[
                sheetStyles.sheet,
                { backgroundColor: colors.screen, paddingBottom: insets.bottom + rV(12) },
              ]}
            >
              <View style={[sheetStyles.grabber, { backgroundColor: colors.cardBorder }]} />

              <View style={sheetStyles.header}>
                <View>
                  <Text style={[sheetStyles.title, { color: colors.text }]}>
                    {isSelling ? "Customer chats" : "Messages"}
                  </Text>
                  <Text style={[sheetStyles.subtitle, { color: colors.textMuted }]}>
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
                    setOpen(false);
                    router.push(
                      (isSelling
                        ? "/vendor/chats"
                        : "/(root)/screens/profileScreens/Account/Chats") as never,
                    );
                  }}
                  style={[sheetStyles.seeAll, { borderColor: colors.cardBorder }]}
                >
                  <Text style={[sheetStyles.seeAllText, { color: colors.text }]}>See all</Text>
                  <Ionicons name="arrow-forward" size={rMS(12)} color={colors.text} />
                </TouchableOpacity>
              </View>

              {hasThreads ? (
                <FlatList
                  data={sorted.slice(0, 12)}
                  keyExtractor={(thread) => thread.id}
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={{ gap: rV(8), paddingHorizontal: rS(14), paddingTop: rV(2) }}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <ThreadRow
                      thread={item}
                      isSelling={isSelling}
                      expanded={expandedId === item.id}
                      onToggleExpand={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
                      onOpenThread={openThread}
                    />
                  )}
                />
              ) : (
                <View style={sheetStyles.empty}>
                  <View style={[sheetStyles.emptyIcon, { backgroundColor: colors.card }]}>
                    <Ionicons name="chatbubbles-outline" size={rMS(22)} color={colors.textMuted} />
                  </View>
                  <Text style={[sheetStyles.emptyTitle, { color: colors.text }]}>No chats yet</Text>
                  <Text style={[sheetStyles.emptyBody, { color: colors.textMuted }]}>
                    Message a seller from any product or store page, and the conversation stays
                    here — replies show up on this bubble wherever you are in the app.
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

const dockStyles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: rS(16),
    zIndex: 45,
    alignItems: "flex-end",
  },
  bubble: {
    width: ASSISTANT_SIZE,
    height: ASSISTANT_SIZE,
    borderRadius: ASSISTANT_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowOpacity: Platform.OS === "ios" ? 0.22 : 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
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
});

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(10, 10, 12, 0.5)",
  },
  sheet: {
    borderTopLeftRadius: rMS(24),
    borderTopRightRadius: rMS(24),
    paddingTop: rV(8),
    maxHeight: "74%",
  },
  grabber: {
    alignSelf: "center",
    width: rS(40),
    height: rV(4.5),
    borderRadius: 999,
    marginBottom: rV(8),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(16),
    paddingBottom: rV(12),
  },
  title: { fontFamily: Fonts.titleBold, fontSize: rMS(17) },
  subtitle: { fontFamily: Fonts.text, fontSize: rMS(11.5), marginTop: rV(2) },
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
    alignItems: "center",
    paddingHorizontal: rS(32),
    paddingVertical: rV(28),
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
});

const rowStyles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: rMS(16), overflow: "hidden" },
  main: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    padding: rS(12),
  },
  avatar: { width: rMS(42), height: rMS(42), borderRadius: rMS(21) },
  copy: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(8),
  },
  name: { fontFamily: Fonts.textBold, fontSize: rMS(13.5), flexShrink: 1 },
  time: { fontFamily: Fonts.text, fontSize: rMS(10.5) },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    marginTop: rV(2),
  },
  preview: { fontFamily: Fonts.text, fontSize: rMS(12), flex: 1 },
  unreadPill: {
    minWidth: rMS(18),
    height: rMS(18),
    borderRadius: rMS(9),
    paddingHorizontal: rS(4),
    alignItems: "center",
    justifyContent: "center",
  },
  unreadPillText: { color: "#FFFFFF", fontFamily: Fonts.titleBold, fontSize: rMS(9.5) },
  replyToggle: {
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
