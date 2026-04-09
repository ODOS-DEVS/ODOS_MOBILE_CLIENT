import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  sender: "user" | "vendor";
  time: string;
};

export default function VendorChatScreen() {
  const { vendorId, vendorName } = useLocalSearchParams() as any;
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    
    return [
      {
        id: "m1",
        text: "Hi! How can I help you with this product?",
        sender: "vendor",
        time: new Date().toISOString(),
      },
      {
        id: "m2",
        text: "Hi, is this available in green?",
        sender: "user",
        time: new Date().toISOString(),
      },
    ];
  });

  const listRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: String(Date.now()),
      text: input.trim(),
      sender: "user",
      time: new Date().toISOString(),
    };
    setMessages((p) => [...p, newMsg]);
    setInput("");
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View
        className={`flex-row ${isUser ? "justify-end" : "justify-start"} px-4 py-2`}
      >
        <View
          style={{
            maxWidth: "80%",
            backgroundColor: isUser ? Colors.primary : Colors.white,
            borderRadius: 16,
            paddingVertical: 10,
            paddingHorizontal: 12,
            shadowColor: "#000",
            shadowOpacity: 0.03,
            shadowRadius: 6,
            elevation: 1,
          }}
        >
          <Text
            style={{
              color: isUser ? Colors.white : Colors.primary,
              fontFamily: Fonts.text,
              lineHeight: 20,
            }}
          >
            {item.text}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 11,
              color: isUser ? Colors.white : "#9ca3af",
              textAlign: "right",
              fontFamily: Fonts.textLight,
            }}
          >
            {new Date(item.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  const keyExtractor = (m: Message) => m.id;

  const header = useMemo(() => {
    return (
      <View
        className="flex-row items-center px-4"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-black/10 rounded-full items-center justify-center mr-3"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>

        <Image
          source={require("../../../../../assets/images/dress.png")}
          className="w-10 h-10 rounded-full mr-3"
        />

        <View>
          <Text className="text-lg font-montserrat-semiBold text-gray-900">
            {vendorName ?? "Vendor"}
          </Text>
          <Text className="text-xs text-gray-500">
            Typically replies within an hour
          </Text>
        </View>
      </View>
    );
  }, [vendorName, insets.top]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      {header}

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />

      <View className="px-4 py-3 mb-6 pb-4 border-t border-gray-200 bg-white">
        <View className="flex-row items-center gap-3">
          <TextInput
            placeholder="Write a message to the vendor..."
            value={input}
            onChangeText={setInput}
            style={{
              flex: 1,
              backgroundColor: "#F2F3f6",
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === "ios" ? 12 : 8,
              fontFamily: Fonts.text,
            }}
            multiline
          />

          <TouchableOpacity
            onPress={sendMessage}
            className="w-12 h-12 bg-black rounded-full items-center justify-center"
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
