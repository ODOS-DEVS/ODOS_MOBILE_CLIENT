import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface WithdrawalDetails {
  amount: number;
  accountNumber: string;
  accountName: string;
  payoutMethod: string;
  provider?: string;
  estimatedTime?: string;
  fees?: number;
}

interface Props {
  isVisible: boolean;
  details: WithdrawalDetails;
  isProcessing?: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function WithdrawalConfirmationDialog({
  isVisible,
  details,
  isProcessing = false,
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        },
        container: {
          backgroundColor: colors.screen,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: 32,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 24,
          gap: 12,
        },
        headerIcon: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#FEF3C7',
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerText: {
          flex: 1,
        },
        title: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
        },
        subtitle: {
          fontSize: 12,
          color: colors.textMuted,
          marginTop: 2,
        },
        detailsContainer: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        },
        detailRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        detailRowLast: {
          borderBottomWidth: 0,
        },
        detailLabel: {
          fontSize: 13,
          color: colors.textMuted,
        },
        detailValue: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
          textAlign: 'right',
          flex: 1,
          marginLeft: 12,
        },
        amountContainer: {
          paddingVertical: 16,
        },
        amountLabel: {
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 4,
        },
        amountValue: {
          fontSize: 28,
          fontWeight: '700',
          color: colors.text,
        },
        warningBox: {
          backgroundColor: '#FEF3C7',
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
          flexDirection: 'row',
          gap: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#F59E0B',
        },
        warningText: {
          fontSize: 12,
          color: '#92400E',
          flex: 1,
          lineHeight: 18,
        },
        feeRow: {
          backgroundColor: colors.surfaceMuted,
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        feeLabel: {
          fontSize: 12,
          color: colors.textMuted,
        },
        feeValue: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
        },
        totalRow: {
          backgroundColor: colors.surfaceMuted,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.primary,
        },
        totalLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
        },
        totalValue: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.primary,
        },
        buttonContainer: {
          gap: 12,
        },
        confirmButton: {
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        },
        confirmButtonText: {
          fontSize: 14,
          fontWeight: '700',
          color: '#fff',
        },
        cancelButton: {
          backgroundColor: colors.card,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        },
        cancelButtonText: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.text,
        },
        loadingText: {
          marginLeft: 8,
          fontSize: 14,
          fontWeight: '600',
          color: '#fff',
        },
      }),
    [colors]
  );

  if (!isVisible) return null;

  const totalAmount = details.amount + (details.fees || 0);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="wallet" size={20} color="#F59E0B" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Confirm Withdrawal</Text>
            <Text style={styles.subtitle}>Please verify the details below</Text>
          </View>
        </View>

        {/* Amount */}
        <View style={[styles.detailsContainer, styles.amountContainer]}>
          <Text style={styles.amountLabel}>Withdrawal Amount</Text>
          <Text style={styles.amountValue}>GHS {details.amount.toFixed(2)}</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Method</Text>
            <Text style={styles.detailValue}>{details.payoutMethod}</Text>
          </View>
          {details.provider && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Provider</Text>
              <Text style={styles.detailValue}>{details.provider}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Name</Text>
            <Text style={styles.detailValue}>{details.accountName}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <Text style={styles.detailValue}>{details.accountNumber}</Text>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={16} color="#92400E" />
          <Text style={styles.warningText}>
            This transaction cannot be reversed once confirmed. Make sure all details are correct.
          </Text>
        </View>

        {/* Fees */}
        {details.fees && details.fees > 0 && (
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Transaction Fee</Text>
            <Text style={styles.feeValue}>GHS {details.fees.toFixed(2)}</Text>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Deduction</Text>
          <Text style={styles.totalValue}>GHS {totalAmount.toFixed(2)}</Text>
        </View>

        {/* Estimated Time */}
        {details.estimatedTime && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.detailLabel, { marginLeft: 8 }]}>
                Estimated delivery: {details.estimatedTime}
              </Text>
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            {isProcessing && (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingText}>Processing...</Text>
              </>
            )}
            {!isProcessing && (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.confirmButtonText}>Confirm & Proceed</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
