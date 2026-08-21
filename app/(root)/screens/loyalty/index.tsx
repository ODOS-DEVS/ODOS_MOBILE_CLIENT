import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLoyalty } from '@/hooks/useLoyalty';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { useTabBarContentInsetFromContext } from '@/components/navigation/TabBarMetricsContext';

const getTierDetails = (tier: string) => {
  const details: Record<string, { color: string; emoji: string; benefits: string[] }> = {
    bronze: {
      color: '#CD7F32',
      emoji: '🥉',
      benefits: ['1x points multiplier', 'Basic support'],
    },
    silver: {
      color: '#C0C0C0',
      emoji: '🥈',
      benefits: ['1.25x points multiplier', '5% discount', 'Free shipping on 50+ GHS', 'Priority support'],
    },
    gold: {
      color: '#FFD700',
      emoji: '🥇',
      benefits: ['1.5x points multiplier', '10% discount', 'Free shipping on 30+ GHS', 'VIP support', 'Exclusive offers'],
    },
  };
  return details[tier.toLowerCase()] || { color: '#999', emoji: '⭐', benefits: [] };
};

export default function LoyaltyScreen() {
  const { colors } = useTheme();
  const tabBarInset = useTabBarContentInsetFromContext();
  const { account, transactions, loading, error, fetchAccount, fetchTransactionHistory, redeemPoints } = useLoyalty();

  const tierDetails = useMemo(() => {
    if (!account) return getTierDetails('bronze');
    return getTierDetails(account.tier_level);
  }, [account]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchAccount(), fetchTransactionHistory()]);
  }, [fetchAccount, fetchTransactionHistory]);

  const handleRedeemPoints = useCallback(() => {
    if (!account) return;

    Alert.prompt(
      'Redeem Points',
      `You have ${account.total_points} points available.\n\nHow many points would you like to redeem? (100 points = 1 GHS)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async (value) => {
            const points = parseInt(value, 10);
            if (isNaN(points) || points <= 0) {
              Alert.alert('Invalid amount', 'Please enter a valid number of points');
              return;
            }
            if (points > account.total_points) {
              Alert.alert('Insufficient points', 'You don\'t have enough points to redeem');
              return;
            }

            const success = await redeemPoints(points);
            if (success) {
              Alert.alert('Success', `Redeemed ${points} points for GHS ${(points / 100).toFixed(2)}`);
              await handleRefresh();
            } else {
              Alert.alert('Error', 'Failed to redeem points');
            }
          },
        },
      ],
      'plain-text',
      '',
      'decimal-pad'
    );
  }, [account, redeemPoints, handleRefresh]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        scrollContent: {
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: tabBarInset,
        },
        tierCard: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: tierDetails.color,
        },
        tierHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        },
        tierEmoji: {
          fontSize: 48,
          marginRight: 12,
        },
        tierInfo: {
          flex: 1,
        },
        tierName: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          textTransform: 'capitalize',
        },
        tierProgress: {
          fontSize: 12,
          color: colors.textMuted,
          marginTop: 4,
        },
        pointsSection: {
          marginBottom: 20,
        },
        pointsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        pointsLabel: {
          fontSize: 14,
          color: colors.textMuted,
        },
        pointsValue: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
        },
        progressBar: {
          height: 8,
          backgroundColor: colors.border,
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 8,
        },
        progressFill: {
          height: '100%',
          backgroundColor: tierDetails.color,
        },
        progressText: {
          fontSize: 12,
          color: colors.textMuted,
          textAlign: 'right',
        },
        benefitsSection: {
          marginTop: 16,
          backgroundColor: colors.secondary,
          borderRadius: 12,
          padding: 12,
        },
        benefitTitle: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.textMuted,
          marginBottom: 8,
          textTransform: 'uppercase',
        },
        benefitItem: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        },
        benefitCheckmark: {
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: tierDetails.color,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        },
        benefitText: {
          fontSize: 13,
          color: colors.text,
          flex: 1,
        },
        actionButtons: {
          flexDirection: 'row',
          gap: 10,
          marginTop: 16,
        },
        button: {
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
        primaryButton: {
          backgroundColor: colors.primary,
        },
        primaryButtonText: {
          color: '#fff',
          fontSize: 13,
          fontWeight: '700',
        },
        secondaryButton: {
          backgroundColor: colors.secondary,
          borderWidth: 1,
          borderColor: colors.border,
        },
        secondaryButtonText: {
          color: colors.text,
          fontSize: 13,
          fontWeight: '700',
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 12,
          marginTop: 20,
        },
        transactionItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: colors.card,
          borderRadius: 8,
          marginBottom: 8,
          borderLeftWidth: 3,
        },
        transactionEarn: {
          borderLeftColor: '#10B981',
        },
        transactionRedeem: {
          borderLeftColor: '#F59E0B',
        },
        transactionInfo: {
          flex: 1,
        },
        transactionType: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
          textTransform: 'capitalize',
        },
        transactionDate: {
          fontSize: 11,
          color: colors.textMuted,
          marginTop: 2,
        },
        transactionPoints: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.text,
        },
        emptyMessage: {
          textAlign: 'center',
          fontSize: 13,
          color: colors.textMuted,
          marginVertical: 32,
        },
        loadingContainer: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 40,
        },
        errorContainer: {
          backgroundColor: '#FEE2E2',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        },
        errorText: {
          color: '#DC2626',
          fontSize: 12,
        },
      }),
    [colors, tabBarInset, tierDetails.color]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ProfileHeader title="Loyalty Rewards" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.container}>
        <ProfileHeader title="Loyalty Rewards" showBackButton />
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyMessage}>Unable to load loyalty account</Text>
        </View>
      </View>
    );
  }

  const tierProgress = (account.tier_progress_percent || 0) * 100;

  return (
    <View style={styles.container}>
      <ProfileHeader title="Loyalty Rewards" showBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Tier Card */}
        <View style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierEmoji}>{tierDetails.emoji}</Text>
            <View style={styles.tierInfo}>
              <Text style={styles.tierName}>{account.tier_level} Member</Text>
              <Text style={styles.tierProgress}>
                {account.lifetime_spend.toLocaleString()} GHS spent
              </Text>
            </View>
          </View>

          {/* Points Section */}
          <View style={styles.pointsSection}>
            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Available Points</Text>
              <Text style={styles.pointsValue}>{account.total_points.toLocaleString()}</Text>
            </View>
            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Point Value</Text>
              <Text style={styles.pointsValue}>GHS {(account.total_points / 100).toFixed(2)}</Text>
            </View>
          </View>

          {/* Progress to Next Tier */}
          {account.tier_level !== 'gold' && (
            <>
              <Text style={styles.progressText}>Progress to next tier: {Math.round(tierProgress)}%</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${tierProgress}%` },
                  ]}
                />
              </View>
            </>
          )}

          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitTitle}>Your Benefits</Text>
            {tierDetails.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitCheckmark}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleRedeemPoints}
            >
              <Text style={styles.primaryButtonText}>Redeem Points</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => Alert.alert('Info', 'Earn 1 point per GHS spent. Bonus points for tier members!')}
            >
              <Text style={styles.secondaryButtonText}>How to Earn</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        {transactions && transactions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {transactions.slice(0, 10).map((transaction, index) => (
              <View
                key={index}
                style={[
                  styles.transactionItem,
                  transaction.event_type === 'earn'
                    ? styles.transactionEarn
                    : styles.transactionRedeem,
                ]}
              >
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>
                    {transaction.event_type === 'earn' ? '+ Earned' : '- Redeemed'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionPoints,
                  { color: transaction.event_type === 'earn' ? '#10B981' : '#F59E0B' }
                ]}>
                  {transaction.event_type === 'earn' ? '+' : '-'}{transaction.points_amount}
                </Text>
              </View>
            ))}
          </>
        )}

        {(!transactions || transactions.length === 0) && (
          <Text style={styles.emptyMessage}>No transaction history yet</Text>
        )}
      </ScrollView>
    </View>
  );
}
