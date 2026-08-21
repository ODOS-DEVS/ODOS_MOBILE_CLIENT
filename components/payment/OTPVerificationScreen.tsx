import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface Props {
  isVisible: boolean;
  phoneNumber?: string;
  amount?: number;
  isLoading?: boolean;
  error?: string;
  onVerify: (otp: string) => Promise<void>;
  onCancel: () => void;
  onResendOTP?: () => Promise<void>;
  maxAttempts?: number;
  attemptsRemaining?: number;
}

export function OTPVerificationScreen({
  isVisible,
  phoneNumber,
  amount,
  isLoading = false,
  error,
  onVerify,
  onCancel,
  onResendOTP,
  maxAttempts = 5,
  attemptsRemaining = 5,
}: Props) {
  const { colors } = useTheme();
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.screen,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          paddingBottom: 30,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        },
        title: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
        },
        closeButton: {
          padding: 8,
        },
        description: {
          fontSize: 14,
          color: colors.textMuted,
          lineHeight: 20,
          marginBottom: 20,
        },
        infoBox: {
          backgroundColor: colors.secondary,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        },
        infoLabel: {
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 4,
        },
        infoValue: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
        },
        otpContainer: {
          marginBottom: 24,
        },
        otpLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 12,
        },
        otpInput: {
          borderWidth: 2,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 16,
          fontSize: 32,
          fontWeight: '700',
          letterSpacing: 8,
          textAlign: 'center',
          color: colors.text,
          backgroundColor: colors.card,
          fontFamily: 'Courier',
        },
        errorBox: {
          backgroundColor: '#FEE2E2',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#DC2626',
        },
        errorText: {
          fontSize: 12,
          color: '#DC2626',
          flex: 1,
        },
        attemptsText: {
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 16,
        },
        attemptsWarning: {
          fontSize: 12,
          color: '#F59E0B',
          marginBottom: 16,
        },
        buttonContainer: {
          gap: 12,
        },
        resendContainer: {
          alignItems: 'center',
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        resendText: {
          fontSize: 13,
          color: colors.textMuted,
          marginBottom: 8,
        },
        resendButton: {
          paddingVertical: 8,
          paddingHorizontal: 16,
        },
        resendButtonText: {
          fontSize: 13,
          fontWeight: '600',
        },
        countdownText: {
          fontSize: 12,
          color: colors.textMuted,
        },
        loadingContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
        },
        loadingText: {
          fontSize: 13,
          color: colors.textMuted,
          marginTop: 12,
        },
      }),
    [colors, error]
  );

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setOtp('');
    }
  }, [isVisible]);

  // Handle OTP input - only allow digits
  const handleOtpChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setOtp(digits);

    // Auto-verify when 6 digits entered
    if (digits.length === 6) {
      handleVerify(digits);
    }
  };

  const handleVerify = async (otpValue: string = otp) => {
    if (otpValue.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit code');
      return;
    }

    try {
      setVerifying(true);
      await onVerify(otpValue);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!onResendOTP) return;

    try {
      setResendLoading(true);
      await onResendOTP();
      setResendDisabled(true);
      setCountdown(60);

      // Countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setResendLoading(false);
    }
  };

  if (!isVisible) return null;

  if (verifying && isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Verifying OTP...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Verify OTP</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onCancel}
          disabled={verifying}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Enter the 6-digit code sent to your registered phone number to confirm this transaction.
      </Text>

      {/* Info Box */}
      {(phoneNumber || amount) && (
        <View style={styles.infoBox}>
          {amount && (
            <>
              <Text style={styles.infoLabel}>Withdrawal Amount</Text>
              <Text style={styles.infoValue}>GHS {amount.toFixed(2)}</Text>
            </>
          )}
          {phoneNumber && (
            <>
              <Text style={[styles.infoLabel, { marginTop: amount ? 8 : 0 }]}>
                Code sent to
              </Text>
              <Text style={styles.infoValue}>{phoneNumber}</Text>
            </>
          )}
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Attempts Warning */}
      {attemptsRemaining <= 2 && (
        <Text style={styles.attemptsWarning}>
          ⚠️ {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining
        </Text>
      )}
      {attemptsRemaining > 2 && (
        <Text style={styles.attemptsText}>
          {attemptsRemaining} / {maxAttempts} attempts remaining
        </Text>
      )}

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        <Text style={styles.otpLabel}>6-Digit Code</Text>
        <TextInput
          ref={inputRef}
          style={styles.otpInput}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="number-pad"
          maxLength={6}
          editable={!verifying}
          selectTextOnFocus
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          label={verifying ? 'Verifying...' : 'Verify OTP'}
          onPress={() => handleVerify()}
          disabled={verifying || otp.length !== 6}
          loading={verifying}
        />
        <SecondaryButton
          label="Cancel"
          onPress={onCancel}
          disabled={verifying}
        />
      </View>

      {/* Resend Option */}
      {onResendOTP && (
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive code?</Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendDisabled || resendLoading}
          >
            <Text
              style={[
                styles.resendButtonText,
                {
                  color: resendDisabled ? colors.textMuted : colors.primary,
                },
              ]}
            >
              {resendLoading && 'Sending...'}
              {!resendLoading && resendDisabled && `Resend in ${countdown}s`}
              {!resendLoading && !resendDisabled && 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
