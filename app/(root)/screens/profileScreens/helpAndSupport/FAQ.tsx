import CollapsibleCard from "@/components/cards/CollapsableCard";
import { SearchBar } from "@/components/SearchBar";
import SortTabs from "@/components/SortTabs";
import Colors, { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FAQScreen = () => {
  const router = useRouter();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={AppColors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>FAQ</Text>
      </View>

      {/* Search */}
      <View>
        <SearchBar
          data={[]}
          onResults={function (results: any[]): void {
            throw new Error("Function not implemented.");
          }}
        />
      </View>

      {/* Filters */}
      <View className="pt-4">
        <SortTabs
          options={[
            "All",
            "Get Started",
            "Payment",
            "Be a vendor",
            "Vouchers",
            "Markets",
          ]}
          onChange={() => {}}
          defaultOption="All"
        />
      </View>

      {/* FAQ List */}
      <View style={styles.list}>
        <CollapsibleCard
          title="Are there fees if I pay by Credit/Debit Card?"
          description={[
            "No, there are no additional fees for payments by Credit / Debit cards.",
          ]}
        />

        <CollapsibleCard
          title="Why can't I check out with my credit/debit card?"
          description={[
            "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
          ]}
        />

        <CollapsibleCard
          title="What payment methods are supported for Postpaid bills?"
          description={[
            "Lorem ipsum is simply dummy text of the printing and typesetting industry.",
          ]}
        />

        <CollapsibleCard
          title="How to make purchases with Apple Pay?"
          description={[
            "Lorem ipsum is simply dummy text of the printing and typesetting industry.",
          ]}
        />
      </View>
    </ScrollView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: rS(16),
    paddingBottom: rV(30),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: rV(60),
    marginBottom: rV(20),
  },

  backButton: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: rS(12),
  },

  headerTitle: {
    fontSize: rMS(18),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },

  filterRow: {
    marginVertical: rV(16),
  },

  chip: {
    paddingHorizontal: rS(16),
    paddingVertical: rV(8),
    borderRadius: rMS(20),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: rS(10),
  },

  activeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  chipText: {
    fontSize: rMS(13),
    fontFamily: Fonts.text,
    color: "#666",
  },

  activeChipText: {
    color: "#fff",
    fontFamily: Fonts.textBold,
  },

  list: {
    marginTop: rV(10),
  },
});
