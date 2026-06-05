import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rS, rV } from "@/styles/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { exitAuthToHome } from "@/utils/authNavigation";
import { useBlockBackNavigation } from "@/hooks/useBlockBackNavigation";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    image: require("@/assets/images/onboarding1.png"),
    title: "Discover stores around you",
    text: "Browse groceries, fashion, and everyday essentials from vendors in your area — all in one app.",
  },
  {
    id: "2",
    image: require("@/assets/images/onboarding2.png"),
    title: "Order with confidence",
    text: "Track deliveries, get updates, and pay your way — card, mobile money, or your ODOS wallet.",
  },
  {
    id: "3",
    image: require("@/assets/images/onboarding4.png"),
    title: "One tap to get started",
    text: "Sign in with Google when you're ready. No long forms — your favourites and orders stay with you.",
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  useBlockBackNavigation(true);
  const { requireAuth, user } = useRequireAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const gradientColors = isDark
    ? (["#3F3F46", "#27272A"] as const)
    : (["#6B7280", "#52525B"] as const);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      return;
    }

    if (user) {
      exitAuthToHome(router);
      return;
    }

    requireAuth({
      title: "Ready to shop for real?",
      message:
        "Sign up or sign in to save favourites, track orders, and use your wallet at checkout.",
      cancelLabel: "Keep browsing",
      onCancel: () => exitAuthToHome(router),
    });
  };

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      <LinearGradient
        colors={gradientColors}
        style={[styles.topBar, { paddingTop: insets.top + rV(8) }]}
      >
        <Text style={styles.brand}>ODOS</Text>
        <TouchableOpacity
          onPress={() => exitAuthToHome(router)}
          hitSlop={12}
        >
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: colors.textMuted }]}>{item.text}</Text>

              <View style={styles.dots}>
                {slides.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        width: index === currentIndex ? rS(20) : rS(8),
                        backgroundColor:
                          index === currentIndex ? colors.primary : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={handleNext}
                style={[styles.cta, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.ctaText, { color: colors.onPrimary }]}>
                  {currentIndex === slides.length - 1 ? "Get started" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(22),
    paddingBottom: rV(10),
  },
  brand: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    color: "#FFFFFF",
    letterSpacing: 1.2,
  },
  skip: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    color: "rgba(255,255,255,0.9)",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    paddingTop: rV(8),
  },
  image: {
    width: width * 0.92,
    height: rV(360),
  },
  card: {
    position: "absolute",
    bottom: rV(48),
    width: width * 0.86,
    borderRadius: rMS(22),
    paddingVertical: rV(28),
    paddingHorizontal: rS(26),
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(19),
    textAlign: "center",
    marginBottom: rV(10),
  },
  body: {
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(21),
    textAlign: "center",
    marginBottom: rV(18),
  },
  dots: {
    flexDirection: "row",
    marginBottom: rV(18),
    gap: rS(6),
  },
  dot: {
    height: rS(8),
    borderRadius: rS(4),
  },
  cta: {
    borderRadius: rMS(999),
    paddingVertical: rV(14),
    paddingHorizontal: rS(32),
    minWidth: rS(200),
    alignItems: "center",
  },
  ctaText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14.5),
  },
});
