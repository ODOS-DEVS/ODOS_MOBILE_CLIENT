import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ReviewStatus = "pending" | "published";
type ReviewFilter = "all" | ReviewStatus;

type ReviewItem = {
  id: string;
  title: string;
  category: string;
  image: any;
  rating: number;
  comment?: string;
  date: string;
  status: ReviewStatus;
};

const reviewFilters: { key: ReviewFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "published", label: "Published" },
];

const reviewData: ReviewItem[] = [
  {
    id: "RV-1003",
    title: "Karia Backpack",
    category: "Travel Bag",
    image: require("@/assets/images/backpack1.png"),
    rating: 5,
    comment: "Strong material, clean finish, and fast delivery. Exactly as expected.",
    date: "Reviewed on Feb 12, 2026",
    status: "published",
  },
  {
    id: "RV-1002",
    title: "Urban Sneakers",
    category: "Footwear",
    image: require("@/assets/images/shoe5.png"),
    rating: 4,
    comment: "Comfortable for daily wear. Slightly narrow fit but overall very good.",
    date: "Reviewed on Feb 05, 2026",
    status: "published",
  },
  {
    id: "RV-1001",
    title: "Elegant Handbag",
    category: "Bags",
    image: require("@/assets/images/handbag.png"),
    rating: 0,
    date: "Delivered on Feb 14, 2026",
    status: "pending",
  },
];

export default function ReviewsScreen() {
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("all");

  const filteredData = useMemo(() => {
    if (activeFilter === "all") return reviewData;
    return reviewData.filter((item) => item.status === activeFilter);
  }, [activeFilter]);

  const publishedCount = reviewData.filter((item) => item.status === "published").length;
  const pendingCount = reviewData.filter((item) => item.status === "pending").length;
  const avgRating =
    reviewData
      .filter((item) => item.rating > 0)
      .reduce((acc, item) => acc + item.rating, 0) /
    Math.max(1, publishedCount);

  return (
    <View style={styles.container}>
      <ProfileHeader title="My Reviews" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard} className="shadow-sm">
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Average Rating</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{publishedCount}</Text>
            <Text style={styles.metricLabel}>Published</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{pendingCount}</Text>
            <Text style={styles.metricLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {reviewFilters.map((item) => {
            const isActive = activeFilter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setActiveFilter(item.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredData.map((item) => {
          const isPending = item.status === "pending";
          return (
            <View key={item.id} style={styles.card} className="shadow-sm">
              <View style={styles.topRow}>
                <View style={styles.imageWrap}>
                  <Image source={item.image} style={styles.image} resizeMode="contain" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.sub}>{item.category}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, isPending ? styles.pendingBadge : styles.publishedBadge]}>
                  <Text style={[styles.statusText, isPending ? styles.pendingText : styles.publishedText]}>
                    {isPending ? "Pending" : "Published"}
                  </Text>
                </View>
              </View>

              {!isPending && (
                <>
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={`${item.id}-${star}`}
                        name={star <= item.rating ? "star" : "star-outline"}
                        size={rMS(14)}
                        color="#F59E0B"
                      />
                    ))}
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.comment}>{item.comment}</Text>
                </>
              )}

              <View style={styles.actionRow}>
                {isPending ? (
                  <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
                    <Text style={styles.primaryBtnText}>Write Review</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
                      <Text style={styles.outlineBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
                      <Text style={styles.primaryBtnText}>View Product</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(24),
  },
  summaryCard: {
    backgroundColor: AppColors.secondary,
    borderRadius: rMS(16),
    paddingVertical: rV(14),
    flexDirection: "row",
    alignItems: "center",
  },
  metricBlock: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: rMS(20),
    color: AppColors.white,
    fontFamily: Fonts.titleBold,
  },
  metricLabel: {
    marginTop: rV(3),
    fontSize: rMS(11),
    color: "#E5E7EB",
    fontFamily: Fonts.text,
  },
  metricDivider: {
    width: 1,
    height: "64%",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  filterRow: {
    flexDirection: "row",
    gap: rS(8),
    marginTop: rV(14),
    marginBottom: rV(10),
  },
  filterBtn: {
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
    borderRadius: rMS(999),
    borderWidth: 1,
    borderColor: "#D6DCE5",
    backgroundColor: AppColors.white,
  },
  filterBtnActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterText: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  filterTextActive: {
    color: AppColors.white,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    padding: rS(14),
    marginBottom: rV(10),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrap: {
    width: rMS(60),
    height: rMS(60),
    borderRadius: rMS(12),
    backgroundColor: "#F1F4F7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "82%",
    height: "82%",
  },
  info: {
    flex: 1,
    marginLeft: rS(10),
  },
  title: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  sub: {
    marginTop: rV(2),
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  date: {
    marginTop: rV(4),
    fontSize: rMS(11),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
  },
  statusBadge: {
    borderRadius: rMS(999),
    paddingHorizontal: rS(9),
    paddingVertical: rV(4),
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },
  publishedBadge: {
    backgroundColor: "#DCFCE7",
  },
  statusText: {
    fontSize: rMS(10),
    fontFamily: Fonts.textBold,
  },
  pendingText: {
    color: "#92400E",
  },
  publishedText: {
    color: "#166534",
  },
  ratingRow: {
    marginTop: rV(10),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(3),
  },
  ratingText: {
    marginLeft: rS(5),
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  comment: {
    marginTop: rV(8),
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
    lineHeight: rMS(18),
  },
  actionRow: {
    marginTop: rV(12),
    flexDirection: "row",
    gap: rS(8),
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D6DCE5",
    borderRadius: rMS(10),
    paddingVertical: rV(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
  },
  outlineBtnText: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: rMS(10),
    paddingVertical: rV(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.primary,
  },
  primaryBtnText: {
    fontSize: rMS(12),
    color: AppColors.white,
    fontFamily: Fonts.textBold,
  },
});
