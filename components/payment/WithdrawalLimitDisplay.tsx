import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ProgressBar } from 'react-native-paper';

interface LimitInfo {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}

interface Props {
  daily: LimitInfo;
  weekly: LimitInfo;
  monthly: LimitInfo;
  singleLimit: number;
  largeThreshold: number;
}

export function WithdrawalLimitDisplay({
  daily,
  weekly,
  monthly,
  singleLimit,
  largeThreshold,
}: Props) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginVertical: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        title: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 16,
        },
        limitRow: {
          marginBottom: 20,
        },
        limitLabel: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 8,
        },
        limitStats: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 6,
        },
        limitText: {
          fontSize: 12,
          color: colors.textMuted,
        },
        limitAmount: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.text,
        },
        progressContainer: {
          marginVertical: 6,
        },
        warningBox: {
          backgroundColor: '#FEF3C7',
          borderRadius: 8,
          padding: 12,
          marginTop: 16,
          borderLeftWidth: 4,
          borderLeftColor: '#F59E0B',
        },
        warningText: {
          fontSize: 12,
          color: '#92400E',
          lineHeight: 18,
        },
        infoBox: {
          backgroundColor: colors.secondary,
          borderRadius: 8,
          padding: 12,
          marginTop: 12,
        },
        infoLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textMuted,
          marginBottom: 4,
        },
        infoValue: {
          fontSize: 13,
          color: colors.text,
        },
      }),
    [colors]
  );

  const getProgressColor = (percentage: number) => {
    if (percentage > 90) return '#EF4444';
    if (percentage > 70) return '#F59E0B';
    return '#10B981';
  };

  const renderLimitRow = (label: string, limit: LimitInfo) => (
    <View style={styles.limitRow}>
      <Text style={styles.limitLabel}>{label}</Text>
      <View style={styles.limitStats}>
        <Text style={styles.limitText}>Used</Text>
        <Text style={styles.limitAmount}>
          GHS {limit.used.toFixed(2)} / {limit.limit.toFixed(2)}
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={Math.min(limit.percentage / 100, 1)}
          color={getProgressColor(limit.percentage)}
          style={{ height: 6, borderRadius: 3 }}
        />
      </View>
      <View style={styles.limitStats}>
        <Text style={styles.limitText}>Remaining</Text>
        <Text style={styles.limitAmount}>
          GHS {limit.remaining.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdrawal Limits</Text>

      {renderLimitRow('Daily', daily)}
      {renderLimitRow('Weekly', weekly)}
      {renderLimitRow('Monthly', monthly)}

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Maximum single withdrawal</Text>
        <Text style={styles.infoValue}>GHS {singleLimit.toFixed(2)}</Text>
        <Text style={[styles.infoLabel, { marginTop: 8 }]}>
          Large withdrawal threshold (requires 2FA)
        </Text>
        <Text style={styles.infoValue}>GHS {largeThreshold.toFixed(2)}</Text>
      </View>

      {daily.percentage > 80 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            📊 You've used {daily.percentage.toFixed(0)}% of your daily withdrawal limit.
            Additional withdrawals today may require additional verification.
          </Text>
        </View>
      )}
    </View>
  );
}
