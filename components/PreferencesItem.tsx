import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { StyleSheet, Switch, Text, View } from "react-native";

export interface PreferenceItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const PreferenceItem = ({
  title,
  description,
  value,
  onValueChange,
}: PreferenceItemProps) => {
  return (
    <View style={styles.prefItem}>
      {/* Top row: title + switch */}
      <View style={styles.topRow}>
        <Text style={styles.prefTitle}>{title}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#E5E5E9", true: "#111" }}
          thumbColor="#E5E1DA"
        />
      </View>

      {/* Description below */}
      <Text style={styles.prefDescription}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  prefItem: {
    backgroundColor: "#fff",
    paddingHorizontal: rS(16),
    paddingVertical: rV(18),
    borderBottomWidth: rMS(0.5),
    borderBottomColor: "#ECECEC",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rMS(8),
  },

  prefTitle: {
    fontSize: rMS(15),
    color: "#1C1C1E",
    fontFamily: Fonts.textBold,
  },

  prefDescription: {
    fontSize: rMS(13),
    lineHeight: rMS(18),
    color: "#6E6E73",
    fontFamily: Fonts.text,
  },
});
