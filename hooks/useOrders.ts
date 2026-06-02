import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { enrichOrderWithProductImages, enrichOrdersWithProductImages } from "@/utils/orderImages";
import { useAuth } from "@/context/AuthContext";
import { useRealtime } from "@/context/RealtimeContext";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";

export type OrderItemPayload = {
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

export type OrderPayload = {
  source: "buy_now" | "cart";
  items: OrderItemPayload[];
  subtotal_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  voucher_code?: string | null;
  address_full_name: string;
  address_phone: string;
  address_street: string;
  address_city: string;
  address_region: string;
  payment_type: string;
  payment_label: string;
  payment_network?: string | null;
  payment_phone?: string | null;
  payment_last4?: string | null;
};

export type CheckoutSessionPayload = OrderPayload & {
  callback_url?: string | null;
  cancel_url?: string | null;
};

export type WalletCheckoutPayload = OrderPayload;

export type OrderItem = {
  id: string;
  product_id: string;
  title: string;
  category: string | null;
  image_url: string | null;
  image_key: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  is_returnable: boolean;
  selected_color: string | null;
  selected_size: string | null;
  created_at: string;
};

export type ReturnRequest = {
  id: string;
  order_id: string;
  order_item_id: string;
  user_id: string;
  request_type: "refund" | "exchange" | "return" | string;
  status:
    | "requested"
    | "under_review"
    | "approved"
    | "rejected"
    | "refunded"
    | "exchanged"
    | string;
  quantity: number;
  reason: string;
  details: string | null;
  evidence_image_urls: string[] | null;
  admin_note: string | null;
  refund_amount: number | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReturnRequestPayload = {
  order_item_id: string;
  request_type: "refund" | "exchange" | "return";
  quantity: number;
  reason: string;
  details?: string | null;
  evidence_images?: string[] | null;
};

export type Order = {
  id: string;
  order_number: string;
  source: "buy_now" | "cart";
  status: "pending_payment" | "processing" | "delivered" | "cancelled" | string;
  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "cancelled"
    | "refunded"
    | "partially_refunded"
    | string;
  payment_provider: string;
  payment_reference: string | null;
  subtotal_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  progress: number | null;
  tracking_eta: string | null;
  cancellation_reason: string | null;
  address_full_name: string;
  address_phone: string;
  address_street: string;
  address_city: string;
  address_region: string;
  payment_type: string;
  payment_label: string;
  payment_network: string | null;
  payment_phone: string | null;
  payment_last4: string | null;
  voucher_code: string | null;
  voucher_title: string | null;
  placed_at: string;
  paid_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  return_requests: ReturnRequest[];
};

export type CheckoutSession = {
  order_id: string;
  order_number: string;
  reference: string;
  authorization_url: string;
  access_code: string;
  amount: number;
  currency: string;
  payment_status: string;
};

export type PaymentVerification = {
  order: Order;
  reference: string;
  payment_status: string;
  provider_status: string;
  paid_at: string | null;
  verified_at: string | null;
  message: string;
};

export type WalletTransaction = {
  id: string;
  kind: string;
  title: string;
  amount: number;
  balance_after: number;
  order_id: string | null;
  topup_id: string | null;
  created_at: string;
};

export type CustomerWallet = {
  id: string;
  user_id: string;
  currency: string;
  available_balance: number;
  lifetime_topups: number;
  lifetime_spend: number;
  lifetime_refunds: number;
  recent_transactions: WalletTransaction[];
};

export type WalletTopUpSession = {
  reference: string;
  authorization_url: string;
  access_code: string;
  amount: number;
  currency: string;
  status: string;
};

export type WalletTopupVerification = {
  reference: string;
  status: "paid" | "pending" | "cancelled" | "failed" | string;
  message: string;
  wallet: CustomerWallet;
};

export type WalletCheckoutResult = {
  order: Order;
  wallet_balance_after: number;
  message: string;
};

async function getStoredAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
}

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

export async function createOrderRequest(accessToken: string, payload: OrderPayload) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as Order;
}

export async function createCheckoutSessionRequest(
  accessToken: string,
  payload: CheckoutSessionPayload,
) {
  const response = await fetch(`${API_BASE_URL}/payments/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CheckoutSession;
}

export async function verifyCheckoutSessionRequest(
  accessToken: string,
  reference: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/payments/checkout/${encodeURIComponent(reference)}/verify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as PaymentVerification;
}

export async function fetchCustomerWalletRequest(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/wallet/customer`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as CustomerWallet;
}

export async function createWalletTopupSessionRequest(
  accessToken: string,
  payload: {
    amount: number;
    payment_type?: "card" | "momo";
    payment_label?: string | null;
    payment_network?: string | null;
    payment_phone?: string | null;
    payment_last4?: string | null;
    callback_url?: string | null;
    cancel_url?: string | null;
  },
) {
  const response = await fetch(`${API_BASE_URL}/wallet/customer/topups/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as WalletTopUpSession;
}

export async function verifyWalletTopupRequest(accessToken: string, reference: string) {
  const response = await fetch(
    `${API_BASE_URL}/wallet/customer/topups/${encodeURIComponent(reference)}/verify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as WalletTopupVerification;
}

export async function createWalletCheckoutRequest(
  accessToken: string,
  payload: WalletCheckoutPayload,
) {
  const response = await fetch(`${API_BASE_URL}/wallet/customer/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as WalletCheckoutResult;
}

async function fetchOrderRequest(accessToken: string, orderId: string) {
  const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as Order;
}

async function createReturnRequestRequest(
  accessToken: string,
  orderId: string,
  payload: ReturnRequestPayload,
) {
  const formData = new FormData();
  formData.append("order_item_id", payload.order_item_id);
  formData.append("request_type", payload.request_type);
  formData.append("quantity", String(payload.quantity));
  formData.append("reason", payload.reason);
  if (payload.details?.trim()) {
    formData.append("details", payload.details.trim());
  }
  for (const [index, imageUri] of (payload.evidence_images ?? []).entries()) {
    if (!imageUri?.trim()) {
      continue;
    }

    const normalized = imageUri.trim();
    const extension = normalized.toLowerCase().endsWith(".png") ? "png" : "jpg";
    formData.append("images", {
      uri: normalized,
      name: `return-evidence-${index + 1}.${extension}`,
      type: extension === "png" ? "image/png" : "image/jpeg",
    } as any);
  }

  const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/returns`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as ReturnRequest;
}

async function getAccessToken(currentToken: string | null) {
  return currentToken || (await getStoredAccessToken());
}

export function useOrders() {
  const { user, accessToken } = useAuth();
  const { subscribe } = useRealtime();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isMutatingOrder, setIsMutatingOrder] = useState(false);

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setIsLoadingOrders(false);
      return;
    }

    const token = accessToken || (await getStoredAccessToken());
    if (!token) {
      setIsLoadingOrders(false);
      return;
    }

    setIsLoadingOrders(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const payload = (await response.json()) as Order[];
      setOrders(await enrichOrdersWithProductImages(payload));
    } catch {
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribe("order.updated", (event) => {
      const payload = event.payload as Order | undefined;
      if (!payload?.id) {
        return;
      }

      void enrichOrderWithProductImages(payload).then((enriched) => {
        setOrders((current) => {
          const existingIndex = current.findIndex((order) => order.id === enriched.id);
          if (existingIndex < 0) {
            return [enriched, ...current].sort(
              (left, right) =>
                new Date(right.placed_at ?? right.created_at).getTime() -
                new Date(left.placed_at ?? left.created_at).getTime(),
            );
          }

          const next = [...current];
          next[existingIndex] = enriched;
          return next;
        });
      });
    });
  }, [subscribe, user]);

  const cancelOrder = useCallback(
    async (orderId: string) => {
      const token = await getAccessToken(accessToken);
      if (!token) {
        throw new Error("Please sign in again to manage this order.");
      }

      setIsMutatingOrder(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/cancel`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(await parseErrorMessage(response));
        }

        const updatedOrder = await enrichOrderWithProductImages(
          (await response.json()) as Order,
        );
        setOrders((current) =>
          current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
        );
        return updatedOrder;
      } finally {
        setIsMutatingOrder(false);
      }
    },
    [accessToken],
  );

  const confirmDelivery = useCallback(
    async (orderId: string) => {
      const token = await getAccessToken(accessToken);
      if (!token) {
        throw new Error("Please sign in again to manage this order.");
      }

      setIsMutatingOrder(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/deliver`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(await parseErrorMessage(response));
        }

        const updatedOrder = await enrichOrderWithProductImages(
          (await response.json()) as Order,
        );
        setOrders((current) =>
          current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
        );
        return updatedOrder;
      } finally {
        setIsMutatingOrder(false);
      }
    },
    [accessToken],
  );

  const removeOrder = useCallback(
    async (orderId: string) => {
      const token = await getAccessToken(accessToken);
      if (!token) {
        throw new Error("Please sign in again to manage this order.");
      }

      setIsMutatingOrder(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(await parseErrorMessage(response));
        }

        setOrders((current) => current.filter((order) => order.id !== orderId));
      } finally {
        setIsMutatingOrder(false);
      }
    },
    [accessToken],
  );

  const createReturnRequest = useCallback(
    async (orderId: string, payload: ReturnRequestPayload) => {
      const token = await getAccessToken(accessToken);
      if (!token) {
        throw new Error("Please sign in again to manage this order.");
      }

      setIsMutatingOrder(true);
      try {
        return await createReturnRequestRequest(token, orderId, payload);
      } finally {
        setIsMutatingOrder(false);
      }
    },
    [accessToken],
  );

  return {
    orders,
    isLoadingOrders,
    isMutatingOrder,
    cancelOrder,
    confirmDelivery,
    createReturnRequest,
    removeOrder,
    refreshOrders,
  };
}

export function useOrder(orderId?: string) {
  const { accessToken, user } = useAuth();
  const { subscribe } = useRealtime();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(Boolean(orderId));
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshOrder = useCallback(async () => {
    if (!orderId || !user) {
      if (isMountedRef.current) {
        setOrder(null);
        setIsLoadingOrder(false);
      }
      return null;
    }

    const token = await getAccessToken(accessToken);
    if (!token) {
      if (isMountedRef.current) {
        setOrder(null);
        setIsLoadingOrder(false);
      }
      return null;
    }

    if (isMountedRef.current) {
      setIsLoadingOrder(true);
    }
    try {
      const payload = await fetchOrderRequest(token, orderId);
      const enriched = await enrichOrderWithProductImages(payload);
      if (isMountedRef.current) {
        setOrder(enriched);
      }
      return enriched;
    } catch {
      if (isMountedRef.current) {
        setOrder(null);
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsLoadingOrder(false);
      }
    }
  }, [accessToken, orderId, user]);

  useEffect(() => {
    const loadOrder = async () => {
      await refreshOrder();
    };

    void loadOrder();
  }, [refreshOrder]);

  useEffect(() => {
    if (!user || !orderId) {
      return;
    }

    return subscribe("order.updated", (event) => {
      const payload = event.payload as Order | undefined;
      if (!payload?.id || payload.id !== orderId) {
        return;
      }

      void enrichOrderWithProductImages(payload).then((enriched) => {
        if (isMountedRef.current) {
          setOrder(enriched);
        }
      });
    });
  }, [orderId, subscribe, user]);

  return { order, isLoadingOrder, refreshOrder };
}
