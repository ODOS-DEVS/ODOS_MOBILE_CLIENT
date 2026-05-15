import { Dimensions, Platform, useWindowDimensions } from "react-native";
import { useMemo } from "react";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// Base design width/height (e.g. iPhone 14 ~390x844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const getViewport = () => Dimensions.get("window");

const getUiScaleCompaction = (width: number) => {
  if (width >= 1200) {
    return 0.84;
  }
  if (width >= 900) {
    return 0.88;
  }
  if (width >= 640) {
    return 0.91;
  }
  if (width >= 430) {
    return 0.95;
  }
  return 0.97;
};

const getPlatformCompaction = (width: number, height: number) => {
  if (Platform.OS !== "android") {
    return 1;
  }

  const aspectRatio = height / Math.max(width, 1);
  const isTallAndroidScreen = aspectRatio >= 2 && height >= 820;

  if (width >= 1200) {
    return 0.9;
  }
  if (width >= 900) {
    return 0.915;
  }
  if (width >= 640) {
    return isTallAndroidScreen ? 0.925 : 0.93;
  }
  if (width >= 500) {
    return isTallAndroidScreen ? 0.935 : 0.94;
  }
  if (width >= 430) {
    return isTallAndroidScreen ? 0.942 : 0.948;
  }
  if (width >= 390) {
    return isTallAndroidScreen ? 0.946 : 0.952;
  }
  return isTallAndroidScreen ? 0.95 : 0.956;
};

const getFinalUiScale = (width: number, height: number) => {
  return getUiScaleCompaction(width) * getPlatformCompaction(width, height);
};

export const rS = (size: number) => {
  const { width, height } = getViewport();
  return scale(size) * getFinalUiScale(width, height);
};

export const rV = (size: number) => {
  const { width, height } = getViewport();
  return verticalScale(size) * Math.min(getFinalUiScale(width, height) + 0.025, 0.985);
};

export const rMS = (size: number, factor?: number) => {
  const { width, height } = getViewport();
  return moderateScale(size, factor) * getFinalUiScale(width, height);
};

export const wp = (percent: number, width: number) => {
  return (Math.max(0, Math.min(percent, 100)) / 100) * width;
};

export const hp = (percent: number, height: number) => {
  return (Math.max(0, Math.min(percent, 100)) / 100) * height;
};

/** Horizontal padding for screen edges (scales with width, min for small devices) */
export const horizontalPadding = (width: number) => {
  const ratio = width / BASE_WIDTH;
  const base = Platform.OS === "android" ? 20 : 22;
  const padded = Math.round(base * Math.min(ratio, 1.08));
  return Math.max(14, Math.min(padded, Platform.OS === "android" ? 26 : 28));
};

/** Section vertical spacing (between sections) */
export const sectionSpacing = (height: number) => {
  const ratio = height / BASE_HEIGHT;
  const base = Platform.OS === "android" ? 26 : 28;
  const min = Platform.OS === "android" ? 22 : 24;
  return Math.max(min, Math.round(base * Math.min(ratio, 1.05)));
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

export const responsiveColumns = (screenWidth: number) => {
  if (screenWidth >= 1200) {
    return 5;
  }
  if (screenWidth >= 900) {
    return 4;
  }
  if (screenWidth >= 640) {
    return 3;
  }
  return 2;
};

export const contentMaxWidth = (screenWidth: number) => {
  if (screenWidth >= 1200) {
    return 1040;
  }
  if (screenWidth >= 900) {
    return 900;
  }
  if (screenWidth >= 640) {
    return 720;
  }
  return screenWidth;
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
      isTablet: width >= 640,
      uiScale: getFinalUiScale(width, height),
      deviceSize: (width < 380
        ? "small"
        : width < 500
          ? "medium"
          : "large") as DeviceSize,
      contentMaxWidth: contentMaxWidth(width),
      responsiveColumns: responsiveColumns(width),
      wp: (percent: number) => wp(percent, width),
      hp: (percent: number) => hp(percent, height),
      gridCardWidth: (columns = 2, gap = 12) =>
        gridCardWidth(width, columns, gap),
    }),
    [width, height]
  );
}
