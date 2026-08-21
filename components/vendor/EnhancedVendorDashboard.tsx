import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeListings: number;
  pendingWithdrawals: number;
  successRate: number;
  averageRating: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface Props {
  stats: DashboardStats;
  actions: QuickAction[];
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  onNavigate?: (screen: string) => void;
}

export function EnhancedVendorDashboard({
  stats,
  actions,
  onRefresh,
  isRefreshing = false,
  onNavigate,
}: Props) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        scrollContent: {
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        header: {
          marginBottom: 24,
        },
        greeting: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 4,
        },
        headerSubtitle: {
          fontSize: 13,
          color: colors.textMuted,
        },
        statsGrid: {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        },
        statCard: {
          flex: 1,
          minWidth: '45%',
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        statIcon: {
          width: 40,
          height: 40,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 8,
        },
        statLabel: {
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 4,
        },
        statValue: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
        },
        actionsSection: {
          marginBottom: 24,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 12,
        },
        actionsGrid: {
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        },
        actionButton: {
          flex: 1,
          minWidth: '45%',
          borderRadius: 12,
          padding: 16,
          justifyContent: 'center',
          alignItems: 'center',
        },
        actionIcon: {
          fontSize: 28,
          marginBottom: 8,
        },
        actionLabel: {
          fontSize: 12,
          fontWeight: '600',
          textAlign: 'center',
          color: '#fff',
        },
        revenueHighlight: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        },
        revenueLabel: {
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 4,
        },
        revenueValue: {
          fontSize: 28,
          fontWeight: '700',
          color: colors.primary,
          marginBottom: 8,
        },
        revenueInfo: {
          fontSize: 11,
          color: colors.textMuted,
        },
        performanceContainer: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
        },
        performanceRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        performanceRowLast: {
          borderBottomWidth: 0,
        },
        performanceLabel: {
          fontSize: 13,
          color: colors.text,
        },
        performanceValue: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.primary,
        },
        ratingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        badgeNew: {
          backgroundColor: '#D1FAE5',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
          marginLeft: 8,
        },
        badgeNewText: {
          fontSize: 10,
          fontWeight: '600',
          color: '#065F46',
        },
      }),
    [colors]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.headerSubtitle}>
          Here's what's happening with your store today
        </Text>
      </View>

      {/* Revenue Highlight */}
      <View style={styles.revenueHighlight}>
        <Text style={styles.revenueLabel}>Total Revenue</Text>
        <Text style={styles.revenueValue}>
          GHS {stats.totalRevenue.toLocaleString()}
        </Text>
        <Text style={styles.revenueInfo}>
          From {stats.totalOrders} orders today
        </Text>
      </View>

      {/* Key Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Ionicons name="cube" size={20} color={colors.primary} />
          </View>
          <Text style={styles.statLabel}>Active Listings</Text>
          <Text style={styles.statValue}>{stats.activeListings}</Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: '#10B98120' },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
          <Text style={styles.statLabel}>Success Rate</Text>
          <Text style={styles.statValue}>{stats.successRate}%</Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: '#F59E0B20' },
            ]}
          >
            <Ionicons name="wallet" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statLabel}>Pending Withdrawals</Text>
          <Text style={styles.statValue}>{stats.pendingWithdrawals}</Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: '#EC4C4620' },
            ]}
          >
            <Ionicons name="star" size={20} color="#EC4C46" />
          </View>
          <Text style={styles.statLabel}>Average Rating</Text>
          <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.performanceContainer}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>

        <View style={styles.performanceRow}>
          <Text style={styles.performanceLabel}>Orders Today</Text>
          <Text style={styles.performanceValue}>{stats.totalOrders}</Text>
        </View>

        <View style={styles.performanceRow}>
          <Text style={styles.performanceLabel}>Success Rate</Text>
          <Text style={styles.performanceValue}>{stats.successRate}%</Text>
        </View>

        <View style={[styles.performanceRow, styles.performanceRowLast]}>
          <Text style={styles.performanceLabel}>Customer Rating</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.performanceValue}>{stats.averageRating.toFixed(1)}</Text>
            <Text style={styles.badgeNewText}>Excellent</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionButton,
                { backgroundColor: action.color },
              ]}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
