import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useToast } from "@/context/ToastContext";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  buildProductShareContent,
  copyProductShareLink,
  resolveSharePreviewImage,
  shareProduct,
  type ProductSharePayload,
} from "@/utils/shareCatalog";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  return (
    <TouchableOpacity style={styles.channel} activeOpacity={0.88} onPress={onPress}>
      <View style={[styles.channelIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={rMS(20)} color="#FFFFFF" />
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
              colors={["#F8FAFC", "#FFFFFF"]}
              style={StyleSheet.absoluteFillObject}
            />
            {imageSource ? (
              <Image source={imageSource} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Ionicons name="image-outline" size={rMS(28)} color="#94A3B8" />
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
            <Ionicons name="link-outline" size={rMS(18)} color={AppColors.primary} />
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
              tint="#374151"
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
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={rMS(20)} color="#FFFFFF" />
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
              <ActivityIndicator color={AppColors.primary} />
            ) : (
              <>
                <Ionicons name="copy-outline" size={rMS(18)} color={AppColors.primary} />
                <Text style={styles.secondaryButtonText}>Copy link only</Text>
              </>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#D1D5DB",
    marginBottom: rV(14),
  },
  sheetTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
    color: "#111827",
  },
  sheetSubtitle: {
    marginTop: rV(6),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
    color: AppColors.secondary,
  },
  previewCard: {
    marginTop: rV(18),
    flexDirection: "row",
    gap: rS(12),
    borderRadius: rMS(20),
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    padding: rS(12),
  },
  previewImage: {
    width: rMS(88),
    height: rMS(88),
    borderRadius: rMS(16),
    backgroundColor: "#F3F4F6",
  },
  previewPlaceholder: {
    width: rMS(88),
    height: rMS(88),
    borderRadius: rMS(16),
    backgroundColor: "#F3F4F6",
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
    color: "#111827",
    lineHeight: rMS(20),
  },
  previewMeta: {
    fontFamily: Fonts.title,
    fontSize: rMS(13),
    color: AppColors.primary,
  },
  previewStore: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: AppColors.secondary,
  },
  linkCard: {
    marginTop: rV(14),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    backgroundColor: "#F8FAFC",
    borderRadius: rMS(14),
    paddingHorizontal: rS(12),
    paddingVertical: rV(11),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  linkText: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#4B5563",
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
    color: AppColors.text,
    textAlign: "center",
  },
  primaryButton: {
    marginTop: rV(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
    backgroundColor: AppColors.primary,
    borderRadius: rMS(16),
    paddingVertical: rV(15),
  },
  primaryButtonText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14.5),
    color: "#FFFFFF",
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
    color: AppColors.primary,
  },
});
