import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountInsightCard,
  AccountRadioRow,
  AccountSettingsGroup,
  AccountStickySaveBar,
  AccountTipBanner,
  accountStyles,
} from "@/components/profile/ProfileHubUi";
import { useToast } from "@/context/ToastContext";
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
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState("en-us");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const selected = LANGUAGES.find((lang) => lang.id === selectedId);
    if (!selected?.available) {
      showToast("That language is not available yet.");
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setIsSaving(false);
    showToast(`Language set to ${selected.label}.`);
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Language" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[accountStyles.content, { paddingBottom: rV(100) }]}
      >
        <AccountInsightCard
          title="App language"
          subtitle="Choose how ODOS reads for you. More regional languages are on the way."
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
          message="Additional languages will unlock in future updates without losing your account data."
          icon="language-outline"
        />

        <AccountSettingsGroup title="Available now">
          {LANGUAGES.filter((lang) => lang.available).map((lang) => (
            <AccountRadioRow
              key={lang.id}
              label={lang.label}
              selected={selectedId === lang.id}
              onPress={() => setSelectedId(lang.id)}
              isLast
            />
          ))}
        </AccountSettingsGroup>

        <AccountSettingsGroup title="Coming soon">
          {LANGUAGES.filter((lang) => !lang.available).map((lang, index, list) => (
            <AccountRadioRow
              key={lang.id}
              label={lang.label}
              selected={selectedId === lang.id}
              onPress={() => setSelectedId(lang.id)}
              hint="Coming soon"
              disabled
              isLast={index === list.length - 1}
            />
          ))}
        </AccountSettingsGroup>
      </ScrollView>

      <AccountStickySaveBar
        label="Save language"
        onPress={() => void handleSave()}
        loading={isSaving}
      />
    </View>
  );
}
