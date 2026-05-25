import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const accountStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: rS(16),
    paddingTop: rV(14),
    paddingBottom: rV(120),
    gap: rV(12),
  },
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(22),
    paddingHorizontal: rS(18),
    paddingVertical: rV(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  insightTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: AppColors.text,
  },
  insightSubtitle: {
    marginTop: rV(6),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  statsRow: {
    marginTop: rV(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(20),
    color: AppColors.text,
  },
  statLabel: {
    marginTop: rV(4),
    fontFamily: Fonts.title,
    fontSize: rMS(11),
    color: "#6B7280",
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: rV(34),
    backgroundColor: "#E5E7EB",
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: rMS(20),
    paddingHorizontal: rS(16),
    paddingVertical: rV(16),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: rS(10),
  },
  cardTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    color: AppColors.text,
  },
  cardSubtitle: {
    marginTop: rV(3),
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  cardBody: {
    marginTop: rV(12),
    gap: rV(4),
  },
  cardLine: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
    color: "#374151",
  },
  cardMuted: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  pillText: {
    fontFamily: Fonts.title,
    fontSize: rMS(10.5),
    color: "#4B5563",
  },
  pillDark: {
    backgroundColor: AppColors.text,
  },
  pillDarkText: {
    color: "#FFFFFF",
  },
  actionRow: {
    marginTop: rV(14),
    flexDirection: "row",
    gap: rS(8),
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rS(8),
  },
  filterChip: {
    paddingHorizontal: rS(14),
    paddingVertical: rV(8),
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  filterChipText: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
    color: "#4B5563",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: "#EEF2F6",
    borderRadius: rMS(14),
    padding: rS(4),
    gap: rS(4),
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: rV(10),
    borderRadius: rMS(11),
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  segmentText: {
    fontFamily: Fonts.title,
    fontSize: rMS(12.5),
    color: "#6B7280",
  },
  segmentTextActive: {
    fontFamily: Fonts.titleBold,
    color: AppColors.text,
  },
  sectionTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: rV(12),
  },
});

type AccountInsightCardProps = {
  title: string;
  subtitle: string;
  stats?: Array<{ value: string | number; label: string }>;
};

export function AccountInsightCard({ title, subtitle, stats }: AccountInsightCardProps) {
  return (
    <View style={accountStyles.insightCard}>
      <Text style={accountStyles.insightTitle}>{title}</Text>
      <Text style={accountStyles.insightSubtitle}>{subtitle}</Text>
      {stats && stats.length > 0 ? (
        <View style={accountStyles.statsRow}>
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              {index > 0 ? <View style={accountStyles.statDivider} /> : null}
              <View style={accountStyles.statItem}>
                <Text style={accountStyles.statValue}>{stat.value}</Text>
                <Text style={accountStyles.statLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type AccountEmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AccountEmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: AccountEmptyStateProps) {
  return (
    <View style={emptyStyles.wrap}>
      <View style={emptyStyles.iconShell}>
        <Ionicons name={icon} size={rMS(30)} color={AppColors.primary} />
      </View>
      <Text style={emptyStyles.title}>{title}</Text>
      <Text style={emptyStyles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={emptyStyles.button} onPress={onAction} activeOpacity={0.88}>
          <Text style={emptyStyles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

type AccountBadgeProps = {
  label: string;
  tone?: "neutral" | "dark" | "success" | "warning" | "danger" | "info";
};

export function AccountBadge({ label, tone = "neutral" }: AccountBadgeProps) {
  const toneStyle =
    tone === "dark"
      ? badgeStyles.dark
      : tone === "success"
        ? badgeStyles.success
        : tone === "warning"
          ? badgeStyles.warning
          : tone === "danger"
            ? badgeStyles.danger
            : tone === "info"
              ? badgeStyles.info
              : badgeStyles.neutral;

  return (
    <View style={[badgeStyles.base, toneStyle.wrap]}>
      <Text style={[badgeStyles.text, toneStyle.text]}>{label}</Text>
    </View>
  );
}

type AccountActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: keyof typeof Ionicons.glyphMap;
  flex?: number;
  compact?: boolean;
  disabled?: boolean;
};

export function AccountActionButton({
  label,
  onPress,
  variant = "secondary",
  icon,
  flex,
  compact = false,
  disabled = false,
}: AccountActionButtonProps) {
  const variantStyle =
    variant === "primary"
      ? actionStyles.primary
      : variant === "danger"
        ? actionStyles.danger
        : variant === "ghost"
          ? actionStyles.ghost
          : actionStyles.secondary;

  return (
    <TouchableOpacity
      style={[
        actionStyles.base,
        variantStyle.btn,
        compact ? null : typeof flex === "number" ? { flex } : { flex: 1 },
        disabled ? actionStyles.disabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.86}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={rMS(15)}
          color={variantStyle.iconColor}
          style={{ marginBottom: rV(4) }}
        />
      ) : null}
      <Text style={[actionStyles.label, variantStyle.text]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AccountActionRow({ children }: { children: React.ReactNode }) {
  return <View style={accountStyles.actionRow}>{children}</View>;
}

export function AccountListCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[accountStyles.listCard, style]}>{children}</View>;
}

export function AccountIconShell({
  icon,
  color = AppColors.primary,
  backgroundColor = "#EEF2FF",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  backgroundColor?: string;
}) {
  return (
    <View style={[iconShellStyles.wrap, { backgroundColor }]}>
      <Ionicons name={icon} size={rMS(20)} color={color} />
    </View>
  );
}

export function AccountFab({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity
      style={[fabStyles.fab, { bottom: insets.bottom + rV(88) }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Ionicons name="add" size={rMS(28)} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

type AccountFilterChipsProps<T extends string> = {
  options: Array<{ key: T; label: string }>;
  activeKey: T;
  onChange: (key: T) => void;
};

export function AccountFilterChips<T extends string>({
  options,
  activeKey,
  onChange,
}: AccountFilterChipsProps<T>) {
  return (
    <View style={accountStyles.filterRow}>
      {options.map((option) => {
        const active = option.key === activeKey;
        return (
          <TouchableOpacity
            key={option.key}
            style={[accountStyles.filterChip, active && accountStyles.filterChipActive]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.85}
          >
            <Text
              style={[accountStyles.filterChipText, active && accountStyles.filterChipTextActive]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

type AccountSegmentedTabsProps<T extends string> = {
  options: Array<{ key: T; label: string }>;
  activeKey: T;
  onChange: (key: T) => void;
};

export function AccountSegmentedTabs<T extends string>({
  options,
  activeKey,
  onChange,
}: AccountSegmentedTabsProps<T>) {
  return (
    <View style={accountStyles.segmentRow}>
      {options.map((option) => {
        const active = option.key === activeKey;
        return (
          <TouchableOpacity
            key={option.key}
            style={[accountStyles.segmentBtn, active && accountStyles.segmentBtnActive]}
            onPress={() => onChange(option.key)}
            activeOpacity={0.88}
          >
            <Text style={[accountStyles.segmentText, active && accountStyles.segmentTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

type AccountFormSheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSave: () => void;
  saveLabel: string;
  isSaving?: boolean;
  saveDisabled?: boolean;
  children: React.ReactNode;
};

export function AccountFormSheet({
  visible,
  title,
  subtitle,
  onClose,
  onSave,
  saveLabel,
  isSaving = false,
  saveDisabled = false,
  children,
}: AccountFormSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={sheetStyles.backdrop}>
        <View style={[sheetStyles.sheet, { paddingBottom: insets.bottom + rV(16) }]}>
          <View style={sheetStyles.handle} />
          <View style={sheetStyles.header}>
            <TouchableOpacity style={sheetStyles.closeBtn} onPress={onClose} activeOpacity={0.82}>
              <Ionicons name="close" size={rMS(22)} color={AppColors.text} />
            </TouchableOpacity>
            <View style={sheetStyles.headerCopy}>
              <Text style={sheetStyles.title}>{title}</Text>
              {subtitle ? <Text style={sheetStyles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={sheetStyles.body}
          >
            {children}
          </ScrollView>

          <TouchableOpacity
            style={[
              sheetStyles.saveBtn,
              (isSaving || saveDisabled) && sheetStyles.saveBtnDisabled,
            ]}
            onPress={onSave}
            disabled={isSaving || saveDisabled}
            activeOpacity={0.9}
          >
            <Text style={sheetStyles.saveBtnText}>{isSaving ? "Saving..." : saveLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

type AccountFormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function AccountFormField({ label, error, icon, style, ...inputProps }: AccountFormFieldProps) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.inputRow, error ? fieldStyles.inputError : null]}>
        {icon ? (
          <Ionicons name={icon} size={rMS(18)} color="#9CA3AF" style={fieldStyles.inputIcon} />
        ) : null}
        <TextInput
          placeholderTextColor="#9CA3AF"
          style={[fieldStyles.input, style]}
          {...inputProps}
        />
      </View>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

type AccountPickerFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  onPress: () => void;
  onClear?: () => void;
};

export function AccountPickerField({
  label,
  value,
  placeholder = "Select",
  icon = "chevron-down-outline",
  error,
  onPress,
  onClear,
}: AccountPickerFieldProps) {
  const hasValue = value.trim().length > 0;

  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TouchableOpacity
        style={[fieldStyles.inputRow, error ? fieldStyles.inputError : null]}
        onPress={onPress}
        activeOpacity={0.86}
      >
        <Text
          style={[fieldStyles.pickerValue, !hasValue && fieldStyles.pickerPlaceholder]}
          numberOfLines={1}
        >
          {hasValue ? value : placeholder}
        </Text>
        <Ionicons name={icon} size={rMS(18)} color="#9CA3AF" />
      </TouchableOpacity>
      {hasValue && onClear ? (
        <TouchableOpacity onPress={onClear} activeOpacity={0.82} style={fieldStyles.clearLink}>
          <Text style={fieldStyles.clearLinkText}>Clear</Text>
        </TouchableOpacity>
      ) : null}
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

export function AccountSectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AccountListCard>
      <Text style={accountStyles.sectionTitle}>{title}</Text>
      {children}
    </AccountListCard>
  );
}

type AccountProfileHeroProps = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  avatarSize?: number;
  onEditPhoto: () => void;
  isEditingPhoto?: boolean;
  renderAvatar: (size: number) => React.ReactNode;
};

export function AccountProfileHero({
  name,
  email,
  onEditPhoto,
  isEditingPhoto = false,
  renderAvatar,
}: AccountProfileHeroProps) {
  const avatarSize = rS(96);

  return (
    <AccountListCard style={profileHeroStyles.card}>
      <View style={profileHeroStyles.avatarWrap}>
        {renderAvatar(avatarSize)}
        <TouchableOpacity
          style={profileHeroStyles.editBtn}
          onPress={onEditPhoto}
          disabled={isEditingPhoto}
          activeOpacity={0.88}
        >
          {isEditingPhoto ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="camera" size={rMS(16)} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
      <Text style={profileHeroStyles.name}>{name}</Text>
      <Text style={profileHeroStyles.email}>{email}</Text>
    </AccountListCard>
  );
}

type AccountChoiceSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AccountChoiceSheet({
  visible,
  title,
  onClose,
  children,
  footer,
}: AccountChoiceSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={choiceSheetStyles.backdrop} onPress={onClose} />
      <View style={[choiceSheetStyles.sheet, { paddingBottom: insets.bottom + rV(12) }]}>
        <View style={choiceSheetStyles.handle} />
        <Text style={choiceSheetStyles.title}>{title}</Text>
        {children}
        {footer}
      </View>
    </Modal>
  );
}

export function AccountChoiceOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[choiceSheetStyles.option, selected && choiceSheetStyles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <Text style={[choiceSheetStyles.optionText, selected && choiceSheetStyles.optionTextSelected]}>
        {label}
      </Text>
      {selected ? (
        <Ionicons name="checkmark-circle" size={rMS(20)} color={AppColors.text} />
      ) : null}
    </TouchableOpacity>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(28),
    paddingVertical: rV(40),
  },
  iconShell: {
    width: rS(76),
    height: rS(76),
    borderRadius: rS(38),
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E6EAF0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rV(16),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    color: AppColors.text,
    textAlign: "center",
  },
  message: {
    marginTop: rV(8),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    lineHeight: rMS(19),
    color: "#6B7280",
    textAlign: "center",
  },
  button: {
    marginTop: rV(20),
    minWidth: "72%",
    minHeight: rV(48),
    borderRadius: rMS(14),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(20),
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
});

const badgeStyles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingHorizontal: rS(10),
    paddingVertical: rV(5),
  },
  text: {
    fontFamily: Fonts.title,
    fontSize: rMS(10.5),
  },
  neutral: { wrap: { backgroundColor: "#F3F4F6" }, text: { color: "#4B5563" } },
  dark: { wrap: { backgroundColor: AppColors.text }, text: { color: "#FFFFFF" } },
  success: { wrap: { backgroundColor: "#DCFCE7" }, text: { color: "#166534" } },
  warning: { wrap: { backgroundColor: "#FEF3C7" }, text: { color: "#92400E" } },
  danger: { wrap: { backgroundColor: "#FEE2E2" }, text: { color: "#B91C1C" } },
  info: { wrap: { backgroundColor: "#DBEAFE" }, text: { color: "#1D4ED8" } },
});

const actionStyles = StyleSheet.create({
  base: {
    minHeight: rV(44),
    borderRadius: rMS(14),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rS(10),
    paddingVertical: rV(8),
  },
  label: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(11.5),
    textAlign: "center",
  },
  disabled: {
    opacity: 0.45,
  },
  primary: {
    btn: { backgroundColor: AppColors.text },
    text: { color: "#FFFFFF" },
    iconColor: "#FFFFFF",
  },
  secondary: {
    btn: { backgroundColor: "#F3F4F6", borderWidth: StyleSheet.hairlineWidth, borderColor: "#E5E7EB" },
    text: { color: AppColors.text },
    iconColor: AppColors.text,
  },
  danger: {
    btn: { backgroundColor: "#FEF2F2", borderWidth: StyleSheet.hairlineWidth, borderColor: "#FECACA" },
    text: { color: "#DC2626" },
    iconColor: "#DC2626",
  },
  ghost: {
    btn: { backgroundColor: "transparent" },
    text: { color: AppColors.primary },
    iconColor: AppColors.primary,
  },
});

const iconShellStyles = StyleSheet.create({
  wrap: {
    width: rS(44),
    height: rS(44),
    borderRadius: rMS(14),
    alignItems: "center",
    justifyContent: "center",
  },
});

const fabStyles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: rS(20),
    width: rS(56),
    height: rS(56),
    borderRadius: rS(28),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  sheet: {
    maxHeight: "92%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: rMS(24),
    borderTopRightRadius: rMS(24),
    paddingTop: rV(8),
  },
  handle: {
    alignSelf: "center",
    width: rS(42),
    height: rV(4),
    borderRadius: rS(2),
    backgroundColor: "#E5E7EB",
    marginBottom: rV(10),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: rS(18),
    paddingBottom: rV(12),
    gap: rS(10),
  },
  closeBtn: {
    width: rS(40),
    height: rS(40),
    borderRadius: rS(20),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    paddingTop: rV(6),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    color: AppColors.text,
  },
  subtitle: {
    marginTop: rV(6),
    fontFamily: Fonts.text,
    fontSize: rMS(12.5),
    lineHeight: rMS(18),
    color: "#6B7280",
  },
  body: {
    paddingHorizontal: rS(18),
    paddingBottom: rV(12),
    gap: rV(4),
  },
  saveBtn: {
    marginHorizontal: rS(18),
    marginTop: rV(8),
    minHeight: rV(50),
    borderRadius: rMS(14),
    backgroundColor: AppColors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
  },
});

const fieldStyles = StyleSheet.create({
  wrap: {
    marginBottom: rV(12),
  },
  label: {
    marginBottom: rV(6),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: "#4B5563",
  },
  inputRow: {
    minHeight: rV(48),
    borderRadius: rMS(14),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    paddingHorizontal: rS(14),
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    marginRight: rS(10),
  },
  input: {
    flex: 1,
    paddingVertical: rV(12),
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  inputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  pickerValue: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    color: AppColors.text,
    paddingVertical: rV(12),
  },
  pickerPlaceholder: {
    color: "#9CA3AF",
  },
  clearLink: {
    alignSelf: "flex-end",
    marginTop: rV(6),
  },
  clearLinkText: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
    color: AppColors.primary,
  },
  error: {
    marginTop: rV(4),
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#DC2626",
  },
});

const profileHeroStyles = StyleSheet.create({
  card: {
    alignItems: "center",
    paddingVertical: rV(22),
  },
  avatarWrap: {
    position: "relative",
  },
  editBtn: {
    position: "absolute",
    right: -rS(2),
    bottom: rS(2),
    width: rS(36),
    height: rS(36),
    borderRadius: rS(18),
    backgroundColor: AppColors.text,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginTop: rV(14),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(18),
    color: AppColors.text,
    textAlign: "center",
  },
  email: {
    marginTop: rV(4),
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: "#6B7280",
    textAlign: "center",
  },
});

const choiceSheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: rMS(24),
    borderTopRightRadius: rMS(24),
    paddingHorizontal: rS(18),
    paddingTop: rV(8),
  },
  handle: {
    alignSelf: "center",
    width: rS(42),
    height: rV(4),
    borderRadius: rS(2),
    backgroundColor: "#E5E7EB",
    marginBottom: rV(14),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(17),
    color: AppColors.text,
    textAlign: "center",
    marginBottom: rV(14),
  },
  option: {
    minHeight: rV(50),
    borderRadius: rMS(14),
    paddingHorizontal: rS(14),
    marginBottom: rV(8),
    backgroundColor: "#F8FAFC",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionSelected: {
    backgroundColor: "#F3F4F6",
    borderColor: AppColors.text,
  },
  optionText: {
    fontFamily: Fonts.text,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  optionTextSelected: {
    fontFamily: Fonts.titleBold,
  },
});
