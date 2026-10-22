import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useContext, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Compact rows for the vendor list screens.
 *
 * Layout lives on a plain inner `View`, never on the touchable itself.
 *
 * This project sets `jsxImportSource: "nativewind"`, so every element goes
 * through NativeWind's style interop, which normalises the `style` prop and
 * never invokes the callback form — `style={({ pressed }) => ...}` on a
 * Pressable is silently dropped, whether it returns an object or an array.
 * The row then rendered with no style at all: a flex *column* with no padding,
 * stretched children, and the stepper floating in the middle on its own line.
 *
 * Plain and array styles on a `View` apply normally, which is why the
 * separator, stepper and status dot always looked right while the row around
 * them did not. Keep layout on plain Views and this stays fixed.
 */

export const VENDOR_ROW_MIN_HEIGHT = rV(64);

export type VendorRowAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** "danger" reserves the destructive red; everything else reads as neutral. */
  tone?: "neutral" | "danger";
  onPress: () => void;
};

export function VendorRow({
  children,
  actions,
  onPress,
  onLongPress,
  selected = false,
}: {
  children: React.ReactNode;
  actions?: VendorRowAction[];
  onPress?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createRowStyles(colors), [colors]);
  const openActions = useContext(VendorRowActionsContext);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={250}
    >
      <View style={[styles.row, selected && styles.rowSelected]}>
        {children}

        {actions?.length && openActions ? (
          <TouchableOpacity
            onPress={() => openActions(actions)}
            hitSlop={10}
            style={styles.menuButton}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={rMS(17)}
              color={colors.iconMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const VendorRowActionsContext =
  createContext<((actions: VendorRowAction[]) => void) | null>(null);

/**
 * One action sheet for a whole list, instead of one per row.
 *
 * `VendorRow` used to render its own `<Modal>`, which put a Modal inside every
 * virtualized cell — twenty of them once a page of products loaded. That is
 * what produced the repeated errors pointing at the `<FlatList>` on the
 * Products and Stock screens; Orders, whose rows carry no actions and so
 * mounted no Modal, never logged them.
 *
 * A row now just asks the list to open the sheet, and the single Modal lives
 * above the list where only one can ever be presented at a time.
 */
export function VendorRowActionsProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createRowStyles(colors), [colors]);
  const [actions, setActions] = useState<VendorRowAction[] | null>(null);

  const open = useMemo(() => (next: VendorRowAction[]) => setActions(next), []);
  const close = () => setActions(null);

  return (
    <VendorRowActionsContext.Provider value={open}>
      {children}

      <Modal
        visible={actions !== null}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {actions?.map((action) => (
              <TouchableOpacity
                key={action.label}
                activeOpacity={0.7}
                onPress={() => {
                  close();
                  action.onPress();
                }}
                style={styles.sheetRow}
              >
                <Ionicons
                  name={action.icon}
                  size={rMS(19)}
                  color={action.tone === "danger" ? colors.dangerText : colors.text}
                />
                <Text
                  style={[
                    styles.sheetLabel,
                    action.tone === "danger" && styles.sheetLabelDanger,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </VendorRowActionsContext.Provider>
  );
}

/** Hairline between rows, so a long list reads as one surface. */
export function VendorRowSeparator() {
  const { colors } = useTheme();
  const styles = useMemo(() => createRowStyles(colors), [colors]);
  return <View style={styles.separator} />;
}

/**
 * Minus / value / plus, for changing a count without a keyboard.
 *
 * Sized intrinsically and placed at the end of a row — never full width.
 */
export function VendorStepper({
  value,
  onChange,
  disabled = false,
  min = 0,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  min?: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createRowStyles(colors), [colors]);
  const atMin = value <= min;

  return (
    <View style={[styles.stepper, disabled && styles.stepperDisabled]}>
      <TouchableOpacity
        style={styles.stepperButton}
        disabled={disabled || atMin}
        onPress={() => onChange(Math.max(min, value - 1))}
        hitSlop={6}
      >
        <Ionicons name="remove" size={rMS(15)} color={atMin ? colors.iconMuted : colors.text} />
      </TouchableOpacity>
      <Text style={[styles.stepperValue, value === 0 && styles.stepperValueZero]}>
        {value}
      </Text>
      <TouchableOpacity
        style={styles.stepperButton}
        disabled={disabled}
        onPress={() => onChange(value + 1)}
        hitSlop={6}
      >
        <Ionicons name="add" size={rMS(15)} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

/** A small coloured dot — status at a glance without spending a badge's width. */
export function VendorStatusDot({ tone }: { tone: "live" | "warn" | "danger" | "muted" }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createRowStyles(colors), [colors]);
  const toneStyle =
    tone === "live"
      ? styles.dotLive
      : tone === "warn"
        ? styles.dotWarn
        : tone === "danger"
          ? styles.dotDanger
          : styles.dotMuted;
  return <View style={[styles.dot, toneStyle]} />;
}

export function createRowStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      minHeight: VENDOR_ROW_MIN_HEIGHT,
      flexDirection: "row",
      alignItems: "center",
      gap: rS(12),
      paddingHorizontal: rS(16),
      paddingVertical: rV(11),
      backgroundColor: colors.card,
    },
    rowSelected: { backgroundColor: colors.accentSoft },

    menuButton: {
      width: rMS(22),
      alignItems: "flex-end",
      justifyContent: "center",
    },

    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: rS(16),
    },

    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: rMS(22),
      borderTopRightRadius: rMS(22),
      paddingTop: rV(10),
      paddingBottom: rV(30),
    },
    sheetHandle: {
      alignSelf: "center",
      width: rS(42),
      height: rV(4),
      borderRadius: 999,
      backgroundColor: colors.cardBorder,
      marginBottom: rV(8),
    },
    sheetRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(13),
      paddingHorizontal: rS(22),
      paddingVertical: rV(15),
    },
    sheetLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(14.5),
      color: colors.text,
    },
    sheetLabelDanger: { color: colors.dangerText },

    stepper: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: rMS(10),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
    },
    stepperDisabled: { opacity: 0.5 },
    stepperButton: {
      width: rMS(30),
      height: rMS(30),
      alignItems: "center",
      justifyContent: "center",
    },
    stepperValue: {
      minWidth: rS(20),
      textAlign: "center",
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13),
      color: colors.text,
    },
    stepperValueZero: { color: colors.dangerText },

    dot: { width: rMS(7), height: rMS(7), borderRadius: rMS(4) },
    dotLive: { backgroundColor: colors.successText },
    dotWarn: { backgroundColor: colors.warningText },
    dotDanger: { backgroundColor: colors.dangerText },
    dotMuted: { backgroundColor: colors.iconMuted },
  });
}
