import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { rMS, rS, rV } from "@/styles/responsive";

export type TabBarMetrics = {
  tabCount: number;
  barSideMargin: number;
  barInnerPaddingH: number;
  slotWidth: number;
  pillWidth: number;
  iconSize: number;
  iconBoxSize: number;
  labelFontSize: number;
  labelLineHeight: number;
  labelWidth: number;
  pillPaddingHorizontal: number;
  pillPaddingVertical: number;
  pillBorderRadius: number;
};

function pickLabelFontSize(slotWidth: number) {
  if (slotWidth >= 60) {
    return rMS(10.5);
  }
  if (slotWidth >= 52) {
    return rMS(10);
  }
  if (slotWidth >= 46) {
    return rMS(9.5);
  }
  return rMS(9);
}

export function computeTabBarMetrics(
  tabCount: number,
  screenWidth: number,
): TabBarMetrics {
  const safeTabCount = Math.max(tabCount, 1);
  const isCompact = screenWidth < 360;

  const barSideMargin = isCompact ? rS(10) : rS(12);
  const barInnerPaddingH = isCompact ? rS(4) : rS(6);
  const pillGap = rS(2);

  const barWidth = screenWidth - barSideMargin * 2;
  const trackWidth = barWidth - barInnerPaddingH * 2;
  const slotWidth = trackWidth / safeTabCount;
  const pillWidth = Math.max(rS(40), slotWidth - pillGap);

  const pillPaddingHorizontal = slotWidth >= 52 ? rS(6) : rS(4);
  const pillPaddingVertical = rV(5);
  const labelFontSize = pickLabelFontSize(slotWidth);
  const labelLineHeight = Math.round(labelFontSize * 1.28);

  return {
    tabCount: safeTabCount,
    barSideMargin,
    barInnerPaddingH,
    slotWidth,
    pillWidth,
    iconSize: rMS(22),
    iconBoxSize: rMS(26),
    labelFontSize,
    labelLineHeight,
    labelWidth: pillWidth - pillPaddingHorizontal * 2,
    pillPaddingHorizontal,
    pillPaddingVertical,
    pillBorderRadius: rMS(14),
  };
}

export function useTabBarMetrics(tabCount: number): TabBarMetrics {
  const { width } = useWindowDimensions();

  return useMemo(
    () => computeTabBarMetrics(tabCount, width),
    [tabCount, width],
  );
}
