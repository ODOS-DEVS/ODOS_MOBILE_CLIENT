import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const channels = [
  { id: "facebook", icon: <FontAwesome name="facebook" size={22} color="#1877F2" />, label: "Facebook" },
  { id: "twitter", icon: <FontAwesome name="twitter" size={22} color="#1DA1F2" />, label: "Twitter" },
  { id: "whatsapp", icon: <FontAwesome name="whatsapp" size={22} color="#25D366" />, label: "WhatsApp" },
  { id: "chat", icon: <Ionicons name="chatbubble-ellipses" size={22} color="#111827" />, label: "Live Chat" },
];

export default function GetHelp() {
  return (
    <View style={styles.container}>
      <ProfileHeader title="Get Help" />

      <View style={styles.content}>
        <View style={styles.heroCircle}>
          <View style={styles.heroInner}>
            <Ionicons name="help-outline" size={rMS(36)} color={AppColors.white} />
          </View>
        </View>

        <Text style={styles.title}>We are here to support you</Text>
        <Text style={styles.subtitle}>
          Reach out to us through any channel below and our team will respond quickly.
        </Text>

        <View style={styles.channelGrid}>
          {channels.map((item) => (
            <TouchableOpacity key={item.id} style={styles.channelCard} activeOpacity={0.8}>
              {item.icon}
              <Text style={styles.channelLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={rMS(16)} color={AppColors.secondary} />
          <Text style={styles.infoText}>Support hours: Mon - Sat, 8:00 AM - 8:00 PM</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: rMS(20),
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: rS(16),
    paddingTop: rV(20),
  },
  heroCircle: {
    width: rMS(180),
    height: rMS(180),
    borderRadius: rMS(90),
    backgroundColor: "#E6EBEF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(20),
  },
  heroInner: {
    width: rMS(72),
    height: rMS(72),
    borderRadius: rMS(36),
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: rMS(20),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  subtitle: {
    marginTop: rV(8),
    fontSize: rMS(13),
    color: AppColors.secondary,
    textAlign: "center",
    lineHeight: rMS(20),
    fontFamily: Fonts.text,
    paddingHorizontal: rS(12),
  },
  channelGrid: {
    marginTop: rV(22),
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: rS(10),
  },
  channelCard: {
    width: "48%",
    backgroundColor: AppColors.white,
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    paddingVertical: rV(16),
    alignItems: "center",
    justifyContent: "center",
    gap: rV(8),
  },
  channelLabel: {
    fontSize: rMS(12),
    color: AppColors.text,
    fontFamily: Fonts.textBold,
  },
  infoCard: {
    marginTop: rV(16),
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(12),
    borderRadius: rMS(12),
    backgroundColor: AppColors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    gap: rS(8),
  },
  infoText: {
    fontSize: rMS(12),
    color: AppColors.secondary,
    fontFamily: Fonts.text,
  },
});
