import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { rMS, rS } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface AddToCartBtnProps {
  item: {
    id: string;
    title: string;
    category?: string;
    price: number;
    image?: any;
    imageKey?: string;
  };

  containerStyle?: StyleProp<ViewStyle>;
  iconSize?: number;
  iconColor?: string;
  variant?: "icon" | "stepper";
  stepperLayout?: "fixed" | "fluid";
  stepperTone?: "solid" | "soft" | "accent" | "compact";
  stepperIdleLabel?: string;
}

const STEPPER_WIDTH = rS(118);
const STEPPER_WIDTH_COMPACT = rS(96);
const STEPPER_HEIGHT = rS(44);
const STEPPER_HEIGHT_ACCENT = rS(50);
const STEPPER_HEIGHT_COMPACT = rS(42);

function formatCartToastMessage(previousQty: number, nextQty: number) {
  if (previousQty <= 0) {
    return "Added to cart successfully";
  }

  if (nextQty === 1) {
    return "1 item in cart";
  }

  return `${nextQty} items in cart`;
}

const AddToCartBtn = ({
  item,
  containerStyle,
  iconSize = rS(14),
  iconColor,
  variant = "icon",
  stepperLayout = "fixed",
  stepperTone = "solid",
  stepperIdleLabel,
}: AddToCartBtnProps) => {
  const { colors } = useTheme();
  const resolvedIconColor = iconColor ?? colors.text;
  const isFluidStepper = stepperLayout === "fluid";
  const isSoftStepper = stepperTone === "soft";
  const isAccentStepper = stepperTone === "accent";
  const isCompactStepper = stepperTone === "compact";
  const stepperHeight = isCompactStepper
    ? STEPPER_HEIGHT_COMPACT
    : isAccentStepper
      ? STEPPER_HEIGHT_ACCENT
      : STEPPER_HEIGHT;
  const stepperBackground = isCompactStepper
    ? colors.card
    : isAccentStepper
      ? colors.surfaceMuted
      : isSoftStepper
        ? colors.surfaceMuted
        : colors.inverseSurface;
  const stepperBorderColor = isCompactStepper
    ? colors.borderStrong
    : isAccentStepper
      ? colors.borderStrong
      : isSoftStepper
        ? colors.border
        : "transparent";
  const stepperIconColor = isCompactStepper
    ? colors.text
    : isAccentStepper
      ? colors.text
      : isSoftStepper
        ? colors.text
        : resolvedIconColor;
  const stepperQtyColor = isCompactStepper
    ? colors.text
    : isAccentStepper
      ? colors.onPrimary
      : isSoftStepper
        ? colors.text
        : colors.onInverseSurface;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        iconWrap: {
          backgroundColor: colors.surfaceMuted,
          padding: rS(10),
          borderRadius: rS(50),
          position: "relative",
        },
        quantityBadge: {
          position: "absolute",
          top: -rS(4),
          right: -rS(4),
          minWidth: rS(18),
          height: rS(18),
          borderRadius: rS(9),
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: rS(4),
          borderWidth: 1.5,
          borderColor: colors.card,
        },
        quantityBadgeText: {
          color: colors.onPrimary,
          fontSize: rMS(10),
          fontFamily: Fonts.titleBold,
        },
        stepperShell: {
          width: isFluidStepper ? "100%" : isCompactStepper ? STEPPER_WIDTH_COMPACT : STEPPER_WIDTH,
          height: stepperHeight,
          borderRadius: isCompactStepper ? rMS(12) : isAccentStepper ? rMS(22) : rMS(14),
          backgroundColor: stepperBackground,
          borderWidth: isSoftStepper || isAccentStepper || isCompactStepper ? StyleSheet.hairlineWidth : 0,
          borderColor: stepperBorderColor,
          overflow: "hidden",
          ...(isAccentStepper
            ? {
                shadowColor: colors.shadow,
                shadowOpacity: 0.08,
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 8,
                elevation: 2,
              }
            : null),
        },
        stepperIdleButton: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rS(isCompactStepper ? 4 : isAccentStepper ? 6 : 4),
          paddingHorizontal: rS(isCompactStepper ? 8 : isAccentStepper ? 12 : 8),
        },
        stepperIdleLabel: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(isCompactStepper ? 12 : isAccentStepper ? 13.5 : 12.5),
          color: stepperIconColor,
          letterSpacing: isAccentStepper ? 0.1 : 0,
        },
        stepperActiveRow: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
        },
        stepperSideButton: {
          width: isFluidStepper ? undefined : isCompactStepper ? rS(30) : rS(38),
          flex: isFluidStepper ? 1 : undefined,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        },
        stepperSideButtonDisabled: {
          opacity: 0.35,
        },
        stepperDivider: {
          width: StyleSheet.hairlineWidth,
          height: rS(isCompactStepper ? 18 : isAccentStepper ? 24 : 22),
          backgroundColor: isCompactStepper
            ? colors.border
            : isAccentStepper
              ? colors.border
              : isSoftStepper
                ? colors.border
                : "rgba(255,255,255,0.18)",
        },
        stepperQtyWrap: {
          flex: isFluidStepper ? 1.2 : 1,
          alignItems: "center",
          justifyContent: "center",
          minWidth: isFluidStepper ? rS(28) : isCompactStepper ? rS(24) : rS(34),
          ...(isAccentStepper
            ? {
                minWidth: rS(34),
                height: rS(28),
                borderRadius: rMS(14),
                backgroundColor: colors.inverseSurface,
              }
            : null),
        },
        stepperQtyText: {
          fontSize: rMS(isCompactStepper ? 12.5 : isAccentStepper ? 13.5 : 15),
          fontFamily: Fonts.titleBold,
          color: stepperQtyColor,
        },
      }),
    [
      colors,
      isAccentStepper,
      isCompactStepper,
      isFluidStepper,
      isSoftStepper,
      stepperBackground,
      stepperBorderColor,
      stepperHeight,
      stepperIconColor,
      stepperQtyColor,
    ],
  );
  const { addToCart, increaseQty, decreaseQty, getItemQuantity } = useCart();
  const { showSuccessToast } = useToast();
  const quantity = getItemQuantity(item.id);

  const handleAdd = useCallback(() => {
    const previousQty = getItemQuantity(item.id);
    void addToCart(item).then(() => {
      const nextQty = Math.min(previousQty + 1, 99);
      showSuccessToast(formatCartToastMessage(previousQty, nextQty));
    });
  }, [addToCart, getItemQuantity, item, showSuccessToast]);

  const handleIncrease = useCallback(() => {
    const previousQty = getItemQuantity(item.id);
    if (previousQty <= 0) {
      handleAdd();
      return;
    }

    void increaseQty(item.id).then(() => {
      const nextQty = Math.min(previousQty + 1, 99);
      showSuccessToast(formatCartToastMessage(previousQty, nextQty));
    });
  }, [getItemQuantity, handleAdd, increaseQty, item.id, showSuccessToast]);

  const handleDecrease = useCallback(() => {
    if (quantity <= 1) {
      return;
    }

    void decreaseQty(item.id).then(() => {
      showSuccessToast(`${quantity - 1} items in cart`);
    });
  }, [decreaseQty, item.id, quantity, showSuccessToast]);

  if (variant === "stepper") {
    const canDecrease = quantity > 1;

    return (
      <View style={[styles.stepperShell, containerStyle]}>
        {quantity > 0 ? (
          <View style={styles.stepperActiveRow}>
            <TouchableOpacity
              style={[
                styles.stepperSideButton,
                !canDecrease && styles.stepperSideButtonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleDecrease}
              disabled={!canDecrease}
              accessibilityLabel="Decrease quantity"
            >
              <Ionicons name="remove" size={iconSize} color={stepperIconColor} />
            </TouchableOpacity>

            <View style={styles.stepperDivider} />

            <View style={styles.stepperQtyWrap}>
              <Text style={styles.stepperQtyText}>{quantity}</Text>
            </View>

            <View style={styles.stepperDivider} />

            <TouchableOpacity
              style={styles.stepperSideButton}
              activeOpacity={0.85}
              onPress={handleIncrease}
              accessibilityLabel="Increase quantity"
            >
              <Ionicons name="add" size={iconSize} color={stepperIconColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.stepperIdleButton}
            activeOpacity={0.85}
            onPress={handleAdd}
            accessibilityLabel="Add to cart"
          >
            <Ionicons
              name={isAccentStepper || isCompactStepper ? "bag-handle-outline" : "cart-outline"}
              size={iconSize}
              color={stepperIconColor}
            />
            {stepperIdleLabel ? (
              <Text style={styles.stepperIdleLabel}>{stepperIdleLabel}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.iconWrap, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleAdd}
        accessibilityLabel={quantity > 0 ? `Add another, ${quantity} in cart` : "Add to cart"}
      >
        <Ionicons name="add" size={iconSize} color={resolvedIconColor} />
      </TouchableOpacity>

      {quantity > 0 ? (
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityBadgeText}>{quantity > 9 ? "9+" : quantity}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default AddToCartBtn;
