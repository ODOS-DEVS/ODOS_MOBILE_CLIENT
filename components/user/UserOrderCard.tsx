import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export interface UserOrder {
  id: string;
  orderId: string;
  storeName: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  totalAmount: number;
  itemCount: number;
  orderDate: string;
  estimatedDelivery?: string;
  deliveryDate?: string;
  trackingUrl?: string;
}

interface Props {
  order: UserOrder;
  onPress?: () => void;
  onTrackOrder?: (orderId: string) => void;
  onReorderItems?: (orderId: string) => void;
  onInitiateReturn?: (orderId: string) => void;
}

const STATUS_CONFIG = {
  processing: { label: 'Processing', icon: 'cog', color: '#3B82F6' },
  shipped: { label: 'Shipped', icon: 'send', color: '#8B5CF6' },
  delivered: { label: 'Delivered', icon: 'checkmark-circle', color: '#10B981' },
  cancelled: { label: 'Cancelled', icon: 'close-circle', color: '#EF4444' },
  returned: { label: 'Returned', icon: 'arrow-back', color: '#F59E0B' },
};

export function UserOrderCard({
  order,
  onPress,
  onTrackOrder,
  onReorderItems,
  onInitiateReturn,
}: Props) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          marginBottom: 12,
        },
        header: {
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        headerLeft: {
          flex: 1,
        },
        orderId: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textMuted,
          marginBottom: 4,
        },
        storeName: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.text,
        },
        statusBadge: {
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        statusText: {
          fontSize: 11,
          fontWeight: '600',
        },
        body: {
          padding: 16,
          gap: 10,
        },
        infoRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        infoLabel: {
          fontSize: 12,
          color: colors.textMuted,
        },
        infoValue: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.text,
        },
        amountValue: {
          fontSize: 15,
          fontWeight: '700',
          color: colors.primary,
        },
        deliveryInfo: {
          backgroundColor: colors.screen,
          borderRadius: 8,
          padding: 10,
          marginTop: 4,
        },
        deliveryLabel: {
          fontSize: 11,
          color: colors.textMuted,
          marginBottom: 2,
        },
        deliveryValue: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.text,
        },
        progressBar: {
          height: 4,
          backgroundColor: colors.border,
          borderRadius: 2,
          marginTop: 8,
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          backgroundColor: colors.primary,
        },
        footer: {
          padding: 12,
          backgroundColor: colors.screen,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          flexDirection: 'row',
          gap: 8,
        },
        actionButton: {
          flex: 1,
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 4,
        },
        trackButton: {
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.border,
        },
        trackButtonText: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.text,
        },
        primaryButton: {
          backgroundColor: colors.primary,
        },
        primaryButtonText: {
          fontSize: 11,
          fontWeight: '600',
          color: '#fff',
        },
      }),
    [colors]
  );

  const statusConfig = STATUS_CONFIG[order.status];
  const statusBgColor =
    order.status === 'delivered'
      ? '#D1FAE5'
      : order.status === 'cancelled'
      ? '#FEE2E2'
      : order.status === 'shipped'
      ? '#E0E7FF'
      : order.status === 'processing'
      ? '#DBEAFE'
      : '#FEF3C7';

  const statusTextColor =
    order.status === 'delivered'
      ? '#065F46'
      : order.status === 'cancelled'
      ? '#7F1D1D'
      : order.status === 'shipped'
      ? '#3730A3'
      : order.status === 'processing'
      ? '#0284C7'
      : '#92400E';

  // Calculate progress for progress bar
  const getProgress = () => {
    switch (order.status) {
      case 'processing':
        return 0.25;
      case 'shipped':
        return 0.75;
      case 'delivered':
        return 1;
      default:
        return 0;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.6}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>Order #{order.orderId}</Text>
          <Text style={styles.storeName}>{order.storeName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusBgColor },
          ]}
        >
          <Ionicons
            name={statusConfig.icon as any}
            size={12}
            color={statusTextColor}
          />
          <Text style={[styles.statusText, { color: statusTextColor }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Items:</Text>
          <Text style={styles.infoValue}>{order.itemCount} item(s)</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.amountValue}>GHS {order.totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order Date:</Text>
          <Text style={styles.infoValue}>
            {new Date(order.orderDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Progress Bar */}
        {order.status !== 'cancelled' && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgress() * 100}%` },
              ]}
            />
          </View>
        )}

        {/* Delivery Info */}
        {order.estimatedDelivery && order.status !== 'delivered' && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
            <Text style={styles.deliveryValue}>
              {new Date(order.estimatedDelivery).toLocaleDateString()}
            </Text>
          </View>
        )}

        {order.deliveryDate && order.status === 'delivered' && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Delivered On</Text>
            <Text style={styles.deliveryValue}>
              {new Date(order.deliveryDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {(order.status === 'shipped' || order.status === 'processing') && (
          <Pressable
            style={[styles.actionButton, styles.trackButton]}
            onPress={() => onTrackOrder?.(order.orderId)}
          >
            <Ionicons name="location" size={12} color={styles.trackButtonText.color} />
            <Text style={styles.trackButtonText}>Track</Text>
          </Pressable>
        )}

        {order.status === 'delivered' && (
          <>
            <Pressable
              style={[styles.actionButton, styles.trackButton]}
              onPress={() => onReorderItems?.(order.orderId)}
            >
              <Ionicons name="reload" size={12} color={styles.trackButtonText.color} />
              <Text style={styles.trackButtonText}>Reorder</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => onInitiateReturn?.(order.orderId)}
            >
              <Ionicons name="arrow-back" size={12} color="#fff" />
              <Text style={styles.primaryButtonText}>Return</Text>
            </Pressable>
          </>
        )}

        {!order.status.includes('delivered') &&
          order.status !== 'cancelled' && (
          <Pressable
            style={[styles.actionButton, styles.trackButton]}
            onPress={() => onTrackOrder?.(order.orderId)}
          >
            <Ionicons name="eye" size={12} color={styles.trackButtonText.color} />
            <Text style={styles.trackButtonText}>Details</Text>
          </Pressable>
        )}
      </View>
    </TouchableOpacity>
  );
}
