import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  buildProductShareContent,
  copyProductShareLink,
  resolveSharePreviewImage,
  shareProduct,
  type ProductSharePayload,
} from "@/utils/shareCatalog";
import CommerceImage from "@/components/media/CommerceImage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ProductShareSheetProps = {
  visible: boolean;
  product: ProductSharePayload | null;
  previewImage?: ReturnType<typeof resolveSharePreviewImage>;
  onClose: () => void;
};

function ShareChannel({
  icon,
  label,
  tint,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <TouchableOpacity style={styles.channel} activeOpacity={0.88} onPress={onPress}>
      <View style={[styles.channelIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={rMS(20)} color={colors.onPrimary} />
      </View>
      <Text style={styles.channelLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ProductShareSheet({
  visible,
  product,
  previewImage,
  onClose,
}: ProductShareSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showSuccessToast, showInfoToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const content = useMemo(
    () => (product ? buildProductShareContent(product) : null),
    [product],
  );

  const imageSource = useMemo(() => {
    if (!product) {
      return undefined;
    }
    return resolveSharePreviewImage(product, previewImage);
  }, [previewImage, product]);

  const handleCopyLink = async () => {
    if (!product) {
      return;
    }

    setIsCopying(true);
    try {
      await copyProductShareLink(product);
      showSuccessToast("Link copied — paste it anywhere.");
    } catch {
      showInfoToast("Could not copy the link. Try again.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleShare = async () => {
    if (!product) {
      return;
    }

    setIsSharing(true);
    try {
      const result = await shareProduct(product);
      if (result.shared && !result.cancelled) {
        showSuccessToast("Shared from ODOS");
        onClose();
      }
    } catch {
      showInfoToast("Sharing was cancelled or unavailable.");
    } finally {
      setIsSharing(false);
    }
  };

  if (!product || !content) {
    return null;
  }

  const priceLabel =
    product.oldPrice && product.oldPrice > product.price
      ? `₵${product.price.toFixed(2)} · was ₵${product.oldPrice.toFixed(2)}`
      : `₵${product.price.toFixed(2)}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, rV(16)) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />

          <Text style={styles.sheetTitle}>Share this find</Text>
          <Text style={styles.sheetSubtitle}>
            Send the product photo, price, and ODOS link to Messages, Instagram, and more.
          </Text>

          <View style={styles.previewCard}>
            <LinearGradient
              colors={[colors.surfaceSubtle, colors.card]}
              style={StyleSheet.absoluteFillObject}
            />
            {imageSource ? (
              <CommerceImage
                source={imageSource}
                style={styles.previewImage}
                contentFit="cover"
                trackingId={`product-share-preview-${product.id}`}
                recyclingKey={product.imageUrl || product.id}
              />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Ionicons name="image-outline" size={rMS(28)} color={colors.iconMuted} />
              </View>
            )}
            <View style={styles.previewCopy}>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {product.title}
              </Text>
              <Text style={styles.previewMeta} numberOfLines={1}>
                {[product.category, priceLabel].filter(Boolean).join(" · ")}
              </Text>
              {product.storeName ? (
                <Text style={styles.previewStore} numberOfLines={1}>
                  from {product.storeName}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.linkCard}>
            <Ionicons name="link-outline" size={rMS(18)} color={colors.primary} />
            <Text style={styles.linkText} numberOfLines={2}>
              {content.shareLink}
            </Text>
          </View>

          <View style={styles.channelsRow}>
            <ShareChannel
              icon="chatbubble-ellipses-outline"
              label="Messages"
              tint="#2563EB"
              onPress={() => void handleShare()}
            />
            <ShareChannel
              icon="logo-instagram"
              label="Instagram"
              tint="#E1306C"
              onPress={() => void handleShare()}
            />
            <ShareChannel
              icon="ellipsis-horizontal"
              label="More"
              tint={colors.inverseSurface}
              onPress={() => void handleShare()}
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPress={() => void handleShare()}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={rMS(20)} color={colors.onPrimary} />
                <Text style={styles.primaryButtonText}>Share with photo & link</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.88}
            onPress={() => void handleCopyLink()}
            disabled={isCopying}
          >
            {isCopying ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons name="copy-outline" size={rMS(18)} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Copy link only</Text>
              </>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: rMS(28),
      borderTopRightRadius: rMS(28),
      paddingHorizontal: rS(20),
      paddingTop: rV(10),
    },
    handle: {
      alignSelf: "center",
      width: rS(44),
      height: rV(5),
      borderRadius: rS(999),
      backgroundColor: colors.border,
      marginBottom: rV(14),
    },
    sheetTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(20),
      color: colors.text,
    },
    sheetSubtitle: {
      marginTop: rV(6),
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(19),
      color: colors.textMuted,
    },
    previewCard: {
      marginTop: rV(18),
      flexDirection: "row",
      gap: rS(12),
      borderRadius: rMS(20),
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: rS(12),
    },
    previewImage: {
      width: rMS(88),
      height: rMS(88),
      borderRadius: rMS(16),
      backgroundColor: colors.imagePlaceholder,
    },
    previewPlaceholder: {
      width: rMS(88),
      height: rMS(88),
      borderRadius: rMS(16),
      backgroundColor: colors.imagePlaceholder,
      alignItems: "center",
      justifyContent: "center",
    },
    previewCopy: {
      flex: 1,
      justifyContent: "center",
      gap: rV(4),
    },
    previewTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(15),
      color: colors.text,
      lineHeight: rMS(20),
    },
    previewMeta: {
      fontFamily: Fonts.title,
      fontSize: rMS(13),
      color: colors.primary,
    },
    previewStore: {
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textMuted,
    },
    linkCard: {
      marginTop: rV(14),
      flexDirection: "row",
      alignItems: "center",
      gap: rS(10),
      backgroundColor: colors.surfaceSubtle,
      borderRadius: rMS(14),
      paddingHorizontal: rS(12),
      paddingVertical: rV(11),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    linkText: {
      flex: 1,
      fontFamily: Fonts.text,
      fontSize: rMS(12),
      color: colors.textSecondary,
    },
    channelsRow: {
      marginTop: rV(18),
      flexDirection: "row",
      justifyContent: "space-between",
      gap: rS(8),
    },
    channel: {
      flex: 1,
      alignItems: "center",
      gap: rV(6),
    },
    channelIcon: {
      width: rMS(48),
      height: rMS(48),
      borderRadius: rMS(16),
      alignItems: "center",
      justifyContent: "center",
    },
    channelLabel: {
      fontFamily: Fonts.title,
      fontSize: rMS(11),
      color: colors.text,
      textAlign: "center",
    },
    primaryButton: {
      marginTop: rV(20),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rS(8),
      backgroundColor: colors.primary,
      borderRadius: rMS(16),
      paddingVertical: rV(15),
    },
    primaryButtonText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14.5),
      color: colors.onPrimary,
    },
    secondaryButton: {
      marginTop: rV(10),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rS(8),
      paddingVertical: rV(12),
    },
    secondaryButtonText: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13.5),
      color: colors.primary,
    },
  });
}
