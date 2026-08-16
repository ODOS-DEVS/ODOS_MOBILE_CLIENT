import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatAttachmentSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPickPhoto: () => void;
  onPickDocument: () => void;
};

export default function ChatAttachmentSheet({
  visible,
  onClose,
  onPickPhoto,
  onPickDocument,
}: ChatAttachmentSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, justifyContent: "flex-end" },
        backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.backdrop },
        sheet: {
          backgroundColor: colors.card,
          borderTopLeftRadius: rMS(22),
          borderTopRightRadius: rMS(22),
          paddingHorizontal: rS(16),
          paddingTop: rV(10),
          paddingBottom: insets.bottom + rV(16),
        },
        handle: {
          alignSelf: "center",
          width: rS(40),
          height: rV(4),
          borderRadius: rS(2),
          backgroundColor: colors.border,
          marginBottom: rV(14),
        },
        option: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(14),
          paddingVertical: rV(14),
          paddingHorizontal: rS(6),
        },
        iconShell: {
          width: rS(42),
          height: rS(42),
          borderRadius: rS(21),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.surfaceMuted,
        },
        optionText: {
          fontFamily: Fonts.title,
          fontSize: rMS(14.5),
          color: colors.text,
        },
      }),
    [colors, insets.bottom],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root} pointerEvents="box-none">
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Pressable
            style={styles.option}
            onPress={() => {
              onClose();
              onPickPhoto();
            }}
          >
            <View style={styles.iconShell}>
              <Ionicons name="image-outline" size={rMS(20)} color={colors.text} />
            </View>
            <Text style={styles.optionText}>Photo</Text>
          </Pressable>
          <Pressable
            style={styles.option}
            onPress={() => {
              onClose();
              onPickDocument();
            }}
          >
            <View style={styles.iconShell}>
              <Ionicons name="document-attach-outline" size={rMS(20)} color={colors.text} />
            </View>
            <Text style={styles.optionText}>Document</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
