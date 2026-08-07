import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FACES = [
  { rating: 1, emoji: "😞" },
  { rating: 2, emoji: "😕" },
  { rating: 3, emoji: "😐" },
  { rating: 4, emoji: "🙂" },
  { rating: 5, emoji: "🤩" },
];

type DeliveryFeedbackPromptProps = {
  onRate: (rating: number) => Promise<void> | void;
};

export default function DeliveryFeedbackPrompt({ onRate }: DeliveryFeedbackPromptProps) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePress = async (rating: number) => {
    if (isSubmitting || selected) {
      return;
    }
    setSelected(rating);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSubmitting(true);
    try {
      await onRate(rating);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {selected ? "Thanks for the feedback!" : "How was your delivery?"}
      </Text>
      {!selected ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Just the handoff — separate from rating the product.
        </Text>
      ) : null}
      <View style={styles.row}>
        {FACES.map((face) => {
          const isSelected = selected === face.rating;
          const dimmed = selected !== null && !isSelected;
          return (
            <TouchableOpacity
              key={face.rating}
              activeOpacity={0.8}
              disabled={isSubmitting || selected !== null}
              onPress={() => void handlePress(face.rating)}
              style={[
                styles.faceButton,
                {
                  backgroundColor: isSelected ? colors.successSoft : colors.surfaceMuted,
                  opacity: dimmed ? 0.4 : 1,
                  transform: [{ scale: isSelected ? 1.12 : 1 }],
                },
              ]}
            >
              <Text style={styles.faceEmoji}>{face.emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: rMS(20),
    padding: rS(16),
    marginBottom: rV(12),
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    textAlign: "center",
  },
  subtitle: {
    marginTop: rV(4),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: rS(10),
    marginTop: rV(14),
  },
  faceButton: {
    width: rMS(46),
    height: rMS(46),
    borderRadius: rMS(23),
    alignItems: "center",
    justifyContent: "center",
  },
  faceEmoji: {
    fontSize: rMS(22),
  },
});
