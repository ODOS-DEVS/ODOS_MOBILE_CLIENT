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
};

// Only what the app actually ships. Listing unbuilt languages as "coming
// soon" promises a date nobody owns.
const LANGUAGES: LanguageOption[] = [{ id: "en-us", label: "English (US)" }];

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
          subtitle="ODOS is available in English. Your device region still controls currency, dates, and number formatting."
          stats={[
            {
              value: LANGUAGES.find((lang) => lang.id === selectedId)?.label ?? "English",
              label: "Selected",
            },
            { value: LANGUAGES.length, label: "Available" },
          ]}
        />

        <AccountTipBanner
          title="Prices always show in cedis"
          message="Order totals, receipts, and wallet balances are in GHS wherever you shop from."
          icon="cash-outline"
        />

        <AccountSettingsGroup title="App language">
          {LANGUAGES.map((lang) => (
            <AccountRadioRow
              key={lang.id}
              label={lang.label}
              selected={selectedId === lang.id}
              onPress={() => undefined}
            />
          ))}
        </AccountSettingsGroup>
      </ScrollView>
    </View>
  );
}
