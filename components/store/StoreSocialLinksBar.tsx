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
    gap: rV(10),
  },
  title: {
    color: "#111827",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
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
    backgroundColor: "#F3F4F6",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    paddingHorizontal: rS(12),
    paddingVertical: rV(8),
  },
  chipLabel: {
    color: "#374151",
    fontFamily: Fonts.title,
    fontSize: rMS(12),
  },
});
