import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountInsightCard,
  AccountSettingToggle,
  AccountSettingsGroup,
  AccountStickySaveBar,
  AccountTipBanner,
  accountStyles,
} from "@/components/profile/ProfileHubUi";
import { useToast } from "@/context/ToastContext";
import { rV } from "@/styles/responsive";
import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

export default function PreferenceScreen() {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [socialMedia, setSocialMedia] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const enabledCount = useMemo(
    () => [analytics, personalization, socialMedia, darkMode].filter(Boolean).length,
    [analytics, darkMode, personalization, socialMedia],
  );

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setIsSaving(false);
    showToast("Preferences saved on this device.");
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Preferences" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[accountStyles.content, { paddingBottom: rV(100) }]}
      >
        <AccountInsightCard
          title="Your shopping experience"
          subtitle="Control recommendations, privacy-friendly analytics, and how ODOS personalizes what you see."
          stats={[
            { value: enabledCount, label: "Enabled" },
            { value: darkMode ? "Dark" : "Light", label: "Theme" },
          ]}
        />

        <AccountTipBanner
          title="You're in control"
          message="These preferences apply to this device. You can change them any time."
          icon="sparkles-outline"
        />

        <AccountSettingsGroup title="Recommendations">
          <AccountSettingToggle
            title="Personalized picks"
            description="Tailor home and category suggestions based on your browsing and orders."
            value={personalization}
            onValueChange={setPersonalization}
            isLast
          />
        </AccountSettingsGroup>

        <AccountSettingsGroup title="Privacy & data">
          <AccountSettingToggle
            title="Analytics"
            description="Help us improve performance and reliability with anonymous usage insights."
            value={analytics}
            onValueChange={setAnalytics}
          />
          <AccountSettingToggle
            title="Social sharing cookies"
            description="Enable share-to-social features when you choose to post products."
            value={socialMedia}
            onValueChange={setSocialMedia}
            isLast
          />
        </AccountSettingsGroup>

        <AccountSettingsGroup title="Appearance">
          <AccountSettingToggle
            title="Dark mode"
            description="Switch to a darker interface. Full app theme support is rolling out soon."
            value={darkMode}
            onValueChange={setDarkMode}
            isLast
          />
        </AccountSettingsGroup>
      </ScrollView>

      <AccountStickySaveBar
        label="Save preferences"
        onPress={() => void handleSave()}
        loading={isSaving}
      />
    </View>
  );
}
