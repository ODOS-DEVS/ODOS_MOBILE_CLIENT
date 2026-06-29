import { useTheme } from "@/context/ThemeContext";
import { MIN_BIRTH_YEAR } from "@/utils/dateOfBirth";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, View } from "react-native";

type DateOfBirthPickerProps = {
  value: Date;
  maximumDate?: Date;
  onChange: (value: Date) => void;
};

/** iOS spinner picker for use inside a sheet with a Done button. */
export default function DateOfBirthPicker({
  value,
  maximumDate = new Date(),
  onChange,
}: DateOfBirthPickerProps) {
  const { isDark } = useTheme();

  if (Platform.OS !== "ios") {
    return null;
  }

  return (
    <View style={{ alignItems: "center" }}>
      <DateTimePicker
        value={value}
        mode="date"
        display="spinner"
        maximumDate={maximumDate}
        minimumDate={new Date(MIN_BIRTH_YEAR, 0, 1)}
        onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
          if (selectedDate) {
            onChange(selectedDate);
          }
        }}
        themeVariant={isDark ? "dark" : "light"}
        style={{ width: "100%", height: 216 }}
      />
    </View>
  );
}

type AndroidBirthDatePickerProps = {
  visible: boolean;
  value: Date;
  maximumDate?: Date;
  onChange: (value: Date) => void;
  onDismiss: () => void;
};

/** Android system date dialog — one tap to open, OK to confirm. */
export function AndroidBirthDatePicker({
  visible,
  value,
  maximumDate = new Date(),
  onChange,
  onDismiss,
}: AndroidBirthDatePickerProps) {
  if (Platform.OS !== "android" || !visible) {
    return null;
  }

  return (
    <DateTimePicker
      value={value}
      mode="date"
      display="default"
      maximumDate={maximumDate}
      minimumDate={new Date(MIN_BIRTH_YEAR, 0, 1)}
      onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
        onDismiss();
        if (event.type === "set" && selectedDate) {
          onChange(selectedDate);
        }
      }}
    />
  );
}
