import { AccountBadge } from "@/components/account/AccountUi";
import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { useMenuItemStyles } from "@/styles/themedCommerce";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MenuItemBadgeTone = "neutral" | "dark" | "success" | "warning" | "danger" | "info";

type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress?: () => void;
  textColor?: string;
  /**
   * Trailing text, for a row whose current state is worth reading without
   * opening it — a loyalty tier, a saved count.
   */
  value?: string;
  /** Status pill before the chevron, for a row that needs attention. */
  badge?: { label: string; tone?: MenuItemBadgeTone };
  /** Second line under the label. Keep it to a few words. */
  description?: string;
  disabled?: boolean;
};

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  textColor,
  value,
  badge,
  description,
  disabled = false,
}) => {
  const styles = useMenuItemStyles();
  const { colors } = useTheme();

  const extraStyles = useMemo(
    () =>
      StyleSheet.create({
        copy: {
          flex: 1,
          marginLeft: rS(12),
          minWidth: 0,
        },
        // marginLeft lives on the wrapper now that the label can be joined by
        // a description line.
        label: {
          marginLeft: 0,
        },
        description: {
          marginTop: rV(2),
          fontSize: rMS(12),
          fontFamily: Fonts.text,
          color: colors.textMuted,
        },
        trailing: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          marginLeft: rS(10),
        },
        value: {
          fontSize: rMS(12.5),
          fontFamily: Fonts.textBold,
          color: colors.textMuted,
        },
        left: {
          flex: 1,
          minWidth: 0,
        },
        disabled: {
          opacity: 0.55,
        },
      }),
    [colors],
  );

  return (
    <TouchableOpacity
      style={[styles.menuItem, disabled ? extraStyles.disabled : null]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={disabled || !onPress}
    >
      <View style={[styles.menuLeft, extraStyles.left]}>
        <Ionicons name={icon} size={rMS(19)} color={colors.textSecondary} />
        <View style={extraStyles.copy}>
          <Text
            style={[
              styles.menuText,
              extraStyles.label,
              textColor ? { color: textColor } : null,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
          {description ? (
            <Text style={extraStyles.description} numberOfLines={1}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={extraStyles.trailing}>
        {value ? (
          <Text style={extraStyles.value} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {badge ? <AccountBadge label={badge.label} tone={badge.tone} /> : null}
        <Ionicons name="chevron-forward" size={rMS(17)} color={colors.iconMuted} />
      </View>
    </TouchableOpacity>
  );
};
