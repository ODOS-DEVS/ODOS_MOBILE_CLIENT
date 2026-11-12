import CommerceImage from "@/components/media/CommerceImage";
import FlashSaleCountdown from "@/components/deals/FlashSaleCountdown";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { FlashSaleEventItem } from "@/hooks/useFlashSaleEvents";
import { rMS, rS, rV } from "@/styles/responsive";
import { resolveApiMediaUrl } from "@/utils/media";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * A live flash event as a destination, not a line of text.
 *
 * The deals screen used to announce a flash sale with a heading, a countdown
 * and a text link — everything about it said "footnote". This gives the event
 * its artwork, a scrim so the type always reads, the countdown where the eye
 * lands, and the whole card as the tap target.
 */
export default function FlashEventShowcase({ event }: { event: FlashSaleEventItem }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}. Opens flash sales`}
      onPress={() => router.push("/(root)/screens/flash-sales")}
      style={[styles.shell, { shadowColor: colors.shadow }]}
    >
      {event.imageUrl ? (
        <CommerceImage
          source={{ uri: resolveApiMediaUrl(event.imageUrl) ?? event.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          participateInReadyGate={false}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#1C1917" }]} />
      )}
      <LinearGradient
        colors={["rgba(12,10,9,0.15)", "rgba(12,10,9,0.62)", "rgba(12,10,9,0.88)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrow}>
            <Ionicons name="flash" size={rMS(11)} color="#FFD166" />
            <Text style={styles.eyebrowText}>Flash sale · live</Text>
          </View>
          {event.productCount > 0 ? (
            <Text style={styles.count}>
              {event.productCount} deal{event.productCount === 1 ? "" : "s"}
            </Text>
          ) : null}
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {event.title}
        </Text>
        {event.subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {event.subtitle}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <FlashSaleCountdown
            endsAt={event.endsAt}
            serverSecondsRemaining={event.secondsRemaining}
            tone="gold"
          />
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Shop the sale</Text>
            <Ionicons name="arrow-forward" size={rMS(13)} color="#0C0A09" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: rMS(20),
    overflow: "hidden",
    minHeight: rV(176),
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: rS(16),
    justifyContent: "flex-end",
    gap: rV(4),
  },
  eyebrowRow: {
    position: "absolute",
    top: rV(12),
    left: rS(14),
    right: rS(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(5),
    backgroundColor: "rgba(12,10,9,0.55)",
    borderRadius: 999,
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  eyebrowText: {
    color: "#FFD166",
    fontFamily: Fonts.textBold,
    fontSize: rMS(10.5),
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  count: {
    color: "rgba(255,255,255,0.92)",
    fontFamily: Fonts.textBold,
    fontSize: rMS(11.5),
  },
  title: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
    lineHeight: rMS(25),
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
  },
  footer: {
    marginTop: rV(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(10),
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    backgroundColor: "#FFD166",
    borderRadius: 999,
    paddingHorizontal: rS(14),
    paddingVertical: rV(8),
  },
  ctaText: {
    color: "#0C0A09",
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
  },
});
