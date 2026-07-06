import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import {
  hasStoreSocialLinks,
  listStoreSocialLinks,
  type StoreSocialLinks,
} from "@/utils/social";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type StoreSocialLinksBarProps = {
  links: StoreSocialLinks;
  title?: string;
};

export default function StoreSocialLinksBar({
  links,
  title = "Connect with this store",
}: StoreSocialLinksBarProps) {
  const items = listStoreSocialLinks(links);

  if (!hasStoreSocialLinks(links) || items.length === 0) {
    return null;
  }

  const openLink = (url: string) => {
    void Linking.openURL(url);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.platform}
            style={styles.chip}
            onPress={() => openLink(item.url)}
            activeOpacity={0.86}
          >
            <Ionicons name={item.icon} size={rS(18)} color={AppColors.primary} />
            <Text style={styles.chipLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: rV(8),
    paddingTop: rS(2),
  },
  title: {
    color: "#64748B",
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
    borderRadius: rS(999),
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2E8F0",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
  },
  chipLabel: {
    color: "#334155",
    fontFamily: Fonts.title,
    fontSize: rMS(11.5),
  },
});
