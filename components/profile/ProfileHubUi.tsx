import {
  AccountActionButton,
  AccountIconShell,
  AccountInsightCard,
  AccountListCard,
  useAccountStyles,
} from "@/components/account/AccountUi";

export {
  AccountActionButton,
  AccountEmptyState,
  AccountFilterChips,
  AccountListCard,
  AccountSegmentedTabs,
} from "@/components/account/AccountUi";
import { useTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AccountTipBanner({
  title,
  message,
  icon = "information-circle-outline" as keyof typeof Ionicons.glyphMap,
}: {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={tipStyles.wrap}>
      <AccountIconShell icon={icon} color="#1D4ED8" backgroundColor="#DBEAFE" />
      <View style={tipStyles.copy}>
        <Text style={tipStyles.title}>{title}</Text>
        <Text style={tipStyles.message}>{message}</Text>
      </View>
    </View>
  );
}

export function AccountSettingsGroup({
  title,
  children,
  style,
}: {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const accountStyles = useAccountStyles();
  return (
    <AccountListCard style={style}>
      {title ? <Text style={accountStyles.sectionTitle}>{title}</Text> : null}
      <View style={groupStyles.body}>{children}</View>
    </AccountListCard>
  );
}

export function AccountSettingToggle({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
  isLast = false,
}: {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[toggleStyles.row, !isLast && toggleStyles.rowBorder, disabled && toggleStyles.rowDisabled]}>
      <View style={toggleStyles.copy}>
        <Text style={[toggleStyles.title, disabled && toggleStyles.titleDisabled]}>{title}</Text>
        {description ? (
          <Text style={[toggleStyles.description, disabled && toggleStyles.descriptionDisabled]}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "#E5E7EB", true: AppColors.text }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

export function AccountRadioRow({
  label,
  selected,
  onPress,
  hint,
  disabled = false,
  isLast = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  hint?: string;
  disabled?: boolean;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[radioStyles.row, !isLast && radioStyles.rowBorder, disabled && radioStyles.rowDisabled]}
      onPress={onPress}
      activeOpacity={0.86}
      disabled={disabled}
    >
      <View style={radioStyles.copy}>
        <Text style={[radioStyles.label, selected && radioStyles.labelSelected]}>{label}</Text>
        {hint ? <Text style={radioStyles.hint}>{hint}</Text> : null}
      </View>
      <View style={[radioStyles.outer, selected && radioStyles.outerSelected]}>
        {selected ? <View style={radioStyles.inner} /> : null}
      </View>
    </TouchableOpacity>
  );
}

export function AccountLinkRow({
  icon,
  title,
  subtitle,
  onPress,
  badge,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  badge?: string;
  isLast?: boolean;
}) {
  const content = (
    <>
      <AccountIconShell icon={icon} />
      <View style={linkStyles.copy}>
        <View style={linkStyles.titleRow}>
          <Text style={linkStyles.title}>{title}</Text>
          {badge ? (
            <View style={linkStyles.badge}>
              <Text style={linkStyles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={linkStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={rMS(18)} color="#D1D5DB" />
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View style={[linkStyles.row, !isLast && linkStyles.rowBorder]}>{content}</View>
    );
  }

  return (
    <TouchableOpacity
      style={[linkStyles.row, !isLast && linkStyles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      {content}
    </TouchableOpacity>
  );
}

export function AccountChannelCard({
  icon,
  label,
  onPress,
  active = true,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  active?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[channelStyles.card, !active && channelStyles.cardMuted]}
      onPress={onPress}
      activeOpacity={0.86}
      disabled={!onPress}
    >
      <View style={channelStyles.iconWrap}>{icon}</View>
      <Text style={[channelStyles.label, !active && channelStyles.labelMuted]}>{label}</Text>
      {!active ? <Text style={channelStyles.soon}>Soon</Text> : null}
    </TouchableOpacity>
  );
}

export function AccountStickySaveBar({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const saveBarStyles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: rS(16),
          paddingTop: rV(12),
          backgroundColor: colors.header,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.headerBorder,
        },
      }),
    [colors],
  );

  return (
    <View style={[saveBarStyles.wrap, { paddingBottom: insets.bottom + rV(12) }]}>
      <AccountActionButton
        label={loading ? "Saving..." : label}
        onPress={onPress}
        variant="primary"
        disabled={disabled || loading}
      />
    </View>
  );
}

export function AccountBulletList({ points }: { points: string[] }) {
  return (
    <View style={bulletStyles.wrap}>
      {points.map((point, index) => (
        <View key={`${index}-${point.slice(0, 12)}`} style={bulletStyles.row}>
          <View style={bulletStyles.dot} />
          <Text style={bulletStyles.text}>{point}</Text>
        </View>
      ))}
    </View>
  );
}

export function AccountMetaFooter({
  meta,
  message,
  actionLabel,
  onAction,
}: {
  meta: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <AccountListCard style={footerStyles.card}>
      <Text style={footerStyles.meta}>{meta}</Text>
      <Text style={footerStyles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.86} style={footerStyles.action}>
          <Text style={footerStyles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </AccountListCard>
  );
}

export { AccountInsightCard, useAccountStyles };

const tipStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(12),
    backgroundColor: "#EFF6FF",
    borderRadius: rMS(20),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#BFDBFE",
  },
  copy: {
    flex: 1,
    gap: rV(4),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13.5),
    color: AppColors.text,
  },
  message: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#4B5563",
  },
});

const groupStyles = StyleSheet.create({
  body: {
    gap: 0,
  },
});

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
    paddingVertical: rV(14),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2F6",
  },
  rowDisabled: {
    opacity: 0.55,
  },
  copy: {
    flex: 1,
    gap: rV(4),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  titleDisabled: {
    color: "#9CA3AF",
  },
  description: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
    color: "#6B7280",
  },
  descriptionDisabled: {
    color: "#9CA3AF",
  },
});

const radioStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
    paddingVertical: rV(14),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2F6",
  },
  rowDisabled: {
    opacity: 0.5,
  },
  copy: {
    flex: 1,
    gap: rV(2),
  },
  label: {
    fontFamily: Fonts.title,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  labelSelected: {
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  hint: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#9CA3AF",
  },
  outer: {
    width: rMS(22),
    height: rMS(22),
    borderRadius: rMS(11),
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  outerSelected: {
    borderColor: AppColors.text,
  },
  inner: {
    width: rMS(10),
    height: rMS(10),
    borderRadius: rMS(5),
    backgroundColor: AppColors.text,
  },
});

const linkStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingVertical: rV(12),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2F6",
  },
  copy: {
    flex: 1,
    gap: rV(3),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(8),
    flexWrap: "wrap",
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  subtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
    color: "#6B7280",
  },
  badge: {
    paddingHorizontal: rS(8),
    paddingVertical: rV(3),
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  badgeText: {
    fontFamily: Fonts.title,
    fontSize: rMS(10),
    color: "#6B7280",
  },
});

const channelStyles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(18),
    paddingVertical: rV(16),
    paddingHorizontal: rS(12),
    alignItems: "center",
    gap: rV(8),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
  },
  cardMuted: {
    backgroundColor: "#F9FAFB",
  },
  iconWrap: {
    width: rMS(44),
    height: rMS(44),
    borderRadius: rMS(22),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: AppColors.text,
    textAlign: "center",
  },
  labelMuted: {
    color: "#9CA3AF",
  },
  soon: {
    fontFamily: Fonts.title,
    fontSize: rMS(10),
    color: "#9CA3AF",
  },
});

const saveBarStyles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: rS(16),
    paddingTop: rV(10),
    backgroundColor: "#F5F7FA",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
});

const bulletStyles = StyleSheet.create({
  wrap: {
    gap: rV(10),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
  },
  dot: {
    marginTop: rV(6),
    width: rMS(6),
    height: rMS(6),
    borderRadius: rMS(3),
    backgroundColor: AppColors.primary,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(19),
    color: "#4B5563",
  },
});

const footerStyles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: rV(6),
  },
  meta: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11),
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  message: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(18),
    color: "#6B7280",
    textAlign: "center",
  },
  action: {
    marginTop: rV(4),
  },
  actionText: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.primary,
  },
});
