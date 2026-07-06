import AuthHeader from "@/components/AuthHeader";
import AuthBackButton from "@/components/auth/AuthBackButton";
import KeyboardAwareScrollView from "@/components/layout/KeyboardAwareScrollView";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeroConfig = {
  title: string;
  header: string;
  subtitle: string;
};

type PlainConfig = {
  title: string;
  subtitle?: string;
  onBack: () => void;
};

type AuthScreenLayoutProps = {
  mode?: "hero" | "plain";
  hero?: HeroConfig;
  plain?: PlainConfig;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthScreenLayout({
  mode = "hero",
  hero,
  plain,
  children,
  footer,
}: AuthScreenLayoutProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.screen }]}>
      {mode === "hero" && hero ? (
        <AuthHeader title={hero.title} header={hero.header} subtitle={hero.subtitle} />
      ) : null}

      {mode === "plain" && plain ? (
        <View
          style={[
            styles.plainTop,
            {
              paddingTop: insets.top + rV(8),
              backgroundColor: colors.screen,
            },
          ]}
        >
          <AuthBackButton onPress={plain.onBack} />
          <Text style={[styles.plainTitle, { color: colors.text }]}>{plain.title}</Text>
          {plain.subtitle ? (
            <Text style={[styles.plainSubtitle, { color: colors.textMuted }]}>
              {plain.subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}

      <KeyboardAwareScrollView
        style={[styles.scroll, { backgroundColor: colors.screen }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + rV(28) },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <View style={styles.body}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  plainTop: {
    paddingHorizontal: rS(22),
    paddingBottom: rV(12),
  },
  plainTitle: {
    marginTop: rV(20),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(24),
    lineHeight: rMS(32),
  },
  plainSubtitle: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    lineHeight: rMS(21),
    maxWidth: rS(340),
  },
  body: {
    paddingHorizontal: rS(22),
    paddingTop: rV(8),
  },
  footer: {
    paddingHorizontal: rS(22),
    marginTop: rV(8),
  },
});
