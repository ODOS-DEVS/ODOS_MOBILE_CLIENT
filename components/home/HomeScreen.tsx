import React, { useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { useLoyalty } from '@/hooks/useLoyalty';
import { LoyaltyCard } from '@/components/loyalty/LoyaltyCard';
import { HomeFeedSection } from '@/components/home/FeedSection';

export function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { feed, loading, refreshFeed } = useHomeFeed();
  const { account, loading: loyaltyLoading } = useLoyalty();

  const handleRefresh = useCallback(async () => {
    await refreshFeed();
  }, [refreshFeed]);

  // Feed section order
  const sectionOrder = [
    'recommended',
    'trending',
    'recently_viewed',
    'wishlist',
    'category_spotlight',
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.screen }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Loyalty Card - only for authenticated users */}
      {user && account && (
        <View style={styles.loyaltySection}>
          <LoyaltyCard account={account} loading={loyaltyLoading} />
        </View>
      )}

      {/* Feed Sections */}
      {feed?.sections && (
        <View>
          {sectionOrder.map((sectionKey) => {
            const section = feed.sections[sectionKey];
            if (!section) return null;

            return (
              <HomeFeedSection
                key={sectionKey}
                section={section}
                sectionKey={sectionKey}
              />
            );
          })}
        </View>
      )}

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loyaltySection: {
    paddingTop: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
