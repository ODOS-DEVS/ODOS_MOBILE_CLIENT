import ProductCard from "@/components/cards/ProductCard";
import {
  AnimatedChatMessageWrap,
  CHAT_FADE_IN_MS,
  CHAT_FADE_OUT_MS,
  TypingDots,
} from "@/components/chat/ChatAnimations";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { productCardGapX, rMS, rS, rV } from "@/styles/responsive";
import type {
  AssistantAction,
  AssistantMessage,
  AssistantProduct,
  AssistantReferenceContext,
  AssistantStore,
} from "@/types/assistant";
import { getAssistantQuickPrompts } from "@/utils/assistantQuickPrompts";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Pressable as GesturePressable } from "react-native-gesture-handler";
import Reanimated from "react-native-reanimated";
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
  context?: AssistantReferenceContext | null;
};

export function AssistantQuickPrompts({
  onSelect,
  disabled = false,
  screen,
  nudgePrompt,
  context = null,
}: AssistantQuickPromptsProps) {
  const { colors } = useTheme();
  const quickPrompts = useMemo(() => {
    const base = getAssistantQuickPrompts(screen, context);
    if (nudgePrompt?.trim()) {
      return [{ label: "Yes, help me with that", prompt: nudgePrompt.trim() }, ...base.slice(0, 3)];
    }
    return base;
  }, [context, nudgePrompt, screen]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: rV(6),
          marginBottom: rV(10),
          paddingHorizontal: rS(16),
          gap: rV(8),
        },
        grid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: rS(8),
        },
        chip: {
          width: "48.5%",
          minHeight: rV(48),
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          paddingHorizontal: rS(12),
          paddingVertical: rV(11),
          borderRadius: rMS(16),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          opacity: disabled ? 0.55 : 1,
          shadowColor: colors.shadow,
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        },
        chipPrimary: {
          width: "100%",
          backgroundColor: colors.accentSoft,
          borderColor: colors.primary,
        },
        chipText: {
          flex: 1,
          fontFamily: Fonts.text,
          fontSize: rMS(12.5),
          lineHeight: rMS(17),
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
      <AssistantSectionLabel label="Try asking" />
      <View style={styles.grid}>
        {quickPrompts.map((item, index) => {
          const isPrimary = index === 0 && Boolean(nudgePrompt);
          return (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.chip,
                isPrimary ? styles.chipPrimary : null,
                pressed && !disabled ? { opacity: 0.82 } : null,
              ]}
              disabled={disabled}
              onPress={() => onSelect(item.prompt)}
            >
              <Ionicons
                name={promptIcon(item.label)}
                size={rMS(15)}
                color={isPrimary ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.chipText, isPrimary ? styles.chipTextPrimary : null]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: rS(8),
        paddingHorizontal: rS(16),
        paddingTop: rV(2),
        paddingBottom: rV(4),
      }}
    >
      <AssistantAvatar size={rMS(28)} pulse />
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: rMS(18),
          borderBottomLeftRadius: rMS(6),
          paddingHorizontal: rS(14),
          paddingVertical: rV(11),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        }}
      >
        <TypingDots color={colors.textMuted} />
      </View>
    </Reanimated.View>
  );
}

function AssistantProductCarousel({ products }: { products: AssistantProduct[] }) {
  if (!products.length) {
    return null;
  }

  return (
    <View>
      <AssistantSectionLabel label="Suggested for you" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: rS(16),
          paddingTop: rV(4),
          paddingBottom: rV(6),
          gap: productCardGapX(),
        }}
      >
        {products.map((product) => (
          <View key={product.id}>
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
          </View>
        ))}
      </ScrollView>
    </View>
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
          borderRadius: rMS(14),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
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
    <View>
      <AssistantSectionLabel label="Matching stores" />
      <View style={styles.wrap}>
        {stores.map((store) => (
          <View key={store.id}>
            <Pressable
              style={({ pressed }) => [styles.card, pressed ? { opacity: 0.88 } : null]}
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
          </View>
        ))}
      </View>
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
    <View style={styles.row}>
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
    </View>
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
      {actions.map((action) => (
        <View key={`${message.id}-${action.label}`}>
          <Pressable style={({ pressed }) => [styles.chip, pressed ? { opacity: 0.86 } : null]} onPress={() => navigateAssistantAction(action)}>
            <Text style={styles.chipText}>{action.label}</Text>
            <Ionicons name="arrow-forward" size={rMS(12)} color={colors.primary} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

type AssistantCopyFeedbackProps = {
  visible: boolean;
};

export function AssistantCopyFeedback({ visible }: AssistantCopyFeedbackProps) {
  if (!visible) {
    return null;
  }

  return (
    <Reanimated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: rV(96),
        alignItems: "center",
        zIndex: 30,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingHorizontal: rS(14),
          paddingVertical: rV(8),
          borderRadius: 999,
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          shadowColor: "#000000",
          shadowOpacity: 0.18,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Ionicons name="checkmark" size={rMS(14)} color="#FFFFFF" />
        <Text
          style={{
            fontFamily: Fonts.titleBold,
            fontSize: rMS(13),
            color: "#FFFFFF",
            letterSpacing: 0.2,
          }}
        >
          Copied
        </Text>
      </View>
    </Reanimated.View>
  );
}

type CopyableMessageBubbleProps = {
  children: React.ReactNode;
  enabled: boolean;
  onCopy: () => void;
  style: StyleProp<ViewStyle>;
};

function CopyableMessageBubble({
  children,
  enabled,
  onCopy,
  style,
}: CopyableMessageBubbleProps) {
  const handleLongPress = useCallback(() => {
    if (!enabled) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCopy();
  }, [enabled, onCopy]);

  return (
    <GesturePressable
      onLongPress={handleLongPress}
      delayLongPress={400}
      disabled={!enabled}
      style={({ pressed }) => [style, enabled && pressed ? { opacity: 0.88 } : null]}
      accessibilityRole="button"
      accessibilityHint="Long press to copy"
    >
      {children}
    </GesturePressable>
  );
}

type AssistantMessageItemProps = {
  message: AssistantMessage;
  onFeedback?: (messageId: string, rating: number) => void;
  onCopied?: () => void;
  isStreaming?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  compactTop?: boolean;
  animate?: boolean;
};

export function AssistantMessageItem({
  message,
  onFeedback,
  onCopied,
  isStreaming = false,
  showAvatar = true,
  showTimestamp = true,
  compactTop = false,
  animate = true,
}: AssistantMessageItemProps) {
  const { colors } = useTheme();
  const isUser = message.role === "user";
  const canCopy = Boolean(message.content.trim()) && !isStreaming;

  const copyMessage = useCallback(() => {
    const text = message.content.trim();
    if (!text) {
      return;
    }
    void Clipboard.setStringAsync(text).then(() => {
      onCopied?.();
    });
  }, [message.content, onCopied]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "flex-end",
          gap: rS(8),
          paddingHorizontal: rS(16),
          paddingTop: compactTop ? rV(1) : rV(6),
          paddingBottom: rV(2),
        },
        rowMine: {
          justifyContent: "flex-end",
        },
        bubbleColumn: {
          maxWidth: "80%",
          gap: rV(3),
        },
        bubbleColumnMine: {
          alignItems: "flex-end",
        },
        assistantBubble: {
          backgroundColor: colors.card,
          borderBottomLeftRadius: rMS(6),
          borderBottomRightRadius: rMS(18),
          borderTopLeftRadius: rMS(18),
          borderTopRightRadius: rMS(18),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
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
    [colors, compactTop],
  );

  const bubble = (
    <View style={[styles.bubbleColumn, isUser ? styles.bubbleColumnMine : null]}>
      {isUser ? (
        <CopyableMessageBubble
          enabled={canCopy}
          onCopy={copyMessage}
          style={styles.userBubble}
        >
          <Text style={[styles.text, { color: "#FFFFFF" }]}>{message.content}</Text>
        </CopyableMessageBubble>
      ) : (
        <CopyableMessageBubble
          enabled={canCopy}
          onCopy={copyMessage}
          style={styles.assistantBubble}
        >
          <View style={styles.textRow}>
            <Text style={[styles.text, { color: colors.text }]}>{message.content}</Text>
            <AssistantStreamingCursor visible={isStreaming && Boolean(message.content)} />
          </View>
        </CopyableMessageBubble>
      )}
      {showTimestamp ? (
        <Text style={[styles.meta, isUser ? { textAlign: "right" } : null]}>
          {formatMessageTime(message.createdAt)}
        </Text>
      ) : null}
    </View>
  );

  return (
    <>
      <AnimatedChatMessageWrap isMine={isUser} animate={animate}>
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
  onCopied?: () => void;
  streamingMessageId?: string | null;
};

export function AssistantMessageList({
  messages,
  onFeedback,
  onCopied,
  streamingMessageId,
}: AssistantMessageListProps) {
  return (
    <View style={{ paddingTop: rV(8), paddingBottom: rV(4) }}>
      {messages.map((message) => (
        <AssistantMessageItem
          key={message.id}
          message={message}
          onFeedback={onFeedback}
          onCopied={onCopied}
          isStreaming={message.id === streamingMessageId}
        />
      ))}
    </View>
  );
}

type AssistantWelcomeHeroProps = {
  signedIn: boolean;
  aiEnabled: boolean;
  context?: AssistantReferenceContext | null;
};

export function AssistantContextChip({
  context,
}: {
  context?: AssistantReferenceContext | null;
}) {
  const { colors } = useTheme();
  if (!context?.store_id) {
    return null;
  }

  const label = context.store_name?.trim() || "This store";

  return (
    <View
      style={{
        marginHorizontal: rS(16),
        marginTop: rV(8),
        marginBottom: rV(2),
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: rS(6),
        paddingHorizontal: rS(10),
        paddingVertical: rV(7),
        borderRadius: 999,
        backgroundColor: colors.accentSoft,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.cardBorder,
        maxWidth: "92%",
      }}
    >
      <Ionicons name="storefront-outline" size={rMS(13)} color={colors.primary} />
      <Text
        numberOfLines={1}
        style={{
          flexShrink: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11.5),
          color: colors.primary,
        }}
      >
        Asking about {label}
      </Text>
    </View>
  );
}

export function AssistantWelcomeHero({
  signedIn,
  aiEnabled,
  context = null,
}: AssistantWelcomeHeroProps) {
  const { colors } = useTheme();
  const storeName = context?.store_name?.trim();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginHorizontal: rS(16),
          marginTop: rV(10),
          marginBottom: rV(6),
          padding: rS(16),
          borderRadius: rMS(20),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          gap: rV(10),
          shadowColor: colors.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
        },
        copy: {
          flex: 1,
          gap: rV(4),
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(16),
          color: colors.text,
        },
        text: {
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(19),
          color: colors.textMuted,
        },
        pill: {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingHorizontal: rS(10),
          paddingVertical: rV(6),
          borderRadius: 999,
          backgroundColor: colors.accentSoft,
        },
        pillText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11),
          color: colors.primary,
        },
      }),
    [colors],
  );

  const helperText = storeName
    ? `I'll keep recommendations and answers focused on ${storeName} unless you ask about other stores.`
    : aiEnabled
      ? signedIn
        ? "Ask about orders, delivery, vouchers, stores, or account help."
        : "Browse help now, or sign in for answers tied to your account."
      : "Guided help is available while AI features are being set up.";

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <AssistantAvatar size={rMS(42)} />
        <View style={styles.copy}>
          <Text style={styles.title}>
            {storeName ? `Help with ${storeName}` : "Hi, I'm ODOS Assistant"}
          </Text>
          <Text style={styles.text}>{helperText}</Text>
        </View>
      </View>
      <View style={styles.pill}>
        <Ionicons
          name={
            storeName
              ? "storefront-outline"
              : aiEnabled
                ? "sparkles-outline"
                : "book-outline"
          }
          size={rMS(12)}
          color={colors.primary}
        />
        <Text style={styles.pillText}>
          {storeName
            ? "Store-focused answers"
            : aiEnabled
              ? "Personal shopping help"
              : "Guided answers"}
        </Text>
      </View>
    </View>
  );
}

type AssistantEscalationBannerProps = {
  onOpenSupport: () => void;
};

export function AssistantEscalationBanner({
  onOpenSupport,
}: AssistantEscalationBannerProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginHorizontal: rS(16),
          marginTop: rV(8),
          marginBottom: rV(4),
          padding: rS(14),
          borderRadius: rMS(16),
          backgroundColor: colors.infoSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.infoBorder,
          gap: rV(8),
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
        },
        title: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.infoText,
        },
        text: {
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          lineHeight: rMS(18),
          color: colors.textSecondary,
        },
        button: {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          paddingHorizontal: rS(12),
          paddingVertical: rV(8),
          borderRadius: 999,
          backgroundColor: colors.card,
        },
        buttonText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.primary,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Ionicons name="headset-outline" size={rMS(16)} color={colors.infoText} />
        <Text style={styles.title}>Human support recommended</Text>
      </View>
      <Text style={styles.text}>
        This conversation may need the ODOS team. Continue here or open a support
        chat and we{"'"}ll pick up from your account.
      </Text>
      <Pressable style={styles.button} onPress={onOpenSupport}>
        <Text style={styles.buttonText}>Open support chat</Text>
        <Ionicons name="arrow-forward" size={rMS(12)} color={colors.primary} />
      </Pressable>
    </View>
  );
}
