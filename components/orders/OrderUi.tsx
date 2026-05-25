import {
  AccountActionButton,
  AccountActionRow,
  AccountBadge,
  AccountEmptyState,
  AccountIconShell,
  AccountInsightCard,
  AccountListCard,
  AccountSectionCard,
  AccountSegmentedTabs,
  accountStyles,
} from "@/components/account/AccountUi";
import { AppColors } from "@/constants/Colors";
import { resolveOrderItemImageSource } from "@/utils/orderImages";
import Fonts from "@/constants/Fonts";
import type { Order } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native";

export const orderStyles = StyleSheet.create({
  tabContent: {
    paddingBottom: rV(16),
    gap: rV(12),
  },
  orderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
  },
  orderInfo: {
    flex: 1,
    gap: rV(2),
  },
  orderNumber: {
    fontFamily: Fonts.text,
    fontSize: rMS(11),
    color: "#9CA3AF",
  },
  orderTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(15),
    color: AppColors.text,
  },
  orderMeta: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  orderMetaSuccess: {
    color: "#15803D",
    fontFamily: Fonts.title,
  },
  orderMetaDanger: {
    color: "#B91C1C",
    fontFamily: Fonts.title,
  },
  imageWrap: {
    width: rS(64),
    height: rS(64),
    borderRadius: rMS(14),
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: rS(64),
    gap: rV(6),
  },
  price: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(16),
    color: AppColors.text,
  },
  progressHeader: {
    marginTop: rV(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressEta: {
    fontFamily: Fonts.title,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  progressPercent: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(12),
    color: AppColors.text,
  },
  trackBar: {
    marginTop: rV(8),
    height: rV(6),
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    backgroundColor: AppColors.text,
    borderRadius: 999,
  },
  reasonRow: {
    marginTop: rV(10),
    flexDirection: "row",
    alignItems: "center",
    gap: rS(6),
  },
  reasonText: {
    flex: 1,
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
  cardFooterRow: {
    marginTop: rV(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: rS(12),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: rS(12),
    paddingVertical: rV(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF2F6",
  },
  summaryRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  summaryLabel: {
    fontFamily: Fonts.text,
    fontSize: rMS(13),
    color: "#6B7280",
  },
  summaryValue: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(13),
    color: AppColors.text,
  },
  summaryValueAccent: {
    color: "#15803D",
  },
  summaryDiscount: {
    color: "#166534",
  },
  selectableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(12),
    paddingVertical: rV(4),
  },
  selectableIcon: {
    width: rS(44),
    height: rS(44),
    borderRadius: rMS(14),
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  selectableCopy: {
    flex: 1,
    gap: rV(2),
  },
  selectableTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: rMS(14),
    color: AppColors.text,
  },
  selectableSub: {
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    lineHeight: rMS(17),
    color: "#6B7280",
  },
  selectableTag: {
    alignSelf: "flex-start",
    paddingHorizontal: rS(8),
    paddingVertical: rV(3),
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  selectableTagText: {
    fontFamily: Fonts.title,
    fontSize: rMS(10.5),
    color: "#4B5563",
  },
  stickyFooter: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: rS(16),
    paddingTop: rV(12),
    paddingBottom: rV(24),
    gap: rV(8),
  },
  footerHint: {
    textAlign: "center",
    fontFamily: Fonts.text,
    fontSize: rMS(12),
    color: "#6B7280",
  },
});

export function formatOrderMoney(value: number) {
  return `₵${value.toFixed(2)}`;
}

export function formatOrderDateShort(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatOrderDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getOrderPrimaryItem(order: Order) {
  return order.items[0];
}

export function getOrderItemImage(order: Order): ImageSourcePropType | null {
  const item = getOrderPrimaryItem(order);
  if (!item) {
    return null;
  }
  return resolveOrderItemImageSource(item);
}

export function getOrderLineItemImage(item: {
  image_url?: string | null;
  image_key?: string | null;
}): ImageSourcePropType {
  return resolveOrderItemImageSource(item);
}

export function getOrderStatusPresentation(order: Order) {
  if (order.status === "pending_payment") {
    return {
      label: "Awaiting payment",
      tone: "warning" as const,
      processingLabel: "Payment pending",
    };
  }
  if (order.status === "delivered") {
    return { label: "Delivered", tone: "success" as const, processingLabel: "Delivered" };
  }
  if (order.status === "cancelled") {
    return { label: "Cancelled", tone: "danger" as const, processingLabel: "Cancelled" };
  }
  return {
    label: "In transit",
    tone: "info" as const,
    processingLabel: "Processing",
  };
}

export {
  AccountActionButton,
  AccountActionRow,
  AccountBadge,
  AccountEmptyState,
  AccountInsightCard,
  AccountIconShell,
  AccountListCard,
  AccountSectionCard,
  AccountSegmentedTabs,
  accountStyles,
};

type OrderThumbnailProps = {
  order: Order;
  size?: number;
};

export function OrderThumbnail({ order, size = rS(64) }: OrderThumbnailProps) {
  const imageSource = getOrderItemImage(order);
  return (
    <View style={[orderStyles.imageWrap, { width: size, height: size }]}>
      {imageSource ? (
        <Image source={imageSource} style={orderStyles.image} resizeMode="cover" />
      ) : (
        <Ionicons name="cube-outline" size={rMS(24)} color="#9CA3AF" />
      )}
    </View>
  );
}

type OrderProgressBarProps = {
  progress: number;
  eta?: string | null;
};

export function OrderProgressBar({ progress, eta }: OrderProgressBarProps) {
  const percent = Math.round(progress * 100);
  return (
    <>
      <View style={orderStyles.progressHeader}>
        <Text style={orderStyles.progressEta}>{eta ?? "Preparing your delivery"}</Text>
        <Text style={orderStyles.progressPercent}>{percent}%</Text>
      </View>
      <View style={orderStyles.trackBar}>
        <View style={[orderStyles.trackFill, { width: `${percent}%` }]} />
      </View>
    </>
  );
}

type OrderSummaryRowProps = {
  label: string;
  value: string;
  accent?: "default" | "success" | "discount";
  last?: boolean;
};

export function OrderSummaryRow({ label, value, accent = "default", last = false }: OrderSummaryRowProps) {
  return (
    <View style={[orderStyles.summaryRow, last && orderStyles.summaryRowLast]}>
      <Text style={orderStyles.summaryLabel}>{label}</Text>
      <Text
        style={[
          orderStyles.summaryValue,
          accent === "success" && orderStyles.summaryValueAccent,
          accent === "discount" && orderStyles.summaryDiscount,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

type OrderSelectableRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  tag?: string;
  onPress: () => void;
};

export function OrderSelectableRow({
  icon,
  title,
  subtitle,
  tag,
  onPress,
}: OrderSelectableRowProps) {
  return (
    <TouchableOpacity style={orderStyles.selectableRow} onPress={onPress} activeOpacity={0.86}>
      <View style={orderStyles.selectableIcon}>
        <Ionicons name={icon} size={rMS(20)} color={AppColors.text} />
      </View>
      <View style={orderStyles.selectableCopy}>
        {tag ? (
          <View style={orderStyles.selectableTag}>
            <Text style={orderStyles.selectableTagText}>{tag}</Text>
          </View>
        ) : null}
        <Text style={orderStyles.selectableTitle}>{title}</Text>
        <Text style={orderStyles.selectableSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={rMS(20)} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

type OrderStickyFooterProps = {
  hint?: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  disabled?: boolean;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

export function OrderStickyFooter({
  hint,
  primaryLabel,
  onPrimaryPress,
  disabled = false,
  secondaryLabel,
  onSecondaryPress,
}: OrderStickyFooterProps) {
  return (
    <View style={orderStyles.stickyFooter}>
      {hint ? <Text style={orderStyles.footerHint}>{hint}</Text> : null}
      <AccountActionButton
        label={primaryLabel}
        variant="primary"
        onPress={onPrimaryPress}
        disabled={disabled}
      />
      {secondaryLabel && onSecondaryPress ? (
        <AccountActionButton label={secondaryLabel} variant="secondary" onPress={onSecondaryPress} />
      ) : null}
    </View>
  );
}
