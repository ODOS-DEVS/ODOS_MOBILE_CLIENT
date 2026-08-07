import { OdosBrandGradient, OdosBrandMark } from "@/components/launch/OdosLaunchChrome";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rS, rV } from "@/styles/responsive";
import { exitAuthToHome, goToSignIn, goToSignUp } from "@/utils/authNavigation";
import { markOnboardingComplete } from "@/utils/onboardingStorage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  useBlockBackNavigation(true);

  const proceed = useCallback((next: () => void) => {
    void (async () => {
      try {
        await markOnboardingComplete();
      } catch {
        // Still proceed — onboarding can re-prompt on next cold start if needed.
      }
      next();
    })();
  }, []);

  const handleCreateAccount = useCallback(() => {
    proceed(() => goToSignUp(router));
  }, [proceed, router]);

  const handleLogIn = useCallback(() => {
    proceed(() => goToSignIn(router));
  }, [proceed, router]);

  const handleGuest = useCallback(() => {
    proceed(() => exitAuthToHome(router, user));
  }, [proceed, router, user]);

  return (
    <OdosBrandGradient style={styles.screen}>
      <StatusBar style="light" />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + rV(40),
            paddingBottom: Math.max(insets.bottom, rV(24)),
          },
        ]}
      >
        <View style={styles.brandBlock}>
          <OdosBrandMark size="onboarding" showTagline />
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleCreateAccount}
            style={styles.primaryCta}
            accessibilityRole="button"
            accessibilityLabel="Create an ODOS account"
          >
            <Text style={styles.primaryCtaText}>Create account</Text>
          </Pressable>

          <Pressable
            onPress={handleLogIn}
            style={styles.secondaryCta}
            accessibilityRole="button"
            accessibilityLabel="Log in to your ODOS account"
          >
            <Text style={styles.secondaryCtaText}>Log in</Text>
          </Pressable>

          <Pressable
            onPress={handleGuest}
            hitSlop={10}
            style={styles.guestLink}
            accessibilityRole="button"
            accessibilityLabel="Continue browsing as a guest"
          >
            <Text style={styles.guestLinkText}>Continue as guest</Text>
          </Pressable>
        </View>
      </View>
    </OdosBrandGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: rS(28),
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    width: "100%",
    gap: rV(12),
  },
  primaryCta: {
    minHeight: rV(54),
    borderRadius: rMS(16),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: "#18181B",
  },
  secondaryCta: {
    minHeight: rV(54),
    borderRadius: rMS(16),
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryCtaText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: "#FFFFFF",
  },
  guestLink: {
    alignSelf: "center",
    marginTop: rV(4),
    paddingVertical: rV(8),
  },
  guestLinkText: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    color: "rgba(255, 255, 255, 0.78)",
    textDecorationLine: "underline",
  },
});
