import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BUTTON_SIZE = rMS(58);

/**
 * The social sign-in options as round buttons, side by side and centred.
 *
 * Replaces a full-width Google card. Two providers stacked as cards would
 * dominate a screen whose primary action is the form above them; as a pair
 * of circles they read as the alternative they are, and the layout stays
 * balanced whether one provider is available or both — Apple is hidden
 * outright on Android and anywhere the OS says it is unavailable.
 */

function SocialButton({
  onPress,
  loading,
  disabled,
  accessibilityLabel,
  children,
  background,
  borderColor,
}: {
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  children: React.ReactNode;
  background: string;
  borderColor: string;
}) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(isDisabled), busy: Boolean(loading) }}
      style={[
        styles.button,
        {
          backgroundColor: background,
          borderColor,
          shadowColor: colors.shadow,
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={colors.primary} /> : children}
    </TouchableOpacity>
  );
}

export default function SocialSignInRow({
  onGooglePress,
  googleLoading,
  onApplePress,
  appleLoading,
  showApple,
  disabled,
  caption,
}: {
  onGooglePress: () => void | Promise<void>;
  googleLoading?: boolean;
  onApplePress: () => void | Promise<void>;
  appleLoading?: boolean;
  /** Apple is iOS-only, and only when the OS reports it available. */
  showApple: boolean;
  disabled?: boolean;
  caption?: string;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <SocialButton
          onPress={onGooglePress}
          loading={googleLoading}
          disabled={disabled}
          accessibilityLabel="Continue with Google"
          background={colors.card}
          borderColor={colors.cardBorder}
        >
          <Image
            source={require("@/assets/images/Icon - Google.png")}
            style={styles.googleIcon}
            resizeMode="contain"
          />
        </SocialButton>

        {showApple ? (
          <SocialButton
            onPress={onApplePress}
            loading={appleLoading}
            disabled={disabled}
            accessibilityLabel="Continue with Apple"
            // Apple's guidelines: black on light, white on dark. The border
            // keeps the black button from vanishing into a dark background.
            background={isDark ? "#FFFFFF" : "#000000"}
            borderColor={isDark ? "#FFFFFF" : "#000000"}
          >
            <Ionicons
              name="logo-apple"
              size={rMS(27)}
              color={isDark ? "#000000" : "#FFFFFF"}
              // The glyph sits optically low in its box; nudge it up.
              style={styles.appleGlyph}
            />
          </SocialButton>
        ) : null}
      </View>

      {caption ? (
        <Text style={[styles.caption, { color: colors.textMuted }]}>{caption}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: rV(10),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(16),
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  googleIcon: {
    width: rMS(26),
    height: rMS(26),
  },
  appleGlyph: {
    marginTop: -rV(2),
  },
  caption: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    textAlign: "center",
  },
});
