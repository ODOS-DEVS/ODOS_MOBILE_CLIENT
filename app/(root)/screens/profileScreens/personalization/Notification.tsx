import { NotificationItem } from "@/components/NotificationItem";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotificationScreen() {
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [discounts, setDiscounts] = useState(true);
  const [store, setStore] = useState(false);
  const [system, setSystem] = useState(false);
  const [location, setLocation] = useState(false);
  const [locationUpdates, setLocationUpdates] = useState(false);

  return (
    <View style={styles.container}>
      <ProfileHeader title="Notifications" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <NotificationItem
            label="Allow Notifications"
            value={allowNotifications}
            onValueChange={setAllowNotifications}
          />
          <NotificationItem
            label="Discount Notifications"
            value={discounts}
            onValueChange={setDiscounts}
          />
          <NotificationItem
            label="Store Notifications"
            value={store}
            onValueChange={setStore}
          />
          <NotificationItem
            label="System Notifications"
            value={system}
            onValueChange={setSystem}
          />
          <NotificationItem
            label="Location Notifications"
            value={location}
            onValueChange={setLocation}
          />
          <NotificationItem
            label="Location Updates"
            value={locationUpdates}
            onValueChange={setLocationUpdates}
          />
        </View>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
          <Text style={styles.actionBtnText}>Save Changes</Text>
        </TouchableOpacity>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(16),
    paddingBottom: rV(28),
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
  },
  actionBtn: {
    marginTop: rV(160),
    borderRadius: rMS(50),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(14),
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: rMS(15),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
});
