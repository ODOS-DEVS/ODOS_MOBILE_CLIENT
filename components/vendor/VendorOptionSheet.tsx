import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * A plain "pick one" sheet, shared by the vendor list screens.
 *
 * Products, orders and stock each replaced a button that cycled blindly
 * through its options on tap. Cycling hid both the direction of a sort and the
 * existence of options past the first two; naming them outright costs one tap
 * and removes the guessing.
 */
export default function VendorOptionSheet<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, rV(16)) }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>

        {options.map((option) => {
          const active = option.value === selected;
          return (
            <TouchableOpacity
              key={option.value}
              style={styles.row}
              activeOpacity={0.82}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
            >
              <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                {option.label}
              </Text>
              {active ? (
                <Ionicons name="checkmark" size={rMS(18)} color={colors.primary} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
    },
    sheet: {
      borderTopLeftRadius: rMS(26),
      borderTopRightRadius: rMS(26),
      backgroundColor: colors.card,
      paddingHorizontal: rS(18),
      paddingTop: rV(10),
    },
    handle: {
      alignSelf: "center",
      width: rS(44),
      height: rV(4),
      borderRadius: 999,
      backgroundColor: colors.cardBorder,
      marginBottom: rV(14),
    },
    title: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(17),
      color: colors.text,
      marginBottom: rV(6),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: rV(14),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rowLabel: {
      fontFamily: Fonts.title,
      fontSize: rMS(14),
      color: colors.textSecondary,
    },
    rowLabelActive: {
      fontFamily: Fonts.titleBold,
      color: colors.text,
    },
  });
}
