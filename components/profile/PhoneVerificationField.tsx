import { AccountFormField } from "@/components/account/AccountUi";
import PhoneVerificationPanel from "@/components/profile/PhoneVerificationPanel";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { formatGhanaPhoneDisplay } from "@/utils/phone";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Reanimated, { FadeInDown } from "react-native-reanimated";

type PhoneVerificationState = ReturnType<typeof usePhoneVerification>;

type PhoneVerificationFieldProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  fieldError?: string;
  verification: PhoneVerificationState;
  onSendCode: () => void | Promise<void>;
  onVerify: (code: string) => void | Promise<void>;
  verifiedTitle?: string;
  verifiedSubtitle?: string;
};

function PhoneVerifiedBanner({
  phoneNumber,
  title,
  subtitle,
}: {
  phoneNumber: string;
  title: string;
  subtitle: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: rV(8),
          borderRadius: rMS(16),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: `${colors.successText}44`,
        },
        inner: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
          paddingHorizontal: rS(14),
          paddingVertical: rV(12),
        },
        iconShell: {
          width: rMS(42),
          height: rMS(42),
          borderRadius: rMS(14),
          backgroundColor: "rgba(255,255,255,0.88)",
          alignItems: "center",
          justifyContent: "center",
        },
        copy: {
          flex: 1,
          minWidth: 0,
          gap: rV(2),
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13.5),
          color: colors.successText,
        },
        phone: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(15),
          color: colors.text,
          letterSpacing: 0.4,
        },
        subtitle: {
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          lineHeight: rMS(16),
          color: colors.textMuted,
        },
        badge: {
          paddingHorizontal: rS(8),
          paddingVertical: rV(4),
          borderRadius: 999,
          backgroundColor: colors.successText,
        },
        badgeText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10),
          color: "#FFFFFF",
          letterSpacing: 0.3,
        },
      }),
    [colors],
  );

  return (
    <Reanimated.View entering={FadeInDown.duration(260)} style={styles.wrap}>
      <LinearGradient
        colors={[`${colors.successText}18`, `${colors.successSoft}`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.iconShell}>
          <Ionicons name="shield-checkmark" size={rMS(22)} color={colors.successText} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.phone}>{formatGhanaPhoneDisplay(phoneNumber)}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>VERIFIED</Text>
        </View>
      </LinearGradient>
    </Reanimated.View>
  );
}

export function isPhoneVerificationRequired(verification: PhoneVerificationState) {
  return Boolean(
    verification.normalizedPhone &&
      !verification.phoneValidationError &&
      !verification.isVerified,
  );
}

export default function PhoneVerificationField({
  label = "Phone number",
  placeholder = "0541234567",
  value,
  onChangeText,
  fieldError,
  verification,
  onSendCode,
  onVerify,
  verifiedTitle = "Number verified",
  verifiedSubtitle = "This number is confirmed and ready to save.",
}: PhoneVerificationFieldProps) {
  const showVerifiedBanner = Boolean(
    verification.isVerified && verification.normalizedPhone,
  );

  return (
    <View>
      <AccountFormField
        label={label}
        icon="call-outline"
        placeholder={placeholder}
        value={value}
        keyboardType="phone-pad"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={10}
        onChangeText={(nextValue) => {
          onChangeText(nextValue);
          verification.setVerificationError("");
        }}
        error={fieldError}
      />

      {showVerifiedBanner ? (
        <PhoneVerifiedBanner
          phoneNumber={verification.normalizedPhone!}
          title={verifiedTitle}
          subtitle={verifiedSubtitle}
        />
      ) : null}

      {verification.showVerificationPanel && verification.normalizedPhone ? (
        <PhoneVerificationPanel
          phoneNumber={verification.normalizedPhone}
          codeSent={verification.codeSent}
          isSendingCode={verification.isSendingCode}
          isVerifying={verification.isVerifying}
          error={verification.verificationError}
          onDismissError={() => verification.setVerificationError("")}
          onSendCode={onSendCode}
          onVerify={onVerify}
        />
      ) : null}
    </View>
  );
}
