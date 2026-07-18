import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import KeyboardAwareScrollView from "@/components/layout/KeyboardAwareScrollView";
import { rMS, rS, rV } from "@/styles/responsive";
import { useAccountUiStyles } from "@/styles/themedAccountStyles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export { useAccountStyles } from "@/styles/themedAccountStyles";

type AccountInsightCardProps = {
  title: string;
  subtitle: string;
  stats?: Array<{ value: string | number; label: string }>;
};

export function AccountInsightCard({ title, subtitle, stats }: AccountInsightCardProps) {
  const { accountStyles } = useAccountUiStyles();
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
  const { emptyStyles } = useAccountUiStyles();
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
  const { badgeStyles } = useAccountUiStyles();
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
  const { actionStyles } = useAccountUiStyles();
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
  const { accountStyles } = useAccountUiStyles();
  return <View style={accountStyles.actionRow}>{children}</View>;
}

export function AccountListCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { accountStyles } = useAccountUiStyles();
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
  const { iconShellStyles } = useAccountUiStyles();
  return (
    <View style={[iconShellStyles.wrap, { backgroundColor }]}>
      <Ionicons name={icon} size={rMS(20)} color={color} />
    </View>
  );
}

export function AccountFab({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const { fabStyles, colors } = useAccountUiStyles();
  return (
    <TouchableOpacity
      style={[fabStyles.fab, { bottom: insets.bottom + rV(88) }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Ionicons name="add" size={rMS(28)} color={colors.onPrimary} />
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
  const { accountStyles } = useAccountUiStyles();
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
  const { accountStyles } = useAccountUiStyles();
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
  saveDisabledLabel?: string;
  /** Rendered inside this same modal (region/city pickers). Avoids nested Modal issues on iOS. */
  overlay?: React.ReactNode;
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
  saveDisabledLabel,
  overlay,
  children,
}: AccountFormSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { sheetStyles, colors } = useAccountUiStyles();
  const sheetMaxHeight = windowHeight * 0.92;
  const scrollMaxHeight = Math.max(
    sheetMaxHeight - insets.bottom - rV(220),
    windowHeight * 0.38,
  );

  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={sheetStyles.backdrop}>
        <Pressable
          style={sheetStyles.backdropTap}
          onPress={dismissKeyboard}
          accessibilityLabel="Dismiss keyboard"
          accessibilityRole="button"
        />
        <View
          style={[
            sheetStyles.sheet,
            sheetStyles.sheetContent,
            { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom + rV(12) },
          ]}
        >
          <View style={sheetStyles.handle} />
          <View style={sheetStyles.header}>
            <TouchableOpacity
              style={sheetStyles.closeBtn}
              onPress={() => {
                dismissKeyboard();
                onClose();
              }}
              activeOpacity={0.82}
            >
              <Ionicons name="close" size={rMS(22)} color={colors.text} />
            </TouchableOpacity>
            <View style={sheetStyles.headerCopy}>
              <Text style={sheetStyles.title}>{title}</Text>
              {subtitle ? <Text style={sheetStyles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>

          <KeyboardAwareScrollView
            style={[sheetStyles.sheetScroll, { maxHeight: scrollMaxHeight }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces
            contentContainerStyle={sheetStyles.body}
          >
            {children}
          </KeyboardAwareScrollView>

          {!overlay ? (
            <TouchableOpacity
              style={[
                sheetStyles.saveBtn,
                (isSaving || saveDisabled) && sheetStyles.saveBtnDisabled,
              ]}
              onPress={() => {
                dismissKeyboard();
                onSave();
              }}
              disabled={isSaving || saveDisabled}
              activeOpacity={0.9}
            >
              <Text style={sheetStyles.saveBtnText}>
                {isSaving
                  ? "Saving..."
                  : saveDisabled && saveDisabledLabel
                    ? saveDisabledLabel
                    : saveLabel}
              </Text>
            </TouchableOpacity>
          ) : null}

          {overlay ? (
            <View
              style={[sheetStyles.overlay, { paddingBottom: insets.bottom + rV(12) }]}
            >
              {overlay}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

type AccountFormPickerOverlayProps = {
  title: string;
  hint?: string;
  onBack: () => void;
  children: React.ReactNode;
};

/** Full-height picker list for use inside AccountFormSheet.overlay */
export function AccountFormPickerOverlay({
  title,
  hint,
  onBack,
  children,
}: AccountFormPickerOverlayProps) {
  const { sheetStyles, colors } = useAccountUiStyles();
  return (
    <View style={{ flex: 1 }}>
      <View style={sheetStyles.overlayHeader}>
        <TouchableOpacity
          style={sheetStyles.overlayBackBtn}
          onPress={onBack}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={rMS(22)} color={colors.text} />
        </TouchableOpacity>
        <Text style={sheetStyles.overlayTitle}>{title}</Text>
      </View>
      {hint ? <Text style={sheetStyles.overlayHint}>{hint}</Text> : null}
      <ScrollView
        style={sheetStyles.overlayScroll}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

type AccountFormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function AccountFormField({ label, error, icon, style, ...inputProps }: AccountFormFieldProps) {
  const { fieldStyles, colors } = useAccountUiStyles();
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.inputRow, error ? fieldStyles.inputError : null]}>
        {icon ? (
          <Ionicons name={icon} size={rMS(18)} color={colors.placeholder} style={fieldStyles.inputIcon} />
        ) : null}
        <TextInput
          placeholderTextColor={colors.placeholder}
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
  const { fieldStyles, colors } = useAccountUiStyles();
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
        <Ionicons name={icon} size={rMS(18)} color={colors.placeholder} />
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
  const { accountStyles } = useAccountUiStyles();
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
  const { profileHeroStyles, colors } = useAccountUiStyles();

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
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Ionicons name="camera" size={rMS(16)} color={colors.onPrimary} />
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
  const { choiceSheetStyles } = useAccountUiStyles();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={choiceSheetStyles.backdrop} onPress={onClose} />
        <View style={[choiceSheetStyles.sheet, { paddingBottom: insets.bottom + rV(12) }]}>
          <View style={choiceSheetStyles.handle} />
          <Text style={choiceSheetStyles.title}>{title}</Text>
          <ScrollView
            style={{ maxHeight: rV(420) }}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {footer}
        </View>
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
  const { choiceSheetStyles, colors } = useAccountUiStyles();
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
        <Ionicons name="checkmark-circle" size={rMS(20)} color={colors.text} />
      ) : null}
    </TouchableOpacity>
  );
}

