import { useTheme } from "@/context/ThemeContext";
import { useMenuItemStyles } from "@/styles/themedCommerce";
import { rMS, rS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress?: () => void;
  textColor?: string;
};

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  textColor,
}) => {
  const styles = useMenuItemStyles();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={rMS(19)} color={colors.textSecondary} />
        <Text style={[styles.menuText, textColor ? { color: textColor } : null]}>
          {label}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={rMS(17)}
        color={colors.iconMuted}
      />
    </TouchableOpacity>
  );
};
