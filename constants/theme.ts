import { AppColors } from "@/constants/Colors";

export type ThemeColors = {
  screen: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  textBody: string;
  header: string;
  headerBorder: string;
  surface: string;
  surfaceMuted: string;
  surfaceSubtle: string;
  border: string;
  borderStrong: string;
  segmentBg: string;
  segmentActive: string;
  pill: string;
  pillText: string;
  inputBg: string;
  inputBorder: string;
  placeholder: string;
  iconMuted: string;
  tabBar: string;
  tabBarBorder: string;
  tabFocused: string;
  shadow: string;
  backdrop: string;
  primary: string;
  onPrimary: string;
  inverseText: string;
  editAvatarBorder: string;
  imagePlaceholder: string;
  cardElevated: string;
  skeleton: string;
  skeletonHighlight: string;
  dangerSoft: string;
  dangerText: string;
  successText: string;
  accentSoft: string;
  inverseSurface: string;
  onInverseSurface: string;
  mutedOnInverse: string;
  bottomBar: string;
  bottomBarBorder: string;
};

export const lightTheme: ThemeColors = {
  screen: "#F5F7FA",
  card: "#FFFFFF",
  cardBorder: "#E6EAF0",
  text: AppColors.text,
  textMuted: "#6B7280",
  textSecondary: "#4B5563",
  textBody: "#374151",
  header: AppColors.white,
  headerBorder: "#E5E7EB",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F3F5",
  surfaceSubtle: "#F8FAFC",
  border: "#E5E7EB",
  borderStrong: "#E6EAF0",
  segmentBg: "#EEF2F6",
  segmentActive: "#FFFFFF",
  pill: "#F3F4F6",
  pillText: "#4B5563",
  inputBg: "#F8FAFC",
  inputBorder: "#E5E7EB",
  placeholder: "#9CA3AF",
  iconMuted: "#9CA3AF",
  tabBar: AppColors.white,
  tabBarBorder: "#E5E7EB",
  tabFocused: "#F3F4F6",
  shadow: "#0F172A",
  backdrop: "rgba(15, 23, 42, 0.45)",
  primary: AppColors.primary,
  onPrimary: "#FFFFFF",
  inverseText: "#FFFFFF",
  editAvatarBorder: "#FFFFFF",
  imagePlaceholder: "#F3F4F6",
  cardElevated: "#F8FAFC",
  skeleton: "#E8ECF1",
  skeletonHighlight: "rgba(255,255,255,0.55)",
  dangerSoft: "#FEF2F2",
  dangerText: "#DC2626",
  successText: "#059669",
  accentSoft: "#F8FAFC",
  inverseSurface: "#0F172A",
  onInverseSurface: "#F8FAFC",
  mutedOnInverse: "#CBD5E1",
  bottomBar: "rgba(255,255,255,0.985)",
  bottomBarBorder: "#E5E7EB",
};

export const darkTheme: ThemeColors = {
  screen: "#0B1220",
  card: "#151C2B",
  cardBorder: "#243044",
  text: "#F3F4F6",
  textMuted: "#9CA3AF",
  textSecondary: "#D1D5DB",
  textBody: "#E5E7EB",
  header: "#111827",
  headerBorder: "#374151",
  surface: "#151C2B",
  surfaceMuted: "#1F2937",
  surfaceSubtle: "#1A2332",
  border: "#374151",
  borderStrong: "#243044",
  segmentBg: "#1F2937",
  segmentActive: "#374151",
  pill: "#1F2937",
  pillText: "#D1D5DB",
  inputBg: "#1A2332",
  inputBorder: "#374151",
  placeholder: "#6B7280",
  iconMuted: "#9CA3AF",
  tabBar: "#111827",
  tabBarBorder: "#374151",
  tabFocused: "#374151",
  shadow: "#000000",
  backdrop: "rgba(0, 0, 0, 0.62)",
  primary: "#A3A3A3",
  onPrimary: "#111827",
  inverseText: "#111827",
  editAvatarBorder: "#151C2B",
  imagePlaceholder: "#1E293B",
  cardElevated: "#1A2234",
  skeleton: "#1E293B",
  skeletonHighlight: "rgba(255,255,255,0.08)",
  dangerSoft: "#3F1D24",
  dangerText: "#FCA5A5",
  successText: "#34D399",
  accentSoft: "#1A2234",
  inverseSurface: "#243044",
  onInverseSurface: "#F3F4F6",
  mutedOnInverse: "#94A3B8",
  bottomBar: "#151C2B",
  bottomBarBorder: "#374151",
};

export const THEME_STORAGE_KEY = "odos_dark_mode";
