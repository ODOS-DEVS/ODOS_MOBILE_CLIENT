import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { resolveCatalogImage } from "@/constants/catalogImages";
import { useAuth } from "@/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  title: string;
  category?: string;
  price: number;
  image?: any;
  imageKey?: string;
  quantity: number;
};

type CartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartContextType = {
  cart: CartItem[];
  isSyncingCart: boolean;
  addToCart: (product: Omit<CartItem, "quantity">) => Promise<void>;
  addItemsToCart: (products: CartItemInput[]) => Promise<void>;
  increaseQty: (id: string) => Promise<void>;
  decreaseQty: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

type CartApiItem = {
  product_id: string;
  title: string;
  image_url: string | null;
  image_key: string | null;
  category: string | null;
  price: string;
  quantity: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeProduct(product: CartItemInput): CartItemInput {
  return {
    ...product,
    id: String(product.id),
  };
}

function parsePrice(value: string): number {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapCartApiItem(item: CartApiItem): CartItem {
  return {
    id: item.product_id,
    title: item.title,
    category: item.category || undefined,
    price: parsePrice(item.price),
    image: item.image_url
      ? { uri: item.image_url }
      : item.image_key
        ? resolveCatalogImage(item.image_key)
        : undefined,
    imageKey: item.image_key || undefined,
    quantity: item.quantity,
  };
}

function mergeCartItems(current: CartItem[], incomingItems: CartItemInput[]) {
  const next = [...current];

  incomingItems.forEach((incomingItem) => {
    const normalizedItem = normalizeProduct(incomingItem);
    const quantityToAdd = Math.max(1, Math.min(normalizedItem.quantity ?? 1, 99));
    const existingIndex = next.findIndex((item) => item.id === normalizedItem.id);

    if (existingIndex >= 0) {
      const existingItem = next[existingIndex];
      next[existingIndex] = {
        ...existingItem,
        ...normalizedItem,
        image:
          normalizedItem.image ||
          (normalizedItem.imageKey ? resolveCatalogImage(normalizedItem.imageKey) : existingItem.image),
        quantity: Math.min(existingItem.quantity + quantityToAdd, 99),
      };
      return;
    }

    next.push({
      ...normalizedItem,
      image:
        normalizedItem.image ||
        (normalizedItem.imageKey ? resolveCatalogImage(normalizedItem.imageKey) : undefined),
      quantity: quantityToAdd,
    });
  });

  return next;
}

async function getStoredAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, accessToken } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSyncingCart, setIsSyncingCart] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      return;
    }

    const token = accessToken || (await getStoredAccessToken());
    if (!token) {
      return;
    }

    setIsSyncingCart(true);

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load cart.");
      }

      const payload = (await response.json()) as CartApiItem[];
      setCart(payload.map(mapCartApiItem));
    } catch {
      // Keep current local cart state if sync fails.
    } finally {
      setIsSyncingCart(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    if (!user) {
      setCart([]);
      return;
    }

    refreshCart();
  }, [refreshCart, user]);

  const addItemsToCart = useCallback(
    async (products: CartItemInput[]) => {
      const normalizedProducts = products.map(normalizeProduct);
      setCart((prev) => mergeCartItems(prev, normalizedProducts));

      if (!user) {
        return;
      }

      const token = accessToken || (await getStoredAccessToken());
      if (!token) {
        return;
      }

      try {
        await Promise.all(
          normalizedProducts.map((product) =>
            fetch(`${API_BASE_URL}/cart`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                product_id: product.id,
                title: product.title,
                image_url:
                  product.image &&
                  typeof product.image === "object" &&
                  "uri" in product.image
                    ? product.image.uri
                    : null,
                image_key: product.imageKey ?? null,
                category: product.category ?? null,
                price: String(product.price),
                quantity: Math.max(1, Math.min(product.quantity ?? 1, 99)),
              }),
            }),
          ),
        );
      } catch {
        // Keep optimistic UI state for now.
      }
    },
    [accessToken, user],
  );

  const addToCart = useCallback(
    async (product: Omit<CartItem, "quantity">) => {
      await addItemsToCart([{ ...product, quantity: 1 }]);
    },
    [addItemsToCart],
  );

  const syncQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (!user) {
        return;
      }

      const token = accessToken || (await getStoredAccessToken());
      if (!token) {
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        });
      } catch {
        // Keep optimistic UI state for now.
      }
    },
    [accessToken, user],
  );

  const increaseQty = useCallback(
    async (id: string) => {
      let nextQuantity = 1;
      setCart((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            nextQuantity = Math.min(p.quantity + 1, 99);
            return { ...p, quantity: nextQuantity };
          }
          return p;
        }),
      );

      await syncQuantity(String(id), nextQuantity);
    },
    [syncQuantity],
  );

  const decreaseQty = useCallback(
    async (id: string) => {
      let nextQuantity = 1;
      setCart((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            nextQuantity = Math.max(p.quantity - 1, 1);
            return { ...p, quantity: nextQuantity };
          }
          return p;
        }),
      );

      await syncQuantity(String(id), nextQuantity);
    },
    [syncQuantity],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const normalizedId = String(id);
      setCart((prev) => prev.filter((p) => p.id !== normalizedId));

      if (!user) {
        return;
      }

      const token = accessToken || (await getStoredAccessToken());
      if (!token) {
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(normalizedId)}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Keep optimistic UI state for now.
      }
    },
    [accessToken, user],
  );

  const clearCart = useCallback(async () => {
    setCart([]);

    if (!user) {
      return;
    }

    const token = accessToken || (await getStoredAccessToken());
    if (!token) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Keep optimistic UI state for now.
    }
  }, [accessToken, user]);

  const value = useMemo(
    () => ({
      cart,
      isSyncingCart,
      addToCart,
      addItemsToCart,
      increaseQty,
      decreaseQty,
      removeItem,
      clearCart,
      refreshCart,
    }),
    [
      addToCart,
      addItemsToCart,
      cart,
      clearCart,
      decreaseQty,
      increaseQty,
      isSyncingCart,
      refreshCart,
      removeItem,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
