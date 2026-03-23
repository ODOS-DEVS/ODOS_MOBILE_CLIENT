import { SearchBar } from "@/components/SearchBar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SortTabs from "@/components/SortTabs";
import CollapsibleCard from "@/components/cards/CollapsableCard";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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

const FILTERS = ["All", "Get Started", "Payment", "Be a vendor", "Vouchers", "Markets"];

export default function FAQScreen() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const filtered = useMemo(() => {
    const base = isSearching ? (searchResults as FAQItem[]) : FAQ_ITEMS;
    if (selectedFilter === "All") return base;
    return base.filter((item) => item.category.toLowerCase() === selectedFilter.toLowerCase());
  }, [isSearching, searchResults, selectedFilter]);

  const searchData = FAQ_ITEMS.map((item) => ({ ...item, title: item.title }));
  const paymentCount = FAQ_ITEMS.filter((item) => item.category === "Payment").length;
  const totalCount = FAQ_ITEMS.length;

  return (
    <View style={styles.container}>
      <ProfileHeader title="FAQ" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroTitle}>Help Center</Text>
            <Text style={styles.heroSub}>Find quick answers for checkout, payment and account issues.</Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{totalCount}</Text>
              <Text style={styles.heroStatLabel}>FAQs</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{paymentCount}</Text>
              <Text style={styles.heroStatLabel}>Payment</Text>
            </View>
          </View>
        </View>

        <SearchBar
          data={searchData}
          onStartSearch={() => setIsSearching(true)}
          onResults={(results) => setSearchResults(results)}
        />

        <View style={styles.sortWrap}>
          <SortTabs options={FILTERS} defaultOption="All" onChange={(value) => setSelectedFilter(value)} />
        </View>

        <View style={styles.listWrap}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="help-circle-outline" size={rMS(28)} color={AppColors.subtext[100]} />
              <Text style={styles.emptyTitle}>No answers found</Text>
              <Text style={styles.emptySub}>Try another keyword or switch the filter category.</Text>
            </View>
          ) : (
            filtered.map((item) => (
              <CollapsibleCard key={item.id} title={item.title} description={item.description} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: rMS(20),
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
    paddingBottom: rV(28),
  },
  heroCard: {
    backgroundColor: AppColors.secondary,
    borderRadius: rMS(16),
    padding: rS(14),
    marginBottom: rV(12),
  },
  heroTitle: {
    fontSize: rMS(17),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
  },
  heroSub: {
    marginTop: rV(4),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#E7EDF2",
    fontFamily: Fonts.text,
  },
  heroStats: {
    marginTop: rV(12),
    borderRadius: rMS(12),
    backgroundColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rV(10),
  },
  heroStatItem: {
    flex: 1,
    alignItems: "center",
  },
  heroStatValue: {
    fontSize: rMS(16),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
  },
  heroStatLabel: {
    marginTop: rV(2),
    fontSize: rMS(11),
    color: "#E5E7EB",
    fontFamily: Fonts.text,
  },
  heroStatDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  sortWrap: {
    marginTop: rV(8),
  },
  listWrap: {
    marginTop: rV(10),
    gap: rV(10),
  },
  emptyState: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    alignItems: "center",
    paddingVertical: rV(28),
    paddingHorizontal: rS(16),
  },
  emptyTitle: {
    marginTop: rV(8),
    fontSize: rMS(15),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  emptySub: {
    marginTop: rV(6),
    textAlign: "center",
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
});
