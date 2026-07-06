import { AccountActionButton } from "@/components/account/AccountUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { ManagedStoreProfile } from "@/types/store";
import {
  buildStoreShareContent,
  copyStoreShareLink,
  shareStore,
} from "@/utils/shareStore";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type VendorStoreShareSheetProps = {
  store: ManagedStoreProfile;
  visible: boolean;
  onClose: () => void;
};

export default function VendorStoreShareSheet({
  store,
  visible,
  onClose,
}: VendorStoreShareSheetProps) {
  const { colors, isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const content = useMemo(
    () =>
      buildStoreShareContent({
        id: store.id,
        name: store.name,
        slug: store.slug,
        category: store.category,
        city: store.city,
        region: store.region,
      }),
    [store],
  );

  const handleCopy = async () => {
    await copyStoreShareLink({
      id: store.id,
      name: store.name,
      slug: store.slug,
      category: store.category,
      city: store.city,
      region: store.region,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    await shareStore({
      id: store.id,
      name: store.name,
      slug: store.slug,
      category: store.category,
      city: store.city,
      region: store.region,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? colors.card : "#FFFFFF",
              borderColor: colors.cardBorder,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Share storefront</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <Ionicons name="close" size={rMS(22)} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.body, { color: colors.textMuted }]}>
            Share your ODOS store link or let shoppers scan the QR code in your shop.
          </Text>

          <View style={[styles.qrShell, { borderColor: colors.cardBorder }]}>
            <Image source={{ uri: content.qrImageUrl }} style={styles.qrImage} />
          </View>

          <Text style={[styles.link, { color: colors.textSecondary }]} numberOfLines={2}>
            {content.shareLink}
          </Text>

          <View style={styles.actions}>
            <AccountActionButton
              label={copied ? "Link copied" : "Copy link"}
              variant="secondary"
              onPress={() => void handleCopy()}
            />
            <AccountActionButton label="Share link" variant="primary" onPress={() => void handleShare()} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
    padding: rS(16),
  },
  sheet: {
    borderRadius: rMS(20),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(18),
    paddingTop: rV(18),
    paddingBottom: rV(22),
    gap: rV(12),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
  },
  body: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
  },
  qrShell: {
    alignSelf: "center",
    padding: rS(12),
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: "#FFFFFF",
  },
  qrImage: {
    width: rMS(200),
    height: rMS(200),
  },
  link: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    textAlign: "center",
  },
  actions: {
    gap: rV(10),
  },
});
