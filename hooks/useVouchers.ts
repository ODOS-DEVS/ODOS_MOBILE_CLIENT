import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

export type VoucherStatus = "active" | "used" | "expired";
export type VoucherScope = "odos" | "store" | "category" | "product";
export type VoucherAvailability = "auto" | "claim" | "assigned" | "private";

export type VoucherWalletItem = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  issuerName?: string | null;
  scope: VoucherScope;
  availability: VoucherAvailability;
  storeId?: string | null;
  storeName?: string | null;
  rewardText: string;
  minSubtotal: number;
  expiresAt?: string | null;
  status: VoucherStatus;
  source?: string | null;
};

export type StoreVoucherOffer = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  issuerName?: string | null;
  scope: VoucherScope;
  availability: VoucherAvailability;
  storeId?: string | null;
  storeName?: string | null;
  rewardText: string;
  minSubtotal: number;
  expiresAt?: string | null;
  claimed: boolean;
  campaignTag?: string | null;
  discountType?: string | null;
  approvalStatus?: string | null;
};

export type VoucherPreview = {
  voucherId: string;
  code: string;
  title: string;
  issuerName?: string | null;
  scope: VoucherScope;
  availability: VoucherAvailability;
  storeId?: string | null;
  storeName?: string | null;
  rewardText: string;
  discountAmount: number;
  eligibleSubtotalAmount: number;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
};

export type PromotionCalculation = {
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  eligibleSubtotalAmount: number;
  appliedPromotions: Array<{
    voucherId: string;
    code: string;
    title: string;
    discountAmount: number;
  }>;
};

type VoucherWalletApiItem = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  issuer_name?: string | null;
  scope: VoucherScope;
  availability: VoucherAvailability;
  store_id?: string | null;
  store_name?: string | null;
  reward_text: string;
  min_subtotal: number;
  expires_at?: string | null;
  status: VoucherStatus;
  source?: string | null;
};

type StoreVoucherApiItem = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  issuer_name?: string | null;
  scope: VoucherScope;
  availability: VoucherAvailability;
  store_id?: string | null;
  store_name?: string | null;
  reward_text: string;
  min_subtotal: number;
  expires_at?: string | null;
  claimed: boolean;
  campaign_tag?: string | null;
  discount_type?: string | null;
  approval_status?: string | null;
};

type VoucherPreviewApiItem = {
  voucher_id: string;
  code: string;
  title: string;
  issuer_name?: string | null;
  scope: VoucherScope;
  availability: VoucherAvailability;
  store_id?: string | null;
  store_name?: string | null;
  reward_text: string;
  discount_amount: number;
  eligible_subtotal_amount: number;
  subtotal_amount: number;
  shipping_amount: number;
  total_amount: number;
};

type VoucherPreviewItemPayload = {
  product_id: string;
  title: string;
  category?: string | null;
  image_url?: string | null;
  image_key?: string | null;
  quantity: number;
  unit_price: number;
  selected_color?: string | null;
  selected_size?: string | null;
};

function normalizeErrorMessage(detail: unknown) {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return "We couldn't complete that request right now.";
}

async function parseErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    return normalizeErrorMessage(payload?.detail);
  } catch {
    return normalizeErrorMessage(response.statusText);
  }
}

async function getStoredAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
}

async function getAccessToken(currentToken: string | null) {
  return currentToken || (await getStoredAccessToken());
}

function mapWalletItem(item: VoucherWalletApiItem): VoucherWalletItem {
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
    status: item.status,
    source: item.source ?? undefined,
  };
}

function mapStoreVoucher(item: StoreVoucherApiItem): StoreVoucherOffer {
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
    campaignTag: item.campaign_tag ?? undefined,
    discountType: item.discount_type ?? undefined,
    approvalStatus: item.approval_status ?? undefined,
  };
}

function mapVoucherPreview(item: VoucherPreviewApiItem): VoucherPreview {
  return {
    voucherId: item.voucher_id,
    code: item.code,
    title: item.title,
    issuerName: item.issuer_name ?? undefined,
    scope: item.scope,
    availability: item.availability,
    storeId: item.store_id ?? undefined,
    storeName: item.store_name ?? undefined,
    rewardText: item.reward_text,
    discountAmount: item.discount_amount,
    eligibleSubtotalAmount: item.eligible_subtotal_amount,
    subtotalAmount: item.subtotal_amount,
    shippingAmount: item.shipping_amount,
    totalAmount: item.total_amount,
  };
}

export function useVouchers() {
  const { user, accessToken } = useAuth();
  const [vouchers, setVouchers] = useState<VoucherWalletItem[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(true);

  const refreshVouchers = useCallback(async () => {
    if (!user) {
      setVouchers([]);
      setIsLoadingVouchers(false);
      return;
    }

    const token = await getAccessToken(accessToken);
    if (!token) {
      setVouchers([]);
      setIsLoadingVouchers(false);
      return;
    }

    setIsLoadingVouchers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const payload = (await response.json()) as VoucherWalletApiItem[];
      setVouchers(payload.map(mapWalletItem));
    } catch {
      setVouchers([]);
    } finally {
      setIsLoadingVouchers(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    void refreshVouchers();
  }, [refreshVouchers]);

  const previewVoucher = useCallback(
    async (input: {
      voucherCode: string;
      items: VoucherPreviewItemPayload[];
      shippingAmount?: number;
    }) => {
      const token = await getAccessToken(accessToken);
      if (!token) {
        throw new Error("Sign in to use a voucher.");
      }

      const response = await fetch(`${API_BASE_URL}/vouchers/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          voucher_code: input.voucherCode.trim().toUpperCase(),
          items: input.items,
          shipping_amount: input.shippingAmount ?? 0,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      return mapVoucherPreview((await response.json()) as VoucherPreviewApiItem);
    },
    [accessToken],
  );

  const suggestVouchers = useCallback(
    async (input: {
      items: VoucherPreviewItemPayload[];
      shippingAmount?: number;
    }) => {
      const token = await getAccessToken(accessToken);
      if (!token) {
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/vouchers/suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: input.items,
          shipping_amount: input.shippingAmount ?? 0,
        }),
      });

      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as VoucherPreviewApiItem[];
      return payload.map(mapVoucherPreview);
    },
    [accessToken],
  );

  const fetchStoreVouchers = useCallback(async (storeId: string) => {
    const response = await fetch(`${API_BASE_URL}/vouchers/stores/${encodeURIComponent(storeId)}`);
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }
    const payload = (await response.json()) as StoreVoucherApiItem[];
    return payload.map(mapStoreVoucher);
  }, []);

  const calculatePromotions = useCallback(
    async (input: {
      items: VoucherPreviewItemPayload[];
      shippingAmount?: number;
      voucherCode?: string | null;
      includeAutoApply?: boolean;
    }) => {
      const token = await getAccessToken(accessToken);
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/vouchers/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: input.items,
          shipping_amount: input.shippingAmount ?? 0,
          voucher_code: input.voucherCode ?? null,
          include_auto_apply: input.includeAutoApply ?? true,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        subtotal_amount: number;
        shipping_amount: number;
        discount_amount: number;
        total_amount: number;
        eligible_subtotal_amount: number;
        applied_promotions: Array<{
          voucher_id: string;
          code: string;
          title: string;
          discount_amount: number;
        }>;
      };

      return {
        subtotalAmount: payload.subtotal_amount,
        shippingAmount: payload.shipping_amount,
        discountAmount: payload.discount_amount,
        totalAmount: payload.total_amount,
        eligibleSubtotalAmount: payload.eligible_subtotal_amount,
        appliedPromotions: payload.applied_promotions.map((item) => ({
          voucherId: item.voucher_id,
          code: item.code,
          title: item.title,
          discountAmount: item.discount_amount,
        })),
      } satisfies PromotionCalculation;
    },
    [accessToken],
  );

  const claimVoucher = useCallback(
    async (voucherId: string) => {
      const token = await getAccessToken(accessToken);
      if (!token) {
        throw new Error("Sign in to save this promotion.");
      }

      const response = await fetch(`${API_BASE_URL}/vouchers/${encodeURIComponent(voucherId)}/claim`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const walletItem = mapWalletItem((await response.json()) as VoucherWalletApiItem);
      setVouchers((current) => {
        const exists = current.some((item) => item.id === walletItem.id);
        if (exists) {
          return current.map((item) => (item.id === walletItem.id ? walletItem : item));
        }
        return [walletItem, ...current];
      });
      return walletItem;
    },
    [accessToken],
  );

  return {
    vouchers,
    isLoadingVouchers,
    refreshVouchers,
    previewVoucher,
    suggestVouchers,
    fetchStoreVouchers,
    calculatePromotions,
    claimVoucher,
  };
}
