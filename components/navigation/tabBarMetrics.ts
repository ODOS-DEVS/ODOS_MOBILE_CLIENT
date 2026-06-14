import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { rMS, rS, rV } from "@/styles/responsive";

export type TabBarMetrics = {
  tabCount: number;
  barInnerPaddingH: number;
  barContentHeight: number;
  barTotalHeight: number;
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
  pillPaddingHorizontal: number;
  pillPaddingVertical: number;
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

export function computeTabBarMetrics(
  tabCount: number,
  screenWidth: number,
  bottomInset = 0,
): TabBarMetrics {
  const safeTabCount = Math.max(tabCount, 1);
  const isCompact = screenWidth < 390 || safeTabCount >= 6;
  const isDense = safeTabCount >= 6;

  const barInnerPaddingH = isDense ? rS(4) : isCompact ? rS(6) : rS(8);
  const pillGap = isDense ? rS(2) : isCompact ? rS(3) : rS(4);

  const trackWidth = screenWidth - barInnerPaddingH * 2;
  const slotWidth = trackWidth / safeTabCount;
  const pillWidth = Math.max(rS(38), slotWidth - pillGap);

  const pillPaddingHorizontal = slotWidth >= 54 ? rS(6) : rS(3);
  const pillPaddingVertical = isDense ? rV(5) : isCompact ? rV(6) : rV(7);
  const labelFontSize = pickLabelFontSize(slotWidth, isCompact || isDense);
  const labelLineHeight = Math.round(labelFontSize * 1.24);
  const labelGap = rV(4);
  const iconSize = isDense ? rMS(23) : isCompact ? rMS(24) : rMS(26);
  const iconSurfaceSize = isDense ? rMS(38) : isCompact ? rMS(40) : rMS(44);
  const showLabels = slotWidth >= 44;

  const itemVerticalPad = rV(isDense ? 10 : 12);
  const iconStackHeight =
    iconSurfaceSize + (showLabels ? labelGap + labelLineHeight : 0);
  const barContentHeight = iconStackHeight + itemVerticalPad * 2;
  const barPaddingBottom = Math.max(bottomInset, rV(8));
  const barTotalHeight = barContentHeight + barPaddingBottom;
  const contentBottomInset = barTotalHeight + rV(8);

  return {
    tabCount: safeTabCount,
    barInnerPaddingH,
    barContentHeight,
    barTotalHeight,
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
    pillPaddingHorizontal,
    pillPaddingVertical,
    pillBorderRadius: rMS(isDense ? 14 : isCompact ? 15 : 16),
    isCompact: isCompact || isDense,
    showLabels,
    itemVerticalPad,
  };
}

export function useTabBarMetrics(tabCount: number, bottomInset = 0): TabBarMetrics {
  const { width } = useWindowDimensions();

  return useMemo(
    () => computeTabBarMetrics(tabCount, width, bottomInset),
    [bottomInset, tabCount, width],
  );
}
