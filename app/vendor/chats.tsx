import ScreenLoader from "@/components/loaders/ScreenLoader";
import {
  AccountEmptyState,
  AccountInsightCard,
  AnimatedChatThreadWrap,
  ChatThreadRow,
} from "@/components/chat/ChatUi";
import { VendorScreenShell, vendorStyles } from "@/components/vendor/VendorUi";
import { useChat } from "@/context/ChatContext";
import { useRequireVendor } from "@/hooks/useRequireVendor";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { FlatList } from "react-native";

export default function VendorChatsScreen() {
  const { hasVendorAccess, isCheckingVendorAccess } = useRequireVendor();
  const { isLoadingVendorThreads, loadVendorThreads, vendorThreads } = useChat();

  useFocusEffect(
    useCallback(() => {
      if (!hasVendorAccess) {
        return undefined;
      }
      void loadVendorThreads({
        silent: vendorThreads.length > 0,
      });
      return undefined;
    }, [hasVendorAccess, loadVendorThreads, vendorThreads.length]),
  );

  if (isCheckingVendorAccess) {
    return (
      <VendorScreenShell
        title="Shopper Chats"
        loading
        loadingLabel="Loading shopper conversations..."
      />
    );
  }

  if (!hasVendorAccess) {
    return null;
  }

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
          renderItem={({ item, index }) => (
            <AnimatedChatThreadWrap index={index}>
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
            </AnimatedChatThreadWrap>
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
