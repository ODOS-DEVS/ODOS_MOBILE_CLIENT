import { router } from "expo-router";
import { Linking } from "react-native";

import type { PromoBannerItem } from "@/hooks/usePromoBanners";

type PromoNavigationInput = Pick<
  PromoBannerItem,
  "linkType" | "ctaLink" | "campaignTag"
>;

function inferLinkTypeFromLegacyLink(link?: string | null): string {
  const trimmed = link?.trim().toLowerCase() ?? "";
  if (!trimmed) return "deals";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return "external";
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

export function navigateFromPromoBanner(
  banner: PromoNavigationInput,
  fallback?: () => void,
) {
  const rawLinkType = banner.linkType?.trim() || "deals";
  const target = banner.ctaLink?.trim() || "";
  const campaignTag = banner.campaignTag?.trim() || target;
  const linkType =
    rawLinkType === "screen" && target ? inferLinkTypeFromLegacyLink(target) : rawLinkType;

  switch (linkType) {
    case "deals":
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
        router.push(`../screens/productDetails/${target}` as never);
        return;
      }
      break;
    case "store":
      if (target) {
        router.push(`../screens/stores/${target}` as never);
        return;
      }
      break;
    case "campaign":
      router.push({
        pathname: "../screens/deals",
        params: campaignTag ? { campaign: campaignTag } : {},
      } as never);
      return;
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

export function navigateFromPromoLink(link?: string | null, fallback?: () => void) {
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
