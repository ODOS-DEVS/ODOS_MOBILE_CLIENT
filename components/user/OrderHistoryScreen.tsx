import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { UserOrderCard, UserOrder } from './UserOrderCard';

interface OrderGroup {
  title: string;
  data: UserOrder[];
}

interface Props {
  orders?: UserOrder[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onOrderPress?: (orderId: string) => void;
  onTrackOrder?: (orderId: string) => void;
  onReorderItems?: (orderId: string) => void;
  onInitiateReturn?: (orderId: string) => void;
}

const ORDER_FILTERS = [
  { id: 'all', label: 'All Orders', icon: 'list' },
  { id: 'processing', label: 'Processing', icon: 'cog' },
  { id: 'shipped', label: 'Shipped', icon: 'send' },
  { id: 'delivered', label: 'Delivered', icon: 'checkmark-circle' },
  { id: 'returned', label: 'Returned', icon: 'arrow-back' },
];

export function OrderHistoryScreen({
  orders = [],
  isLoading = false,
  onRefresh,
  onOrderPress,
  onTrackOrder,
  onReorderItems,
  onInitiateReturn,
}: Props) {
  const { colors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        header: {
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        title: {
          fontSize: 20,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 16,
        },
        filterScroll: {
          marginHorizontal: -16,
          paddingHorizontal: 16,
        },
        filterButton: {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          marginRight: 10,
          borderWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        filterButtonActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        filterButtonInactive: {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        filterButtonText: {
          fontSize: 12,
          fontWeight: '600',
        },
        filterButtonTextActive: {
          color: '#fff',
        },
        filterButtonTextInactive: {
          color: colors.text,
        },
        contentContainer: {
          flex: 1,
        },
        listContent: {
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        sectionHeader: {
          backgroundColor: colors.surfaceMuted,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          marginVertical: 12,
          marginBottom: 12,
        },
        sectionHeaderText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 32,
        },
        emptyIcon: {
          fontSize: 48,
          marginBottom: 16,
        },
        emptyText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 8,
          textAlign: 'center',
        },
        emptySubtext: {
          fontSize: 12,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 18,
        },
        statsContainer: {
          flexDirection: 'row',
          gap: 12,
          marginBottom: 16,
        },
        statBox: {
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: 10,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
        },
        statValue: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.primary,
          marginBottom: 2,
        },
        statLabel: {
          fontSize: 11,
          color: colors.textMuted,
        },
      }),
    [colors]
  );

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'all') return orders;
    return orders.filter((order) => order.status === selectedFilter);
  }, [orders, selectedFilter]);

  // Group orders by date
  const groupedOrders = useMemo(() => {
    const groups: Record<string, UserOrder[]> = {};

    filteredOrders.forEach((order) => {
      const date = new Date(order.orderDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key = 'Other';
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    });

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredOrders]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: orders.length,
      processing: orders.filter((o) => o.status === 'processing').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    };
  }, [orders]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⏳</Text>
          <Text style={styles.emptyText}>Loading your orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.processing}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {ORDER_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id
                  ? styles.filterButtonActive
                  : styles.filterButtonInactive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={12}
                color={
                  selectedFilter === filter.id
                    ? '#fff'
                    : colors.text
                }
              />
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter.id
                    ? styles.filterButtonTextActive
                    : styles.filterButtonTextInactive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <View style={styles.contentContainer}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'all'
                ? 'Start shopping to see your orders here'
                : `No ${selectedFilter} orders found`}
            </Text>
          </View>
        ) : (
          <SectionList
            sections={groupedOrders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              ) : undefined
            }
            renderItem={({ item }) => (
              <UserOrderCard
                order={item}
                onPress={() => onOrderPress?.(item.orderId)}
                onTrackOrder={onTrackOrder}
                onReorderItems={onReorderItems}
                onInitiateReturn={onInitiateReturn}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
