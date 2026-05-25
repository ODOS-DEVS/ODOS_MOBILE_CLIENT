import CollapsibleCard from "@/components/cards/CollapsableCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountEmptyState,
  AccountFilterChips,
  AccountInsightCard,
  accountStyles,
} from "@/components/profile/ProfileHubUi";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rV } from "@/styles/responsive";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type FAQItem = {
  id: string;
  category: string;
  title: string;
  description: string[];
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    category: "Payment",
    title: "Are there fees if I pay by credit/debit card?",
    description: ["No. We do not add extra payment fees for debit or credit card transactions."],
  },
  {
    id: "faq-2",
    category: "Payment",
    title: "Why can't I check out with my card?",
    description: ["Check card details, available funds, and whether online transactions are enabled."],
  },
  {
    id: "faq-3",
    category: "Vouchers",
    title: "How do I apply vouchers at checkout?",
    description: ["On checkout, select one active voucher from your profile wallet before placing your order."],
  },
  {
    id: "faq-4",
    category: "Get Started",
    title: "How do I update my profile details?",
    description: ["Open Profile > Customer Profile, edit fields, and tap Save Changes."],
  },
  {
    id: "faq-5",
    category: "Markets",
    title: "How can I find a specific market?",
    description: ["Use category filters or search by market name in Explore and Store sections."],
  },
];

const FILTERS = [
  { key: "All", label: "All" },
  { key: "Get Started", label: "Get Started" },
  { key: "Payment", label: "Payment" },
  { key: "Vouchers", label: "Vouchers" },
  { key: "Markets", label: "Markets" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function FAQScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("All");
  const [query, setQuery] = useState("");

  const paymentCount = FAQ_ITEMS.filter((item) => item.category === "Payment").length;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const matchesFilter =
        selectedFilter === "All" ||
        item.category.toLowerCase() === selectedFilter.toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.description.some((line) => line.toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesQuery;
    });
  }, [query, selectedFilter]);

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="FAQ" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={accountStyles.content}>
        <AccountInsightCard
          title="Help center"
          subtitle="Quick answers for checkout, payments, vouchers, and account setup."
          stats={[
            { value: FAQ_ITEMS.length, label: "FAQs" },
            { value: paymentCount, label: "Payment" },
          ]}
        />

        <View style={searchStyles.wrap}>
          <Ionicons name="search-outline" size={rMS(18)} color="#9CA3AF" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search questions..."
            placeholderTextColor="#9CA3AF"
            style={searchStyles.input}
          />
        </View>

        <AccountFilterChips
          options={FILTERS.map((item) => ({ key: item.key, label: item.label }))}
          activeKey={selectedFilter}
          onChange={setSelectedFilter}
        />

        {filtered.length === 0 ? (
          <AccountEmptyState
            icon="help-circle-outline"
            title="No answers found"
            message="Try another keyword or switch the filter category."
          />
        ) : (
          <View style={faqStyles.list}>
            {filtered.map((item) => (
              <View key={item.id} style={faqStyles.itemWrap}>
                <Text style={faqStyles.category}>{item.category}</Text>
                <CollapsibleCard title={item.title} description={item.description} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const searchStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: rMS(10),
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(16),
    paddingHorizontal: rMS(14),
    paddingVertical: rV(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
  },
  input: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(13.5),
    color: AppColors.text,
    padding: 0,
  },
});

const faqStyles = StyleSheet.create({
  list: {
    gap: rV(10),
  },
  itemWrap: {
    gap: rV(6),
  },
  category: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(10.5),
    color: AppColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
