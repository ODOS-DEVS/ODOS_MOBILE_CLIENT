import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rV } from "@/styles/responsive";
import {
  buildDeliveryOptions,
  formatDeliveryAmount,
  type DeliveryMethodId,
  type DeliveryOption,
} from "@/utils/delivery";
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

type DeliveryOptionsCardProps = {
  subtotal: number;
  region?: string | null;
  selectedMethodId?: DeliveryMethodId;
  onSelectMethod?: (methodId: DeliveryMethodId) => void;
  defaultExpanded?: boolean;
  variant?: "card" | "inline";
};

function DeliveryOptionRow({
  option,
  selected,
  selectable,
  onPress,
}: {
  option: DeliveryOption;
  selected: boolean;
  selectable: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          borderRadius: 14,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.accentSoft : colors.card,
          paddingHorizontal: 12,
          paddingVertical: 12,
          opacity: option.available ? 1 : 0.55,
        },
        topLine: {
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        },
        title: {
          flex: 1,
          fontSize: rMS(14),
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        price: {
          fontSize: rMS(14),
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        meta: {
          marginTop: rV(4),
          fontSize: rMS(12),
          lineHeight: rMS(17),
          fontFamily: Fonts.text,
          color: colors.textMuted,
        },
        etaRow: {
          marginTop: rV(8),
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        },
        eta: {
          fontSize: rMS(12),
          fontFamily: Fonts.textBold,
          color: colors.text,
        },
        badge: {
          alignSelf: "flex-start",
          marginTop: rV(8),
          borderRadius: 999,
          paddingHorizontal: 8,
          paddingVertical: 3,
          backgroundColor: "#DCFCE7",
        },
        badgeText: {
          fontSize: rMS(10),
          fontFamily: Fonts.titleBold,
          color: "#166534",
        },
        radio: {
          width: rMS(18),
          height: rMS(18),
          borderRadius: rMS(9),
          borderWidth: 2,
          borderColor: selected ? colors.primary : colors.border,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
        },
        radioInner: {
          width: rMS(8),
          height: rMS(8),
          borderRadius: rMS(4),
          backgroundColor: colors.primary,
        },
      }),
    [colors, option.available, selected],
  );

  const content = (
    <View style={styles.row}>
      <View style={styles.topLine}>
        {selectable ? (
          <View style={styles.radio}>
            {selected ? <View style={styles.radioInner} /> : null}
          </View>
        ) : null}
        <Text style={styles.title}>{option.title}</Text>
        <Text style={styles.price}>{formatDeliveryAmount(option.amount)}</Text>
      </View>
      <Text style={styles.meta}>{option.subtitle}</Text>
      <View style={styles.etaRow}>
        <Ionicons name="time-outline" size={rMS(14)} color={colors.textMuted} />
        <Text style={styles.eta}>{option.eta}</Text>
      </View>
      {option.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{option.badge}</Text>
        </View>
      ) : null}
      {!option.available && option.unavailableReason ? (
        <Text style={[styles.meta, { marginTop: rV(6) }]}>{option.unavailableReason}</Text>
      ) : null}
    </View>
  );

  if (!selectable || !option.available || !onPress) {
    return content;
  }

  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

export default function DeliveryOptionsCard({
  subtotal,
  region,
  selectedMethodId = "economy",
  onSelectMethod,
  defaultExpanded = false,
  variant = "card",
}: DeliveryOptionsCardProps) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || variant === "inline");
  const options = useMemo(
    () => buildDeliveryOptions({ subtotal, region }),
    [region, subtotal],
  );
  const selectable = Boolean(onSelectMethod);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          backgroundColor: colors.accentSoft,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          marginBottom: 12,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 18,
        },
        title: {
          fontSize: 16,
          fontFamily: Fonts.titleBold,
          color: colors.text,
        },
        content: {
          paddingHorizontal: 14,
          paddingBottom: 14,
          gap: 10,
        },
        inlineContent: {
          gap: 10,
        },
        intro: {
          fontSize: 13,
          lineHeight: 19,
          color: colors.textMuted,
          fontFamily: Fonts.text,
          marginBottom: 4,
        },
        footnote: {
          marginTop: 2,
          fontSize: 12,
          lineHeight: 17,
          color: colors.textMuted,
          fontFamily: Fonts.text,
        },
      }),
    [colors],
  );

  const toggleExpand = () => {
    if (variant === "inline") {
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((current) => !current);
  };

  const content = (
    <View style={variant === "inline" ? styles.inlineContent : styles.content}>
      <Text style={styles.intro}>
        {selectable
          ? "Choose how fast you want this order delivered. Rates update automatically from your address and cart total."
          : "See estimated delivery speeds for this item. You can choose your preferred option at checkout."}
      </Text>
      {options.map((option) => (
        <DeliveryOptionRow
          key={option.id}
          option={option}
          selected={selectedMethodId === option.id}
          selectable={selectable}
          onPress={
            onSelectMethod && option.available
              ? () => onSelectMethod(option.id)
              : undefined
          }
        />
      ))}
      <Text style={styles.footnote}>
        Delivery windows exclude Sundays and public holidays. Large or fragile items may need an
        extra handling day.
      </Text>
    </View>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <View style={styles.shell}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 8 }}>
          <Ionicons name="car-outline" size={20} color={colors.textMuted} />
          <Text style={styles.title}>Delivery & shipping</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-down" : "chevron-forward"}
          size={22}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {isExpanded ? content : null}
    </View>
  );
}
