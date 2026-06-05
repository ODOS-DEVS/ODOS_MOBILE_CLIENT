import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountLinkRow,
  AccountSettingToggle,
  AccountSettingsGroup,
  AccountStickySaveBar,
  useAccountStyles,
} from "@/components/profile/ProfileHubUi";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rV } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function NotificationSettingsScreen() {
  const accountStyles = useAccountStyles();
  const { colors } = useTheme();
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
      showToast(
        result.message || result.fieldErrors?.general || "We couldn't save your notification settings.",
      );
      return;
    }

    showToast("Notification settings updated.");
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Notifications" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[accountStyles.content, { paddingBottom: rV(100) }]}
      >
        <Text style={[introStyles.text, { color: colors.textMuted }]}>
          Order and account events always appear in Activity. These toggles control push alerts on
          this device.
        </Text>

        <AccountSettingsGroup title="Push alerts">
          <AccountSettingToggle
            title="Allow notifications"
            description="Master switch for ODOS push alerts."
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
            isLast={!allowNotifications}
          />
          {allowNotifications ? (
            <>
              <AccountSettingToggle
                title="Deals & vouchers"
                description="Sales and limited-time offers."
                value={discounts}
                onValueChange={setDiscounts}
              />
              <AccountSettingToggle
                title="Store messages"
                description="Vendor chat and store updates."
                value={store}
                onValueChange={setStore}
              />
              <AccountSettingToggle
                title="System updates"
                description="Security and account notices."
                value={system}
                onValueChange={setSystem}
              />
              <AccountSettingToggle
                title="Location alerts"
                description="Delivery and location reminders."
                value={location}
                onValueChange={setLocation}
              />
              <AccountSettingToggle
                title="Live location updates"
                description="Smoother delivery tracking when enabled."
                value={locationUpdates}
                onValueChange={setLocationUpdates}
                isLast
              />
            </>
          ) : null}
        </AccountSettingsGroup>

        <AccountSettingsGroup>
          <AccountLinkRow
            icon="time-outline"
            title="View activity"
            subtitle="Order milestones and account events."
            onPress={() => router.push("/(root)/screens/Notification" as any)}
            isLast
          />
        </AccountSettingsGroup>
      </ScrollView>

      <AccountStickySaveBar
        label="Save settings"
        onPress={() => void handleSave()}
        loading={isUpdatingProfile}
      />
    </View>
  );
}

const introStyles = {
  text: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(20),
    marginBottom: rV(2),
  },
};
