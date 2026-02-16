import { MenuItem } from "@/components/MenuItem";
import { AppColors } from "@/constants/Colors";
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
        <MenuItem
          icon="receipt-outline"
          label="Orders"
          onPress={() => {
            router.push("../screens/profileScreens/orders/[orderId]");
          }}
        />
        <MenuItem icon="return-up-back-outline" label="Returns" />
        <MenuItem
          icon="location-outline"
          label="Addresses"
          onPress={() => {
            router.push("../screens/profileScreens/Account/Addresses");
          }}
        />
        <MenuItem icon="chatbubble-outline" label="Chats" />
        <MenuItem icon="card-outline" label="Payment Method" onPress={() => {
            router.push("../screens/profileScreens/Account/Wallet");
          }} />
        <MenuItem
          icon="star-outline"
          label="Reviews"
          onPress={() => {
            router.push("../screens/profileScreens/Account/Reviews");
          }}
        />
        <MenuItem
          icon="ticket-outline"
          label="Vouchers"
          onPress={() => {
            router.push("../screens/profileScreens/Account/Vouchers");
          }}
        />
        <MenuItem icon="briefcase-outline" label="Request to be a vendor" />
      </View>

      {/* Personalization */}
      <Text style={styles.sectionTitle}>Personalization</Text>
      <View style={styles.card}>
        <MenuItem
          icon="notifications-outline"
          label="Notification"
          onPress={() => {
            router.push(
              "../screens/profileScreens/personalization/Notification",
            );
          }}
        />
        <MenuItem
          icon="options-outline"
          label="Preferences"
          onPress={() => {
            router.push(
              "../screens/profileScreens/personalization/Preferences",
            );
          }}
        />
        <MenuItem
          icon="language-outline"
          label="Language"
          onPress={() => {
            router.push("../screens/profileScreens/personalization/Language");
          }}
        />
      </View>

      {/* Help & Support */}
      <Text style={styles.sectionTitle}>Help & Support</Text>
      <View style={styles.card}>
        <MenuItem
          icon="help-circle-outline"
          label="Get Help"
          onPress={() => {
            router.push("../screens/profileScreens/helpAndSupport/GetHelp");
          }}
        />
        <MenuItem
          icon="document-text-outline"
          label="Legal & Policy"
          onPress={() => {
            router.push("../screens/profileScreens/helpAndSupport/LegalPolicy");
          }}
        />
        <MenuItem icon="library-outline" label="Resources" />
        <MenuItem
          icon="help-outline"
          label="FAQ"
          onPress={() => {
            router.push("../screens/profileScreens/helpAndSupport/FAQ");
          }}
        />
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
    backgroundColor: "#F5F7FA",
    paddingHorizontal: rS(16),
    paddingTop: rV(34),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: rMS(16),
    borderRadius: rMS(16),
    marginTop: rV(20),
    marginBottom: rV(20),
    backgroundColor: AppColors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
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
    color: AppColors.text,
  },

  email: {
    fontSize: rMS(13),
    color: AppColors.subtext[100],
    marginTop: rMS(2),
    fontFamily: Fonts.text,
  },

  sectionTitle: {
    fontSize: rMS(14),
    color: AppColors.secondary,
    marginBottom: rMS(8),
    marginLeft: rMS(4),
    fontFamily: Fonts.textBold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(16),
    marginBottom: rMS(20),
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
  },

  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: rV(14),
    marginBottom: rMS(180),
  },

  logoutText: {
    color: "#E53935",
    fontSize: rMS(15),
    marginLeft: rMS(8),
    fontWeight: "500",
  },
});
