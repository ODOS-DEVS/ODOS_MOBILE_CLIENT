import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { rMS, rS, rV } from "@/styles/responsive";

export type TabBarMetrics = {
  tabCount: number;
  barInnerPaddingH: number;
  barContentHeight: number;
  barTotalHeight: number;
  barPaddingTop: number;
  barPaddingBottom: number;
  barBottomOffset: number;
  contentBottomInset: number;
  slotWidth: number;
  pillWidth: number;
  iconSize: number;
  iconSurfaceSize: number;
  labelFontSize: number;
  labelLineHeight: number;
  labelGap: number;
  labelWidth: number;
  pillBorderRadius: number;
  isCompact: boolean;
  showLabels: boolean;
  itemVerticalPad: number;
};

function pickLabelFontSize(slotWidth: number, isCompact: boolean) {
  if (isCompact) {
    return slotWidth >= 56 ? rMS(10) : rMS(9.5);
  }

  if (slotWidth >= 62) {
    return rMS(11);
  }
  if (slotWidth >= 54) {
    return rMS(10.5);
  }
  return rMS(10);
}

/**
 * The bar is sized from the icon surface outwards, not from a fixed height.
 *
 * Reference points: a native iOS tab bar gives its content 49pt and Material's
 * bottom navigation uses 56-64dp. The earlier numbers here (a 44pt icon
 * surface with 12pt of padding above and below) produced 73-98pt of content
 * depending on device — half again as tall as either platform's own bar, which
 * is what made it read as long and heavy. These land at 55-70pt.
 *
 * Label text size is deliberately left alone: shrinking type to reclaim height
 * trades legibility for a number, and the padding had plenty to give.
 * Each slot still clears Apple's 44pt minimum touch target.
 */
export function computeTabBarMetrics(
  tabCount: number,
  screenWidth: number,
  bottomInset = 0,
  /**
   * Whether the icons are the pill-wrapped kind.
   *
   * The shopper tabs render `TabBarIconShell`, whose pill fills its slot and
   * so sits flush against the bar's top edge. The seller tabs render a bare
   * icon with react-navigation's own label, which already carries its own
   * spacing. Only the former needs the bar opened up at the top.
   */
  pillIcons = false,
): TabBarMetrics {
  const safeTabCount = Math.max(tabCount, 1);
  const isCompact = screenWidth < 390 || safeTabCount >= 6;
  const isDense = safeTabCount >= 6;

  const barInnerPaddingH = isDense ? rS(4) : isCompact ? rS(6) : rS(8);
  const pillGap = isDense ? rS(2) : isCompact ? rS(3) : rS(4);

  const trackWidth = screenWidth - barInnerPaddingH * 2;
  const slotWidth = trackWidth / safeTabCount;
  const pillWidth = Math.max(rS(38), slotWidth - pillGap);

  const labelFontSize = pickLabelFontSize(slotWidth, isCompact || isDense);
  const labelLineHeight = Math.round(labelFontSize * 1.24);
  const labelGap = rV(3);
  const iconSize = isDense ? rMS(19) : isCompact ? rMS(20) : rMS(21);
  const iconSurfaceSize = isDense ? rMS(30) : isCompact ? rMS(32) : rMS(34);
  const showLabels = safeTabCount === 5 || slotWidth >= 44;

  const itemVerticalPad = rV(isDense ? 5 : 6);
  const iconStackHeight =
    iconSurfaceSize + (showLabels ? labelGap + labelLineHeight : 0);
  const barContentHeight = iconStackHeight + itemVerticalPad * 2;
  const barPaddingBottom = Math.max(bottomInset, rV(8));
  // The bottom padding absorbs the home-indicator inset, so content already
  // has room beneath it; without a matching pad above, the pills read as
  // pinned to the top edge rather than sitting in the bar.
  const barPaddingTop = pillIcons ? rV(7) : 0;
  const barTotalHeight = barPaddingTop + barContentHeight + barPaddingBottom;
  const contentBottomInset = barTotalHeight + rV(8);

  return {
    tabCount: safeTabCount,
    barInnerPaddingH,
    barContentHeight,
    barTotalHeight,
    barPaddingTop,
    barPaddingBottom,
    barBottomOffset: 0,
    contentBottomInset,
    slotWidth,
    pillWidth,
    iconSize,
    iconSurfaceSize,
    labelFontSize,
    labelLineHeight,
    labelGap,
    labelWidth: pillWidth,
    // Kept proportional to the smaller surface (was 16 on a 44pt pill); left
    // at the old values it would round to a full circle rather than the
    // squircle the design uses.
    pillBorderRadius: rMS(isDense ? 10 : isCompact ? 11 : 12),
    isCompact: isCompact || isDense,
    showLabels,
    itemVerticalPad,
  };
}

export function useTabBarMetrics(
  tabCount: number,
  bottomInset = 0,
  pillIcons = false,
): TabBarMetrics {
  const { width } = useWindowDimensions();

  return useMemo(
    () => computeTabBarMetrics(tabCount, width, bottomInset, pillIcons),
    [bottomInset, pillIcons, tabCount, width],
  );
}
