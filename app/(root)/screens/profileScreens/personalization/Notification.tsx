import { NotificationItem } from "@/components/NotificationItem";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotificationScreen() {
  const { user, updateProfile, isUpdatingProfile } = useAuth();
  const { showToast } = useToast();
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [discounts, setDiscounts] = useState(true);
  const [store, setStore] = useState(false);
  const [system, setSystem] = useState(false);
  const [location, setLocation] = useState(false);
  const [locationUpdates, setLocationUpdates] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setAllowNotifications(user.allow_notifications);
    setDiscounts(user.discount_notifications);
    setStore(user.store_notifications);
    setSystem(user.system_notifications);
    setLocation(user.location_notifications);
    setLocationUpdates(user.location_updates);
  }, [user]);

  const handleSave = async () => {
    const result = await updateProfile({
      allowNotifications,
      discountNotifications: discounts,
      storeNotifications: store,
      systemNotifications: system,
      locationNotifications: location,
      locationUpdates,
    });

    if (!result.success) {
      showToast(result.message || result.fieldErrors?.general || "We couldn't save your notification settings.");
      return;
    }

    showToast("Notification settings updated.");
  };

  return (
    <View style={styles.container}>
      <ProfileHeader title="Notification Settings" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Manage how we alert you</Text>
          <Text style={styles.infoText}>
            Order and account updates show up in your Activity feed. These settings control which alerts you want us to send.
          </Text>
        </View>

        <View
          style={{ borderRadius: rMS(16), backgroundColor: AppColors.white }}
          className="shadow-sm"
        >
          <View style={styles.card}>
            <NotificationItem
              label="Allow Notifications"
              value={allowNotifications}
              onValueChange={(value) => {
                setAllowNotifications(value);
                if (!value) {
                  setDiscounts(false);
                  setStore(false);
                  setSystem(false);
                  setLocation(false);
                  setLocationUpdates(false);
                }
              }}
            />
            <NotificationItem
              label="Discount Notifications"
              value={discounts}
              onValueChange={setDiscounts}
              disabled={!allowNotifications}
            />
            <NotificationItem
              label="Store Notifications"
              value={store}
              onValueChange={setStore}
              disabled={!allowNotifications}
            />
            <NotificationItem
              label="System Notifications"
              value={system}
              onValueChange={setSystem}
              disabled={!allowNotifications}
            />
            <NotificationItem
              label="Location Notifications"
              value={location}
              onValueChange={setLocation}
              disabled={!allowNotifications}
            />
            <NotificationItem
              label="Location Updates"
              value={locationUpdates}
              onValueChange={setLocationUpdates}
              disabled={!allowNotifications}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionBtn, isUpdatingProfile && styles.actionBtnDisabled]}
          activeOpacity={0.85}
          onPress={() => {
            void handleSave();
          }}
          disabled={isUpdatingProfile}
        >
          <Text style={styles.actionBtnText}>
            {isUpdatingProfile ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: rV(28),
  },
  infoCard: {
    backgroundColor: "#EEF4FF",
    borderRadius: rMS(16),
    paddingHorizontal: rS(16),
    paddingVertical: rV(14),
    marginBottom: rV(14),
  },
  infoTitle: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  infoText: {
    marginTop: rV(4),
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    overflow: "hidden",
  },
  actionBtn: {
    marginTop: rV(22),
    borderRadius: rMS(50),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(14),
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnDisabled: {
    opacity: 0.7,
  },
  actionBtnText: {
    fontSize: rMS(15),
    fontFamily: Fonts.textBold,
    color: AppColors.white,
  },
});
