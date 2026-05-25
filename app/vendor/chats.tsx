import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountEmptyState,
  AccountInsightCard,
  ChatThreadRow,
} from "@/components/chat/ChatUi";
import { VendorScreenShell, vendorStyles } from "@/components/vendor/VendorUi";
import { useChat } from "@/context/ChatContext";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { FlatList } from "react-native";

export default function VendorChatsScreen() {
  const { isLoadingVendorThreads, loadVendorThreads, vendorThreads } = useChat();

  useFocusEffect(
    useCallback(() => {
      void loadVendorThreads({
        silent: vendorThreads.length > 0,
      });
    }, [loadVendorThreads, vendorThreads.length]),
  );

  const unreadTotal = vendorThreads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  if (vendorThreads.length > 0) {
    return (
      <VendorScreenShell title="Shopper Chats">
        <FlatList
          data={vendorThreads}
          keyExtractor={(thread) => thread.id}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={vendorStyles.listContent}
          ListHeaderComponent={
            <AccountInsightCard
              title="Shopper inbox"
              subtitle="Reply quickly when customers ask about products, delivery, or availability."
              stats={[
                { value: vendorThreads.length, label: "Threads" },
                { value: unreadTotal, label: "Unread" },
              ]}
            />
          }
          renderItem={({ item }) => (
            <ChatThreadRow
              thread={item}
              avatarMode="counterpart"
              onPress={() =>
                router.push({
                  pathname: "/screens/productDetails/chat/[vendorId]" as any,
                  params: {
                    vendorId: item.store.id,
                    vendorName: item.counterpart.name,
                    threadId: item.id,
                    viewer: "vendor",
                  },
                })
              }
            />
          )}
        />
      </VendorScreenShell>
    );
  }

  if (isLoadingVendorThreads) {
    return (
      <VendorScreenShell
        title="Shopper Chats"
        loading
        loadingLabel="Loading shopper conversations..."
      />
    );
  }

  return (
    <VendorScreenShell title="Shopper Chats">
      <AccountEmptyState
        icon="chatbubbles-outline"
        title="No shopper chats yet"
        message="When shoppers message your store from a product page, the conversation will appear here."
      />
    </VendorScreenShell>
  );
}
