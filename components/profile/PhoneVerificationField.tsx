import { AccountFormField } from "@/components/account/AccountUi";
import PhoneVerificationPanel from "@/components/profile/PhoneVerificationPanel";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import type { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { formatGhanaPhoneDisplay } from "@/utils/phone";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Reanimated from "react-native-reanimated";

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
};

function PhoneVerifiedBanner({
  phoneNumber,
  title,
}: {
  phoneNumber: string;
  title: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        chip: {
          alignSelf: "flex-start",
          marginTop: rV(8),
          flexDirection: "row",
          alignItems: "center",
          gap: rS(6),
          maxWidth: "100%",
          paddingHorizontal: rS(10),
          paddingVertical: rV(6),
          borderRadius: rMS(999),
          backgroundColor: colors.successSoft,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: `${colors.successText}28`,
        },
        label: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11.5),
          color: colors.successText,
        },
        divider: {
          fontFamily: Fonts.text,
          fontSize: rMS(11),
          color: `${colors.successText}66`,
        },
        phone: {
          flexShrink: 1,
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          color: colors.textMuted,
          letterSpacing: 0.2,
        },
      }),
    [colors],
  );

  return (
    <Reanimated.View style={styles.chip}>
      <Ionicons name="checkmark-circle" size={rMS(14)} color={colors.successText} />
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.divider}>·</Text>
      <Text style={styles.phone} numberOfLines={1}>
        {formatGhanaPhoneDisplay(phoneNumber)}
      </Text>
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
  verifiedTitle = "Verified",
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
