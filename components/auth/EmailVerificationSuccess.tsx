import PrimaryButton from "@/components/buttons/PrimaryButton";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type EmailVerificationSuccessProps = {
  email: string;
  onContinue: () => void;
};

export default function EmailVerificationSuccess({
  email,
  onContinue,
}: EmailVerificationSuccessProps) {
  const scale = useRef(new Animated.Value(0.82)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(rV(18))).current;

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
    <View style={styles.screen}>
      <LinearGradient
        colors={["#F8FAFC", "#FFFFFF", "#F3F4F6"]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [{ translateY: slide }],
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
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={rMS(16)} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Text style={styles.title}>You&apos;re in!</Text>
        <Text style={styles.subtitle}>
          Your email is verified and your ODOS account is ready to go.
        </Text>

        <View style={styles.emailCard}>
          <Ionicons name="shield-checkmark-outline" size={rMS(18)} color="#15803D" />
          <View style={styles.emailCopy}>
            <Text style={styles.emailLabel}>Verified email</Text>
            <Text style={styles.emailValue} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        <View style={styles.perksRow}>
          <View style={styles.perkChip}>
            <Ionicons name="bag-handle-outline" size={rMS(16)} color={AppColors.primary} />
            <Text style={styles.perkText}>Shop securely</Text>
          </View>
          <View style={styles.perkChip}>
            <Ionicons name="notifications-outline" size={rMS(16)} color={AppColors.primary} />
            <Text style={styles.perkText}>Get order updates</Text>
          </View>
          <View style={styles.perkChip}>
            <Ionicons name="heart-outline" size={rMS(16)} color={AppColors.primary} />
            <Text style={styles.perkText}>Save favourites</Text>
          </View>
        </View>

        <Text style={styles.footerCopy}>
          From here you can browse stores, track orders, and build your wishlist — all in one place.
        </Text>

        <PrimaryButton title="Start exploring" onPress={onContinue} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rS(24),
    paddingTop: rV(72),
    paddingBottom: rV(28),
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
    borderColor: "#FFFFFF",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(28),
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: rV(10),
    fontFamily: Fonts.text,
    fontSize: rMS(14.5),
    lineHeight: rMS(22),
    color: AppColors.secondary,
    textAlign: "center",
    maxWidth: rS(320),
  },
  emailCard: {
    marginTop: rV(24),
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    backgroundColor: "#F0FDF4",
    borderRadius: rMS(18),
    paddingHorizontal: rS(16),
    paddingVertical: rV(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#BBF7D0",
  },
  emailCopy: {
    flex: 1,
    gap: rV(2),
  },
  emailLabel: {
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    color: "#15803D",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  emailValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: "#14532D",
  },
  perksRow: {
    marginTop: rV(20),
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
    justifyContent: "center",
  },
  perkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    backgroundColor: "#F8FAFC",
    borderRadius: rMS(999),
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  perkText: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
    color: AppColors.text,
  },
  footerCopy: {
    marginTop: rV(18),
    marginBottom: rV(24),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
    color: AppColors.secondary,
    textAlign: "center",
  },
});
