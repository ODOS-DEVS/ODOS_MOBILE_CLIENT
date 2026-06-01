import { useTheme } from "@/context/ThemeContext";
import Fonts from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ShippingOption {
  type: string;
  deliveryTime: string;
  price: string;
}

interface CollapsibleCardProps {
  title?: string;
  icon?: any;
  description?: string[];
  specifications?: string[];
  shippingOptions?: ShippingOption[];
  defaultExpanded?: boolean;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  icon,
  description,
  specifications,
  shippingOptions,
  defaultExpanded = false,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          backgroundColor: colors.accentSoft,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden" as const,
        },
        header: {
          flexDirection: "row" as const,
          justifyContent: "space-between" as const,
          alignItems: "center" as const,
          paddingHorizontal: 14,
          paddingVertical: 18,
          backgroundColor: colors.accentSoft,
        },
        title: {
          fontSize: 16,
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        chevron: {
          fontSize: 20,
          color: colors.textMuted,
          marginLeft: 8,
        },
        content: {
          paddingHorizontal: 14,
          paddingBottom: 14,
          paddingTop: 6,
        },
        bodyText: {
          fontSize: 13,
          lineHeight: 19,
          color: colors.textMuted,
          fontFamily: Fonts.text,
        },
        specCard: {
          borderRadius: 12,
          backgroundColor: colors.card,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        specLabel: {
          fontSize: 12,
          fontFamily: Fonts.textBold,
          color: colors.text,
          marginBottom: 4,
        },
        specValue: {
          fontSize: 13,
          lineHeight: 18,
          color: colors.textMuted,
          fontFamily: Fonts.text,
        },
        shippingRow: {
          flexDirection: "row" as const,
          justifyContent: "space-between" as const,
          alignItems: "center" as const,
          backgroundColor: colors.card,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shippingTitle: {
          fontSize: 14,
          fontFamily: Fonts.titleBold,
          color: colors.text,
          marginBottom: 2,
        },
        shippingMeta: {
          fontSize: 12,
          fontFamily: Fonts.text,
          color: colors.textMuted,
        },
        shippingPrice: {
          fontSize: 14,
          fontFamily: Fonts.titleBold,
          color: colors.text,
          marginLeft: 10,
        },
      }),
    [colors],
  );

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View className="shadow-sm" style={{ borderRadius: 16, marginBottom: 12 }}>
      <View style={styles.shell}>
        <TouchableOpacity
          style={styles.header}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Text style={{ fontSize: 22, marginRight: 8 }}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.chevron}>
            {isExpanded ? (
              <Ionicons name="chevron-down" size={22} />
            ) : (
              <Ionicons name="chevron-forward" size={22} />
            )}
          </Text>
        </TouchableOpacity>

        {isExpanded ? (
          <View style={styles.content}>
            {description ? (
              <View
                style={{
                  gap: 8,
                  marginBottom:
                    shippingOptions?.length || specifications?.length ? 12 : 6,
                }}
              >
                {(Array.isArray(description) ? description : [description]).map(
                  (line, idx) => (
                    <Text key={idx} style={styles.bodyText}>
                      {line}
                    </Text>
                  ),
                )}
              </View>
            ) : null}

            {specifications?.length ? (
              <View
                style={{
                  gap: 10,
                  marginBottom: shippingOptions?.length ? 12 : 6,
                }}
              >
                {specifications.map((line, idx) => {
                  const separatorIndex = line.indexOf(":");
                  const label =
                    separatorIndex >= 0 ? line.slice(0, separatorIndex).trim() : null;
                  const value =
                    separatorIndex >= 0
                      ? line.slice(separatorIndex + 1).trim()
                      : line.trim();

                  return (
                    <View key={`${line}-${idx}`} style={styles.specCard}>
                      {label ? (
                        <Text style={styles.specLabel}>{label}</Text>
                      ) : null}
                      <Text style={styles.specValue}>{value}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <View style={{ gap: 10 }}>
              {shippingOptions?.map((option, index) => (
                <View key={index} style={styles.shippingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shippingTitle}>{option.type}</Text>
                    <Text style={styles.shippingMeta}>{option.deliveryTime}</Text>
                  </View>
                  <Text style={styles.shippingPrice}>{option.price}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default CollapsibleCard;
