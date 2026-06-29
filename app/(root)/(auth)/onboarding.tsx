import { OdosBrandGradient } from "@/components/launch/OdosLaunchChrome";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { rMS, rS, rV } from "@/styles/responsive";
import { exitAuthToHome } from "@/utils/authNavigation";
import { markOnboardingComplete } from "@/utils/onboardingStorage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = rV(360);

type OnboardingSlide = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  eyebrow: string;
  title: string;
  text: string;
  highlights: string[];
};

const slides: OnboardingSlide[] = [
  {
    id: "discover",
    icon: "storefront-outline",
    eyebrow: "Discover",
    title: "Everything you need, nearby",
    text: "Browse groceries, fashion, and everyday essentials from trusted local vendors — curated for your city.",
    highlights: ["Local vendors", "Top deals", "Smart search"],
  },
  {
    id: "order",
    icon: "bag-check-outline",
    eyebrow: "Order",
    title: "Checkout without the friction",
    text: "Track deliveries in real time, choose your speed, and pay securely with card, mobile money, or wallet.",
    highlights: ["Live tracking", "Flexible delivery", "Secure payments"],
  },
  {
    id: "start",
    icon: "sparkles-outline",
    eyebrow: "Get started",
    title: "Your marketplace, ready",
    text: "Create an account to save favourites, checkout faster, and keep every order in one place.",
    highlights: ["Saved favourites", "Order history", "Instant alerts"],
  },
];

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { requireAuth, user } = useRequireAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  useBlockBackNavigation(true);

  const activeSlide = slides[currentIndex] ?? slides[0];

  const finishOnboarding = useCallback(async () => {
    await markOnboardingComplete();
    exitAuthToHome(router);
  }, [router]);

  const handleSkip = useCallback(() => {
    void finishOnboarding();
  }, [finishOnboarding]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      return;
    }

    void (async () => {
      await markOnboardingComplete();

      if (user) {
        exitAuthToHome(router);
        return;
      }

      requireAuth({
        title: "Create your ODOS account",
        message: "Sign up or sign in to checkout, track orders, and save your favourites.",
        cancelLabel: "Browse first",
        onCancel: () => exitAuthToHome(router),
      });
    })();
  }, [currentIndex, requireAuth, router, user]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index >= 0 && index < slides.length) {
      setCurrentIndex(index);
    }
  }, []);

  const renderSlide: ListRenderItem<OnboardingSlide> = useCallback(
    ({ item }) => (
      <View style={[styles.heroSlide, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}>
        <View style={styles.iconRing}>
          <Ionicons name={item.icon} size={rMS(34)} color="#FFFFFF" />
        </View>
        <Text style={styles.eyebrow}>{item.eyebrow}</Text>
        <View style={styles.highlightRow}>
          {item.highlights.map((label) => (
            <View key={label} style={styles.highlightPill}>
              <Text style={styles.highlightText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    ),
    [],
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <StatusBar style="light" />

      <OdosBrandGradient style={styles.heroShell}>
        <View
          style={[
            styles.topBar,
            {
              paddingTop: insets.top + rV(8),
            },
          ]}
        >
          <Text style={styles.topBrand}>ODOS</Text>
          <Pressable onPress={handleSkip} hitSlop={12} accessibilityRole="button">
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={renderSlide}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          style={styles.heroList}
        />
      </OdosBrandGradient>

      <View
        style={[
          styles.contentPanel,
          {
            backgroundColor: colors.screen,
            paddingBottom: Math.max(insets.bottom, rV(16)),
            borderTopColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{activeSlide.title}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>{activeSlide.text}</Text>

        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                {
                  width: index === currentIndex ? rS(24) : rS(8),
                  backgroundColor: index === currentIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={[styles.cta, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text style={[styles.ctaText, { color: colors.onPrimary }]}>
            {isLastSlide ? "Get started" : "Continue"}
          </Text>
          <Ionicons
            name={isLastSlide ? "arrow-forward" : "chevron-forward"}
            size={rMS(18)}
            color={colors.onPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  heroShell: {
    height: HERO_HEIGHT,
    overflow: "hidden",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(20),
    paddingBottom: rV(8),
  },
  topBrand: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: "#FFFFFF",
    letterSpacing: 2.2,
  },
  skip: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    color: "rgba(255, 255, 255, 0.82)",
  },
  heroList: {
    flex: 1,
  },
  heroSlide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(24),
    paddingTop: rV(56),
    gap: rV(14),
  },
  iconRing: {
    width: rS(88),
    height: rS(88),
    borderRadius: rMS(28),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  eyebrow: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
    color: "rgba(255, 255, 255, 0.78)",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  highlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: rS(8),
  },
  highlightPill: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(6),
    borderRadius: rMS(999),
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  highlightText: {
    fontFamily: Fonts.title,
    fontSize: rMS(11.5),
    color: "rgba(255, 255, 255, 0.9)",
  },
  contentPanel: {
    flex: 1,
    marginTop: -rV(22),
    borderTopLeftRadius: rMS(28),
    borderTopRightRadius: rMS(28),
    paddingHorizontal: rS(24),
    paddingTop: rV(28),
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: rV(12),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(26),
    lineHeight: rMS(32),
  },
  body: {
    fontFamily: Fonts.text,
    fontSize: rMS(15),
    lineHeight: rMS(23),
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: rS(6),
    marginTop: "auto",
    paddingTop: rV(8),
  },
  dot: {
    height: rS(8),
    borderRadius: rS(4),
  },
  cta: {
    minHeight: rV(52),
    borderRadius: rMS(16),
    paddingHorizontal: rS(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
    marginTop: rV(8),
  },
  ctaText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
  },
});
