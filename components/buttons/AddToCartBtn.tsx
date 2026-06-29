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
}

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
}: AddToCartBtnProps) => {
  const { colors } = useTheme();
  const resolvedIconColor = iconColor ?? colors.text;
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
        stepperWrap: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          borderRadius: rS(999),
          paddingHorizontal: rS(6),
          paddingVertical: rS(4),
          gap: rS(4),
        },
        stepperButton: {
          width: rS(34),
          height: rS(34),
          borderRadius: rS(17),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.14)",
        },
        stepperQtyWrap: {
          minWidth: rS(28),
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: rS(4),
        },
        stepperQtyText: {
          fontSize: rMS(14),
          fontFamily: Fonts.titleBold,
          color: colors.onPrimary,
        },
      }),
    [colors],
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

  if (variant === "stepper" && quantity > 0) {
    return (
      <View style={[containerStyle, styles.stepperWrap]}>
        <TouchableOpacity
          style={styles.stepperButton}
          activeOpacity={0.85}
          onPress={handleDecrease}
          accessibilityLabel="Decrease quantity"
        >
          <Ionicons name="remove" size={iconSize} color={resolvedIconColor} />
        </TouchableOpacity>

        <View style={styles.stepperQtyWrap}>
          <Text style={[styles.stepperQtyText, { color: resolvedIconColor }]}>{quantity}</Text>
        </View>

        <TouchableOpacity
          style={styles.stepperButton}
          activeOpacity={0.85}
          onPress={handleIncrease}
          accessibilityLabel="Increase quantity"
        >
          <Ionicons name="add" size={iconSize} color={resolvedIconColor} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.iconWrap,
        containerStyle,
      ]}
    >
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
