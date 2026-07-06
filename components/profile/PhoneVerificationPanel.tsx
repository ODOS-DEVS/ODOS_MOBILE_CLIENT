import OtpCodeInput, { OTP_LENGTH } from "@/components/auth/OtpCodeInput";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PhoneVerificationPanelProps = {
  phoneNumber: string;
  codeSent: boolean;
  isSendingCode: boolean;
  isVerifying: boolean;
  verified?: boolean;
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
  verified = false,
  error,
  onSendCode,
  onVerify,
  onDismissError,
}: PhoneVerificationPanelProps) {
  const { colors } = useTheme();
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
  const autoVerifyLock = useRef(false);
  const lastPhoneRef = useRef(phoneNumber);

  useEffect(() => {
    if (lastPhoneRef.current !== phoneNumber) {
      lastPhoneRef.current = phoneNumber;
      setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
      autoVerifyLock.current = false;
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (!codeSent) {
      setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
      autoVerifyLock.current = false;
    }
  }, [codeSent]);

  useEffect(() => {
    if (!isVerifying) {
      autoVerifyLock.current = false;
    }
  }, [isVerifying]);

  const handleComplete = (code: string) => {
    if (autoVerifyLock.current || isVerifying || verified) {
      return;
    }
    autoVerifyLock.current = true;
    void Promise.resolve(onVerify(code)).finally(() => {
      autoVerifyLock.current = false;
    });
  };

  if (verified) {
    return (
      <View
        style={[
          styles.panel,
          styles.successPanel,
          {
            backgroundColor: `${colors.primary}12`,
            borderColor: `${colors.primary}40`,
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={rMS(18)} color={colors.primary} />
        <Text style={[styles.successText, { color: colors.primary }]}>
          {phoneNumber} verified
        </Text>
      </View>
    );
  }

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
        <Ionicons name="shield-checkmark-outline" size={rMS(16)} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Verify number</Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Code sent to{" "}
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
        <Pressable
          style={[
            styles.sendBtn,
            { backgroundColor: `${colors.primary}14`, borderColor: colors.primary },
            isSendingCode && styles.sendBtnDisabled,
          ]}
          onPress={() => {
            onDismissError?.();
            void onSendCode();
          }}
          disabled={isSendingCode}
        >
          {isSendingCode ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.sendBtnText, { color: colors.primary }]}>
              Send code
            </Text>
          )}
        </Pressable>
      ) : (
        <View style={styles.codeSection}>
          <OtpCodeInput
            value={otp}
            compact
            autoFocus
            editable={!isVerifying}
            onChange={(next) => {
              setOtp(next);
              onDismissError?.();
            }}
            onComplete={handleComplete}
          />

          <View style={styles.statusRow}>
            {isVerifying ? (
              <>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.textMuted }]}>
                  Checking code…
                </Text>
              </>
            ) : (
              <Text style={[styles.hintText, { color: colors.textMuted }]}>
                Enter the 6-digit SMS code
              </Text>
            )}
          </View>

          <Pressable
            onPress={() => {
              if (isSendingCode || isVerifying) {
                return;
              }
              onDismissError?.();
              autoVerifyLock.current = false;
              void onSendCode();
            }}
            disabled={isSendingCode || isVerifying}
            hitSlop={8}
          >
            <Text
              style={[
                styles.resendText,
                { color: colors.primary },
                (isSendingCode || isVerifying) && styles.resendDisabled,
              ]}
            >
              {isSendingCode ? "Sending…" : "Resend code"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: rV(8),
    marginBottom: rV(4),
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(12),
    paddingVertical: rV(12),
    gap: rV(8),
  },
  successPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(8),
    paddingVertical: rV(10),
  },
  successText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(6),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
    textAlign: "center",
  },
  phoneHighlight: {
    fontFamily: Fonts.titleBold,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: rMS(10),
    paddingHorizontal: rS(10),
    paddingVertical: rV(8),
  },
  errorText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
    textAlign: "center",
  },
  sendBtn: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: rMS(999),
    paddingHorizontal: rS(14),
    paddingVertical: rV(8),
    minHeight: rV(36),
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    opacity: 0.7,
  },
  sendBtnText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
  },
  codeSection: {
    gap: rV(4),
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(6),
    minHeight: rV(20),
  },
  statusText: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  hintText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    textAlign: "center",
  },
  resendText: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12),
    textAlign: "center",
    paddingVertical: rV(4),
  },
  resendDisabled: {
    opacity: 0.5,
  },
});
