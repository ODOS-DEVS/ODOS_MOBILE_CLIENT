import { AppColors } from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CartItemProps {
  id: string;
  title: string;
  category?: string;
  price: number;
  image?: any;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const CartItemCard = ({
  image,
  title,
  category,
  price,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) => {
  const lineTotal = price * quantity;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.imageWrap}>
          <Image source={image} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.meta}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {category ? (
                <Text style={styles.category} numberOfLines={1}>
                  {category}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={onRemove}
              activeOpacity={0.8}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={18} color="#D64545" />
            </TouchableOpacity>
          </View>

          <Text style={styles.unitPrice}>{formatCurrency(price)}</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.quantityBlock}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={onDecrease}
              activeOpacity={0.85}
              style={styles.stepperButton}
            >
              <Ionicons name="remove" size={16} color={AppColors.text} />
            </TouchableOpacity>

            <Text style={styles.quantityValue}>
              {quantity.toString().padStart(2, "0")}
            </Text>

            <TouchableOpacity
              onPress={onIncrease}
              activeOpacity={0.85}
              style={styles.stepperButton}
            >
              <Ionicons name="add" size={16} color={AppColors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>Item Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(lineTotal)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.white,
    borderRadius: rMS(20),
    paddingHorizontal: rS(14),
    paddingVertical: rV(14),
    marginBottom: rV(12),
    borderWidth: 1,
    borderColor: "#E8ECEF",
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageWrap: {
    width: rS(80),
    height: rV(84),
    borderRadius: rMS(14),
    overflow: "hidden",
    backgroundColor: "#EEF2F4",
    marginRight: rS(12),
  },
  image: {
    width: "100%",
    height: "100%",
  },
  meta: {
    flex: 1,
    minHeight: rV(84),
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rS(10),
  },
  titleBlock: {
    flex: 1,
    paddingTop: rV(2),
  },
  title: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    lineHeight: rMS(20),
    color: AppColors.text,
    marginBottom: rV(4),
  },
  category: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    color: AppColors.subtext[100],
  },
  removeButton: {
    width: rMS(32),
    height: rMS(32),
    borderRadius: rMS(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F2",
  },
  unitPrice: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
  },
  footerRow: {
    marginTop: rV(12),
    paddingTop: rV(12),
    borderTopWidth: 1,
    borderTopColor: "#EEF2F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
  },
  quantityBlock: {
    flex: 1,
  },
  quantityLabel: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    color: AppColors.subtext[100],
    marginBottom: rV(6),
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F3F5F6",
    borderRadius: rMS(14),
    paddingHorizontal: rS(7),
    paddingVertical: rV(7),
  },
  stepperButton: {
    width: rMS(30),
    height: rMS(30),
    borderRadius: rMS(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.white,
  },
  quantityValue: {
    minWidth: rS(24),
    textAlign: "center",
    marginHorizontal: rS(10),
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  totalBlock: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(11),
    color: AppColors.subtext[100],
    marginBottom: rV(4),
  },
  totalValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
  },
});

export default CartItemCard;
