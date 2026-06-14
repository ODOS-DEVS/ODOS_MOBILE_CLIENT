import { API_BASE_URL } from "@/constants/auth";
import { useCallback, useEffect, useState } from "react";

export type FlashSaleEventItem = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  startsAt?: string | null;
  endsAt: string;
  sortOrder: number;
  productCount: number;
  secondsRemaining: number;
};

type FlashSaleEventApiItem = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  starts_at?: string | null;
  ends_at: string;
  sort_order: number;
  product_count: number;
  seconds_remaining: number;
};

function mapFlashSaleEvent(item: FlashSaleEventApiItem): FlashSaleEventItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle ?? undefined,
    imageUrl: item.image_url ?? undefined,
    startsAt: item.starts_at ?? undefined,
    endsAt: item.ends_at,
    sortOrder: item.sort_order,
    productCount: item.product_count,
    secondsRemaining: item.seconds_remaining,
  };
}

export function useFlashSaleEvents() {
  const [events, setEvents] = useState<FlashSaleEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/catalog/flash-sale-events/active`);
      if (!response.ok) {
        throw new Error("Unable to load flash sale events.");
      }

      const payload = (await response.json()) as FlashSaleEventApiItem[];
      setEvents(payload.map(mapFlashSaleEvent));
    } catch (loadError) {
      setEvents([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load flash sale events.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const primaryEvent = events[0] ?? null;

  return {
    events,
    primaryEvent,
    isLoading,
    error,
    refresh,
  };
}
