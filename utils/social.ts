export type StoreSocialLinks = {
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  twitterUrl?: string | null;
  whatsappUrl?: string | null;
  websiteUrl?: string | null;
};

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "twitter"
  | "whatsapp"
  | "website";

export type SocialLinkItem = {
  platform: SocialPlatform;
  label: string;
  url: string;
  icon:
    | "logo-instagram"
    | "logo-facebook"
    | "logo-tiktok"
    | "logo-twitter"
    | "logo-whatsapp"
    | "globe-outline";
};

const HANDLE_PATTERN = /^@?[A-Za-z0-9._-]{2,64}$/;

function stripInput(value?: string | null) {
  return value?.trim() ?? "";
}

function hasProtocol(value: string) {
  return /^https?:\/\//i.test(value);
}

function normalizeWebsite(value: string) {
  if (!value) {
    return null;
  }

  const trimmed = value.replace(/\s+/g, "");
  if (!trimmed) {
    return null;
  }

  if (hasProtocol(trimmed)) {
    return trimmed;
  }

  if (trimmed.includes(".") && !trimmed.includes(" ")) {
    return `https://${trimmed.replace(/^www\./i, "www.")}`;
  }

  return null;
}

function normalizeHandleUrl(
  value: string,
  host: string,
  pathPrefix = "",
): string | null {
  if (!value) {
    return null;
  }

  let trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (hasProtocol(trimmed)) {
    return trimmed;
  }

  trimmed = trimmed.replace(/^@/, "");

  try {
    const asUrl = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (asUrl.hostname.includes(host.replace("www.", ""))) {
      return asUrl.toString();
    }
  } catch {
    // Fall through to handle parsing.
  }

  if (HANDLE_PATTERN.test(trimmed)) {
    return `https://${host}${pathPrefix}${trimmed}`;
  }

  if (trimmed.includes(host) || trimmed.includes("/")) {
    return normalizeWebsite(trimmed);
  }

  return null;
}

function normalizeWhatsapp(value: string) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (hasProtocol(trimmed)) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 9) {
    const normalizedDigits = digits.startsWith("233")
      ? digits
      : digits.startsWith("0")
        ? `233${digits.slice(1)}`
        : `233${digits}`;
    return `https://wa.me/${normalizedDigits}`;
  }

  return normalizeHandleUrl(trimmed, "wa.me", "/");
}

export function normalizeStoreSocialLinks(
  input: StoreSocialLinks,
): StoreSocialLinks {
  return {
    instagramUrl: normalizeHandleUrl(stripInput(input.instagramUrl), "instagram.com", "/"),
    facebookUrl: normalizeHandleUrl(stripInput(input.facebookUrl), "facebook.com", "/"),
    tiktokUrl: normalizeHandleUrl(stripInput(input.tiktokUrl), "tiktok.com", "/@"),
    twitterUrl:
      normalizeHandleUrl(stripInput(input.twitterUrl), "x.com", "/") ??
      normalizeHandleUrl(stripInput(input.twitterUrl), "twitter.com", "/"),
    whatsappUrl: normalizeWhatsapp(stripInput(input.whatsappUrl)),
    websiteUrl: normalizeWebsite(stripInput(input.websiteUrl)),
  };
}

export function listStoreSocialLinks(links: StoreSocialLinks): SocialLinkItem[] {
  const normalized = normalizeStoreSocialLinks(links);
  const items: SocialLinkItem[] = [];

  if (normalized.instagramUrl) {
    items.push({
      platform: "instagram",
      label: "Instagram",
      url: normalized.instagramUrl,
      icon: "logo-instagram",
    });
  }
  if (normalized.facebookUrl) {
    items.push({
      platform: "facebook",
      label: "Facebook",
      url: normalized.facebookUrl,
      icon: "logo-facebook",
    });
  }
  if (normalized.tiktokUrl) {
    items.push({
      platform: "tiktok",
      label: "TikTok",
      url: normalized.tiktokUrl,
      icon: "logo-tiktok",
    });
  }
  if (normalized.twitterUrl) {
    items.push({
      platform: "twitter",
      label: "X",
      url: normalized.twitterUrl,
      icon: "logo-twitter",
    });
  }
  if (normalized.whatsappUrl) {
    items.push({
      platform: "whatsapp",
      label: "WhatsApp",
      url: normalized.whatsappUrl,
      icon: "logo-whatsapp",
    });
  }
  if (normalized.websiteUrl) {
    items.push({
      platform: "website",
      label: "Website",
      url: normalized.websiteUrl,
      icon: "globe-outline",
    });
  }

  return items;
}

export function hasStoreSocialLinks(links: StoreSocialLinks) {
  return listStoreSocialLinks(links).length > 0;
}
