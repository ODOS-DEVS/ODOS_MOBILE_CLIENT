import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import RecommendationCard from '@/components/cards/RecommendationCard';
import type { FeedProduct, FeedSection } from '@/hooks/useHomeFeed';

interface Props {
  section: FeedSection;
  sectionKey: string;
}

export function HomeFeedSection({ section, sectionKey }: Props) {
  const { colors } = useTheme();

  if (!section.products || section.products.length === 0) {
    return null;
  }

  const handleViewAll = () => {
    router.push({
      pathname: '/(root)/screens/browse/[section]',
      params: {
        section: sectionKey,
        title: section.title,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>{section.title}</Text>
          {section.subtitle && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{section.subtitle}</Text>
          )}
        </View>
        {section.count && (
          <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View all</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Products Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {section.products.map((product, index) => (
          <View key={product.id || index} style={styles.productWrapper}>
            <RecommendationCard {...product} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productWrapper: {
    width: 160,
  },
});
