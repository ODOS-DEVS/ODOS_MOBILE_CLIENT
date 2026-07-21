import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useVendorQuickAccess } from "@/hooks/useVendorQuickAccess";
import {
  useWorkspaceModeStore,
  type WorkspaceMode,
} from "@/stores/workspaceModeStore";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { switchWorkspaceMode } from "@/utils/workspaceNavigation";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WorkspaceSwitcherSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type WorkspaceOption = {
  id: WorkspaceMode;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function WorkspaceSwitcherSheet({
  visible,
  onClose,
}: WorkspaceSwitcherSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { isApprovedVendor, storeLabel } = useVendorQuickAccess();
  const mode = useWorkspaceModeStore((state) => state.mode);
  const [isSwitching, setIsSwitching] = useState(false);

  const options = useMemo<WorkspaceOption[]>(() => {
    return [
      {
        id: "shop_and_sell",
        title: user?.full_name?.trim() || "Shopping",
        subtitle: "Shop and sell in one place",
        icon: "bag-handle-outline",
      },
      {
        id: "sell_only",
        title: storeLabel,
        subtitle: "Seller mode — manage your store",
        icon: "storefront-outline",
      },
    ];
  }, [storeLabel, user?.full_name]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: "flex-end",
        },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.backdrop,
        },
        sheet: {
          zIndex: 2,
          elevation: 8,
          backgroundColor: colors.card,
          borderTopLeftRadius: rMS(22),
          borderTopRightRadius: rMS(22),
          paddingHorizontal: rS(16),
          paddingTop: rV(10),
          paddingBottom: insets.bottom + rV(16),
        },
        handle: {
          alignSelf: "center",
          width: rS(40),
          height: rV(4),
          borderRadius: rS(2),
          backgroundColor: colors.border,
          marginBottom: rV(14),
        },
        heading: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(16),
          color: colors.text,
          marginBottom: rV(4),
          paddingHorizontal: rS(4),
        },
        caption: {
          fontFamily: Fonts.text,
          fontSize: rMS(12.5),
          color: colors.textMuted,
          marginBottom: rV(14),
          paddingHorizontal: rS(4),
        },
        option: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
          minHeight: rV(64),
          borderRadius: rMS(16),
          paddingHorizontal: rS(12),
          marginBottom: rV(8),
          backgroundColor: colors.inputBg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.inputBorder,
        },
        optionActive: {
          borderColor: colors.text,
          backgroundColor: colors.pill,
        },
        optionCopy: {
          flex: 1,
          minWidth: 0,
        },
        optionTitle: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(14.5),
          color: colors.text,
        },
        optionSubtitle: {
          marginTop: rV(2),
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.textMuted,
        },
        iconShell: {
          width: rMS(44),
          height: rMS(44),
          borderRadius: rMS(22),
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
          overflow: "hidden",
        },
      }),
    [colors, insets.bottom],
  );

  const canShow = Boolean(isApprovedVendor && user);

  const selectMode = async (next: WorkspaceMode) => {
    if (isSwitching) {
      return;
    }
    if (next === mode) {
      onClose();
      return;
    }

    setIsSwitching(true);
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onClose();
      await switchWorkspaceMode(next);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Modal
      visible={visible && canShow}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root} pointerEvents="box-none">
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.heading}>Switch account</Text>
          <Text style={styles.caption}>
            Same ODOS login — pick shopping or seller focus.
          </Text>

          {options.map((option) => {
            const selected = mode === option.id;
            return (
              <Pressable
                key={option.id}
                style={[styles.option, selected && styles.optionActive]}
                onPress={() => void selectMode(option.id)}
                disabled={isSwitching}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: isSwitching }}
              >
                <View style={styles.iconShell} pointerEvents="none">
                  {option.id === "shop_and_sell" && user ? (
                    <UserAvatar
                      avatarUrl={user.avatar_url}
                      gender={user.gender}
                      size={rMS(44)}
                    />
                  ) : (
                    <Ionicons
                      name={option.icon}
                      size={rMS(22)}
                      color={colors.text}
                    />
                  )}
                </View>
                <View style={styles.optionCopy} pointerEvents="none">
                  <Text style={styles.optionTitle} numberOfLines={1}>
                    {option.title}
                  </Text>
                  <Text style={styles.optionSubtitle} numberOfLines={1}>
                    {option.subtitle}
                  </Text>
                </View>
                <Ionicons
                  name={selected ? "checkmark-circle" : "ellipse-outline"}
                  size={rMS(22)}
                  color={selected ? colors.text : colors.iconMuted}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
