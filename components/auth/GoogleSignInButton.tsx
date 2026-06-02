import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type GoogleSignInButtonProps = {
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
};

export default function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
  label = "Continue with Google",
  hint = "One tap — no password to remember",
}: GoogleSignInButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.88}
      style={[
        styles.button,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
          opacity: isDisabled ? 0.72 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Image
            source={require("@/assets/images/Icon - Google.png")}
            style={styles.icon}
            resizeMode="contain"
          />
        )}
        <View style={styles.copy}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: rMS(18),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(18),
    paddingVertical: rV(16),
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(14),
  },
  icon: {
    width: rMS(28),
    height: rMS(28),
  },
  copy: {
    flex: 1,
    gap: rV(2),
  },
  label: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15.5),
  },
  hint: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
  },
});
