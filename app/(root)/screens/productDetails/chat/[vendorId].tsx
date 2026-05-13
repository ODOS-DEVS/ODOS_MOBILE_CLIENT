import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { type ChatMessage, useChat } from "@/context/ChatContext";
import { goBackOr } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p;

const isSameDay = (a: number, b: number) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

const formatMessageTime = (time: number) =>
  new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDayLabel = (time: number) => {
  const d = new Date(time);
  const now = new Date();
  if (isSameDay(d.getTime(), now.getTime())) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d.getTime(), yesterday.getTime())) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};

export default function VendorChatScreen() {
  const params = useLocalSearchParams();
  const vendorId = getParam(params.vendorId) ?? "";
  const vendorName = getParam(params.vendorName) ?? "Vendor";
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const { ensureThread, messagesByVendor, sendMessage } = useChat();
  const messages = vendorId ? (messagesByVendor[vendorId] ?? []) : [];

  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!vendorId) return;
    ensureThread({ vendorId, vendorName });
  }, [ensureThread, vendorId, vendorName]);

  useEffect(() => {
    if (!messages.length) return;
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  const onSend = () => {
    if (!vendorId || !input.trim()) return;
    sendMessage(vendorId, input.trim(), "user");
    setInput("");
  };

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.sender === "user";
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const showDay =
      !prev || !isSameDay(prev.time, item.time);

    const nextSameSender = next?.sender === item.sender;
    const nextCloseInTime = next ? Math.abs(next.time - item.time) < 6 * 60 * 1000 : false;
    const showMeta = !nextSameSender || !nextCloseInTime;

    return (
      <>
        {showDay && (
          <View className="items-center py-3">
            <View className="bg-black/5 px-3 py-1 rounded-full">
              <Text style={{ fontFamily: Fonts.text }} className="text-xs text-gray-700">
                {formatDayLabel(item.time)}
              </Text>
            </View>
          </View>
        )}

        <View
          className={`flex-row ${isUser ? "justify-end" : "justify-start"} px-4 py-1.5`}
        >
          <View
            className={`${isUser ? "" : "border border-gray-200"} ${
              isUser ? "shadow-sm" : ""
            }`}
            style={{
              maxWidth: "82%",
              backgroundColor: isUser ? Colors.primary : "#FFFFFF",
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderBottomLeftRadius: isUser ? 18 : 6,
              borderBottomRightRadius: isUser ? 6 : 18,
            }}
          >
            <Text
              style={{
                color: isUser ? "#FFFFFF" : "#111827",
                fontFamily: Fonts.text,
                lineHeight: 20,
              }}
            >
              {item.text}
            </Text>

            {showMeta && (
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: isUser ? "rgba(255,255,255,0.85)" : "#9CA3AF",
                  textAlign: "right",
                  fontFamily: Fonts.textLight,
                }}
              >
                {formatMessageTime(item.time)}
              </Text>
            )}
          </View>
        </View>
      </>
    );
  };

  const keyExtractor = (m: ChatMessage) => m.id;

  const header = useMemo(() => {
    return (
      <View
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <View className="flex-row items-center px-4">
          <TouchableOpacity
            onPress={() =>
              goBackOr(router, {
                fallback: "/(root)/screens/profileScreens/Account/Chats" as any,
              })
            }
            className="w-10 h-10 bg-black/10 rounded-full items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>

          <View className="w-10 h-10 rounded-full mr-3 bg-black/10 items-center justify-center">
            <Ionicons name="person-outline" size={20} color="#111827" />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-montserrat-semiBold text-gray-900">
              {vendorName ?? "Vendor"}
            </Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-xs text-gray-500">Online</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {}}
            className="w-10 h-10 bg-black/5 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [vendorName, insets.top]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F5F7FA]"
    >
      <StatusBar barStyle="dark-content" />
      {header}

      {!vendorId ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Missing vendor
          </Text>
          <Text className="text-gray-500 text-center">
            Go back and open chat from a product page.
          </Text>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <View
        className="px-4 pt-3 border-t border-gray-200 bg-white"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View className="flex-row items-end gap-3">
          <View className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 border border-gray-200">
            <TextInput
              placeholder="Message vendor..."
              value={input}
              onChangeText={setInput}
              style={{
                maxHeight: 120,
                padding: 0,
                fontFamily: Fonts.text,
                color: "#111827",
              }}
              multiline
            />
          </View>

          <Pressable
            onPress={onSend}
            disabled={!input.trim() || !vendorId}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              input.trim() && vendorId ? "bg-black" : "bg-black/20"
            }`}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
