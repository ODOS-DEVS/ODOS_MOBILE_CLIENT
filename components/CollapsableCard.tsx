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

interface CollapsibleShippingCardProps {
  title?: string;
  icon?: any;
  description?: string[];
  shippingOptions?: ShippingOption[];
  defaultExpanded?: boolean;
}

const CollapsibleShippingCard: React.FC<CollapsibleShippingCardProps> = ({
  title,
  icon,
  description,
  shippingOptions,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View className="bg-[#f8f8f8] rounded-xl border border-[#e0e0e0] overflow-hidden mb-4">
      {/* HEADER */}
      <TouchableOpacity
        className="flex-row justify-between items-center p-4 bg-[#f8f8f8]"
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-2">{icon}</Text>
          <Text className="text-lg font-semibold text-[#333]">{title}</Text>
        </View>
        <Text className="text-2xl text-[#666] ml-2">
          {isExpanded ? (
            <Ionicons name="chevron-down" size={22}/>
          ) : (
            <Ionicons name="chevron-forward" size={22}/>
          )}
        </Text>
      </TouchableOpacity>

      {/* CONTENT */}
      {isExpanded && (
        <View className="px-4 pb-4 pt-0">
          <Text className="text-sm text-[#666] leading-relaxed mb-4 ">
            {description}
          </Text>

          <View className="gap-3">
            {shippingOptions?.map((option, index) => (
              <View
                key={index}
                className={`flex-row justify-between items-center bg-white p-4 rounded-lg border border-[#e0e0e0] ${
                  index !== shippingOptions.length - 1 ? "mb-3" : ""
                }`}
              >
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#333] mb-1">
                    {option.type}
                  </Text>
                  <Text className="text-sm text-[#666]">
                    {option.deliveryTime}
                  </Text>
                </View>

                <Text className="text-base font-semibold text-[#333] ml-3">
                  {option.price}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default CollapsibleShippingCard;
