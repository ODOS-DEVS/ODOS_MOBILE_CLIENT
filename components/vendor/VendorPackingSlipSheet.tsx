import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { VendorOrder } from "@/types/store";
import { buildVendorPackingSlip } from "@/utils/vendorOrderFulfillment";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * The picking list for one order, ready to read off a shelf or hand to a packer.
 *
 * Fulfilment is a physical job, and the queue screen was built entirely for
 * the digital half of it: a vendor could advance an order's status but had
 * nowhere to see, in one glance, the quantities and variants they were
 * supposed to put in the box. They were reading them off the order detail
 * screen, scrolling past the timeline each time.
 *
 * Plain text and the OS share sheet rather than a generated PDF, because the
 * real destinations are WhatsApp (to a packer or a rider), the clipboard, and
 * thermal-printer apps — all of which take text and none of which need
 * layout. It also means no file is written to disk for a document that is
 * obsolete in ten minutes.
 */
export default function VendorPackingSlipSheet({
  order,
  onClose,
}: {
  /** The order to pick; null closes the sheet. */
  order: VendorOrder | null;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const slip = useMemo(() => (order ? buildVendorPackingSlip(order) : ""), [order]);

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(slip);
      showToast("Packing slip copied.", "success");
    } catch {
      showToast("We couldn't copy the packing slip.", "error");
    }
  };

  const share = async () => {
    try {
      await Share.share(
        Platform.OS === "ios"
          ? { message: slip }
          : { message: slip, title: `Order ${order?.orderNumber ?? ""}` },
      );
    } catch {
      // A dismissed share sheet is not a failure worth reporting.
    }
  };

  return (
    <Modal
      visible={order !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, rV(16)) }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title} numberOfLines={1}>
              Packing slip
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {order?.orderNumber ?? ""}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} activeOpacity={0.75} hitSlop={8}>
            <Ionicons name="close" size={rMS(21)} color={colors.iconMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.slipScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.slipText} selectable>
            {slip}
          </Text>
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.ghostButton}
            activeOpacity={0.75}
            onPress={() => void copy()}
          >
            <Ionicons name="copy-outline" size={rMS(15)} color={colors.text} />
            <Text style={styles.ghostLabel}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.solidButton}
            activeOpacity={0.8}
            onPress={() => void share()}
          >
            <Ionicons
              name="share-outline"
              size={rMS(15)}
              color={colors.onInverseSurface}
            />
            <Text style={styles.solidLabel}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: colors.backdrop },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: rMS(22),
      borderTopRightRadius: rMS(22),
      paddingHorizontal: rS(20),
      paddingTop: rV(10),
      gap: rV(12),
      maxHeight: "80%",
    },
    handle: {
      alignSelf: "center",
      width: rS(42),
      height: rV(4),
      borderRadius: 999,
      backgroundColor: colors.cardBorder,
    },
    header: { flexDirection: "row", alignItems: "center", gap: rS(10) },
    headerCopy: { flex: 1, gap: rV(2) },
    title: { fontFamily: Fonts.titleBold, fontSize: rMS(17), color: colors.text },
    subtitle: { fontFamily: Fonts.text, fontSize: rMS(12), color: colors.textMuted },

    slipScroll: {
      borderRadius: rMS(12),
      backgroundColor: colors.surfaceSubtle,
    },
    slipText: {
      padding: rS(14),
      // Monospace keeps the quantity column aligned down the list, which is
      // what makes it scannable while packing.
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: rMS(12),
      lineHeight: rMS(19),
      color: colors.text,
    },

    actions: { flexDirection: "row", alignItems: "center", gap: rS(10) },
    ghostButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rS(6),
      paddingHorizontal: rS(18),
      paddingVertical: rV(13),
      borderRadius: rMS(11),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    ghostLabel: { fontFamily: Fonts.titleBold, fontSize: rMS(13), color: colors.text },
    solidButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rS(6),
      paddingVertical: rV(13),
      borderRadius: rMS(11),
      backgroundColor: colors.inverseSurface,
    },
    solidLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.onInverseSurface,
    },
  });
}
