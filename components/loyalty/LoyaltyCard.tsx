import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { LoyaltyAccount } from '@/hooks/useLoyalty';

interface Props {
  account: LoyaltyAccount | null;
  loading: boolean;
}

export function LoyaltyCard({ account, loading }: Props) {
  const { colors } = useTheme();

  if (!account) {
    return null;
  }

  const tierEmojis = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
  };

  const tierBenefits = {
    bronze: { discount: 'No discount', shipping: 'Standard shipping' },
    silver: { discount: '5% off orders', shipping: 'Free shipping 50+ GHS' },
    gold: { discount: '10% off orders', shipping: 'Free shipping 30+ GHS' },
  };

  const benefits = tierBenefits[account.tier_level];

  return (
    <TouchableOpacity
      onPress={() => router.push('/(root)/screens/loyalty')}
      activeOpacity={0.7}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Tier Header */}
      <View style={styles.tierHeader}>
        <View style={styles.tierInfo}>
          <Text style={[styles.tierEmoji]}>{tierEmojis[account.tier_level]}</Text>
          <View>
            <Text style={[styles.tierName, { color: colors.text }]}>
              {account.tier_level.charAt(0).toUpperCase() + account.tier_level.slice(1)} Member
            </Text>
            <Text style={[styles.tierProgress, { color: colors.textMuted }]}>
              {account.tier_progress_percent.toFixed(0)}% to next tier
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: account.tier_level === 'gold' ? '#FFD700' : account.tier_level === 'silver' ? '#C0C0C0' : '#CD7F32',
              width: `${Math.min(account.tier_progress_percent, 100)}%`,
            },
          ]}
        />
      </View>

      {/* Points Display */}
      <View style={styles.pointsSection}>
        <View style={styles.pointsBox}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <View style={styles.pointsInfo}>
            <Text style={[styles.pointsLabel, { color: colors.textMuted }]}>Points</Text>
            <Text style={[styles.pointsValue, { color: colors.text }]}>{account.total_points}</Text>
          </View>
          <Text style={[styles.pointsGHS, { color: colors.textMuted }]}>
            = ₵{account.points_value_ghs.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Benefits Row */}
      <View style={styles.benefitsRow}>
        <View style={styles.benefit}>
          <Ionicons name="pricetag" size={16} color={colors.primary} />
          <Text style={[styles.benefitText, { color: colors.text }]}>{benefits.discount}</Text>
        </View>
        <View style={styles.benefit}>
          <Ionicons name="car" size={16} color={colors.primary} />
          <Text style={[styles.benefitText, { color: colors.text }]}>{benefits.shipping}</Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        onPress={() => router.push('/(root)/screens/loyalty')}
        style={[styles.ctaButton, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.ctaText, { color: colors.onPrimary }]}>View & Redeem Points</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.onPrimary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tierEmoji: {
    fontSize: 32,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tierProgress: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pointsSection: {
    marginBottom: 12,
  },
  pointsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 12,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  pointsGHS: {
    fontSize: 12,
    fontWeight: '600',
  },
  benefitsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  benefit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 12,
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
