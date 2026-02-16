import { SearchBar } from "@/components/SearchBar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SortTabs from "@/components/SortTabs";
import CollapsibleCard from "@/components/cards/CollapsableCard";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

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
    title: "Are there fees if I pay by Credit/Debit Card?",
    description: ["No, there are no additional fees for payments by credit or debit card."],
  },
  {
    id: "faq-2",
    category: "Payment",
    title: "Why can't I check out with my card?",
    description: ["Ensure your card details are valid, has enough funds, and supports online payments."],
  },
  {
    id: "faq-3",
    category: "Vouchers",
    title: "How do I use vouchers at checkout?",
    description: ["On checkout, pick an active voucher from your profile wallet before placing an order."],
  },
  {
    id: "faq-4",
    category: "Get Started",
    title: "How do I update my profile details?",
    description: ["Go to Profile > Customer Profile, update your details, then tap Save Changes."],
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

  return (
    <View style={styles.container}>
      <ProfileHeader title="FAQ" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <SearchBar
          data={searchData}
          onStartSearch={() => setIsSearching(true)}
          onResults={(results) => setSearchResults(results)}
        />

        <View style={styles.sortWrap}>
          <SortTabs
            options={FILTERS}
            defaultOption="All"
            onChange={(value) => setSelectedFilter(value)}
          />
        </View>

        <View style={styles.listWrap}>
          {filtered.map((item) => (
            <CollapsibleCard key={item.id} title={item.title} description={item.description} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
    paddingBottom: rV(28),
  },
  sortWrap: {
    marginTop: rV(8),
  },
  listWrap: {
    marginTop: rV(10),
    borderRadius: rMS(16),
    overflow: "hidden",
    gap: rV(10),
  },
});
