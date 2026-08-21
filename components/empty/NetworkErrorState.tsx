import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { rMS, rS, rV } from "@/styles/responsive";
import type { FetchErrorKind } from "@/utils/fetchCache";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NetworkErrorCopy = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

const COPY_BY_KIND: Record<FetchErrorKind, NetworkErrorCopy> = {
  network: {
    icon: "cloud-offline-outline",
    title: "Can't reach ODOS",
    message: "Check your internet connection and try again.",
  },
  server: {
    icon: "server-outline",
    title: "Something went wrong on our end",
    message: "Give it a moment and try again.",
  },
  unknown: {
    icon: "cloud-offline-outline",
    title: "Couldn't load that",
    message: "Something interrupted the request — try again.",
  },
};

type NetworkErrorStateProps = {
  kind?: FetchErrorKind;
  /** Override the default copy for this kind — useful for screen-specific context. */
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryLabel?: string;
  /** Small inline row for use inside a section that sits alongside other content — the
   * full variant is for when it's the only thing on the screen. */
  compact?: boolean;
};

/**
 * The one shared "can't reach the backend" state, for both full-page and inline-section
 * use. Distinguishes a network-level failure from a server-side one where that's known
 * (see classifyFetchError), and gives retry a visible loading state rather than firing
 * silently.
 */
export function NetworkErrorState({
  kind = "unknown",
  title,
  message,
  onRetry,
  isRetrying = false,
  retryLabel = "Try again",
  compact = false,
}: NetworkErrorStateProps) {
  const { colors } = useTheme();
  const copy = COPY_BY_KIND[kind];
  const resolvedTitle = title ?? copy.title;
  const resolvedMessage = message ?? copy.message;

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <Ionicons name={copy.icon} size={rMS(15)} color={colors.warningText} />
        <Text style={[styles.compactText, { color: colors.textMuted }]} numberOfLines={1}>
          {resolvedTitle}
        </Text>
        {onRetry ? (
          <TouchableOpacity
            onPress={onRetry}
            disabled={isRetrying}
            accessibilityRole="button"
            hitSlop={8}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.compactRetry, { color: colors.primary }]}>{retryLabel}</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.iconShell,
          { backgroundColor: colors.warningSoft, borderColor: colors.warningBorder },
        ]}
      >
        <Ionicons name={copy.icon} size={rMS(30)} color={colors.warningText} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{resolvedTitle}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{resolvedMessage}</Text>
      {onRetry ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.inverseSurface }]}
          onPress={onRetry}
          disabled={isRetrying}
          activeOpacity={0.88}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color={colors.onInverseSurface} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.onInverseSurface }]}>
              {retryLabel}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(28),
    paddingVertical: rV(32),
  },
  iconShell: {
    width: rS(76),
    height: rS(76),
    borderRadius: rS(38),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(16),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    textAlign: "center",
  },
  message: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
    textAlign: "center",
  },
  button: {
    marginTop: rV(20),
    minWidth: "72%",
    minHeight: rV(48),
    borderRadius: rMS(14),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(20),
  },
  buttonText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14.5),
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(7),
  },
  compactText: {
    flexShrink: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
  },
  compactRetry: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12.5),
  },
});
