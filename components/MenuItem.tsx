import { AppColors } from "@/constants/Colors";
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

  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={rMS(19)} color={AppColors.secondary} />
        <Text style={[styles.menuText, textColor ? { color: textColor } : null]}>
          {label}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={rMS(17)}
        color={AppColors.subtext[100]}
      />
    </TouchableOpacity>
  );
};
