import Fonts from "@/constants/Fonts";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useChatInbox, useChatInboxSync } from "@/hooks/useChatInbox";
import { useAppChromeStore } from "@/stores/appChromeStore";
import type { ChatThread } from "@/types/chat";
import CommerceImage from "@/components/media/CommerceImage";
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
 * Chat, reachable from anywhere — and answerable from anywhere.
 *
 * The earlier launcher appeared only when a reply was unread, so between
 * replies the way back into a conversation was still Profile → Chats. This
 * keeps a quiet dock on screen whenever the person has conversations at all:
 * a small bubble normally, the informative "Kofi replied" pill when something
 * is waiting. Tapping opens the inbox as a sheet over the current screen —
 * read the latest from every conversation and fire back a quick reply right
 * there, without abandoning the cart, the product, or wherever you were.
 * The full thread screen (attachments, voice notes) is one more tap.
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

/** The assistant FAB's own footprint, so the dock sits clear above it. */
const ASSISTANT_FAB_CLEARANCE = rMS(52) + rV(22);

function timeLabel(iso?: string): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function ThreadRow({
  thread,
  isSelling,
  onOpenThread,
}: {
  thread: ChatThread;
  isSelling: boolean;
  onOpenThread: (thread: ChatThread) => void;
}) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { sendMessage, loadMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const unread = (thread.unreadCount ?? 0) > 0;

  const quickReply = useCallback(async () => {
    const text = draft.trim();
    if (!text || isSending) {
      return;
    }
    setIsSending(true);
    try {
      await sendMessage(thread.id, text);
      setDraft("");
      // Fetching the thread is what marks it read server-side; silent so no
      // spinner appears anywhere. Realtime then clears the badge.
      void loadMessages(thread.id, { silent: true });
      showToast("Sent", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Your message didn't send.", "error");
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, loadMessages, sendMessage, showToast, thread.id]);

  return (
    <View style={[rowStyles.wrap, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
      <TouchableOpacity activeOpacity={0.75} style={rowStyles.main} onPress={() => onOpenThread(thread)}>
        <View style={rowStyles.avatarWrap}>
          <CommerceImage
            source={{ uri: thread.counterpart.avatarUrl ?? thread.store.imageUrl ?? undefined }}
            style={rowStyles.avatar}
            contentFit="cover"
            participateInReadyGate={false}
          />
          {unread ? <View style={[rowStyles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
        </View>
        <View style={rowStyles.copy}>
          <View style={rowStyles.titleRow}>
            <Text numberOfLines={1} style={[rowStyles.name, { color: colors.text }]}>
              {thread.counterpart.name || thread.store.title}
            </Text>
            <Text style={[rowStyles.time, { color: colors.textMuted }]}>{timeLabel(thread.lastMessageAt ?? undefined)}</Text>
          </View>
          <Text
            numberOfLines={1}
            style={[
              rowStyles.preview,
              { color: unread ? colors.text : colors.textMuted },
              unread && { fontFamily: Fonts.textBold },
            ]}
          >
            {thread.lastMessageText ?? (isSelling ? "A customer reached out" : "Start the conversation")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={rMS(15)} color={colors.textMuted} />
      </TouchableOpacity>

      {unread ? (
        <View style={[rowStyles.replyRow, { borderTopColor: colors.cardBorder }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Reply without leaving this screen…"
            placeholderTextColor={colors.textMuted}
            style={[rowStyles.replyInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
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
              (isSending || !draft.trim()) && { opacity: 0.5 },
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
  const { showToast } = useToast();
  useChatInboxSync();
  const { threads, unreadCount, latestUnreadThread, hasThreads, isSelling } = useChatInbox();
  const tabBarHeight = useAppChromeStore((state) => state.tabBarHeight);
  const [open, setOpen] = useState(false);

  const hidden = useMemo(
    () => HIDDEN_PATH_SNIPPETS.some((snippet) => pathname.includes(snippet)),
    [pathname],
  );

  const sorted = useMemo(
    () =>
      [...threads].sort((a, b) => {
        const unreadGap = (b.unreadCount ?? 0) - (a.unreadCount ?? 0) === 0 ? 0 : (b.unreadCount ?? 0) > 0 ? 1 : -1;
        if ((a.unreadCount ?? 0) > 0 !== ((b.unreadCount ?? 0) > 0)) {
          return unreadGap;
        }
        return Date.parse(b.lastMessageAt ?? b.updatedAt) - Date.parse(a.lastMessageAt ?? a.updatedAt);
      }),
    [threads],
  );

  const openThread = useCallback(
    (thread: ChatThread) => {
      setOpen(false);
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

  const bottom = tabBarHeight
    ? tabBarHeight + (isSelling ? rV(12) : ASSISTANT_FAB_CLEARANCE)
    : insets.bottom + rV(12);

  // No conversations yet: nothing to open, so no dock. The first chat is
  // started from a product or store, and the dock exists from then on.
  if (hidden || !hasThreads) {
    return null;
  }

  const who = latestUnreadThread?.counterpart.name?.trim();

  return (
    <>
      <View style={[dockStyles.wrap, { bottom }]} pointerEvents="box-none">
        {unreadCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${unreadCount} new message${unreadCount === 1 ? "" : "s"}. Open chats`}
            onPress={() => setOpen(true)}
            style={({ pressed }) => [
              dockStyles.pill,
              { backgroundColor: colors.inverseSurface, shadowColor: colors.shadow },
              pressed && { opacity: 0.88 },
            ]}
          >
            <View style={[dockStyles.pillIcon, { backgroundColor: colors.onInverseSurface }]}>
              <Ionicons name="chatbubble-ellipses" size={rMS(16)} color={colors.inverseSurface} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text numberOfLines={1} style={[dockStyles.pillTitle, { color: colors.onInverseSurface }]}>
                {unreadCount === 1 ? "1 new message" : `${unreadCount} new messages`}
              </Text>
              <Text numberOfLines={1} style={[dockStyles.pillSubtitle, { color: colors.onInverseSurface }]}>
                {who ? `${who} replied · tap to read` : "Tap to read and reply"}
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open chats"
            onPress={() => setOpen(true)}
            style={({ pressed }) => [
              dockStyles.bubble,
              { backgroundColor: colors.inverseSurface, shadowColor: colors.shadow },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="chatbubble-ellipses" size={rMS(19)} color={colors.onInverseSurface} />
          </Pressable>
        )}
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={sheetStyles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Close chats" onPress={() => setOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View
              style={[
                sheetStyles.sheet,
                { backgroundColor: colors.surface, paddingBottom: insets.bottom + rV(12) },
              ]}
            >
              <View style={sheetStyles.grabber} />
              <View style={sheetStyles.header}>
                <Text style={[sheetStyles.title, { color: colors.text }]}>
                  {isSelling ? "Customer chats" : "Your chats"}
                </Text>
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
                >
                  <Text style={[sheetStyles.seeAll, { color: colors.primary }]}>See all</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={sorted.slice(0, 12)}
                keyExtractor={(thread) => thread.id}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ gap: rV(8), paddingHorizontal: rS(14) }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <ThreadRow thread={item} isSelling={isSelling} onOpenThread={openThread} />
                )}
              />
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
    left: rS(16),
    right: rS(16),
    zIndex: 50,
    alignItems: "center",
  },
  bubble: {
    alignSelf: "flex-start",
    width: rMS(44),
    height: rMS(44),
    borderRadius: rMS(22),
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: Platform.OS === "ios" ? 0.22 : 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    alignSelf: "center",
    maxWidth: "100%",
    paddingLeft: rS(12),
    paddingRight: rS(16),
    paddingVertical: rV(10),
    borderRadius: 999,
    shadowOpacity: Platform.OS === "ios" ? 0.22 : 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  pillIcon: {
    width: rMS(30),
    height: rMS(30),
    borderRadius: rMS(15),
    alignItems: "center",
    justifyContent: "center",
  },
  pillTitle: { fontFamily: Fonts.titleBold, fontSize: rMS(13) },
  pillSubtitle: { fontFamily: Fonts.text, fontSize: rMS(11.5), opacity: 0.75 },
});

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(10, 10, 12, 0.45)",
  },
  sheet: {
    borderTopLeftRadius: rMS(22),
    borderTopRightRadius: rMS(22),
    paddingTop: rV(8),
    maxHeight: "72%",
  },
  grabber: {
    alignSelf: "center",
    width: rS(38),
    height: rV(4),
    borderRadius: 999,
    backgroundColor: "rgba(127,127,127,0.35)",
    marginBottom: rV(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(16),
    paddingBottom: rV(10),
  },
  title: { fontFamily: Fonts.titleBold, fontSize: rMS(16) },
  seeAll: { fontFamily: Fonts.textBold, fontSize: rMS(13) },
});

const rowStyles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: rMS(16), overflow: "hidden" },
  main: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    padding: rS(12),
  },
  avatarWrap: { position: "relative" },
  avatar: { width: rMS(40), height: rMS(40), borderRadius: rMS(20) },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: rMS(11),
    height: rMS(11),
    borderRadius: rMS(6),
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  copy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: rS(8) },
  name: { fontFamily: Fonts.textBold, fontSize: rMS(13.5), flexShrink: 1 },
  time: { fontFamily: Fonts.text, fontSize: rMS(11) },
  preview: { fontFamily: Fonts.text, fontSize: rMS(12), marginTop: rV(2) },
  replyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    borderTopWidth: 1,
    paddingHorizontal: rS(10),
    paddingVertical: rV(8),
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
