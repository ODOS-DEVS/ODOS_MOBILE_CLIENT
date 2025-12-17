import { MenuItem } from "@/components/MenuItem";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => {
          router.push("../screens/profileScreens/CustomerProfile");
        }}
      >
        <View style={styles.header}>
          <View style={styles.subHeader}>
            <Image
              source={{
                uri: "https://i.pravatar.cc/502",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>Domenic Aura</Text>
              <Text style={styles.email}>esaomens@gmail.com</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="#111" />
        </View>
      </TouchableOpacity>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <MenuItem icon="receipt-outline" label="Orders" />
        <MenuItem icon="return-up-back-outline" label="Returns" />
        <MenuItem icon="location-outline" label="Addresses" />
        <MenuItem icon="chatbubble-outline" label="Chats" />
        <MenuItem icon="card-outline" label="Payment Method" />
        <MenuItem icon="star-outline" label="Reviews" />
        <MenuItem icon="ticket-outline" label="Vouchers" />
        <MenuItem icon="briefcase-outline" label="Request to be a vendor" />
      </View>

      {/* Personalization */}
      <Text style={styles.sectionTitle}>Personalization</Text>
      <View style={styles.card}>
        <MenuItem
          icon="notifications-outline"
          label="Notification"
          onPress={() => {
            router.push("../screens/profileScreens/Notification");
          }}
        />
        <MenuItem icon="options-outline" label="Preferences" />
        <MenuItem icon="language-outline" label="Language" />
      </View>

      {/* Help & Support */}
      <Text style={styles.sectionTitle}>Help & Support</Text>
      <View style={styles.card}>
        <MenuItem icon="help-circle-outline" label="Get Help" />
        <MenuItem icon="document-text-outline" label="Legal & Policy" />
        <MenuItem icon="library-outline" label="Resources" />
        <MenuItem icon="help-outline" label="FAQ" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logout}>
        <Ionicons name="log-out-outline" size={20} color="#E53935" />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: rS(16),
    paddingVertical: rV(30),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: rMS(16),
    borderRadius: rMS(16),
    marginTop: rV(20),
    marginBottom: rV(20),
    backgroundColor: "#fff",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: rS(50),
    height: rV(50),
    borderRadius: rMS(28),
    marginRight: rS(12),
  },

  name: {
    fontSize: rMS(16),
    fontFamily: Fonts.title,
  },

  email: {
    fontSize: rMS(13),
    color: "#777",
    marginTop: rMS(2),
    fontFamily: Fonts.text,
  },

  sectionTitle: {
    fontSize: rMS(15),
    fontWeight: "600",
    color: "#444",
    marginBottom: rMS(8),
    marginLeft: rMS(4),
    fontFamily: Fonts.title,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: rMS(16),
    marginBottom: rMS(20),
    overflow: "hidden",
  },

  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(14),
    marginBottom: rMS(90),
  },

  logoutText: {
    color: "#E53935",
    fontSize: rMS(15),
    marginLeft: rMS(8),
    fontWeight: "500",
  },
});
