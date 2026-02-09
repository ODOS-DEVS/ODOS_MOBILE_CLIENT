import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Fonts from "@/constants/Fonts";
import { AppColors } from "@/constants/Colors";
import { rMS, rS, rV } from "@/styles/responsive";

// Types
interface NotificationItem {
  id: string;
  title: string;
  time: string;
  avatar?: ImageSourcePropType;
  statusDot?: boolean;
  actionLabel?: string;
  productImage?: ImageSourcePropType;
}

interface Section {
  title: string;
  data: NotificationItem[];
}

const todayData: NotificationItem[] = [
  {
    id: "1",
    title: "Hi, we have sent your product",
    time: "2 hours ago",
    statusDot: true,
  },
  {
    id: "2",
    title: "Your payment has been successful, thank you",
    time: "2 hours ago",
    actionLabel: "See Detail",
  },
  {
    id: "3",
    title: "We have added a new product",
    time: "2 hours ago",
    statusDot: true,
    productImage: require("../../../assets/images/backpack1.png"),
  },
];

const yesterdayData: NotificationItem[] = [
  {
    id: "4",
    title: "Hi, we have sent your product",
    time: "2 hours ago",
    statusDot: true,
  },
  {
    id: "5",
    title: "Your payment has been successful, thank you",
    time: "2 hours ago",
    actionLabel: "See Detail",
  },
  {
    id: "6",
    title: "We have added a new product",
    time: "2 hours ago",
    actionLabel: "See Product",
  },
];

const sections: Section[] = [
  { title: "Today", data: todayData },
  { title: "Yesterday", data: yesterdayData },
];

const NotificationScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => <NotificationRow item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const NotificationRow = ({ item }: { item: NotificationItem }) => {
  return (
    <View style={styles.itemRow}>
      {/* Left */}
      <View style={styles.left}>
        {item.avatar ? (
          <View style={styles.avatarWrapper}>
            <Image source={item.avatar} style={styles.avatar} />
            {item.statusDot && <View style={styles.statusDot} />}
          </View>
        ) : (
          <View style={styles.iconCircle}>
            <Ionicons
              name={item.statusDot ? "notifications" : "notifications-outline"}
              size={18}
              color={AppColors.text}
            />
          </View>
        )}
      </View>

      {/* Middle */}
      <View style={styles.middle}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      {/* Right */}
      <View style={styles.right}>
        {item.productImage && (
          <Image source={item.productImage} style={styles.productImage} />
        )}
        {item.actionLabel && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{item.actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
    paddingBottom: rV(12),
  },
  backButton: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: rMS(18),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  headerRightSpacer: {
    width: rMS(40),
  },
  listContent: {
    paddingHorizontal: rS(16),
    paddingBottom: rV(24),
  },
  sectionTitle: {
    marginTop: rV(16),
    marginBottom: rV(10),
    fontSize: rMS(13),
    fontFamily: Fonts.textBold,
    color: AppColors.subtext[100],
    textTransform: "uppercase",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rV(12),
    borderBottomWidth: rMS(0.5),
    borderBottomColor: "#EEE",
  },
  left: {
    marginRight: rS(12),
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: rMS(10),
    height: rMS(10),
    borderRadius: rMS(5),
    backgroundColor: "#2ecc71",
    borderWidth: rMS(2),
    borderColor: AppColors.white,
  },
  iconCircle: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  middle: {
    flex: 1,
  },
  itemTitle: {
    fontSize: rMS(14),
    fontFamily: Fonts.title,
    color: AppColors.text,
  },
  time: {
    fontSize: rMS(12),
    fontFamily: Fonts.text,
    color: AppColors.secondary,
    marginTop: rV(4),
  },
  right: {
    alignItems: "flex-end",
  },
  actionBtn: {
    borderWidth: rMS(1),
    borderColor: AppColors.tertiary,
    borderRadius: rMS(16),
    paddingHorizontal: rS(12),
    paddingVertical: rV(6),
  },
  actionText: {
    fontSize: rMS(12),
    fontFamily: Fonts.textBold,
    color: AppColors.text,
  },
  productImage: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(8),
    marginBottom: rV(8),
  },
});
