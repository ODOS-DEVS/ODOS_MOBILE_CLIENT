import { PreferenceItem } from "@/components/PreferencesItem";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PreferenceScreen() {
  const [analytics, setAnalytics] = useState(false);
  const [personalization, setPersonalization] = useState(false);
  const [socialMedia, setSocialMedia] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <ProfileHeader title="Preferences" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <PreferenceItem
            title="Analytics"
            description="Analytics helps us improve app performance and reliability."
            value={analytics}
            onValueChange={setAnalytics}
          />

          <PreferenceItem
            title="Personalization"
            description="Customize recommendations and content based on your activity."
            value={personalization}
            onValueChange={setPersonalization}
          />

          <PreferenceItem
            title="Social Media Cookies"
            description="Allow social features for sharing products with your network."
            value={socialMedia}
            onValueChange={setSocialMedia}
          />

          <PreferenceItem
            title="Dark Mode"
            description="Switch between light and dark interface themes."
            value={darkMode}
            onValueChange={setDarkMode}
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
    marginTop: rV(130),
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
