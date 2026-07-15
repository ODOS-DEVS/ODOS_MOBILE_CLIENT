import {
  AccountActionButton as OrderActionButton,
} from "@/components/account/AccountUi";
import { resolveOrderItemImageSource } from "@/utils/orderImages";
import Fonts from "@/constants/Fonts";
import type { Order } from "@/hooks/useOrders";
import { getActiveOrderTimelineStep } from "@/utils/orderTracking";
import { rMS, rS, rV } from "@/styles/responsive";
import { useOrderStyles } from "@/styles/themedOrderStyles";
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

export { useOrderStyles } from "@/styles/themedOrderStyles";

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
  const orderStyles = useOrderStyles();
  const { colors } = useTheme();
  const imageSource = getOrderItemImage(order);
  return (
    <View style={[orderStyles.imageWrap, { width: size, height: size }]}>
      {imageSource ? (
        <Image source={imageSource} style={orderStyles.image} resizeMode="cover" />
      ) : (
        <Ionicons name="cube-outline" size={rMS(24)} color={colors.iconMuted} />
      )}
    </View>
  );
}

type OrderProgressBarProps = {
  progress: number;
  eta?: string | null;
};

export function OrderProgressBar({ progress, eta }: OrderProgressBarProps) {
  const orderStyles = useOrderStyles();
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

type OrderTrackingPreviewProps = {
  order: Order;
};

export function OrderTrackingPreview({ order }: OrderTrackingPreviewProps) {
  const orderStyles = useOrderStyles();
  const { colors } = useTheme();
  const activeStep = getActiveOrderTimelineStep(order);

  if (!activeStep) {
    return null;
  }

  const iconName =
    activeStep.state === "done"
      ? "checkmark-circle"
      : activeStep.state === "cancelled"
        ? "close-circle"
        : "radio-button-on";

  const iconColor =
    activeStep.state === "done"
      ? "#16A34A"
      : activeStep.state === "cancelled"
        ? "#DC2626"
        : colors.text;

  return (
    <View style={orderStyles.trackingPreview}>
      <Ionicons name={iconName} size={rMS(16)} color={iconColor} />
      <View style={orderStyles.trackingPreviewCopy}>
        <Text style={orderStyles.trackingPreviewTitle}>{activeStep.title}</Text>
        <Text style={orderStyles.trackingPreviewCaption} numberOfLines={2}>
          {activeStep.caption}
        </Text>
      </View>
    </View>
  );
}

type OrderSummaryRowProps = {
  label: string;
  value: string;
  accent?: "default" | "success" | "discount";
  last?: boolean;
};

export function OrderSummaryRow({ label, value, accent = "default", last = false }: OrderSummaryRowProps) {
  const orderStyles = useOrderStyles();
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
  const orderStyles = useOrderStyles();
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={orderStyles.selectableRow} onPress={onPress} activeOpacity={0.86}>
      <View style={orderStyles.selectableIcon}>
        <Ionicons name={icon} size={rMS(20)} color={colors.text} />
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
      <Ionicons name="chevron-forward" size={rMS(20)} color={colors.iconMuted} />
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
          paddingBottom: getOrderFooterBottomPadding(insets.bottom),
          gap: rV(10),
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -4 },
          elevation: 10,
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
    return rV(20);
  }

  const buttonHeight = rV(52);
  const gaps = Math.max(0, actionRows - 1) * rV(10);
  const topPadding = rV(12);
  const bottomPadding = Math.max(bottomInset + rV(12), rV(24));
  const buffer = rV(14);
  return actionRows * buttonHeight + gaps + topPadding + bottomPadding + buffer;
}

export function getOrderFooterBottomPadding(bottomInset: number) {
  return Math.max(bottomInset + rV(12), rV(24));
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
