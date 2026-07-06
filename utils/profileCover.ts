export type ProfileCoverVariant = "male" | "female" | "neutral";

export function resolveProfileCoverVariant(
  gender?: string | null,
): ProfileCoverVariant {
  const normalized = gender?.trim().toLowerCase();

  if (normalized === "male") {
    return "male";
  }

  if (normalized === "female") {
    return "female";
  }

  return "neutral";
}

export type ProfileCoverPalette = {
  gradient: readonly [string, string, string];
  accent: string;
  watermark: string;
  avatarBackground: string;
  avatarBorder: string;
  avatarIcon: string;
};

const COVER_PALETTES: Record<ProfileCoverVariant, ProfileCoverPalette> = {
  male: {
    gradient: ["#1E3A5F", "#2F5F8F", "#4A7BA7"],
    accent: "rgba(255, 255, 255, 0.14)",
    watermark: "rgba(255, 255, 255, 0.08)",
    avatarBackground: "#E8EEF4",
    avatarBorder: "#FFFFFF",
    avatarIcon: "#6B7C8F",
  },
  female: {
    gradient: ["#4A2C4E", "#7A4A72", "#A66B8A"],
    accent: "rgba(255, 255, 255, 0.14)",
    watermark: "rgba(255, 255, 255, 0.08)",
    avatarBackground: "#F2E9EE",
    avatarBorder: "#FFFFFF",
    avatarIcon: "#8A6B7A",
  },
  neutral: {
    gradient: ["#2A3440", "#3D4A57", "#566674"],
    accent: "rgba(255, 255, 255, 0.12)",
    watermark: "rgba(255, 255, 255, 0.07)",
    avatarBackground: "#ECEFF3",
    avatarBorder: "#FFFFFF",
    avatarIcon: "#7A8491",
  },
};

export function getProfileCoverPalette(
  gender?: string | null,
): ProfileCoverPalette {
  return COVER_PALETTES[resolveProfileCoverVariant(gender)];
}
