import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountInsightCard,
  AccountRadioRow,
  AccountSettingsGroup,
  AccountTipBanner,
  useAccountStyles,
} from "@/components/profile/ProfileHubUi";
import { rV } from "@/styles/responsive";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";

type LanguageOption = {
  id: string;
  label: string;
  available: boolean;
};

const LANGUAGES: LanguageOption[] = [
  { id: "en-us", label: "English (US)", available: true },
  { id: "en-gb", label: "English (UK)", available: false },
  { id: "fr", label: "French", available: false },
  { id: "tw", label: "Twi", available: false },
  { id: "zh", label: "Mandarin", available: false },
  { id: "ar", label: "Arabic", available: false },
];

export default function LanguageScreen() {
  const accountStyles = useAccountStyles();
  const [selectedId] = useState("en-us");

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Language" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[accountStyles.content, { paddingBottom: rV(40) }]}
      >
        <AccountInsightCard
          title="App language"
          subtitle="ODOS currently ships in English. More regional languages will unlock in a future update."
          stats={[
            {
              value: LANGUAGES.find((lang) => lang.id === selectedId)?.label ?? "English",
              label: "Selected",
            },
            { value: 1, label: "Available" },
          ]}
        />

        <AccountTipBanner
          title="English is live today"
          message="There is nothing to save yet — English is the only supported language in this build."
          icon="language-outline"
        />

        <AccountSettingsGroup title="Available now">
          {LANGUAGES.filter((lang) => lang.available).map((lang) => (
            <AccountRadioRow
              key={lang.id}
              label={lang.label}
              selected={selectedId === lang.id}
              onPress={() => undefined}
            />
          ))}
        </AccountSettingsGroup>

        <AccountSettingsGroup title="Coming soon">
          {LANGUAGES.filter((lang) => !lang.available).map((lang) => (
            <AccountRadioRow
              key={lang.id}
              label={lang.label}
              selected={false}
              onPress={() => undefined}
              disabled
            />
          ))}
        </AccountSettingsGroup>
      </ScrollView>
    </View>
  );
}
