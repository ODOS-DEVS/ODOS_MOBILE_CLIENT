import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountInsightCard,
  AccountLinkRow,
  AccountSettingToggle,
  AccountSettingsGroup,
  AccountStickySaveBar,
  AccountTipBanner,
  useAccountStyles,
} from "@/components/profile/ProfileHubUi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { rV } from "@/styles/responsive";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

export default function NotificationScreen() {
  const accountStyles = useAccountStyles();
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

  const enabledCount = useMemo(
    () =>
      [discounts, store, system, location, locationUpdates].filter(Boolean).length,
    [discounts, location, locationUpdates, store, system],
  );

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
      <ProfileHeader title="Notification Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[accountStyles.content, { paddingBottom: rV(100) }]}
      >
        <AccountInsightCard
          title="Stay in the loop"
          subtitle="Order and account updates always appear in Activity. Choose which push alerts you want on this device."
          stats={[
            { value: allowNotifications ? "On" : "Off", label: "Master" },
            { value: enabledCount, label: "Channels" },
          ]}
        />

        <AccountTipBanner
          title="Activity vs push alerts"
          message="Your order timeline in Activity is separate from these notification toggles."
          icon="notifications-outline"
        />

        <AccountSettingsGroup title="Master control">
          <AccountSettingToggle
            title="Allow notifications"
            description="Turn off to pause every push alert from ODOS on this device."
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
            isLast
          />
        </AccountSettingsGroup>

        <AccountSettingsGroup title="Alert types">
          <AccountSettingToggle
            title="Deals & vouchers"
            description="Sales, voucher drops, and limited-time offers."
            value={discounts}
            onValueChange={setDiscounts}
            disabled={!allowNotifications}
          />
          <AccountSettingToggle
            title="Store messages"
            description="Replies and updates from vendors you chat with."
            value={store}
            onValueChange={setStore}
            disabled={!allowNotifications}
          />
          <AccountSettingToggle
            title="System updates"
            description="Security, policy, and account notices."
            value={system}
            onValueChange={setSystem}
            disabled={!allowNotifications}
          />
          <AccountSettingToggle
            title="Location alerts"
            description="Delivery proximity and location-based reminders."
            value={location}
            onValueChange={setLocation}
            disabled={!allowNotifications}
          />
          <AccountSettingToggle
            title="Live location updates"
            description="Share location updates for smoother delivery tracking."
            value={locationUpdates}
            onValueChange={setLocationUpdates}
            disabled={!allowNotifications}
            isLast
          />
        </AccountSettingsGroup>

        <AccountSettingsGroup>
          <AccountLinkRow
            icon="list-outline"
            title="View activity feed"
            subtitle="See order milestones and account events in one timeline."
            onPress={() => router.push("/(root)/screens/Notification" as any)}
            isLast
          />
        </AccountSettingsGroup>
      </ScrollView>

      <AccountStickySaveBar
        label="Save notification settings"
        onPress={() => void handleSave()}
        loading={isUpdatingProfile}
      />
    </View>
  );
}
