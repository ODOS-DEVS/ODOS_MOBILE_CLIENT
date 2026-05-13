import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
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
  selected_color: string | null;
  selected_size: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  source: "buy_now" | "cart";
  status: "processing" | "delivered" | "cancelled" | string;
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
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
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

async function getAccessToken(currentToken: string | null) {
  return currentToken || (await getStoredAccessToken());
}

export function useOrders() {
  const { user, accessToken } = useAuth();
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
      setOrders(payload);
    } catch {
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

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

        const updatedOrder = (await response.json()) as Order;
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

        const updatedOrder = (await response.json()) as Order;
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

  return {
    orders,
    isLoadingOrders,
    isMutatingOrder,
    cancelOrder,
    confirmDelivery,
    removeOrder,
    refreshOrders,
  };
}

export function useOrder(orderId?: string) {
  const { accessToken, user } = useAuth();
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
      if (isMountedRef.current) {
        setOrder(payload);
      }
      return payload;
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

  return { order, isLoadingOrder, refreshOrder };
}
