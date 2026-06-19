import { API_BASE_URL } from "@/constants/auth";
import { useCallback, useEffect, useState } from "react";

export type PromoBannerItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaLabel: string;
  ctaLink?: string | null;
  imageUrl?: string | null;
  accent?: "gold" | "default" | "teal" | null;
  sortOrder: number;
  campaignTag?: string | null;
  linkType?: string | null;
  placement?: string | null;
};

type PromoBannerApiItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  cta_label: string;
  cta_link?: string | null;
  image_url?: string | null;
  accent?: string | null;
  sort_order: number;
  campaign_tag?: string | null;
  link_type?: string | null;
  placement?: string | null;
};

function mapPromoBanner(item: PromoBannerApiItem): PromoBannerItem {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle ?? undefined,
    ctaLabel: item.cta_label,
    ctaLink: item.cta_link ?? undefined,
    imageUrl: item.image_url ?? undefined,
    accent: (item.accent as PromoBannerItem["accent"]) ?? undefined,
    sortOrder: item.sort_order,
    campaignTag: item.campaign_tag ?? undefined,
    linkType: item.link_type ?? undefined,
    placement: item.placement ?? undefined,
  };
}

export function usePromoBanners(placement = "home") {
  const [banners, setBanners] = useState<PromoBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/catalog/promo-banners?placement=${encodeURIComponent(placement)}`,
      );
      if (!response.ok) {
        throw new Error("Unable to load promo banners.");
      }

      const payload = (await response.json()) as PromoBannerApiItem[];
      setBanners(payload.map(mapPromoBanner));
    } catch (loadError) {
      setBanners([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load promo banners.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [placement]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    banners,
    isLoading,
    error,
    refresh,
  };
}
