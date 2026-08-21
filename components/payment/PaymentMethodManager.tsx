import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'ussd';
  name: string;
  lastFour: string;
  provider?: string;
  isDefault: boolean;
  expiresAt?: string;
  createdAt: string;
}

interface Props {
  methods: PaymentMethod[];
  isLoading?: boolean;
  onAddMethod?: () => void;
  onSetDefault?: (methodId: string) => Promise<void>;
  onDeleteMethod?: (methodId: string) => Promise<void>;
  onSelectMethod?: (methodId: string) => void;
  selectable?: boolean;
}

const PAYMENT_TYPE_LABELS = {
  card: 'Credit/Debit Card',
  mobile_money: 'Mobile Money',
  bank_transfer: 'Bank Transfer',
  ussd: 'USSD',
};

const getPaymentIcon = (type: PaymentMethod['type']) => {
  switch (type) {
    case 'card':
      return 'card-outline';
    case 'mobile_money':
      return 'phone-portrait-outline';
    case 'bank_transfer':
      return 'bank-outline';
    case 'ussd':
      return 'cellular-outline';
    default:
      return 'wallet-outline';
  }
};

const getPaymentColor = (type: PaymentMethod['type']) => {
  switch (type) {
    case 'card':
      return '#3B82F6';
    case 'mobile_money':
      return '#10B981';
    case 'bank_transfer':
      return '#8B5CF6';
    case 'ussd':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

export function PaymentMethodManager({
  methods = [],
  isLoading = false,
  onAddMethod,
  onSetDefault,
  onDeleteMethod,
  onSelectMethod,
  selectable = false,
}: Props) {
  const { colors } = useTheme();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.screen,
        },
        listContent: {
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        methodCard: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        methodCardSelected: {
          borderColor: colors.primary,
          borderWidth: 2,
        },
        methodContent: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        methodIcon: {
          width: 44,
          height: 44,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        methodInfo: {
          flex: 1,
        },
        methodName: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
        },
        methodDetails: {
          fontSize: 12,
          color: colors.textMuted,
          marginTop: 2,
        },
        defaultBadge: {
          backgroundColor: '#DBEAFE',
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 4,
          marginTop: 4,
        },
        defaultBadgeText: {
          fontSize: 10,
          fontWeight: '600',
          color: '#0284C7',
        },
        methodActions: {
          flexDirection: 'row',
          gap: 8,
          alignItems: 'center',
        },
        iconButton: {
          width: 36,
          height: 36,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        setDefaultButton: {
          backgroundColor: colors.secondary,
        },
        deleteButton: {
          backgroundColor: '#FEE2E2',
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
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
          marginBottom: 16,
        },
        addButton: {
          backgroundColor: colors.primary,
          borderRadius: 8,
          paddingHorizontal: 20,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        addButtonText: {
          fontSize: 13,
          fontWeight: '600',
          color: '#fff',
        },
        sectionHeader: {
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 8,
          marginTop: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
        sectionHeaderText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }),
    [colors]
  );

  const handleDeleteMethod = async (methodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!onDeleteMethod) return;
            try {
              setDeletingId(methodId);
              await onDeleteMethod(methodId);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (methodId: string) => {
    if (!onSetDefault) return;
    try {
      setSettingDefaultId(methodId);
      await onSetDefault(methodId);
    } finally {
      setSettingDefaultId(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (methods.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyText}>No Payment Methods</Text>
          <Text style={styles.emptySubtext}>
            Add a payment method to get started
          </Text>
          {onAddMethod && (
            <TouchableOpacity style={styles.addButton} onPress={onAddMethod}>
              <Ionicons name="add-circle" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Group methods by type
  const groupedMethods = methods.reduce(
    (groups, method) => {
      const type = method.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(method);
      return groups;
    },
    {} as Record<string, PaymentMethod[]>
  );

  const sections = Object.entries(groupedMethods).map(([type, items]) => ({
    title: PAYMENT_TYPE_LABELS[type as PaymentMethod['type']] || type,
    data: items,
  }));

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: method }) => (
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectable && !method.isDefault && styles.methodCardSelected,
            ]}
            onPress={() => selectable && onSelectMethod?.(method.id)}
            activeOpacity={selectable ? 0.6 : 1}
          >
            <View style={styles.methodContent}>
              <View
                style={[
                  styles.methodIcon,
                  { backgroundColor: getPaymentColor(method.type) + '20' },
                ]}
              >
                <Ionicons
                  name={getPaymentIcon(method.type) as any}
                  size={20}
                  color={getPaymentColor(method.type)}
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDetails}>
                  {method.provider && `${method.provider} • `}
                  •••• {method.lastFour}
                </Text>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
            </View>

            {!selectable && (
              <View style={styles.methodActions}>
                {!method.isDefault && onSetDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(method.id)}
                    disabled={settingDefaultId === method.id}
                  >
                    {settingDefaultId === method.id ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Ionicons
                        name="star-outline"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                {onDeleteMethod && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMethod(method.id)}
                    disabled={deletingId === method.id}
                  >
                    {deletingId === method.id ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        ListHeaderComponent={
          onAddMethod && !selectable ? (
            <TouchableOpacity
              style={[styles.addButton, { marginBottom: 16 }]}
              onPress={onAddMethod}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.addButtonText}>Add New Payment Method</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}
