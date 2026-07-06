import {
  FaqAccordionItem,
  FaqCategory,
  FaqCategoryChips,
  FaqEmptyState,
  FaqHero,
  FaqItem,
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
import { rV } from "@/styles/responsive";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-account-1",
    category: "Get Started",
    title: "How do I update my profile details?",
    description: [
      "Open Profile, then Customer Profile.",
      "Edit your name, phone, or address fields and tap Save Changes.",
    ],
  },
  {
    id: "faq-account-2",
    category: "Get Started",
    title: "Do I need an account to shop on ODOS?",
    description: [
      "You can browse stores and products as a guest.",
      "Sign in to save addresses, track orders, use vouchers, and chat with stores.",
    ],
  },
  {
    id: "faq-orders-1",
    category: "Orders",
    title: "How do I track my order?",
    description: [
      "Go to Profile > Orders and tap your order.",
      "You'll see live status updates, receipt details, and store chat if you need help.",
    ],
  },
  {
    id: "faq-orders-2",
    category: "Orders",
    title: "Can I cancel an order?",
    description: [
      "If the order has not been processed yet, open the order detail screen and tap Cancel.",
      "Once a store starts preparing your order, contact the store through order chat.",
    ],
  },
  {
    id: "faq-delivery-1",
    category: "Delivery",
    title: "What delivery options does ODOS offer?",
    description: [
      "Standard delivery usually takes 3–5 business days.",
      "Express is 1–2 days where available.",
      "Same-day delivery may be offered in Greater Accra when your address qualifies.",
    ],
  },
  {
    id: "faq-delivery-2",
    category: "Delivery",
    title: "How is my delivery fee calculated?",
    description: [
      "Delivery fees depend on your region, cart total, and the method you choose at checkout.",
      "The exact fee is always shown before you pay — no surprises after checkout.",
    ],
  },
  {
    id: "faq-payment-1",
    category: "Payment",
    title: "Are there extra fees for card payments?",
    description: [
      "No. ODOS does not add extra payment fees for debit or credit card transactions.",
    ],
  },
  {
    id: "faq-payment-2",
    category: "Payment",
    title: "Why can't I check out with my card?",
    description: [
      "Confirm your card number, expiry date, and CVV are correct.",
      "Check that you have enough funds and that online transactions are enabled with your bank.",
      "If it still fails, try another payment method or contact support.",
    ],
  },
  {
    id: "faq-payment-3",
    category: "Payment",
    title: "Can I pay with my ODOS wallet?",
    description: [
      "If wallet balance is available at checkout, you'll see it as a payment option.",
      "Top up your wallet from Profile before checkout if needed.",
    ],
  },
  {
    id: "faq-vouchers-1",
    category: "Vouchers",
    title: "How do I apply a voucher at checkout?",
    description: [
      "Claim vouchers from Deals or your voucher wallet in Profile.",
      "At checkout, tap Browse Wallet or enter your code before placing the order.",
    ],
  },
  {
    id: "faq-vouchers-2",
    category: "Vouchers",
    title: "Why was my voucher rejected?",
    description: [
      "The voucher may have expired, already been used, or not meet the minimum order amount.",
      "Check the voucher details in Profile > Vouchers for terms and expiry.",
    ],
  },
  {
    id: "faq-returns-1",
    category: "Returns",
    title: "How do I start a return?",
    description: [
      "Open Profile > Returns and select the delivered order item.",
      "Explain the issue and submit — the store or ODOS team will review your request.",
    ],
  },
  {
    id: "faq-returns-2",
    category: "Returns",
    title: "How long do refunds take?",
    description: [
      "After your return is approved, refunds are processed back to your original payment method.",
      "Timing depends on your bank or mobile money provider — usually a few business days.",
    ],
  },
  {
    id: "faq-markets-1",
    category: "Markets",
    title: "How do I find stores in my city?",
    description: [
      "Browse Markets from the home tab or search by store name.",
      "Use category filters to narrow down fashion, electronics, beauty, and more.",
    ],
  },
  {
    id: "faq-markets-2",
    category: "Markets",
    title: "Can I chat with a store before buying?",
    description: [
      "Yes. Open a product or store page and tap Chat to message the vendor directly.",
      "You can also ask the ODOS Assistant for help finding the right store.",
    ],
  },
];

const CATEGORY_TOTAL = new Set(FAQ_ITEMS.map((item) => item.category)).size;

export default function FAQScreen() {
  const accountStyles = useAccountStyles();
  const [selectedFilter, setSelectedFilter] = useState<FaqCategory>("All");
  const [query, setQuery] = useState("");
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
