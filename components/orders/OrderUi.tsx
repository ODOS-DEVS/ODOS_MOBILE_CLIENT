import {
  AccountActionButton as OrderActionButton,
} from "@/components/account/AccountUi";
import { AppColors } from "@/constants/Colors";
import { resolveOrderItemImageSource } from "@/utils/orderImages";
import Fonts from "@/constants/Fonts";
import type { Order } from "@/hooks/useOrders";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

export {
  AccountActionButton,
  AccountActionRow,
  AccountBadge,
  AccountEmptyState,
  AccountIconShell,
  AccountInsightCard,
  AccountListCard,
  AccountSectionCard,
  AccountSegmentedTabs,
  useAccountStyles,
} from "@/components/account/AccountUi";

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

function useOrderFooterShellStyles() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return useMemo(
    () =>
      StyleSheet.create({
        shell: {
          backgroundColor: colors.bottomBar,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.bottomBarBorder,
          paddingHorizontal: rS(16),
          paddingTop: rV(12),
          paddingBottom: Math.max(insets.bottom, rV(12)),
          gap: rV(10),
          shadowColor: colors.shadow,
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
      }),
    [colors, insets.bottom],
  );
}

type OrderScreenFooterProps = {
  children: React.ReactNode;
};

export function OrderScreenFooter({ children }: OrderScreenFooterProps) {
  const footerStyles = useOrderFooterShellStyles();
  return <View style={footerStyles.shell}>{children}</View>;
}

/** Approximate multi-row order footer height for scroll padding. */
export function estimateOrderScreenFooterHeight(actionRows: number, bottomInset: number) {
  if (actionRows <= 0) {
    return rV(16);
  }

  const rowHeight = rV(48);
  const gaps = Math.max(0, actionRows - 1) * rV(10);
  const padding = rV(12) + Math.max(bottomInset, rV(12));
  return actionRows * rowHeight + gaps + padding + rV(8);
}

type OrderStickyFooterProps = {
  hint?: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  disabled?: boolean;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  /** When set, shows total on the left and a compact action button on the right. */
  amountLabel?: string;
  amountValue?: string;
};

export function OrderStickyFooter({
  hint,
  primaryLabel,
  onPrimaryPress,
  disabled = false,
  secondaryLabel,
  onSecondaryPress,
  amountLabel = "Total",
  amountValue,
}: OrderStickyFooterProps) {
  const { colors } = useTheme();
  const footerShellStyles = useOrderFooterShellStyles();

  const footerStyles = useMemo(
    () =>
      StyleSheet.create({
        shell: footerShellStyles.shell,
        hint: {
          textAlign: "center",
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          color: colors.textMuted,
        },
        actionRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(12),
        },
        amountCopy: {
          flex: 1,
          minWidth: 0,
          gap: rV(2),
        },
        amountLabel: {
          fontFamily: Fonts.text,
          fontSize: rMS(11.5),
          color: colors.textMuted,
        },
        amountValue: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(20),
          color: colors.text,
        },
        primaryButton: {
          flexShrink: 0,
          minWidth: rS(132),
        },
      }),
    [colors, footerShellStyles.shell],
  );

  return (
    <View style={footerStyles.shell}>
      {hint ? <Text style={footerStyles.hint}>{hint}</Text> : null}
      {amountValue ? (
        <View style={footerStyles.actionRow}>
          <View style={footerStyles.amountCopy}>
            <Text style={footerStyles.amountLabel}>{amountLabel}</Text>
            <Text style={footerStyles.amountValue} numberOfLines={1} adjustsFontSizeToFit>
              {amountValue}
            </Text>
          </View>
          <View style={footerStyles.primaryButton}>
            <OrderActionButton
              label={primaryLabel}
              variant="primary"
              onPress={onPrimaryPress}
              disabled={disabled}
              flex={0}
            />
          </View>
        </View>
      ) : (
        <OrderActionButton
          label={primaryLabel}
          variant="primary"
          onPress={onPrimaryPress}
          disabled={disabled}
        />
      )}
      {secondaryLabel && onSecondaryPress ? (
        <OrderActionButton label={secondaryLabel} variant="secondary" onPress={onSecondaryPress} />
      ) : null}
    </View>
  );
}

/** Approximate sticky footer height for scroll content padding. */
export function estimateOrderStickyFooterHeight(options: {
  hasHint?: boolean;
  hasSplitAmount?: boolean;
  bottomInset: number;
}) {
  const hintHeight = options.hasHint ? rV(34) : 0;
  const barHeight = options.hasSplitAmount ? rV(52) : rV(56);
  const padding = rV(12) + Math.max(options.bottomInset, rV(12));
  return hintHeight + barHeight + padding + rV(8);
}
