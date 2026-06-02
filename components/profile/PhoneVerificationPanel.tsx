import { AccountActionButton } from "@/components/account/AccountUi";
import OtpCodeInput, { OTP_LENGTH } from "@/components/auth/OtpCodeInput";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type PhoneVerificationPanelProps = {
  phoneNumber: string;
  codeSent: boolean;
  isSendingCode: boolean;
  isVerifying: boolean;
  error?: string;
  onSendCode: () => void | Promise<void>;
  onVerify: (code: string) => void | Promise<void>;
  onDismissError?: () => void;
};

export default function PhoneVerificationPanel({
  phoneNumber,
  codeSent,
  isSendingCode,
  isVerifying,
  error,
  onSendCode,
  onVerify,
  onDismissError,
}: PhoneVerificationPanelProps) {
  const { colors } = useTheme();
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ""));

  useEffect(() => {
    setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
  }, [phoneNumber, codeSent]);

  const joinedCode = otp.join("");

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Ionicons name="shield-checkmark-outline" size={rMS(18)} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Verify this number
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {"We'll text a 6-digit code to "}
        <Text style={[styles.phoneHighlight, { color: colors.text }]}>{phoneNumber}</Text>
      </Text>

      {error ? (
        <View
          style={[
            styles.errorBox,
            {
              backgroundColor: colors.dangerSoft,
              borderColor: `${colors.dangerText}33`,
            },
          ]}
        >
          <Text style={[styles.errorText, { color: colors.dangerText }]}>{error}</Text>
        </View>
      ) : null}

      {!codeSent ? (
        <AccountActionButton
          label={isSendingCode ? "Sending code…" : "Send verification code"}
          onPress={() => {
            onDismissError?.();
            void onSendCode();
          }}
          variant="secondary"
          disabled={isSendingCode}
        />
      ) : (
        <>
          <OtpCodeInput
            value={otp}
            onChange={(next) => {
              setOtp(next);
              onDismissError?.();
            }}
          />
          <AccountActionButton
            label={isVerifying ? "Verifying…" : "Confirm code"}
            onPress={() => {
              const code = otp.join("");
              if (code.length === OTP_LENGTH) {
                void onVerify(code);
              }
            }}
            variant="primary"
            disabled={isVerifying || joinedCode.length !== OTP_LENGTH}
          />
          <AccountActionButton
            label={isSendingCode ? "Sending…" : "Resend code"}
            onPress={() => {
              onDismissError?.();
              void onSendCode();
            }}
            variant="ghost"
            disabled={isSendingCode}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: rV(10),
    marginBottom: rV(6),
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    gap: rV(10),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
  phoneHighlight: {
    fontFamily: Fonts.titleBold,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: rMS(12),
    paddingHorizontal: rS(12),
    paddingVertical: rV(10),
  },
  errorText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
  },
});
