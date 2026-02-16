import TextInputField from "@/components/TextInputField";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CustomerProfile = () => {
  return (
    <View style={styles.container}>
      <ProfileHeader title="Customer Profile" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/300?img=12" }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatar} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={18} color={AppColors.white} />
          </TouchableOpacity>
          <Text style={styles.name}>Domenic Aura</Text>
          <Text style={styles.email}>esaomens@gmail.com</Text>
        </View>

        <View style={styles.formCard}>
          <TextInputField
            icon="person-outline"
            label="Name"
            placeholder="Enter your name"
            value="Dominic Aura"
          />
          <TextInputField
            icon="mail-outline"
            label="Email"
            placeholder="Enter your email"
            value="DominicAura@gmail.com"
          />
          <TextInputField
            icon="calendar-outline"
            label="Date of Birth"
            placeholder="02/21/1980"
            value="02/21/1980"
          />
          <TextInputField
            icon="call-outline"
            label="Telephone"
            placeholder="+233 54 187 4005"
            value="+233 54 187 4005"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CustomerProfile;

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
  avatarContainer: {
    alignItems: "center",
    borderRadius: rMS(16),
    paddingVertical: rV(18),
    marginBottom: rV(12),
  },
  avatar: {
    width: rMS(96),
    height: rMS(96),
    borderRadius: rMS(48),
  },
  editAvatar: {
    position: "absolute",
    top: rV(78),
    right: "36%",
    backgroundColor: AppColors.primary,
    width: rMS(34),
    height: rMS(34),
    borderRadius: rMS(17),
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    marginTop: rV(10),
    fontSize: rMS(17),
    color: AppColors.text,
    fontFamily: Fonts.titleBold,
  },
  email: {
    marginTop: rV(2),
    fontSize: rMS(13),
    color: AppColors.subtext[100],
    fontFamily: Fonts.text,
  },
  formCard: {
    borderRadius: rMS(16),
  },
  saveBtn: {
    marginTop: rV(18),
    borderRadius: rMS(12),
    backgroundColor: AppColors.primary,
    paddingVertical: rV(14),
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: rMS(15),
    color: AppColors.white,
    fontFamily: Fonts.textBold,
  },
});
