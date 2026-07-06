import ProductCard from "@/components/cards/ProductCard";
import { AnimatedChatMessageWrap, TypingDots } from "@/components/chat/ChatAnimations";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type {
  AssistantAction,
  AssistantMessage,
  AssistantProduct,
  AssistantStore,
} from "@/types/assistant";
import { getAssistantQuickPrompts } from "@/utils/assistantQuickPrompts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  ZoomIn,
} from "react-native-reanimated";
import {
  AssistantAvatar,
  AssistantSectionLabel,
  AssistantStreamingCursor,
} from "@/components/assistant/AssistantAnimations";

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

function formatMessageTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function promptIcon(label: string): keyof typeof Ionicons.glyphMap {
  const text = label.toLowerCase();
  if (text.includes("order") || text.includes("track")) return "cube-outline";
  if (text.includes("voucher") || text.includes("deal")) return "pricetag-outline";
  if (text.includes("delivery")) return "bicycle-outline";
  if (text.includes("return")) return "return-down-back-outline";
  if (text.includes("checkout") || text.includes("cart")) return "bag-handle-outline";
  if (text.includes("wallet") || text.includes("payout")) return "wallet-outline";
  if (text.includes("help") || text.includes("yes")) return "sparkles-outline";
  return "chatbubble-ellipses-outline";
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
          marginTop: rV(8),
          marginBottom: rV(14),
          gap: rV(10),
        },
        titleRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          paddingHorizontal: rS(16),
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.textMuted,
          paddingHorizontal: rS(16),
        },
        scrollContent: {
          paddingHorizontal: rS(16),
          gap: rS(10),
          paddingVertical: rV(2),
        },
        chip: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          paddingHorizontal: rS(14),
          paddingVertical: rV(11),
          borderRadius: rMS(18),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
          opacity: disabled ? 0.55 : 1,
        },
        chipPrimary: {
          backgroundColor: colors.accentSoft,
          borderColor: colors.primary,
        },
        chipText: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          color: colors.text,
        },
        chipTextPrimary: {
          fontFamily: Fonts.titleBold,
          color: colors.primary,
        },
      }),
    [colors, disabled],
  );

  return (
    <View style={styles.wrap}>
      <Reanimated.View entering={FadeInDown.duration(280)} style={styles.titleRow}>
        <Ionicons name="flash-outline" size={rMS(16)} color={colors.primary} />
        <Text style={styles.title}>Quick questions</Text>
      </Reanimated.View>
      <Text style={styles.subtitle}>Tap one to get started instantly</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {quickPrompts.map((item, index) => {
          const isPrimary = index === 0 && Boolean(nudgePrompt);
          return (
            <Reanimated.View
              key={item.label}
              entering={FadeInRight.delay(index * 70).springify().damping(18)}
            >
              <Pressable
                style={[styles.chip, isPrimary ? styles.chipPrimary : null]}
                disabled={disabled}
                onPress={() => onSelect(item.prompt)}
              >
                <Ionicons
                  name={promptIcon(item.label)}
                  size={rMS(16)}
                  color={isPrimary ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.chipText, isPrimary ? styles.chipTextPrimary : null]}>
                  {item.label}
                </Text>
              </Pressable>
            </Reanimated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

type AssistantTypingIndicatorProps = {
  visible: boolean;
};

export function AssistantTypingIndicator({ visible }: AssistantTypingIndicatorProps) {
  const { colors } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <Reanimated.View
      entering={FadeIn.duration(180)}
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: rS(8),
        paddingHorizontal: rS(16),
        paddingVertical: rV(6),
      }}
    >
      <AssistantAvatar size={rMS(28)} pulse />
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: rMS(18),
          borderBottomLeftRadius: rMS(6),
          paddingHorizontal: rS(16),
          paddingVertical: rV(12),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          minWidth: rS(72),
        }}
      >
        <TypingDots color={colors.textMuted} />
        <Text
          style={{
            marginTop: rV(4),
            fontFamily: Fonts.text,
            fontSize: rMS(10),
            color: colors.textMuted,
            textAlign: "center",
          }}
        >
          ODOS is thinking
        </Text>
      </View>
    </Reanimated.View>
  );
}

function AssistantProductCarousel({ products }: { products: AssistantProduct[] }) {
  if (!products.length) {
    return null;
  }

  return (
    <Reanimated.View entering={FadeInDown.delay(60).duration(280)}>
      <AssistantSectionLabel label="Suggested for you" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: rS(16),
          paddingTop: rV(4),
          paddingBottom: rV(6),
          gap: rS(12),
        }}
      >
        {products.map((product, index) => (
          <Reanimated.View
            key={product.id}
            entering={ZoomIn.delay(index * 55).springify().damping(16)}
          >
            <ProductCard
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
          </Reanimated.View>
        ))}
      </ScrollView>
    </Reanimated.View>
  );
}

function AssistantStoreCarousel({ stores }: { stores: AssistantStore[] }) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          paddingHorizontal: rS(16),
          paddingTop: rV(4),
          paddingBottom: rV(6),
          gap: rS(8),
        },
        card: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
          padding: rS(12),
          borderRadius: rMS(16),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        image: {
          width: rMS(48),
          height: rMS(48),
          borderRadius: rMS(14),
          backgroundColor: colors.surfaceMuted,
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13.5),
          color: colors.text,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
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
    <Reanimated.View entering={FadeInDown.delay(60).duration(280)}>
      <AssistantSectionLabel label="Matching stores" />
      <View style={styles.wrap}>
        {stores.map((store, index) => (
          <Reanimated.View key={store.id} entering={FadeInRight.delay(index * 50).duration(240)}>
            <Pressable
              style={styles.card}
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
              <Ionicons name="arrow-forward-circle" size={rMS(22)} color={colors.primary} />
            </Pressable>
          </Reanimated.View>
        ))}
      </View>
    </Reanimated.View>
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
          gap: rS(8),
          marginLeft: rS(52),
          marginTop: rV(4),
          marginBottom: rV(2),
        },
        label: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: colors.textMuted,
          marginRight: rS(2),
        },
        button: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
          paddingHorizontal: rS(10),
          paddingVertical: rV(6),
          borderRadius: 999,
          backgroundColor: colors.surfaceMuted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        buttonActive: {
          backgroundColor: colors.accentSoft,
          borderColor: colors.primary,
        },
        buttonText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10.5),
          color: colors.textMuted,
        },
        buttonTextActive: {
          color: colors.primary,
        },
      }),
    [colors],
  );

  if (messageId === "welcome") {
    return null;
  }

  return (
    <Reanimated.View entering={FadeIn.delay(120).duration(220)} style={styles.row}>
      <Text style={styles.label}>Helpful?</Text>
      <Pressable
        style={[styles.button, rating === 1 ? styles.buttonActive : null]}
        onPress={() => onFeedback(messageId, 1)}
      >
        <Ionicons
          name={rating === 1 ? "thumbs-up" : "thumbs-up-outline"}
          size={rMS(13)}
          color={rating === 1 ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.buttonText, rating === 1 ? styles.buttonTextActive : null]}>Yes</Text>
      </Pressable>
      <Pressable
        style={[styles.button, rating === -1 ? styles.buttonActive : null]}
        onPress={() => onFeedback(messageId, -1)}
      >
        <Ionicons
          name={rating === -1 ? "thumbs-down" : "thumbs-down-outline"}
          size={rMS(13)}
          color={rating === -1 ? colors.primary : colors.textMuted}
        />
        <Text style={[styles.buttonText, rating === -1 ? styles.buttonTextActive : null]}>No</Text>
      </Pressable>
    </Reanimated.View>
  );
}

function AssistantActionChips({ message, actions }: { message: AssistantMessage; actions: AssistantAction[] }) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          marginTop: rV(8),
          marginBottom: rV(2),
        },
        content: {
          paddingHorizontal: rS(16),
          paddingLeft: rS(52),
          gap: rS(8),
        },
        chip: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          borderRadius: 999,
          paddingHorizontal: rS(14),
          paddingVertical: rV(8),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primary,
        },
        chipText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.primary,
        },
      }),
    [colors],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {actions.map((action, index) => (
        <Reanimated.View key={`${message.id}-${action.label}`} entering={FadeInRight.delay(index * 45)}>
          <Pressable style={styles.chip} onPress={() => navigateAssistantAction(action)}>
            <Text style={styles.chipText}>{action.label}</Text>
            <Ionicons name="arrow-forward" size={rMS(12)} color={colors.primary} />
          </Pressable>
        </Reanimated.View>
      ))}
    </ScrollView>
  );
}

type AssistantMessageItemProps = {
  message: AssistantMessage;
  onFeedback?: (messageId: string, rating: number) => void;
  isStreaming?: boolean;
  showAvatar?: boolean;
};

export function AssistantMessageItem({
  message,
  onFeedback,
  isStreaming = false,
  showAvatar = true,
}: AssistantMessageItemProps) {
  const { colors } = useTheme();
  const isUser = message.role === "user";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "flex-end",
          gap: rS(8),
          paddingHorizontal: rS(16),
          paddingVertical: rV(4),
        },
        rowMine: {
          justifyContent: "flex-end",
        },
        bubbleColumn: {
          maxWidth: "78%",
          gap: rV(4),
        },
        bubbleColumnMine: {
          alignItems: "flex-end",
        },
        assistantBubble: {
          overflow: "hidden",
          borderBottomLeftRadius: rMS(6),
          borderBottomRightRadius: rMS(18),
          borderTopLeftRadius: rMS(18),
          borderTopRightRadius: rMS(18),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        },
        assistantGradient: {
          paddingHorizontal: rS(14),
          paddingVertical: rV(11),
        },
        userBubble: {
          backgroundColor: colors.primary,
          borderBottomLeftRadius: rMS(18),
          borderBottomRightRadius: rMS(6),
          borderTopLeftRadius: rMS(18),
          borderTopRightRadius: rMS(18),
          paddingHorizontal: rS(14),
          paddingVertical: rV(11),
          shadowColor: colors.primary,
          shadowOpacity: 0.22,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        },
        text: {
          fontFamily: Fonts.text,
          fontSize: rMS(14.5),
          lineHeight: rMS(21),
        },
        meta: {
          fontFamily: Fonts.text,
          fontSize: rMS(10),
          color: colors.textMuted,
          paddingHorizontal: rS(4),
        },
        textRow: {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-end",
        },
      }),
    [colors],
  );

  const bubble = (
    <View style={[styles.bubbleColumn, isUser ? styles.bubbleColumnMine : null]}>
      {isUser ? (
        <View style={styles.userBubble}>
          <Text style={[styles.text, { color: "#FFFFFF" }]}>{message.content}</Text>
        </View>
      ) : (
        <View style={styles.assistantBubble}>
          <LinearGradient
            colors={["#FFFFFF", colors.accentSoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.assistantGradient}
          >
            <View style={styles.textRow}>
              <Text style={[styles.text, { color: colors.text }]}>{message.content}</Text>
              <AssistantStreamingCursor visible={isStreaming && Boolean(message.content)} />
            </View>
          </LinearGradient>
        </View>
      )}
      <Text style={[styles.meta, isUser ? { textAlign: "right" } : null]}>
        {formatMessageTime(message.createdAt)}
      </Text>
    </View>
  );

  return (
    <>
      <AnimatedChatMessageWrap isMine={isUser}>
        <View style={[styles.row, isUser ? styles.rowMine : null]}>
          {!isUser && showAvatar ? <AssistantAvatar size={rMS(32)} /> : null}
          {!isUser && !showAvatar ? <View style={{ width: rMS(32) }} /> : null}
          {bubble}
        </View>
      </AnimatedChatMessageWrap>
      {!isUser && message.products?.length ? (
        <AssistantProductCarousel products={message.products} />
      ) : null}
      {!isUser && message.stores?.length ? (
        <AssistantStoreCarousel stores={message.stores} />
      ) : null}
      {!isUser && message.suggestedActions?.length ? (
        <AssistantActionChips message={message} actions={message.suggestedActions} />
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
  streamingMessageId?: string | null;
};

export function AssistantMessageList({
  messages,
  onFeedback,
  streamingMessageId,
}: AssistantMessageListProps) {
  return (
    <View style={{ paddingTop: rV(8), paddingBottom: rV(4) }}>
      {messages.map((message) => (
        <AssistantMessageItem
          key={message.id}
          message={message}
          onFeedback={onFeedback}
          isStreaming={message.id === streamingMessageId}
        />
      ))}
    </View>
  );
}
