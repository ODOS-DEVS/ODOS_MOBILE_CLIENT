import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { STORE_HOURS_DAY_KEYS, type BusinessHoursMap } from "@/utils/storeHours";
import React, { useMemo } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

const DAY_LABELS: Record<(typeof STORE_HOURS_DAY_KEYS)[number], string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

type StoreHoursEditorProps = {
  value: BusinessHoursMap | null;
  onChange: (next: BusinessHoursMap) => void;
};

export default function StoreHoursEditor({ value, onChange }: StoreHoursEditorProps) {
  const { colors } = useTheme();

  const hours = useMemo(() => value ?? {}, [value]);

  function updateDay(
    dayKey: string,
    patch: Partial<{ open: string; close: string; closed: boolean }>,
  ) {
    const current = hours[dayKey] ?? { open: "09:00", close: "18:00", closed: false };
    onChange({ ...hours, [dayKey]: { ...current, ...patch } });
  }

  function applyMondayToAllDays() {
    const monday = hours.monday ?? { open: "09:00", close: "18:00", closed: false };
    const next: BusinessHoursMap = {};
    STORE_HOURS_DAY_KEYS.forEach((dayKey) => {
      next[dayKey] = { ...monday };
    });
    onChange(next);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.rows}>
        {STORE_HOURS_DAY_KEYS.map((dayKey) => {
          const day = hours[dayKey];
          const isClosed = Boolean(day?.closed);
          const openValue = day?.open ?? "";
          const closeValue = day?.close ?? "";
          const openInvalid = Boolean(openValue) && !TIME_PATTERN.test(openValue);
          const closeInvalid = Boolean(closeValue) && !TIME_PATTERN.test(closeValue);

          return (
            <View
              key={dayKey}
              style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
            >
              <View style={styles.dayHeaderRow}>
                <Text style={[styles.dayLabel, { color: colors.text }]}>
                  {DAY_LABELS[dayKey]}
                </Text>
                <View style={styles.closedToggle}>
                  <Text style={[styles.closedLabel, { color: colors.textMuted }]}>Closed</Text>
                  <Switch
                    value={isClosed}
                    onValueChange={(next) => updateDay(dayKey, { closed: next })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.onPrimary}
                  />
                </View>
              </View>

              {!isClosed ? (
                <View style={styles.timeRow}>
                  <View style={styles.timeField}>
                    <Text style={[styles.timeFieldLabel, { color: colors.textMuted }]}>Opens</Text>
                    <TextInput
                      value={openValue}
                      onChangeText={(text) => updateDay(dayKey, { open: text })}
                      placeholder="09:00"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                      style={[
                        styles.timeInput,
                        {
                          color: colors.text,
                          borderColor: openInvalid ? colors.dangerText : colors.inputBorder,
                          backgroundColor: colors.inputBg,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.timeSeparator, { color: colors.textMuted }]}>–</Text>
                  <View style={styles.timeField}>
                    <Text style={[styles.timeFieldLabel, { color: colors.textMuted }]}>Closes</Text>
                    <TextInput
                      value={closeValue}
                      onChangeText={(text) => updateDay(dayKey, { close: text })}
                      placeholder="18:00"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                      style={[
                        styles.timeInput,
                        {
                          color: colors.text,
                          borderColor: closeInvalid ? colors.dangerText : colors.inputBorder,
                          backgroundColor: colors.inputBg,
                        },
                      ]}
                    />
                  </View>
                </View>
              ) : null}
              {openInvalid || closeInvalid ? (
                <Text style={[styles.errorText, { color: colors.dangerText }]}>
                  Use 24-hour HH:MM, e.g. 09:00 or 18:30.
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <Text
        onPress={applyMondayToAllDays}
        style={[styles.copyAction, { color: colors.primary }]}
      >
        Copy Monday&apos;s hours to every day
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: rV(12),
  },
  rows: {
    gap: rV(8),
  },
  row: {
    borderRadius: rMS(14),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: rS(12),
    paddingVertical: rV(10),
    gap: rV(8),
  },
  dayHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayLabel: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
  },
  closedToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
  },
  closedLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: rS(10),
  },
  timeField: {
    flex: 1,
    gap: rV(4),
  },
  timeFieldLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(10.5),
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  timeInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: rMS(10),
    paddingHorizontal: rS(10),
    paddingVertical: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
  },
  timeSeparator: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    paddingBottom: rV(9),
  },
  errorText: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
  },
  copyAction: {
    alignSelf: "flex-start",
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
});
