import { LAUNCH_ACCENT, LaunchBackdrop, OdosMark, OdosWordmark } from "@/components/launch/OdosLaunchChrome";
import { ONBOARDING_SLIDES, OnboardingDots, OnboardingFeatureSlide } from "@/components/onboarding/OnboardingUi";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rS, rV } from "@/styles/responsive";
import { exitAuthToHome, goToSignIn, goToSignUp } from "@/utils/authNavigation";
import { markOnboardingComplete } from "@/utils/onboardingStorage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CTA_PAGE_INDEX = ONBOARDING_SLIDES.length;
const TOTAL_PAGES = ONBOARDING_SLIDES.length + 1;

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: pageWidth } = useWindowDimensions();
  useBlockBackNavigation(true);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const onTourPage = activeIndex < CTA_PAGE_INDEX;

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      setActiveIndex(index);
    },
    [pageWidth],
  );

  const goToPage = useCallback(
    (index: number) => {
      void Haptics.selectionAsync();
      scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    },
    [pageWidth],
  );

  const handleNext = useCallback(() => {
    goToPage(Math.min(activeIndex + 1, TOTAL_PAGES - 1));
  }, [activeIndex, goToPage]);

  const handleSkip = useCallback(() => {
    goToPage(CTA_PAGE_INDEX);
  }, [goToPage]);

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
    <LaunchBackdrop>
      <StatusBar style="light" />

      {onTourPage ? (
        <Animated.View
          exiting={FadeOut.duration(180)}
          style={[styles.skipWrap, { top: insets.top + rV(12) }]}
        >
          <Pressable
            onPress={handleSkip}
            hitSlop={12}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip the tour"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {ONBOARDING_SLIDES.map((slide, index) => (
          <OnboardingFeatureSlide
            key={slide.key}
            index={index}
            scrollX={scrollX}
            pageWidth={pageWidth}
            icon={slide.icon}
            headline={slide.headline}
            subhead={slide.subhead}
          />
        ))}

        <View style={[styles.ctaSlide, { width: pageWidth, paddingBottom: Math.max(insets.bottom, rV(24)) }]}>
          <View style={styles.ctaBrandBlock}>
            <OdosMark size={rS(72)} animate={activeIndex === CTA_PAGE_INDEX} />
            <View style={{ marginTop: rV(16) }}>
              <OdosWordmark compact delayMs={0} />
            </View>
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
      </Animated.ScrollView>

      {onTourPage ? (
        <Animated.View
          exiting={FadeOut.duration(180)}
          style={[styles.tourFooter, { paddingBottom: Math.max(insets.bottom, rV(20)) }]}
        >
          <OnboardingDots count={TOTAL_PAGES} scrollX={scrollX} pageWidth={pageWidth} />

          <Pressable
            onPress={handleNext}
            style={styles.nextButton}
            accessibilityRole="button"
            accessibilityLabel="Next"
          >
            <Ionicons name="chevron-forward" size={rS(22)} color="#0A0A0A" />
          </Pressable>
        </Animated.View>
      ) : null}
    </LaunchBackdrop>
  );
}

const styles = StyleSheet.create({
  skipWrap: {
    position: "absolute",
    right: rS(20),
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: rS(14),
    paddingVertical: rV(8),
  },
  skipText: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    color: "rgba(255,255,255,0.72)",
  },
  pager: {
    flex: 1,
  },
  ctaSlide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(28),
  },
  ctaBrandBlock: {
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
    color: "#0A0A0A",
  },
  secondaryCta: {
    minHeight: rV(54),
    borderRadius: rMS(16),
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.28)",
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
  tourFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(28),
    paddingTop: rV(12),
  },
  nextButton: {
    width: rS(48),
    height: rS(48),
    borderRadius: rS(24),
    backgroundColor: LAUNCH_ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
});
