import Fonts from "@/constants/Fonts";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * The business-signal layer of the vendor workspace.
 *
 * A stats *card* was removed from these screens once already, for good
 * reasons: it restated the numbers the filter chips were already showing, and
 * it pushed real content below the fold. Both faults are about what the panel
 * said and how much room it took, not about showing numbers at all — a vendor
 * genuinely cannot run a shop without knowing what it earned and what is about
 * to run out.
 *
 * So the pulse bar earns its space by obeying three rules:
 *
 *   1. **Only what a chip cannot say.** Chips count rows ("Live 14"). This
 *      shows money, velocity and runway — facts with no chip equivalent.
 *   2. **One line, never a panel.** It is shorter than a single list row, so
 *      arriving at the screen still shows real content.
 *   3. **It scrolls away.** Deliberately rendered inside the list header
 *      rather than pinned: a pinned panel is what ended up clipped behind the
 *      tab bar before, and a number you have already read should not keep
 *      charging you rent.
 *
 * Metrics are also tappable, which is what makes them worth more than a
 * readout — "3 need reorder" is both the finding and the way to act on it.
 *
 * NOTE: never pass a function to `style` anywhere in this app. NativeWind owns
 * the JSX runtime and silently drops callback styles; see the comment in
 * VendorRowUi.tsx. Press feedback goes through `activeOpacity`.
 */

export type VendorPulseMetric = {
  key: string;
  label: string;
  value: string;
  /** Tints the value when it means "act on me". */
  tone?: "neutral" | "warn" | "danger" | "good";
  /** Makes the metric a filter: tap the number, see the rows behind it. */
  onPress?: () => void;
  /** Marks the metric as the currently applied filter. */
  active?: boolean;
};

export function VendorPulseBar({ metrics }: { metrics: VendorPulseMetric[] }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (metrics.length === 0) {
    return null;
  }

  const toneColor = (tone: VendorPulseMetric["tone"]) => {
    switch (tone) {
      case "danger":
        return colors.dangerText;
      case "warn":
        return colors.warningText;
      case "good":
        return colors.successText;
      default:
        return colors.text;
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pulseRow}
      keyboardShouldPersistTaps="handled"
    >
      {metrics.map((metric, index) => (
        <View key={metric.key} style={styles.pulseCell}>
          {index > 0 ? <View style={styles.pulseDivider} /> : null}
          <TouchableOpacity
            activeOpacity={metric.onPress ? 0.6 : 1}
            disabled={!metric.onPress}
            onPress={metric.onPress}
          >
            <View style={styles.pulseBody}>
              <Text style={styles.pulseLabel} numberOfLines={1}>
                {metric.label}
              </Text>
              <View style={styles.pulseValueRow}>
                <Text
                  style={[styles.pulseValue, { color: toneColor(metric.tone) }]}
                  numberOfLines={1}
                >
                  {metric.value}
                </Text>
                {metric.active ? (
                  <Ionicons
                    name="funnel"
                    size={rMS(10)}
                    color={toneColor(metric.tone)}
                  />
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

/**
 * Relative sales velocity as a hairline bar under a product name.
 *
 * Scaled against the best seller currently on screen, so the question it
 * answers while scanning is "how does this line compare to my strongest one".
 * An absolute axis would be unreadable at this size and useless across
 * vendors selling at wildly different volumes.
 */
export function VendorVelocityBar({
  share,
  tone = "neutral",
  width,
}: {
  /** 0–1, from getVendorVelocityShare. */
  share: number;
  tone?: "neutral" | "warn" | "danger";
  width?: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const trackWidth = width ?? rS(42);
  const fillWidth = Math.max(share > 0 ? rS(2) : 0, trackWidth * share);

  const fillColor =
    tone === "danger"
      ? colors.dangerText
      : tone === "warn"
        ? colors.warningText
        : colors.textSecondary;

  return (
    <View style={[styles.velocityTrack, { width: trackWidth }]}>
      <View
        style={[styles.velocityFill, { width: fillWidth, backgroundColor: fillColor }]}
      />
    </View>
  );
}

/**
 * A compact labelled pill — "Reorder now", "8d cover", "Pickup".
 *
 * Sized intrinsically so several can share the end of a row without any of
 * them stretching to fill it.
 */
export function VendorTag({
  label,
  tone = "neutral",
  icon,
}: {
  label: string;
  tone?: "neutral" | "warn" | "danger" | "good" | "info";
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const palette =
    tone === "danger"
      ? { bg: colors.dangerSoft, fg: colors.dangerText }
      : tone === "warn"
        ? { bg: colors.warningSoft, fg: colors.warningText }
        : tone === "good"
          ? { bg: colors.successSoft, fg: colors.successText }
          : tone === "info"
            ? { bg: colors.infoSoft, fg: colors.infoText }
            : { bg: colors.surfaceSubtle, fg: colors.textSecondary };

  return (
    <View style={[styles.tag, { backgroundColor: palette.bg }]}>
      {icon ? <Ionicons name={icon} size={rMS(10)} color={palette.fg} /> : null}
      <Text style={[styles.tagLabel, { color: palette.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/**
 * A sticky bar for acting on a multi-row selection.
 *
 * Pinned to the bottom rather than the top because that is where the thumb
 * already is after ticking rows, and because it must stay reachable while the
 * list keeps scrolling underneath it.
 */
export function VendorActionBar({
  children,
  bottomInset = 0,
}: {
  children: React.ReactNode;
  bottomInset?: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.actionBar, { paddingBottom: bottomInset + rV(12) }]}>
      {children}
    </View>
  );
}

/** A filled or outlined button sized for the action bar. */
export function VendorActionButton({
  label,
  icon,
  onPress,
  variant = "ghost",
  tone = "neutral",
  disabled = false,
  grow = false,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: "solid" | "ghost";
  tone?: "neutral" | "danger";
  disabled?: boolean;
  grow?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const solid = variant === "solid";
  const fg = solid
    ? colors.onInverseSurface
    : tone === "danger"
      ? colors.dangerText
      : colors.text;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.actionButton,
        grow && styles.actionButtonGrow,
        solid ? styles.actionButtonSolid : styles.actionButtonGhost,
        disabled && styles.actionButtonDisabled,
      ]}
    >
      {icon ? <Ionicons name={icon} size={rMS(14)} color={fg} /> : null}
      <Text style={[styles.actionButtonLabel, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** Groups rows under a quiet heading — "Reorder now", "Today". */
export function VendorSectionHeading({
  title,
  trailing,
}: {
  title: string;
  trailing?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle} numberOfLines={1}>
        {title}
      </Text>
      {trailing ? (
        <Text style={styles.sectionTrailing} numberOfLines={1}>
          {trailing}
        </Text>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pulseRow: {
      flexDirection: "row",
      alignItems: "stretch",
      paddingRight: rS(4),
    },
    pulseCell: { flexDirection: "row", alignItems: "stretch" },
    pulseDivider: {
      width: StyleSheet.hairlineWidth,
      marginVertical: rV(3),
      marginRight: rS(14),
      backgroundColor: colors.border,
    },
    pulseBody: { paddingRight: rS(14), gap: rV(3), justifyContent: "center" },
    pulseLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(9.5),
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: colors.textMuted,
    },
    pulseValueRow: { flexDirection: "row", alignItems: "center", gap: rS(4) },
    pulseValue: { fontFamily: Fonts.titleBold, fontSize: rMS(15) },

    velocityTrack: {
      height: rV(3),
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: colors.surfaceMuted,
    },
    velocityFill: { height: "100%", borderRadius: 999 },

    tag: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(3),
      paddingHorizontal: rS(7),
      paddingVertical: rV(3),
      borderRadius: rMS(6),
    },
    tagLabel: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(10.5),
    },

    actionBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(8),
      paddingHorizontal: rS(14),
      paddingTop: rV(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.cardElevated,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rS(5),
      paddingHorizontal: rS(13),
      paddingVertical: rV(11),
      borderRadius: rMS(11),
    },
    actionButtonGrow: { flex: 1 },
    actionButtonSolid: { backgroundColor: colors.inverseSurface },
    actionButtonGhost: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    actionButtonDisabled: { opacity: 0.45 },
    actionButtonLabel: { fontFamily: Fonts.titleBold, fontSize: rMS(12.5) },

    sectionHeading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rS(10),
      paddingHorizontal: rS(16),
      paddingTop: rV(16),
      paddingBottom: rV(7),
      backgroundColor: colors.screen,
    },
    sectionTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11),
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: colors.textMuted,
    },
    sectionTrailing: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(11),
      color: colors.textMuted,
    },
  });
}
