import TextInputField from "@/components/TextInputField";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rV } from "@/styles/responsive";
import type { StoreSocialLinks } from "@/utils/social";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type StoreSocialLinksEditorProps = {
  value: StoreSocialLinks;
  onChange: (value: StoreSocialLinks) => void;
};

const FIELDS: Array<{
  key: keyof StoreSocialLinks;
  label: string;
  icon: string;
  placeholder: string;
}> = [
  {
    key: "instagramUrl",
    label: "Instagram",
    icon: "logo-instagram",
    placeholder: "@yourstore or instagram.com/yourstore",
  },
  {
    key: "facebookUrl",
    label: "Facebook",
    icon: "logo-facebook",
    placeholder: "facebook.com/yourstore",
  },
  {
    key: "tiktokUrl",
    label: "TikTok",
    icon: "logo-tiktok",
    placeholder: "@yourstore or tiktok.com/@yourstore",
  },
  {
    key: "twitterUrl",
    label: "X (Twitter)",
    icon: "logo-twitter",
    placeholder: "@yourstore or x.com/yourstore",
  },
  {
    key: "websiteUrl",
    label: "Website",
    icon: "globe-outline",
    placeholder: "yourstore.com",
  },
];

export default function StoreSocialLinksEditor({
  value,
  onChange,
}: StoreSocialLinksEditorProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Social media links</Text>
      <Text style={styles.helper}>
        Optional. Paste a handle or full link — shoppers can tap these on your store page.
      </Text>

      {FIELDS.map((field) => (
        <TextInputField
          key={field.key}
          label={field.label}
          icon={field.icon as any}
          placeholder={field.placeholder}
          value={value[field.key] ?? ""}
          onChangeText={(text) => onChange({ ...value, [field.key]: text })}
          autoCapitalize="none"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: rV(8),
  },
  title: {
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
  helper: {
    marginBottom: rV(6),
    color: "#6B7280",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
  },
});
