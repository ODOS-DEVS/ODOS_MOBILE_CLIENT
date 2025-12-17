import TextInputField from "@/components/TextInputField";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

const CustomerProfile = () => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} />
      </TouchableOpacity>

      {/* Profile Image */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: "https://i.pravatar.cc/300?img=12" }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editAvatar}>
          <Ionicons name="camera-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="px-4 ">
        <TextInputField
          icon="person-outline"
          label={"Name"}
          placeholder="Enter your name"
          value="Dominic Aura"
        />
        <TextInputField
          icon="mail-outline"
          label={"Email"}
          placeholder="Dominic Aura"
          value="Dominic Aura"
        />
        <TextInputField
          icon="calendar-outline"
          label={"Date of Birth"}
          placeholder="02/21/1980"
          value="02/21/1980"
        />
        <TextInputField
          icon="call-outline"
          label={"Telephone"}
          placeholder="+233 54 187 4005"
          value="+233 54 187 4005"
        />
      </View>
    </View>
  );
};

export default CustomerProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 16,
  },
  backButton: {
    marginTop: 30,
    marginBottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  editAvatar: {
    position: "absolute",
    bottom: -5,
    right: 140,
    backgroundColor: "#000",
    width: 40,
    height: 36,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
