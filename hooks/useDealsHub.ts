import { API_BASE_URL } from "@/constants/auth";
import { mapProduct, type ProductApiItem } from "@/hooks/useCatalog";
import type { PromoBannerItem } from "@/hooks/usePromoBanners";
import type { StoreVoucherOffer } from "@/hooks/useVouchers";
import type { FlashSaleEventItem } from "@/hooks/useFlashSaleEvents";
import { dedupeProductsById, isDealProduct } from "@/utils/deals";
import { buildCatalogProductsUrl } from "@/utils/fetchCache";
import { useCallback, useEffect, useState } from "react";

export type DealsHubSection = {
  key: string;
  title: string;
  subtitle?: string | null;
  kind: string;
  count?: number | null;
  badge?: string | null;
};

export type DealsHubCampaignTag = {
  tag: string;
  label: string;
};

export type DealsHubPayload = {
  banners: PromoBannerItem[];
  flashEvents: FlashSaleEventItem[];
  promotions: StoreVoucherOffer[];
  dealProducts: ReturnType<typeof mapProduct>[];
  sections: DealsHubSection[];
  campaignTags: DealsHubCampaignTag[];
};

function mapBanner(item: Record<string, unknown>): PromoBannerItem {
  return {
    id: String(item.id),
    title: String(item.title),
    subtitle: (item.subtitle as string | null) ?? undefined,
    ctaLabel: String(item.cta_label ?? "Browse deals"),
    ctaLink: (item.cta_link as string | null) ?? undefined,
    imageUrl: (item.image_url as string | null) ?? undefined,
    accent: (item.accent as PromoBannerItem["accent"]) ?? undefined,
    sortOrder: Number(item.sort_order ?? 0),
    campaignTag: (item.campaign_tag as string | null) ?? undefined,
    linkType: (item.link_type as string | null) ?? undefined,
  };
}

function mapPromotion(item: Record<string, unknown>): StoreVoucherOffer {
  return {
    id: String(item.id),
    code: String(item.code),
    title: String(item.title),
    description: (item.description as string | null) ?? undefined,
    issuerName: (item.issuer_name as string | null) ?? undefined,
    scope: item.scope as StoreVoucherOffer["scope"],
    availability: item.availability as StoreVoucherOffer["availability"],
    storeId: (item.store_id as string | null) ?? undefined,
    storeName: (item.store_name as string | null) ?? undefined,
    rewardText: String(item.reward_text),
    minSubtotal: Number(item.min_subtotal ?? 0),
    expiresAt: (item.expires_at as string | null) ?? undefined,
    claimed: Boolean(item.claimed),
    campaignTag: (item.campaign_tag as string | null) ?? undefined,
    discountType: (item.discount_type as string | null) ?? undefined,
    approvalStatus: (item.approval_status as string | null) ?? undefined,
  };
}

function mapFlashEvent(item: Record<string, unknown>): FlashSaleEventItem {
  return {
    id: String(item.id),
    slug: String(item.slug),
    title: String(item.title),
    subtitle: (item.subtitle as string | null) ?? undefined,
    imageUrl: (item.image_url as string | null) ?? undefined,
    endsAt: String(item.ends_at),
    startsAt: (item.starts_at as string | null) ?? undefined,
    sortOrder: Number(item.sort_order ?? 0),
    productCount: Number(item.product_count ?? 0),
    secondsRemaining: Number(item.seconds_remaining ?? 0),
  };
}

function mapDealsHubPayload(payload: Record<string, unknown>): DealsHubPayload {
  return {
    banners: Array.isArray(payload.banners)
      ? payload.banners.map((item) => mapBanner(item as Record<string, unknown>))
      : [],
    flashEvents: Array.isArray(payload.flash_events)
      ? payload.flash_events.map((item) => mapFlashEvent(item as Record<string, unknown>))
      : [],
    promotions: Array.isArray(payload.promotions)
      ? payload.promotions.map((item) => mapPromotion(item as Record<string, unknown>))
      : [],
    dealProducts: Array.isArray(payload.deal_products)
      ? payload.deal_products.map((item) => mapProduct(item as ProductApiItem))
      : [],
    sections: Array.isArray(payload.sections)
      ? payload.sections.map((item) => {
          const section = item as Record<string, unknown>;
          return {
            key: String(section.key),
            title: String(section.title),
            subtitle: (section.subtitle as string | null) ?? undefined,
            kind: String(section.kind),
            count: (section.count as number | null) ?? undefined,
            badge: (section.badge as string | null) ?? undefined,
          };
        })
      : [],
    campaignTags: Array.isArray(payload.campaign_tags)
      ? payload.campaign_tags.map((item) => {
          const tag = item as Record<string, unknown>;
          return { tag: String(tag.tag), label: String(tag.label) };
        })
      : [],
  };
}

function buildFallbackSections(
  banners: PromoBannerItem[],
  flashEvents: FlashSaleEventItem[],
  promotions: StoreVoucherOffer[],
  dealProducts: ReturnType<typeof mapProduct>[],
): DealsHubSection[] {
  const sections: DealsHubSection[] = [];

  if (banners.length > 0) {
    sections.push({
      key: "campaigns",
      title: "Campaigns",
      subtitle: "Seasonal offers and curated ODOS campaigns",
      kind: "banners",
    });
  }

  if (flashEvents.length > 0) {
    sections.push({
      key: "flash-sales",
      title: flashEvents[0].title,
      subtitle: flashEvents[0].subtitle ?? "Limited-time savings",
      kind: "flash_sales",
      badge: "Live now",
    });
  }

  if (promotions.length > 0) {
    sections.push({
      key: "promo-codes",
      title: "Promo codes",
      subtitle: "Save codes to your wallet and use them at checkout",
      kind: "vouchers",
      count: promotions.length,
    });
  }

  if (dealProducts.length > 0) {
    sections.push({
      key: "todays-deals",
      title: "Today's deals",
      subtitle: "Products with active sale pricing",
      kind: "products",
      count: dealProducts.length,
    });
  }

  return sections;
}

async function fetchDealsHubFallback(): Promise<DealsHubPayload> {
  const [bannersRes, flashRes, promosRes, flashProductsRes, popularProductsRes] =
    await Promise.all([
      fetch(`${API_BASE_URL}/catalog/promo-banners`),
      fetch(`${API_BASE_URL}/catalog/flash-sale-events/active`),
      fetch(`${API_BASE_URL}/vouchers/promotions`),
      fetch(buildCatalogProductsUrl({ placement: "flash-sale" })),
      fetch(buildCatalogProductsUrl({ section: "popular" })),
    ]);

  const banners = bannersRes.ok
    ? ((await bannersRes.json()) as Record<string, unknown>[]).map(mapBanner)
    : [];
  const flashEvents = flashRes.ok
    ? ((await flashRes.json()) as Record<string, unknown>[]).map(mapFlashEvent)
    : [];
  const promotions = promosRes.ok
    ? ((await promosRes.json()) as Record<string, unknown>[]).map(mapPromotion)
    : [];

  const productPayloads: ProductApiItem[] = [];
  if (flashProductsRes.ok) {
    productPayloads.push(...((await flashProductsRes.json()) as ProductApiItem[]));
  }
  if (popularProductsRes.ok) {
    productPayloads.push(...((await popularProductsRes.json()) as ProductApiItem[]));
  }

  const dealProducts = dedupeProductsById(
    productPayloads.map(mapProduct).filter(isDealProduct),
  ).slice(0, 24);

  if (
    banners.length === 0 &&
    flashEvents.length === 0 &&
    promotions.length === 0 &&
    dealProducts.length === 0
  ) {
    throw new Error("Unable to load deals right now.");
  }

  return {
    banners,
    flashEvents,
    promotions,
    dealProducts,
    sections: buildFallbackSections(banners, flashEvents, promotions, dealProducts),
    campaignTags: [],
  };
}

export function useDealsHub() {
  const [data, setData] = useState<DealsHubPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/catalog/deals-hub`);
      if (response.ok) {
        setData(mapDealsHubPayload((await response.json()) as Record<string, unknown>));
        return;
      }

      setData(await fetchDealsHubFallback());
    } catch (loadError) {
      try {
        setData(await fetchDealsHubFallback());
      } catch (fallbackError) {
        setData(null);
        setError(
          fallbackError instanceof Error
            ? fallbackError.message
            : loadError instanceof Error
              ? loadError.message
              : "Unable to load deals right now.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
