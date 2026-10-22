import {
  FaqAccordionItem,
  FaqCategory,
  FaqCategoryChips,
  FaqEmptyState,
  FaqHero,
  FaqSearchBar,
  FaqSectionHeader,
  FaqStillNeedHelp,
  buildFaqCounts,
  filterFaqItems,
  groupFaqByCategory,
  useFaqAccordion,
  useResetOnFilterChange,
} from "@/components/help/FaqUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAccountStyles } from "@/components/profile/ProfileHubUi";
import { FAQ_ITEMS } from "@/constants/faqContent";
import { rV } from "@/styles/responsive";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";


const CATEGORY_TOTAL = new Set(FAQ_ITEMS.map((item) => item.category)).size;

export default function FAQScreen() {
  const accountStyles = useAccountStyles();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [selectedFilter, setSelectedFilter] = useState<FaqCategory>("All");
  const [query, setQuery] = useState(typeof q === "string" ? q : "");
  const { expandedId, toggle, collapseAll } = useFaqAccordion();

  useResetOnFilterChange(collapseAll, selectedFilter, query);

  const filtered = useMemo(
    () => filterFaqItems(FAQ_ITEMS, selectedFilter, query),
    [query, selectedFilter],
  );

  const counts = useMemo(() => buildFaqCounts(FAQ_ITEMS), []);
  const grouped = useMemo(
    () => (selectedFilter === "All" && !query.trim() ? groupFaqByCategory(filtered) : null),
    [filtered, query, selectedFilter],
  );

  const clearFilters = () => {
    setQuery("");
    setSelectedFilter("All");
  };

  let itemIndex = 0;

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="FAQ" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={accountStyles.content}>
        <FaqHero totalCount={FAQ_ITEMS.length} categoryCount={CATEGORY_TOTAL} />

        <View style={{ marginTop: rV(14), gap: rV(12) }}>
          <FaqSearchBar value={query} onChangeText={setQuery} />
          <FaqCategoryChips
            activeKey={selectedFilter}
            onChange={setSelectedFilter}
            counts={counts}
          />
        </View>

        {filtered.length === 0 ? (
          <FaqEmptyState onClear={clearFilters} />
        ) : grouped ? (
          <View style={{ gap: rV(10), marginTop: rV(6) }}>
            {grouped.map((section) => (
              <View key={section.category}>
                <FaqSectionHeader title={section.category} />
                <View style={{ gap: rV(10) }}>
                  {section.items.map((item) => {
                    const index = itemIndex++;
                    return (
                      <FaqAccordionItem
                        key={item.id}
                        item={item}
                        expanded={expandedId === item.id}
                        onToggle={() => toggle(item.id)}
                        index={index}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ gap: rV(10), marginTop: rV(6) }}>
            {filtered.map((item, index) => (
              <FaqAccordionItem
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onToggle={() => toggle(item.id)}
                index={index}
              />
            ))}
          </View>
        )}

        <FaqStillNeedHelp />
      </ScrollView>
    </View>
  );
}
