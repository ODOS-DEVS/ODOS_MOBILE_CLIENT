import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useEmailPreferences } from '@/hooks/useEmailPreferences';

export function EmailPreferencesManager() {
  const { colors } = useTheme();
  const { preferences, loading, togglePreference } = useEmailPreferences();

  const handleToggle = async (key: keyof typeof preferences, label: string) => {
    const success = await togglePreference(key as any);
    if (!success) {
      Alert.alert('Error', `Failed to update ${label}`);
    }
  };

  if (loading || !preferences) {
    return (
      <View style={[styles.container, { backgroundColor: colors.screen }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const preferences_list = [
    {
      key: 'promotional_emails',
      label: 'Promotional Emails',
      description: 'Special offers and discounts',
    },
    {
      key: 'order_updates',
      label: 'Order Updates',
      description: 'Track your orders and deliveries',
    },
    {
      key: 'loyalty_rewards',
      label: 'Loyalty Rewards',
      description: 'Earn points notifications',
    },
    {
      key: 'cart_reminders',
      label: 'Cart Reminders',
      description: 'Abandoned cart recovery',
    },
    {
      key: 'weekly_newsletter',
      label: 'Weekly Newsletter',
      description: 'Curated deals and trends',
    },
    {
      key: 'product_recommendations',
      label: 'Product Recommendations',
      description: 'Personalized suggestions',
    },
    {
      key: 'exclusive_offers',
      label: 'Exclusive Offers',
      description: 'VIP member-only deals',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.screen }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.text }]}>
          Email Preferences
        </Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Manage what emails you receive from ODOS
        </Text>
      </View>

      {/* Preferences List */}
      <View style={styles.preferencesSection}>
        {preferences_list.map((pref, index) => (
          <View
            key={pref.key}
            style={[
              styles.preferenceRow,
              {
                backgroundColor: colors.secondary,
                borderBottomColor: colors.border,
                borderBottomWidth: index < preferences_list.length - 1 ? 1 : 0,
              },
            ]}
          >
            <View style={styles.preferenceLabel}>
              <Text
                style={[styles.preferenceName, { color: colors.text }]}
              >
                {pref.label}
              </Text>
              <Text
                style={[styles.preferenceDesc, { color: colors.textMuted }]}
              >
                {pref.description}
              </Text>
            </View>
            <Switch
              value={
                preferences[pref.key as keyof typeof preferences] as boolean
              }
              onValueChange={() =>
                handleToggle(pref.key as any, pref.label)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.primary}
            />
          </View>
        ))}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={[styles.infoBg, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            💡 We'll always send you important transactional emails like order
            confirmations and shipping updates, regardless of these settings.
          </Text>
        </View>
      </View>

      {/* Last Updated */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Last updated:{' '}
          {new Date(preferences.updated_at).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
  },
  preferencesSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  preferenceLabel: {
    flex: 1,
    marginRight: 12,
  },
  preferenceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDesc: {
    fontSize: 12,
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoBg: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
