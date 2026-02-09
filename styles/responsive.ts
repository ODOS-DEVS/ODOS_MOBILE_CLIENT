import { useWindowDimensions } from "react-native";
import { useMemo } from "react";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Base design width/height (e.g. iPhone 14 ~390x844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export const rS = (size: number) => {
  return scale(size);
};

export const rV = (size: number) => {
  return verticalScale(size);
};

export const rMS = (size: number, factor?: number) => {
  return moderateScale(size, factor);
};

/** Horizontal padding for screen edges (scales with width, min for small devices) */
export const horizontalPadding = (width: number) => {
  const ratio = width / BASE_WIDTH;
  const base = 24;
  const padded = Math.round(base * Math.min(ratio, 1.2));
  return Math.max(16, Math.min(padded, 32));
};

/** Section vertical spacing (between sections) */
export const sectionSpacing = (height: number) => {
  const ratio = height / BASE_HEIGHT;
  return Math.round(32 * Math.min(ratio, 1.15));
};

/** Card width for 2-column grid: (screenWidth - padding*2 - gap) / 2 */
export const gridCardWidth = (
  screenWidth: number,
  columns: number = 2,
  gap: number = 12
) => {
  const padding = horizontalPadding(screenWidth) * 2;
  return (screenWidth - padding - gap * (columns - 1)) / columns;
};

export type DeviceSize = "small" | "medium" | "large";

/** Hook: responsive values from window dimensions */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(
    () => ({
      width,
      height,
      horizontalPadding: horizontalPadding(width),
      sectionSpacing: sectionSpacing(height),
      isSmallDevice: width < 380,
      isMediumDevice: width >= 380 && width < 500,
      isLargeDevice: width >= 500,
      deviceSize: (width < 380
        ? "small"
        : width < 500
          ? "medium"
          : "large") as DeviceSize,
      gridCardWidth: (columns = 2, gap = 12) =>
        gridCardWidth(width, columns, gap),
    }),
    [width, height]
  );
}
