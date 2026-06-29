import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AppReviewPromptProps = {
  visible: boolean;
  title?: string;
  message?: string;
  onRate: () => void;
  onDismiss: () => void;
};

export function AppReviewPrompt({
  visible,
  title = "Enjoying ODOS?",
  message = "A quick App Store rating helps more shoppers discover local sellers on ODOS.",
  onRate,
  onDismiss,
}: AppReviewPromptProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <View style={styles.iconShell}>
            <Ionicons name="star" size={rMS(28)} color={AppColors.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onRate} activeOpacity={0.88}>
            <Text style={styles.primaryButtonText}>Rate ODOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onDismiss} activeOpacity={0.88}>
            <Text style={styles.secondaryButtonText}>Maybe later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    paddingHorizontal: rS(24),
  },
  card: {
    borderRadius: rS(28),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rS(24),
    paddingVertical: rV(24),
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  iconShell: {
    alignSelf: "center",
    width: rMS(64),
    height: rMS(64),
    borderRadius: rMS(20),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 94, 89, 0.08)",
    marginBottom: rV(16),
  },
  title: {
    textAlign: "center",
    fontFamily: Fonts.title,
    fontSize: rMS(22),
    color: AppColors.text,
    marginBottom: rV(8),
  },
  message: {
    textAlign: "center",
    fontFamily: Fonts.text,
    fontSize: rMS(15),
    lineHeight: rMS(22),
    color: AppColors.subtext[200],
    marginBottom: rV(22),
  },
  primaryButton: {
    borderRadius: rS(16),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(14),
    alignItems: "center",
    marginBottom: rV(10),
  },
  primaryButtonText: {
    fontFamily: Fonts.title,
    fontSize: rMS(16),
    color: "#FFFFFF",
  },
  secondaryButton: {
    borderRadius: rS(16),
    paddingVertical: rV(12),
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(15),
    color: AppColors.subtext[200],
  },
});
