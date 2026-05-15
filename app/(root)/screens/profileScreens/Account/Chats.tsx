import ProfileHeader from "@/components/profile/ProfileHeader";
import { useChat } from "@/context/ChatContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const formatTime = (time: number) => {
  const d = new Date(time);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function ChatsScreen() {
  const { customerThreads, isLoadingCustomerThreads, loadCustomerThreads } = useChat();

  useFocusEffect(
    React.useCallback(() => {
      void loadCustomerThreads();
    }, [loadCustomerThreads]),
  );

  return (
    <View className="flex-1 bg-gray-100">
      <ProfileHeader title="Chats" />

      {isLoadingCustomerThreads && customerThreads.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="chatbubbles-outline" size={34} color="#9CA3AF" />
          <Text className="text-gray-500 mt-4">Loading your conversations...</Text>
        </View>
      ) : null}

      {!isLoadingCustomerThreads && customerThreads.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-6">
            <Ionicons name="chatbubbles-outline" size={40} color="#6B7280" />
          </View>
          <Text className="text-xl font-semibold mb-2">No chats yet</Text>
          <Text className="text-gray-500 text-center leading-6">
            Start a conversation from any product page by tapping “Message
            Vendor”.
          </Text>
        </View>
      ) : !isLoadingCustomerThreads ? (
        <FlatList
          data={customerThreads}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: "/screens/productDetails/chat/[vendorId]",
                    params: {
                      vendorId: item.store.id,
                      vendorName: item.counterpart.name,
                      threadId: item.id,
                    },
                  })
                }
                className="bg-white rounded-[22px] px-3.5 py-3 mb-2.5 shadow-sm"
              >
                <View className="flex-row items-center">
                  {item.counterpart.avatarUrl ? (
                    <Image
                      source={{ uri: item.counterpart.avatarUrl }}
                      className="w-10 h-10 rounded-full mr-3 bg-gray-200"
                    />
                  ) : (
                    <View className="w-10 h-10 rounded-full mr-3 bg-black/10 items-center justify-center">
                      <Ionicons name="person-outline" size={18} color="#111827" />
                    </View>
                  )}

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-semibold text-[15px] text-gray-900">
                        {item.counterpart.name}
                      </Text>
                      <Text className="text-[11px] text-gray-500">
                        {formatTime(
                          new Date(item.lastMessageAt ?? item.updatedAt).getTime(),
                        )}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-gray-500 mt-0.5">
                      {item.store.title}
                    </Text>
                    <Text
                      className="text-[13px] text-gray-600 mt-1"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.lastMessageText || "Open the conversation"}
                    </Text>
                  </View>

                  {item.unreadCount > 0 ? (
                    <View className="ml-2.5 min-w-[22px] h-[22px] rounded-full bg-black items-center justify-center px-1.5">
                      <Text className="text-white text-[11px] font-semibold">
                        {item.unreadCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </View>
  );
}
