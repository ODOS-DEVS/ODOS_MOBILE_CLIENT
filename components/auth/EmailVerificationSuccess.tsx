import PrimaryButton from "@/components/buttons/PrimaryButton";
import AuthFormCard from "@/components/auth/AuthFormCard";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type EmailVerificationSuccessProps = {
  email: string;
  onContinue: () => void;
};

export default function EmailVerificationSuccess({
  email,
  onContinue,
}: EmailVerificationSuccessProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.82)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(rV(18))).current;

  const gradientColors = isDark
    ? (["#151C2B", "#0B1220", "#151C2B"] as const)
    : (["#F8FAFC", "#FFFFFF", "#F3F4F6"] as const);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 14,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale, slide]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFillObject} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [{ translateY: slide }],
            paddingTop: insets.top + rV(48),
            paddingBottom: insets.bottom + rV(28),
          },
        ]}
      >
        <Animated.View style={[styles.heroOrb, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={["#16A34A", "#15803D"]}
            style={styles.heroOrbGradient}
          >
            <Ionicons name="mail-open-outline" size={rMS(34)} color="#FFFFFF" />
          </LinearGradient>
          <View style={[styles.checkBadge, { borderColor: colors.card }]}>
            <Ionicons name="checkmark" size={rMS(16)} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Text style={[styles.title, { color: colors.text }]}>You're in!</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Your email is verified and your ODOS account is ready.
        </Text>

        <AuthFormCard>
          <View
            style={[
              styles.emailRow,
              {
                backgroundColor: colors.accentSoft,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="shield-checkmark-outline" size={rMS(18)} color={colors.successText} />
            <View style={styles.emailCopy}>
              <Text style={[styles.emailLabel, { color: colors.successText }]}>
                Verified email
              </Text>
              <Text style={[styles.emailValue, { color: colors.text }]} numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>

          <View style={styles.perksRow}>
            {[
              { icon: "bag-handle-outline" as const, text: "Shop securely" },
              { icon: "notifications-outline" as const, text: "Order updates" },
              { icon: "heart-outline" as const, text: "Save favourites" },
            ].map((perk) => (
              <View
                key={perk.text}
                style={[
                  styles.perkChip,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name={perk.icon} size={rMS(15)} color={colors.primary} />
                <Text style={[styles.perkText, { color: colors.textBody }]}>{perk.text}</Text>
              </View>
            ))}
          </View>
        </AuthFormCard>

        <Text style={[styles.footerCopy, { color: colors.textMuted }]}>
          Browse stores, track orders, and build your wishlist — all in one place.
        </Text>

        <PrimaryButton title="Start exploring" onPress={onContinue} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: rS(24),
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  heroOrb: {
    width: rMS(112),
    height: rMS(112),
    marginBottom: rV(24),
  },
  heroOrbGradient: {
    width: "100%",
    height: "100%",
    borderRadius: rMS(56),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#15803D",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  checkBadge: {
    position: "absolute",
    right: rS(4),
    bottom: rV(4),
    width: rMS(34),
    height: rMS(34),
    borderRadius: rMS(17),
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(28),
    textAlign: "center",
  },
  subtitle: {
    marginTop: rV(10),
    fontFamily: Fonts.text,
    fontSize: rMS(14.5),
    lineHeight: rMS(22),
    textAlign: "center",
    maxWidth: rS(320),
    marginBottom: rV(22),
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    borderRadius: rMS(14),
    paddingHorizontal: rS(14),
    paddingVertical: rV(12),
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: rV(14),
  },
  emailCopy: {
    flex: 1,
    gap: rV(2),
  },
  emailLabel: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  emailValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  perksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    justifyContent: "center",
  },
  perkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    borderRadius: rMS(999),
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderWidth: StyleSheet.hairlineWidth,
  },
  perkText: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
  },
  footerCopy: {
    marginTop: rV(20),
    marginBottom: rV(22),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
    textAlign: "center",
    paddingHorizontal: rS(8),
  },
});
