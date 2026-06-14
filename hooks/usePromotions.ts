import { API_BASE_URL } from "@/constants/auth";
import type { StoreVoucherOffer } from "@/hooks/useVouchers";
import { useCallback, useEffect, useState } from "react";

type PromotionApiItem = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  issuer_name?: string | null;
  scope: "odos" | "store";
  availability: "auto" | "claim" | "assigned";
  store_id?: string | null;
  store_name?: string | null;
  reward_text: string;
  min_subtotal: number;
  expires_at?: string | null;
  claimed: boolean;
};

function mapPromotion(item: PromotionApiItem): StoreVoucherOffer {
  return {
    id: item.id,
    code: item.code,
    title: item.title,
    description: item.description ?? undefined,
    issuerName: item.issuer_name ?? undefined,
    scope: item.scope,
    availability: item.availability,
    storeId: item.store_id ?? undefined,
    storeName: item.store_name ?? undefined,
    rewardText: item.reward_text,
    minSubtotal: item.min_subtotal,
    expiresAt: item.expires_at ?? undefined,
    claimed: item.claimed,
  };
}

export function usePromotions() {
  const [promotions, setPromotions] = useState<StoreVoucherOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/promotions`);
      if (!response.ok) {
        throw new Error("Unable to load promotions right now.");
      }

      const payload = (await response.json()) as PromotionApiItem[];
      setPromotions(payload.map(mapPromotion));
    } catch (loadError) {
      setPromotions([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load promotions right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    promotions,
    isLoading,
    error,
    refresh,
  };
}
