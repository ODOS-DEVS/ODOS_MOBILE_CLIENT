import PrimaryButton from "@/components/buttons/PrimaryButton";
import { PreferenceItem } from "@/components/PreferencesItem";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* -------------------- Main Screen -------------------- */
export default function PreferenceScreen() {
  const [analytics, setAnalytics] = useState(false);
  const [personalization, setPersonalization] = useState(false);
  const [socialMedia, setSocialMedia] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Preference</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Preferences */}
      <View style={styles.card}>
        <PreferenceItem
          title="Analytics"
          description="Analytics cookies help us improve our application by collecting and reporting information on how you use it. They collect information in a way that does not directly identify anyone."
          value={analytics}
          onValueChange={setAnalytics}
        />

        <PreferenceItem
          title="Personalization"
          description="Personalization cookies collect information about your use of this app in order to display content and experience that are relevant to you."
          value={personalization}
          onValueChange={setPersonalization}
        />

        <PreferenceItem
          title="Social Media Cookies"
          description="The cookies are set by a range of social media services that we have added to the site to enable you to share our content with your friends and network."
          value={socialMedia}
          onValueChange={setSocialMedia}
        />

        <PreferenceItem
          title="Dark Mode"
          description="Changes the theme from light to a dark mode with a balance contrast between the content and the background."
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>

      <View>
        <PrimaryButton title="Save changes" onPress={() => {}} />
      </View>
    </ScrollView>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingHorizontal: rS(16),
    paddingTop: rV(25),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rMS(20),
    marginBottom: rMS(24),
  },

  backButton: {
    width: rS(40),
    height: rV(40),
    borderRadius: rMS(20),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: rMS(17),
    fontFamily: Fonts.textBold,
    color: "#111",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: rMS(18),
    paddingVertical: rV(8),
  },
});
