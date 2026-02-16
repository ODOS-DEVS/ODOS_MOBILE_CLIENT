import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LanguageItemProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const LanguageItem = ({ label, selected, onPress }: LanguageItemProps) => {
  return (
    <TouchableOpacity style={styles.languageItem} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.languageText}>{label}</Text>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState("English (US)");
  const languages = ["English (US)", "English (UK)", "French", "Twi", "Mandarin", "Arabic"];

  return (
    <View style={styles.container}>
      <ProfileHeader title="Language" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {languages.map((lang) => (
            <LanguageItem
              key={lang}
              label={lang}
              selected={selectedLanguage === lang}
              onPress={() => setSelectedLanguage(lang)}
            />
          ))}
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
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECEFF3",
  },
  languageText: {
    fontSize: rMS(14),
    color: AppColors.text,
    fontFamily: Fonts.title,
  },
  radioOuter: {
    width: rMS(20),
    height: rMS(20),
    borderRadius: rMS(10),
    borderWidth: rMS(2),
    borderColor: "#BDBDBD",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: AppColors.primary,
  },
  radioInner: {
    width: rMS(10),
    height: rMS(10),
    borderRadius: rMS(5),
    backgroundColor: AppColors.primary,
  },
  actionBtn: {
    marginTop: rV(18),
    borderRadius: rMS(12),
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
