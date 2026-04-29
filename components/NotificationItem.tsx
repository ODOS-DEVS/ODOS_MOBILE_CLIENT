import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { StyleSheet, Switch, Text, View } from "react-native";

/* -------------------- Reusable Row -------------------- */
export interface NotificationItemProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}
export const NotificationItem = ({
  label,
  value,
  onValueChange,
  disabled = false,
}: NotificationItemProps) => {
  return (
    <View style={[styles.item, disabled && styles.itemDisabled]}>
      <Text style={[styles.itemText, disabled && styles.itemTextDisabled]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: "#E5E5E9",
          true: "#111",
        }}
        thumbColor="#EEEEEE"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderBottomWidth: rMS(0.5),
    borderBottomColor: "#EEE",
  },

  itemText: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    color: "#222",
  },
  itemDisabled: {
    opacity: 0.55,
  },
  itemTextDisabled: {
    color: "#80848A",
  },
});
