import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface ProfileHeaderProps {
  title: string;
  onBack?: () => void;
  rightNode?: React.ReactNode;
}

export default function ProfileHeader({
  title,
  onBack,
  rightNode,
}: ProfileHeaderProps) {
  const { width } = useWindowDimensions();

  const headerSizing = useMemo(() => {
    if (width >= 1200) {
      return {
        maxWidth: 1120,
        paddingX: 28,
        paddingTop: rV(60),
        paddingBottom: rV(22),
      };
    }
    if (width >= 900) {
      return {
        maxWidth: 980,
        paddingX: 24,
        paddingTop: rV(56),
        paddingBottom: rV(20),
      };
    }
    if (width >= 600) {
      return {
        maxWidth: 760,
        paddingX: 18,
        paddingTop: rV(50),
        paddingBottom: rV(16),
      };
    }
    // Phones and small tablets
    return {
      maxWidth: width,
      paddingX: 16,
      paddingTop: rV(48),
      paddingBottom: rV(12),
    };
  }, [width]);

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: headerSizing.paddingTop,
          paddingBottom: headerSizing.paddingBottom,
        },
      ]}
    >
      <View
        style={[
          styles.headerContent,
          {
            maxWidth: headerSizing.maxWidth,
            paddingHorizontal: headerSizing.paddingX,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack ?? (() => router.back())}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={AppColors.text} />
        </TouchableOpacity>

        <Text numberOfLines={1} style={styles.headerTitle}>
          {title}
        </Text>

        <View style={styles.rightSlot}>{rightNode ?? null}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: AppColors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
  },
  backButton: {
    width: rMS(38),
    height: rMS(38),
    borderRadius: rMS(19),
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: rS(8),
    fontSize: rMS(18),
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  rightSlot: {
    width: rMS(38),
    alignItems: "center",
    justifyContent: "center",
  },
});
