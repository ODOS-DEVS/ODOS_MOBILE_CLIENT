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
          false: "#E5E5E5",
          true: "#111",
        }}
        thumbColor="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },

  itemText: {
    fontSize: 15,
    color: "#222",
  },
});
