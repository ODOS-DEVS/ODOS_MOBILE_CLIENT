import PrimaryButton from "@/components/buttons/PrimaryButton";
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

/* -------------------- Language Item -------------------- */
interface LanguageItemProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const LanguageItem = ({ label, selected, onPress }: LanguageItemProps) => {
  return (
    <TouchableOpacity style={styles.languageItem} onPress={onPress}>
      <Text style={styles.languageText}>{label}</Text>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

/* -------------------- Main Screen -------------------- */
export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState("English (US)");

  const languages = [
    "English (US)",
    "English (UK)",
    "French",
    "Twi",
    "Mandarin",
    "Arabic",
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Language List */}
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
    marginTop: rV(20),
    marginBottom: rV(24),
  },

  backButton: {
    width: rMS(40),
    height: rMS(40),
    borderRadius: rMS(20),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: rMS(17),
    color: "#111",
    fontFamily: Fonts.textBold,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: rMS(18),
    paddingVertical: rV(8),
  },

  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rS(16),
    paddingVertical: rV(18),
    borderBottomWidth: rMS(0.5),
    borderBottomColor: "#EEE",
  },

  languageText: {
    fontSize: rMS(14),
    color: "#1C1C1E",
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
    borderColor: "#111",
  },

  radioInner: {
    width: rMS(10),
    height: rMS(10),
    borderRadius: rMS(5),
    backgroundColor: "#111",
  },
});
