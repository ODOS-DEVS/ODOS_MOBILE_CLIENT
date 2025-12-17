import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { StyleSheet, Switch, Text, View } from "react-native";

/* -------------------- Reusable Row -------------------- */
export interface NotificationItemProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}
export const NotificationItem = ({
  label,
  value,
  onValueChange,
}: NotificationItemProps) => {
  return (
    <View style={styles.item}>
      <Text style={styles.itemText}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
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
});
