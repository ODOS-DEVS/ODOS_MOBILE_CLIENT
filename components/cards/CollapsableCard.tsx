import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable LayoutAnimation for Android
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
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View
      className="shadow-sm"
      style={{ borderRadius: 16, marginBottom: 12 }}
    >
      <View
        style={{
          backgroundColor: "#F8FAFC",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          overflow: "hidden",
        }}
      >
      {/* HEADER */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 18,
          backgroundColor: "#F8FAFC",
        }}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Text style={{ fontSize: 22, marginRight: 8 }}>{icon}</Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: Fonts.titleBold,
              color: AppColors.text,
            }}
          >
            {title}
          </Text>
        </View>
        <Text style={{ fontSize: 20, color: AppColors.subtext[100], marginLeft: 8 }}>
          {isExpanded ? (
            <Ionicons name="chevron-down" size={22} />
          ) : (
            <Ionicons name="chevron-forward" size={22} />
          )}
        </Text>
      </TouchableOpacity>

      {/* CONTENT */}
      {isExpanded && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 6 }}>
          {description && (
            <View
              style={{
                gap: 8,
                marginBottom: shippingOptions?.length || specifications?.length ? 12 : 6,
              }}
            >
              {(Array.isArray(description) ? description : [description]).map(
                (line, idx) => (
                  <Text
                    key={idx}
                    style={{
                      fontSize: 13,
                      lineHeight: 19,
                      color: AppColors.secondary,
                      fontFamily: Fonts.text,
                    }}
                  >
                    {line}
                  </Text>
                )
              )}
            </View>
          )}

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
                  <View
                    key={`${line}-${idx}`}
                    style={{
                      borderRadius: 12,
                      backgroundColor: AppColors.white,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                    }}
                  >
                    {label ? (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: Fonts.textBold,
                          color: AppColors.text,
                          marginBottom: 4,
                        }}
                      >
                        {label}
                      </Text>
                    ) : null}
                    <Text
                      style={{
                        fontSize: 13,
                        lineHeight: 18,
                        color: AppColors.secondary,
                        fontFamily: Fonts.text,
                      }}
                    >
                      {value}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          <View style={{ gap: 10 }}>
            {shippingOptions?.map((option, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: AppColors.white,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: Fonts.titleBold,
                      color: AppColors.text,
                      marginBottom: 2,
                    }}
                  >
                    {option.type}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.text,
                      color: AppColors.secondary,
                    }}
                  >
                    {option.deliveryTime}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.titleBold,
                    color: AppColors.text,
                    marginLeft: 10,
                  }}
                >
                  {option.price}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      </View>
    </View>
  );
};

export default CollapsibleCard;
