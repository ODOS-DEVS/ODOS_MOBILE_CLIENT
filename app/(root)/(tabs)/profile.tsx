import { MenuItem } from "@/components/MenuItem";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { useAuth } from "@/context/AuthContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { isSigningOut, signOut, user } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(root)/(auth)/onboarding");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 90 }}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => {
          router.push("../screens/profileScreens/CustomerProfile");
        }}
      >
        <View
          className="bg-white rounded-3xl mb-5 shadow-sm"
          style={styles.header}
        >
          <View style={styles.subHeader}>
            <Image
              source={{
                uri: "https://i.pravatar.cc/502",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{user?.full_name || "ODOS User"}</Text>
              <Text style={styles.email}>
                {user?.email || "Sign in to view account details"}
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="#111" />
        </View>
      </TouchableOpacity>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View className="bg-white rounded-3xl mb-5 shadow-sm">
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
        <MenuItem
          icon="chatbubble-outline"
          label="Chats"
          onPress={() => {
            router.push("../screens/profileScreens/Account/Chats");
          }}
        />
        <MenuItem
          icon="card-outline"
          label="Payment Method"
          onPress={() => {
            router.push("../screens/profileScreens/Account/Wallet");
          }}
        />
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
        <MenuItem
          icon="briefcase-outline"
          label="Request to be a vendor"
          onPress={() => {
            router.push("../screens/profileScreens/Account/VendorRequest");
          }}
        />
      </View>

      {/* Personalization */}
      <Text style={styles.sectionTitle}>Personalization</Text>
      <View className="bg-white rounded-3xl mb-5 shadow-sm">
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
      <View className="bg-white rounded-3xl mb-5 shadow-sm">
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
        <MenuItem
          icon="library-outline"
          label="Resources"
          onPress={() => {
            router.push("../screens/profileScreens/helpAndSupport/Resources");
          }}
        />
        <MenuItem
          icon="help-outline"
          label="FAQ"
          onPress={() => {
            router.push("../screens/profileScreens/helpAndSupport/FAQ");
          }}
        />
      </View>

      <View className="bg-white rounded-3xl mb-5 shadow-sm">
        <MenuItem
          icon="log-out-outline"
          label={isSigningOut ? "Logging out..." : "Log out"}
          onPress={handleLogout}
          textColor="#E53935"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: rS(16),
    paddingTop: rV(54),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: rMS(16),
    marginTop: rV(20),
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
    marginTop: rMS(20),
    marginBottom: rMS(14),
    marginLeft: rMS(4),
    fontFamily: Fonts.textBold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
