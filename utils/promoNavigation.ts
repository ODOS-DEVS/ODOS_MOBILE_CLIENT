import type { PromoBannerItem } from "@/hooks/usePromoBanners";
import { router } from "expo-router";
import { Linking } from "react-native";

type PromoNavigationInput = Pick<
  PromoBannerItem,
  "linkType" | "ctaLink" | "campaignTag" | "title" | "subtitle"
>;

function inferLinkTypeFromLegacyLink(link?: string | null): string {
  const trimmed = link?.trim().toLowerCase() ?? "";
  if (!trimmed) return "deals";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return "external";
  if (trimmed.includes("flash")) return "flash_sales";
  if (trimmed.includes("popular")) return "popular";
  if (trimmed.includes("voucher")) return "vouchers";
  if (trimmed.includes("deals")) return "deals";
  if (trimmed.includes("search")) return "search";
  if (trimmed.includes("categories/")) return "category";
  if (trimmed.includes("productdetails/")) return "product";
  if (trimmed.includes("stores/")) return "store";
  return "screen";
}

export function extractPromoDiscountPercent(
  banner: PromoNavigationInput,
): number | undefined {
  if (banner.linkType === "discounted_products") {
    const parsed = Number.parseInt(banner.ctaLink?.trim() ?? "", 10);
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 90) {
      return parsed;
    }
  }

  const text = `${banner.title ?? ""} ${banner.subtitle ?? ""}`;
  const match = text.match(/(\d{1,2})\s*(?:%|percent|pct)/i);
  if (!match) {
    return undefined;
  }

  const parsed = Number.parseInt(match[1], 10);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 90) {
    return undefined;
  }
  return parsed;
}

export function navigateToPromoDealBrowse(banner: PromoNavigationInput) {
  const minDiscount = extractPromoDiscountPercent(banner);
  const campaign = banner.campaignTag?.trim() || "";

  router.push({
    pathname: "/(root)/screens/promo-deals",
    params: {
      title: banner.title?.trim() || "Deals for you",
      subtitle: banner.subtitle?.trim() || "",
      minDiscount: minDiscount ? String(minDiscount) : "",
      campaign,
    },
  } as never);
}

export function navigateToMerchandisingCampaign(slug: string, fallbackTitle?: string) {
  const cleaned = slug.trim();
  if (!cleaned) {
    router.push("../screens/deals" as never);
    return;
  }

  router.push({
    pathname: "/(root)/screens/campaigns/[slug]",
    params: {
      slug: cleaned,
      title: fallbackTitle?.trim() || cleaned,
    },
  } as never);
}

export function navigateFromPromoBanner(
  banner: PromoNavigationInput,
  fallback?: () => void,
) {
  const rawLinkType = banner.linkType?.trim() || "deals";
  const target = banner.ctaLink?.trim() || "";
  const campaignTag = banner.campaignTag?.trim() || "";
  const linkType =
    rawLinkType === "screen" && target
      ? inferLinkTypeFromLegacyLink(target)
      : rawLinkType;
  const inferredDiscount = extractPromoDiscountPercent(banner);

  switch (linkType) {
    case "discounted_products":
      navigateToPromoDealBrowse(banner);
      return;
    case "merchandising_campaign":
      navigateToMerchandisingCampaign(
        target || campaignTag,
        banner.title?.trim() || undefined,
      );
      return;
    case "campaign": {
      const campaignSlug = campaignTag || target;
      if (campaignSlug) {
        navigateToMerchandisingCampaign(campaignSlug, banner.title?.trim() || undefined);
        return;
      }
      navigateToPromoDealBrowse(banner);
      return;
    }
    case "deals":
      if (inferredDiscount || campaignTag) {
        navigateToPromoDealBrowse(banner);
        return;
      }
      router.push("../screens/deals" as never);
      return;
    case "flash_sales":
      router.push("../screens/flash-sales" as never);
      return;
    case "popular":
      router.push("../screens/popular" as never);
      return;
    case "vouchers":
      router.push("../screens/profileScreens/Account/Vouchers" as never);
      return;
    case "search":
      router.push({
        pathname: "../screens/search",
        params: target ? { q: target } : {},
      } as never);
      return;
    case "category":
      if (target) {
        router.push(`../screens/categories/${target}` as never);
        return;
      }
      break;
    case "product":
      if (target) {
        router.push({
          pathname: "/(root)/screens/[id]" as never,
          params: { id: target },
        });
        return;
      }
      break;
    case "store":
      if (target) {
        router.push(`../screens/stores/${target}` as never);
        return;
      }
      break;
    case "external":
      if (target) {
        void Linking.openURL(target);
        return;
      }
      break;
    case "screen":
    default:
      navigateFromPromoLink(target || banner.ctaLink, fallback);
      return;
  }

  fallback?.();
}

export function navigateFromPromoLink(
  link?: string | null,
  fallback?: () => void,
) {
  const trimmed = link?.trim();
  if (!trimmed) {
    fallback?.();
    return;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    void Linking.openURL(trimmed);
    return;
  }

  if (trimmed.startsWith("/")) {
    router.push(trimmed as never);
    return;
  }

  router.push(`../screens/${trimmed}` as never);
}

export function navigateToCampaignDeals(campaignTag: string, label?: string) {
  const cleaned = campaignTag.trim();
  if (cleaned) {
    navigateToMerchandisingCampaign(cleaned, label);
    return;
  }
  navigateToPromoDealBrowse({
    title: label ?? "Campaign deals",
    subtitle: "Vendor-priced offers opted into this campaign",
    linkType: "campaign",
    campaignTag,
    ctaLink: null,
  });
}
