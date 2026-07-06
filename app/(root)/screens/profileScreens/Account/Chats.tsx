import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountEmptyState,
  AccountInsightCard,
  AnimatedChatThreadWrap,
  useAccountStyles,
  ChatThreadRow,
} from "@/components/chat/ChatUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useChat } from "@/context/ChatContext";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, View } from "react-native";

export default function ChatsScreen() {
  const accountStyles = useAccountStyles();
  const { customerThreads, isLoadingCustomerThreads, loadCustomerThreads } = useChat();

  useFocusEffect(
    useCallback(() => {
      void loadCustomerThreads({
        silent: customerThreads.length > 0,
      });
    }, [customerThreads.length, loadCustomerThreads]),
  );

  const unreadTotal = customerThreads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Chats" />

      {customerThreads.length > 0 ? (
        <FlatList
          data={customerThreads}
          keyExtractor={(thread) => thread.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={accountStyles.content}
          ListHeaderComponent={
            <AccountInsightCard
              title="Vendor conversations"
              subtitle="Keep every store chat in one place. Unread messages stay highlighted until you open the thread."
              stats={[
                { value: customerThreads.length, label: "Threads" },
                { value: unreadTotal, label: "Unread" },
              ]}
            />
          }
          renderItem={({ item, index }) => (
            <AnimatedChatThreadWrap index={index}>
              <ChatThreadRow
                thread={item}
                onPress={() =>
                  router.push({
                    pathname: "/screens/productDetails/chat/[vendorId]" as any,
                    params: {
                      vendorId: item.store.id,
                      vendorName: item.counterpart.name,
                      threadId: item.id,
                    },
                  })
                }
              />
            </AnimatedChatThreadWrap>
          )}
        />
      ) : isLoadingCustomerThreads ? (
        <ScreenLoader label="Loading your conversations..." />
      ) : (
        <AccountEmptyState
          icon="chatbubbles-outline"
          title="No chats yet"
          message="Message a vendor from any product page to ask about sizing, stock, or delivery."
        />
      )}
    </View>
  );
}
