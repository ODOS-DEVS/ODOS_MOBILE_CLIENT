import { MenuItem } from "@/components/MenuItem";
import Fonts from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
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
        <MenuItem icon="notifications-outline" label="Notification" />
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
    paddingHorizontal: 16,
    paddingVertical: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  email: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: Fonts.titleBold,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },

  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginBottom: 90,
  },

  logoutText: {
    color: "#E53935",
    fontSize: 15,
    marginLeft: 8,
    fontWeight: "500",
  },
});
