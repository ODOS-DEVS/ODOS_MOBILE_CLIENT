import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type RescheduleRequestSheetProps = {
  visible: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
};

export default function RescheduleRequestSheet({
  visible,
  isSubmitting = false,
  onClose,
  onSubmit,
}: RescheduleRequestSheetProps) {
  const { colors } = useTheme();
  const [note, setNote] = useState("");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.backdrop }]} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.text }]}>Not home right now?</Text>
          <Text style={[styles.helper, { color: colors.textSecondary }]}>
            Let the seller know instead of them guessing — add a note if it helps (e.g. &ldquo;back
            in 30 min&rdquo; or &ldquo;leave with the security guard&rdquo;).
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Optional note for the seller"
            placeholderTextColor={colors.placeholder}
            multiline
            maxLength={280}
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
              style={[styles.button, { backgroundColor: colors.inverseSurface }]}
              onPress={() => onSubmit(note.trim())}
              disabled={isSubmitting}
            >
              <Text style={[styles.buttonText, { color: colors.onInverseSurface }]}>
                {isSubmitting ? "Sending..." : "Let seller know"}
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
  input: {
    marginTop: rV(10),
    minHeight: rV(70),
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
