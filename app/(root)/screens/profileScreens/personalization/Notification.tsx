import PrimaryButton from "@/components/buttons/PrimaryButton";
import { NotificationItem } from "@/components/NotificationItem";
import Fonts from "@/constants/Fonts";
import { rMS, rV } from "@/styles/responsive";
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
export default function NotificationScreen() {
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [discounts, setDiscounts] = useState(true);
  const [store, setStore] = useState(false);
  const [system, setSystem] = useState(false);
  const [location, setLocation] = useState(false);
  const [locationUpdates, setLocationUpdates] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Notification</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Card */}
      <View style={styles.card}>
        <NotificationItem
          label="Allow Notifications"
          value={allowNotifications}
          onValueChange={setAllowNotifications}
        />
        <NotificationItem
          label="Discount Notifications"
          value={discounts}
          onValueChange={setDiscounts}
        />
        <NotificationItem
          label="Store Notifications"
          value={store}
          onValueChange={setStore}
        />
        <NotificationItem
          label="System Notifications"
          value={system}
          onValueChange={setSystem}
        />
        <NotificationItem
          label="Location Notifications"
          value={location}
          onValueChange={setLocation}
        />
        <NotificationItem
          label="Location Updates"
          value={locationUpdates}
          onValueChange={setLocationUpdates}
        />
      </View>

      {/* Save Button */}
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
    paddingHorizontal: rMS(16),
    paddingVertical: rV(25),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: rMS(20),
    marginBottom: rMS(24),
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
    fontFamily: Fonts.textBold,
    color: "#111",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: rMS(18),
    paddingVertical: rV(8),
  },
});
