import Fonts from "@/constants/Fonts";
import type { FaqItem } from "@/components/help/FaqUi";
import { GuideVideoList } from "@/components/help/GuideVideoCard";
import type { GuideVideo } from "@/hooks/useGuideVideos";
import { GUIDES_BY_SLUG, type Guide, type GuideAction, type GuideNote, type GuideStep } from "@/constants/resourceGuides";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

/**
 * Presentation for the resource center. The guide detail screen deliberately
 * reuses the numbered-rail shape of the order journey timeline on
 * `orders/[orderId]`, so a walkthrough reads like something the app already
 * does rather than a help article bolted on the side.
 */

const NOTE_TONES: Record<
  GuideNote["tone"],
  {
    icon: keyof typeof Ionicons.glyphMap;
    background: keyof ThemeColors;
    text: keyof ThemeColors;
  }
> = {
  tip: { icon: "bulb-outline", background: "successSoft", text: "successText" },
  warning: { icon: "alert-circle-outline", background: "warningSoft", text: "warningText" },
  info: { icon: "information-circle-outline", background: "infoSoft", text: "infoText" },
};

/**
 * Runs a guide's deep link, prompting anonymous readers to sign in first for
 * the destinations that would only bounce them back.
 */
export function useGuideAction() {
  const { requireAuth } = useRequireAuth();

  return useCallback(
    (action: GuideAction) => {
      if (
        action.requiresAuth &&
        !requireAuth({
          title: "Sign in to continue",
          message: `Log in to open ${action.label.toLowerCase()}.`,
        })
      ) {
        return;
      }

      router.push(action.href as Href);
    },
    [requireAuth],
  );
}

export function GuideActionButton({ action }: { action: GuideAction }) {
  const { colors } = useTheme();
  const runAction = useGuideAction();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: rS(8),
          marginTop: rV(10),
          paddingHorizontal: rS(14),
          paddingVertical: rV(10),
          borderRadius: rMS(14),
          backgroundColor: colors.inverseSurface,
        },
        label: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12.5),
          color: colors.onInverseSurface,
        },
      }),
    [colors],
  );

  return (
    <Pressable style={styles.button} onPress={() => runAction(action)}>
      <Text style={styles.label}>{action.label}</Text>
      <Ionicons name="arrow-forward" size={rMS(14)} color={colors.onInverseSurface} />
    </Pressable>
  );
}

export function GuideNoteCard({ note }: { note: GuideNote }) {
  const { colors } = useTheme();
  const tone = NOTE_TONES[note.tone];
  const background = colors[tone.background];
  const accent = colors[tone.text];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          gap: rS(10),
          marginTop: rV(10),
          padding: rS(12),
          borderRadius: rMS(14),
          backgroundColor: background,
        },
        copy: {
          flex: 1,
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: accent,
        },
        body: {
          marginTop: rV(3),
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          lineHeight: rMS(18),
          color: colors.textSecondary,
        },
      }),
    [accent, background, colors],
  );

  return (
    <View style={styles.wrap}>
      <Ionicons name={tone.icon} size={rMS(16)} color={accent} style={{ marginTop: rV(1) }} />
      <View style={styles.copy}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.body}>{note.body}</Text>
      </View>
    </View>
  );
}

export function GuideStepRow({
  step,
  index,
  isLast,
  videos = [],
}: {
  step: GuideStep;
  index: number;
  isLast: boolean;
  /** Videos an admin pinned to this specific step. Empty renders nothing. */
  videos?: GuideVideo[];
}) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: rS(12),
        },
        railWrap: {
          width: rMS(26),
          alignItems: "center",
          // Stretch past the row's flex-start alignment so the connector can
          // actually span the height of a step's content.
          alignSelf: "stretch",
        },
        bullet: {
          width: rMS(26),
          height: rMS(26),
          borderRadius: rMS(13),
          backgroundColor: colors.inverseSurface,
          alignItems: "center",
          justifyContent: "center",
        },
        bulletText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.onInverseSurface,
        },
        rail: {
          width: 2,
          flex: 1,
          minHeight: rV(18),
          marginTop: rV(6),
          borderRadius: rMS(999),
          backgroundColor: colors.border,
        },
        content: {
          flex: 1,
          paddingBottom: isLast ? 0 : rV(22),
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14.5),
          lineHeight: rMS(21),
          color: colors.text,
        },
        body: {
          marginTop: rV(6),
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(21),
          color: colors.textSecondary,
        },
      }),
    [colors, isLast],
  );

  return (
    <View style={styles.row}>
      <View style={styles.railWrap}>
        <View style={styles.bullet}>
          <Text style={styles.bulletText}>{index + 1}</Text>
        </View>
        {!isLast ? <View style={styles.rail} /> : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{step.title}</Text>
        {step.body.map((paragraph) => (
          <Text key={paragraph} style={styles.body}>
            {paragraph}
          </Text>
        ))}
        {step.note ? <GuideNoteCard note={step.note} /> : null}
        {step.action ? <GuideActionButton action={step.action} /> : null}
        {videos.length > 0 ? (
          <View style={{ marginTop: rV(12) }}>
            <GuideVideoList videos={videos} label="Watch this step" />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function GuideDetailHero({ guide, isRead }: { guide: Guide; isRead: boolean }) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: rMS(22),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        inner: {
          paddingHorizontal: rS(18),
          paddingVertical: rV(18),
        },
        topRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
        },
        iconWrap: {
          width: rMS(46),
          height: rMS(46),
          borderRadius: rMS(16),
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
        },
        category: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10),
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: colors.primary,
        },
        title: {
          marginTop: rV(2),
          fontFamily: Fonts.titleBold,
          fontSize: rMS(17),
          lineHeight: rMS(24),
          color: colors.text,
        },
        intro: {
          marginTop: rV(12),
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(20),
          color: colors.textSecondary,
        },
        metaRow: {
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: rS(8),
          marginTop: rV(14),
        },
        pill: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(5),
          paddingHorizontal: rS(10),
          paddingVertical: rV(6),
          borderRadius: 999,
          backgroundColor: colors.card,
        },
        pillText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11),
          color: colors.textSecondary,
        },
        readPill: {
          backgroundColor: colors.successSoft,
        },
        readPillText: {
          color: colors.successText,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.accentSoft, colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons name={guide.icon} size={rMS(22)} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.category}>{guide.category}</Text>
            <Text style={styles.title}>{guide.title}</Text>
          </View>
        </View>

        <Text style={styles.intro}>{guide.intro}</Text>

        <View style={styles.metaRow}>
          <View style={styles.pill}>
            <Ionicons name="list-outline" size={rMS(13)} color={colors.textMuted} />
            <Text style={styles.pillText}>{guide.steps.length} steps</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="time-outline" size={rMS(13)} color={colors.textMuted} />
            <Text style={styles.pillText}>{guide.minutes} min read</Text>
          </View>
          {isRead ? (
            <View style={[styles.pill, styles.readPill]}>
              <Ionicons name="checkmark-circle" size={rMS(13)} color={colors.successText} />
              <Text style={[styles.pillText, styles.readPillText]}>Read</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

export function GuideReadToggle({ isRead, onToggle }: { isRead: boolean; onToggle: () => void }) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(8),
          paddingVertical: rV(14),
          borderRadius: rMS(16),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isRead ? colors.successBorder : colors.border,
          backgroundColor: isRead ? colors.successSoft : colors.card,
        },
        label: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: isRead ? colors.successText : colors.text,
        },
      }),
    [colors, isRead],
  );

  return (
    <Pressable style={styles.button} onPress={onToggle}>
      <Ionicons
        name={isRead ? "checkmark-circle" : "ellipse-outline"}
        size={rMS(17)}
        color={isRead ? colors.successText : colors.textMuted}
      />
      <Text style={styles.label}>{isRead ? "Marked as read" : "Mark as read"}</Text>
    </Pressable>
  );
}

export function GuideCard({
  guide,
  isRead,
  onPress,
  stepIndex,
  hasVideo = false,
}: {
  guide: Guide;
  isRead: boolean;
  onPress: () => void;
  /** Shows a sequence number instead of the topic icon, for the starter path. */
  stepIndex?: number;
  hasVideo?: boolean;
}) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
          padding: rS(14),
          borderRadius: rMS(18),
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
        iconShell: {
          width: rMS(42),
          height: rMS(42),
          borderRadius: rMS(14),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isRead ? colors.successSoft : colors.surfaceMuted,
        },
        stepIndexText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(15),
          color: colors.primary,
        },
        copy: {
          flex: 1,
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14),
          lineHeight: rMS(20),
          color: colors.text,
        },
        summary: {
          marginTop: rV(3),
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          lineHeight: rMS(18),
          color: colors.textMuted,
        },
        metaRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(10),
          marginTop: rV(7),
        },
        meta: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(4),
        },
        metaText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10.5),
          color: colors.textMuted,
        },
        readText: {
          color: colors.successText,
        },
        videoText: {
          color: colors.primary,
        },
      }),
    [colors, isRead],
  );

  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <View style={styles.iconShell}>
        {typeof stepIndex === "number" ? (
          <Text style={styles.stepIndexText}>{stepIndex}</Text>
        ) : (
          <Ionicons
            name={isRead ? "checkmark-circle" : guide.icon}
            size={rMS(20)}
            color={isRead ? colors.successText : colors.primary}
          />
        )}
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{guide.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {guide.summary}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="list-outline" size={rMS(11)} color={colors.textMuted} />
            <Text style={styles.metaText}>{guide.steps.length} steps</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={rMS(11)} color={colors.textMuted} />
            <Text style={styles.metaText}>{guide.minutes} min</Text>
          </View>
          {hasVideo ? (
            <View style={styles.meta}>
              <Ionicons name="play-circle" size={rMS(11)} color={colors.primary} />
              <Text style={[styles.metaText, styles.videoText]}>Video</Text>
            </View>
          ) : null}
          {isRead ? (
            <View style={styles.meta}>
              <Ionicons name="checkmark" size={rMS(11)} color={colors.successText} />
              <Text style={[styles.metaText, styles.readText]}>Read</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={rMS(18)} color={colors.iconMuted} />
    </Pressable>
  );
}

export function GuideProgressHero({
  total,
  readCount,
  onResume,
  resumeLabel,
}: {
  total: number;
  readCount: number;
  onResume?: () => void;
  resumeLabel?: string;
}) {
  const { colors } = useTheme();
  const percent = total > 0 ? Math.round((readCount / total) * 100) : 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: rMS(22),
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        inner: {
          paddingHorizontal: rS(18),
          paddingVertical: rV(18),
        },
        topRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
        },
        iconWrap: {
          width: rMS(46),
          height: rMS(46),
          borderRadius: rMS(16),
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
        },
        title: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(18),
          color: colors.text,
        },
        subtitle: {
          marginTop: rV(10),
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(20),
          color: colors.textSecondary,
        },
        progressRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: rV(16),
          marginBottom: rV(6),
        },
        progressLabel: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(11.5),
          color: colors.textSecondary,
        },
        track: {
          height: rV(7),
          borderRadius: 999,
          backgroundColor: colors.surfaceMuted,
          overflow: "hidden",
        },
        fill: {
          height: "100%",
          borderRadius: 999,
          backgroundColor: colors.primary,
          width: `${percent}%`,
        },
        resume: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(8),
          marginTop: rV(16),
          paddingVertical: rV(12),
          borderRadius: rMS(14),
          backgroundColor: colors.inverseSurface,
        },
        resumeText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          color: colors.onInverseSurface,
        },
      }),
    [colors, percent],
  );

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.accentSoft, colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="compass-outline" size={rMS(24)} color={colors.primary} />
          </View>
          <Text style={styles.title}>Guide center</Text>
        </View>

        <Text style={styles.subtitle}>
          Step-by-step walkthroughs for buying, paying, tracking a delivery, and everything after
          it. Each step links straight to the screen it describes.
        </Text>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {readCount} of {total} read
          </Text>
          <Text style={styles.progressLabel}>{percent}%</Text>
        </View>
        <View style={styles.track}>
          <View style={styles.fill} />
        </View>

        {onResume && resumeLabel ? (
          <Pressable style={styles.resume} onPress={onResume}>
            <Ionicons name="play-circle-outline" size={rMS(16)} color={colors.onInverseSurface} />
            <Text style={styles.resumeText} numberOfLines={1}>
              {resumeLabel}
            </Text>
          </Pressable>
        ) : null}
      </LinearGradient>
    </View>
  );
}

export function GuideSectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: rS(8),
        marginTop: rV(14),
        marginBottom: rV(8),
      }}
    >
      <Ionicons name={icon} size={rMS(16)} color={colors.primary} />
      <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(13), color: colors.text }}>
        {title}
      </Text>
    </View>
  );
}

/**
 * An FAQ hit surfaced inside the resource center's search, so a reader who
 * types "voucher rejected" gets the one-line answer here instead of being told
 * to go and look on another screen.
 */
export function GuideFaqResult({ item, onPress }: { item: FaqItem; onPress: () => void }) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: rS(10),
          padding: rS(13),
          borderRadius: rMS(16),
          backgroundColor: colors.surfaceSubtle,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        copy: {
          flex: 1,
        },
        title: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13),
          lineHeight: rMS(19),
          color: colors.text,
        },
        answer: {
          marginTop: rV(3),
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          lineHeight: rMS(18),
          color: colors.textMuted,
        },
      }),
    [colors],
  );

  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <Ionicons
        name="help-circle-outline"
        size={rMS(18)}
        color={colors.primary}
        style={{ marginTop: rV(1) }}
      />
      <View style={styles.copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.answer} numberOfLines={2}>
          {item.description.join(" ")}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={rMS(16)} color={colors.iconMuted} />
    </Pressable>
  );
}

export function GuideEmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  const { colors } = useTheme();
  const needle = query.trim();

  return (
    <View style={{ alignItems: "center", paddingVertical: rV(36), paddingHorizontal: rS(24), gap: rV(10) }}>
      <View
        style={{
          width: rMS(56),
          height: rMS(56),
          borderRadius: rMS(18),
          backgroundColor: colors.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="search-outline" size={rMS(26)} color={colors.textMuted} />
      </View>
      <Text
        style={{
          fontFamily: Fonts.titleBold,
          fontSize: rMS(16),
          color: colors.text,
          textAlign: "center",
        }}
      >
        {needle ? `Nothing matches “${needle}”` : "Nothing here yet"}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.text,
          fontSize: rMS(13),
          lineHeight: rMS(20),
          color: colors.textMuted,
          textAlign: "center",
        }}
      >
        Try a different word, or ask the ODOS Assistant — it can answer things the guides do not
        cover.
      </Text>
      <Pressable
        onPress={onClear}
        style={{
          marginTop: rV(6),
          paddingHorizontal: rS(16),
          paddingVertical: rV(10),
          borderRadius: 999,
          backgroundColor: colors.primary,
        }}
      >
        <Text style={{ fontFamily: Fonts.titleBold, fontSize: rMS(13), color: colors.onPrimary }}>
          Clear search
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * A quiet pointer to one guide, placed on the screens where the confusion
 * actually happens rather than waiting for someone to go looking in Settings.
 */
export function GuideHintLink({
  slug,
  label,
  style,
}: {
  slug: string;
  /** Override the guide's own title with phrasing that fits the host screen. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const guide = GUIDES_BY_SLUG[slug];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(9),
          paddingHorizontal: rS(12),
          paddingVertical: rV(11),
          borderRadius: rMS(14),
          backgroundColor: colors.surfaceSubtle,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        label: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: colors.textSecondary,
        },
      }),
    [colors],
  );

  if (!guide) {
    return null;
  }

  return (
    <Pressable
      style={[styles.wrap, style]}
      onPress={() => router.push(`/(root)/screens/resources/${guide.slug}` as Href)}
    >
      <Ionicons name="book-outline" size={rMS(15)} color={colors.primary} />
      <Text style={styles.label} numberOfLines={1}>
        {label ?? guide.title}
      </Text>
      <Ionicons name="chevron-forward" size={rMS(15)} color={colors.iconMuted} />
    </Pressable>
  );
}

/**
 * Filters the index down to guides that have a video.
 *
 * Rendered by the caller only when at least one video exists, so there is
 * never a filter that resolves to an empty screen — the same rule the video
 * sections themselves follow.
 */
export function GuideVideoFilterToggle({
  active,
  count,
  onToggle,
}: {
  active: boolean;
  count: number;
  onToggle: () => void;
}) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pill: {
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: rS(7),
          paddingHorizontal: rS(13),
          paddingVertical: rV(9),
          borderRadius: 999,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primary : colors.card,
        },
        label: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(12),
          color: active ? colors.onPrimary : colors.textSecondary,
        },
      }),
    [active, colors],
  );

  return (
    <Pressable
      style={styles.pill}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
    >
      <Ionicons
        name={active ? "play-circle" : "play-circle-outline"}
        size={rMS(15)}
        color={active ? colors.onPrimary : colors.primary}
      />
      <Text style={styles.label}>
        {active ? "Showing videos" : `Watch (${count})`}
      </Text>
    </Pressable>
  );
}
