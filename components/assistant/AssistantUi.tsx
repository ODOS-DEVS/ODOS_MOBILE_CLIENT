import ProductCard from "@/components/cards/ProductCard";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useChatStyles } from "@/styles/themedChatStyles";
import { ChatTypingIndicator } from "@/components/chat/ChatAnimations";
import { rMS, rS, rV } from "@/styles/responsive";
import type {
  AssistantAction,
  AssistantMessage,
  AssistantProduct,
  AssistantStore,
} from "@/types/assistant";
import { getAssistantQuickPrompts } from "@/utils/assistantQuickPrompts";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function navigateAssistantAction(action: AssistantAction) {
  if (action.params && Object.keys(action.params).length) {
    router.push({
      pathname: action.route,
      params: action.params,
    } as any);
    return;
  }
  router.push(action.route as any);
}

type AssistantQuickPromptsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  screen?: string;
  nudgePrompt?: string | null;
};

export function AssistantQuickPrompts({
  onSelect,
  disabled = false,
  screen,
  nudgePrompt,
}: AssistantQuickPromptsProps) {
  const { colors } = useTheme();
  const quickPrompts = useMemo(() => {
    const base = getAssistantQuickPrompts(screen);
    if (nudgePrompt?.trim()) {
      return [{ label: "Yes, help me with that", prompt: nudgePrompt.trim() }, ...base.slice(0, 3)];
    }
    return base;
  }, [nudgePrompt, screen]);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginHorizontal: rS(16),
          marginTop: rV(4),
          marginBottom: rV(12),
          borderRadius: rMS(16),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: "hidden",
          opacity: disabled ? 0.55 : 1,
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: rS(14),
          paddingVertical: rV(13),
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        rowLast: {
          borderBottomWidth: 0,
        },
        rowText: {
          fontFamily: Fonts.text,
          fontSize: rMS(14),
          color: colors.text,
        },
      }),
    [colors, disabled],
  );

  return (
    <View style={styles.wrap}>
      {quickPrompts.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          style={[styles.row, index === quickPrompts.length - 1 ? styles.rowLast : null]}
          activeOpacity={0.72}
          disabled={disabled}
          onPress={() => onSelect(item.prompt)}
        >
          <Text style={styles.rowText}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={rMS(16)} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

type AssistantTypingIndicatorProps = {
  visible: boolean;
};

export function AssistantTypingIndicator({ visible }: AssistantTypingIndicatorProps) {
  return <ChatTypingIndicator visible={visible} variant="incoming" label="ODOS is typing" />;
}

function AssistantProductCarousel({ products }: { products: AssistantProduct[] }) {
  if (!products.length) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: rS(16),
        paddingTop: rV(8),
        paddingBottom: rV(4),
        gap: rS(12),
      }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          image={product.image_url ? { uri: product.image_url } : undefined}
          imageKey={product.image_key ?? undefined}
          imageUrl={product.image_url ?? undefined}
          title={product.title}
          category={product.category ?? undefined}
          price={product.price}
          oldPrice={product.old_price ?? undefined}
          discount={product.discount ?? undefined}
          rating={product.rating ?? undefined}
          cardWidth={rS(148)}
          horizontalSpacing={0}
          sourceScreen="assistant"
          storeId={product.store_id ?? undefined}
          trackingEvent="product_click"
        />
      ))}
    </ScrollView>
  );
}

function AssistantStoreCarousel({ stores }: { stores: AssistantStore[] }) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          paddingHorizontal: rS(16),
          paddingTop: rV(8),
          paddingBottom: rV(4),
          gap: rS(8),
        },
        card: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
          padding: rS(10),
          borderRadius: rMS(14),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        image: {
          width: rMS(44),
          height: rMS(44),
          borderRadius: rMS(12),
          backgroundColor: colors.surfaceMuted,
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
          marginTop: rV(2),
        },
      }),
    [colors],
  );

  if (!stores.length) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {stores.map((store) => (
        <TouchableOpacity
          key={store.id}
          style={styles.card}
          activeOpacity={0.78}
          onPress={() =>
            router.push({
              pathname: "/screens/stores/[id]",
              params: { id: store.id },
            } as any)
          }
        >
          {store.image_url ? (
            <Image source={{ uri: store.image_url }} style={styles.image} />
          ) : (
            <View style={styles.image} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {store.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {store.market_title || store.category || "Store on ODOS"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={rMS(16)} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

type AssistantFeedbackProps = {
  messageId: string;
  rating: number | null | undefined;
  onFeedback: (messageId: string, rating: number) => void;
};

function AssistantFeedbackRow({ messageId, rating, onFeedback }: AssistantFeedbackProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
          paddingHorizontal: rS(16),
          paddingTop: rV(4),
          paddingBottom: rV(2),
        },
        label: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
        },
        button: {
          padding: rS(4),
          borderRadius: 999,
          backgroundColor: colors.surfaceMuted,
        },
        buttonActive: {
          backgroundColor: colors.accentSoft,
        },
      }),
    [colors],
  );

  if (messageId === "welcome") {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Was this helpful?</Text>
      <TouchableOpacity
        style={[styles.button, rating === 1 ? styles.buttonActive : null]}
        onPress={() => onFeedback(messageId, 1)}
        accessibilityLabel="Helpful"
      >
        <Ionicons
          name={rating === 1 ? "thumbs-up" : "thumbs-up-outline"}
          size={rMS(14)}
          color={rating === 1 ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, rating === -1 ? styles.buttonActive : null]}
        onPress={() => onFeedback(messageId, -1)}
        accessibilityLabel="Not helpful"
      >
        <Ionicons
          name={rating === -1 ? "thumbs-down" : "thumbs-down-outline"}
          size={rMS(14)}
          color={rating === -1 ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

type AssistantMessageItemProps = {
  message: AssistantMessage;
  onFeedback?: (messageId: string, rating: number) => void;
};

export function AssistantMessageItem({ message, onFeedback }: AssistantMessageItemProps) {
  const chatStyles = useChatStyles();
  const { colors } = useTheme();
  const isUser = message.role === "user";

  const actionStyles = useMemo(
    () =>
      StyleSheet.create({
        actions: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: rS(8),
          marginTop: rV(6),
          paddingHorizontal: rS(16),
          maxWidth: "88%",
        },
        actionChip: {
          borderRadius: 999,
          paddingHorizontal: rS(12),
          paddingVertical: rV(6),
          backgroundColor: colors.accentSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        actionText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.primary,
        },
      }),
    [colors],
  );

  return (
    <>
      <View
        style={[
          chatStyles.messageRow,
          isUser ? chatStyles.messageRowMine : chatStyles.messageRowTheirs,
        ]}
      >
        <View
          style={[
            chatStyles.bubble,
            isUser ? chatStyles.bubbleMine : chatStyles.bubbleTheirs,
          ]}
        >
          <Text
            style={[
              chatStyles.bubbleText,
              { color: isUser ? "#FFFFFF" : colors.text },
            ]}
          >
            {message.content}
          </Text>
        </View>
      </View>
      {!isUser && message.products?.length ? (
        <AssistantProductCarousel products={message.products} />
      ) : null}
      {!isUser && message.stores?.length ? (
        <AssistantStoreCarousel stores={message.stores} />
      ) : null}
      {!isUser && message.suggestedActions?.length ? (
        <View style={[actionStyles.actions, { alignSelf: "flex-start" }]}>
          {message.suggestedActions.map((action) => (
            <TouchableOpacity
              key={`${message.id}-${action.route}-${action.label}`}
              style={actionStyles.actionChip}
              activeOpacity={0.75}
              onPress={() => navigateAssistantAction(action)}
            >
              <Text style={actionStyles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      {!isUser && onFeedback ? (
        <AssistantFeedbackRow
          messageId={message.id}
          rating={message.feedbackRating}
          onFeedback={onFeedback}
        />
      ) : null}
    </>
  );
}

type AssistantMessageListProps = {
  messages: AssistantMessage[];
  onFeedback?: (messageId: string, rating: number) => void;
};

export function AssistantMessageList({ messages, onFeedback }: AssistantMessageListProps) {
  return (
    <View style={{ paddingTop: rV(8), paddingBottom: rV(4) }}>
      {messages.map((message) => (
        <AssistantMessageItem key={message.id} message={message} onFeedback={onFeedback} />
      ))}
    </View>
  );
}
