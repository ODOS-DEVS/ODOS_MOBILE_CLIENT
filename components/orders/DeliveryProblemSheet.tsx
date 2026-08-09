import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export type DeliveryProblemReason =
  | "rider_no_show"
  | "not_available"
  | "wrong_delivery"
  | "order_issue"
  | "other";

const REASONS: { value: DeliveryProblemReason; label: string }[] = [
  { value: "rider_no_show", label: "Rider didn't arrive" },
  { value: "not_available", label: "I wasn't available" },
  { value: "wrong_delivery", label: "Wrong delivery" },
  { value: "order_issue", label: "Something's wrong with the order" },
  { value: "other", label: "Other" },
];

type DeliveryProblemSheetProps = {
  visible: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: DeliveryProblemReason, details: string) => void;
};

export default function DeliveryProblemSheet({
  visible,
  isSubmitting = false,
  onClose,
  onSubmit,
}: DeliveryProblemSheetProps) {
  const { colors } = useTheme();
  const [reason, setReason] = useState<DeliveryProblemReason | null>(null);
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (!reason) {
      return;
    }
    onSubmit(reason, details.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.backdrop }]} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.text }]}>What happened?</Text>
          <Text style={[styles.helper, { color: colors.textSecondary }]}>
            We&apos;ll pause this order and get our team to look into it — you won&apos;t be charged
            or asked to confirm delivery until it&apos;s sorted.
          </Text>
          <ScrollView style={styles.reasonList} showsVerticalScrollIndicator={false}>
            {REASONS.map((option) => {
              const selected = option.value === reason;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.reasonRow,
                    {
                      borderColor: selected ? colors.primary : colors.inputBorder,
                      backgroundColor: selected ? colors.infoSoft : "transparent",
                    },
                  ]}
                  onPress={() => setReason(option.value)}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: selected ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {selected ? (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    ) : null}
                  </View>
                  <Text style={[styles.reasonLabel, { color: colors.text }]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Add details (optional)"
            placeholderTextColor={colors.placeholder}
            multiline
            maxLength={500}
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
            ]}
          />
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, { backgroundColor: colors.surfaceMuted }]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                { backgroundColor: colors.inverseSurface, opacity: reason ? 1 : 0.5 },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || !reason}
            >
              <Text style={[styles.buttonText, { color: colors.onInverseSurface }]}>
                {isSubmitting ? "Sending..." : "Report problem"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(20),
  },
  sheet: {
    width: "100%",
    borderRadius: rMS(20),
    borderWidth: StyleSheet.hairlineWidth,
    padding: rS(20),
    gap: rV(6),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
  },
  helper: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  reasonList: {
    marginTop: rV(10),
    maxHeight: rV(220),
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: rMS(14),
    paddingVertical: rV(12),
    paddingHorizontal: rS(14),
    marginBottom: rV(8),
  },
  radioOuter: {
    width: rMS(18),
    height: rMS(18),
    borderRadius: rMS(9),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: rMS(9),
    height: rMS(9),
    borderRadius: rMS(4.5),
  },
  reasonLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
    flex: 1,
  },
  input: {
    marginTop: rV(4),
    minHeight: rV(60),
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: rMS(14),
    paddingHorizontal: rS(14),
    paddingVertical: rV(10),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(10),
  },
  button: {
    flex: 1,
    borderRadius: rMS(14),
    paddingVertical: rV(13),
    alignItems: "center",
  },
  buttonText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
  },
});
