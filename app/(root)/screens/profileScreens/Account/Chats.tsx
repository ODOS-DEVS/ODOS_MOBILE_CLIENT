import ProfileHeader from "@/components/profile/ProfileHeader";
import { useChat } from "@/context/ChatContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
  const { threads } = useChat();

  return (
    <View className="flex-1 bg-gray-100">
      <ProfileHeader title="Chats" />

      {threads.length === 0 ? (
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
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(t) => t.vendorId}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: "/screens/productDetails/chat/[vendorId]",
                    params: { vendorId: item.vendorId, vendorName: item.vendorName },
                  })
                }
                className="bg-white rounded-3xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-center">
                  {item.vendorAvatarUri ? (
                    <Image
                      source={{ uri: item.vendorAvatarUri }}
                      className="w-12 h-12 rounded-full mr-4 bg-gray-200"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full mr-4 bg-black/10 items-center justify-center">
                      <Ionicons name="person-outline" size={22} color="#111827" />
                    </View>
                  )}

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-semibold text-base text-gray-900">
                        {item.vendorName}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatTime(item.updatedAt)}
                      </Text>
                    </View>
                    <Text
                      className="text-gray-600 mt-1"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.lastMessageText}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

