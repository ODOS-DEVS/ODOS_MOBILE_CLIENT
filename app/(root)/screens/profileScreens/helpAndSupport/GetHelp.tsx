import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const GetHelp = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Get Help</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon Circle */}
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <Ionicons name="help" size={36} color="#fff" />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>We are here to help</Text>

        <Text style={styles.subtitle}>
          Please get in touch with us, contact one of our social media
        </Text>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={22} color="#1877F2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="twitter" size={22} color="#1DA1F2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="whatsapp" size={22} color="#25D366" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GetHelp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    marginBottom: 24,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Fonts.titleBold,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 60,
  },

  outerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },

  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#666666",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: Fonts.textBold,
  },

  subtitle: {
    fontSize: 14,
    color: AppColors.secondary,
    textAlign: "center",
    paddingHorizontal: 32,
    marginBottom: 32,
    fontFamily: Fonts.textBold,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },

  socialButton: {
    width: 70,
    height: 66,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
});
