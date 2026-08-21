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

export interface VendorOrder {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerImage?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

interface Props {
  order: VendorOrder;
  onPress?: () => void;
  onViewDetails?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, status: string) => void;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: 'hourglass', color: '#F59E0B' },
  processing: { label: 'Processing', icon: 'cog', color: '#3B82F6' },
  shipped: { label: 'Shipped', icon: 'send', color: '#8B5CF6' },
  delivered: { label: 'Delivered', icon: 'checkmark-circle', color: '#10B981' },
  cancelled: { label: 'Cancelled', icon: 'close-circle', color: '#EF4444' },
};

export function VendorOrderCard({
  order,
  onPress,
  onViewDetails,
  onUpdateStatus,
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
          fontSize: 13,
          fontWeight: '600',
          color: colors.textMuted,
          marginBottom: 4,
        },
        customerName: {
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
          color: '#fff',
        },
        body: {
          padding: 16,
          gap: 12,
        },
        itemRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        itemLabel: {
          fontSize: 13,
          color: colors.textMuted,
        },
        itemValue: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.text,
        },
        amountValue: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.primary,
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
        detailsButton: {
          backgroundColor: colors.secondary,
          borderWidth: 1,
          borderColor: colors.border,
        },
        detailsButtonText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.text,
        },
        updateButton: {
          backgroundColor: colors.primary,
        },
        updateButtonText: {
          fontSize: 12,
          fontWeight: '600',
          color: '#fff',
        },
        deliveryInfo: {
          backgroundColor: colors.screen,
          borderRadius: 8,
          padding: 8,
          marginTop: 8,
        },
        deliveryLabel: {
          fontSize: 11,
          color: colors.textMuted,
          marginBottom: 2,
        },
        deliveryValue: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.text,
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
          <Text style={styles.customerName}>{order.customerName}</Text>
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
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Items:</Text>
          <Text style={styles.itemValue}>{order.itemCount} item(s)</Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Total Amount:</Text>
          <Text style={styles.amountValue}>GHS {order.totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Order Date:</Text>
          <Text style={styles.itemValue}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {order.trackingNumber && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Tracking Number</Text>
            <Text style={styles.deliveryValue}>{order.trackingNumber}</Text>
          </View>
        )}

        {order.estimatedDelivery && order.status !== 'delivered' && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
            <Text style={styles.deliveryValue}>
              {new Date(order.estimatedDelivery).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => onViewDetails?.(order.orderId)}
        >
          <Ionicons name="eye" size={14} color={styles.detailsButtonText.color} />
          <Text style={styles.detailsButtonText}>View Details</Text>
        </Pressable>

        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <Pressable
            style={[styles.actionButton, styles.updateButton]}
            onPress={() => onUpdateStatus?.(order.orderId, order.status)}
          >
            <Ionicons name="arrow-forward" size={14} color="#fff" />
            <Text style={styles.updateButtonText}>Update Status</Text>
          </Pressable>
        )}
      </View>
    </TouchableOpacity>
  );
}
