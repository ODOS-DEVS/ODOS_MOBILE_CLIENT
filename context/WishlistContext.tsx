import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import {
  BEHAVIOR_EVENT_TYPES,
  trackBehaviorEvent,
} from "@/services/behaviorTracking";
import { resolveApiMediaUrl } from "@/utils/media";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";

export interface WishlistProduct {
  id: string;
  image?: any;
  title: string;
  category?: string;
  price?: number;
  oldPrice?: number;
  rating?: number;
  reviews?: number;
}

type WishlistContextType = {
  wishlist: WishlistProduct[];
  isSyncingWishlist: boolean;
  addToWishlist: (product: WishlistProduct) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
};

type WishlistApiItem = {
  product_id: string;
  title: string;
  image_url: string | null;
  category: string | null;
  price: string | null;
  old_price: string | null;
  rating: string | null;
  reviews: string | null;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

function normalizeProduct(product: WishlistProduct): WishlistProduct {
  return {
    ...product,
    id: String(product.id),
  };
}

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function mapWishlistApiItem(item: WishlistApiItem): WishlistProduct {
  return {
    id: item.product_id,
    image: item.image_url
      ? { uri: resolveApiMediaUrl(item.image_url) ?? item.image_url }
      : undefined,
    title: item.title,
    category: item.category || undefined,
    price: parseOptionalNumber(item.price),
    oldPrice: parseOptionalNumber(item.old_price),
    rating: parseOptionalNumber(item.rating),
    reviews: parseOptionalNumber(item.reviews),
  };
}

async function getStoredAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
}

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, accessToken } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [isSyncingWishlist, setIsSyncingWishlist] = useState(false);
  const guestWishlistRef = useRef<WishlistProduct[]>([]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      return;
    }

    const token = accessToken || (await getStoredAccessToken());
    if (!token) {
      return;
    }

    setIsSyncingWishlist(true);

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load wishlist.");
      }

      const payload = (await response.json()) as WishlistApiItem[];
      setWishlist(payload.map(mapWishlistApiItem));
    } catch {
      // Keep current local state if sync fails.
    } finally {
      setIsSyncingWishlist(false);
    }
  }, [accessToken, user]);

  useEffect(() => {
    if (!user) {
      guestWishlistRef.current = wishlist;
    }
  }, [user, wishlist]);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    let cancelled = false;

    const syncGuestWishlistOnLogin = async () => {
      const pending = guestWishlistRef.current;
      guestWishlistRef.current = [];
      const token = accessToken || (await getStoredAccessToken());
      if (!token || cancelled) {
        return;
      }

      setIsSyncingWishlist(true);
      try {
        if (pending.length > 0) {
          await Promise.all(
            pending.map((product) => {
              const normalizedProduct = normalizeProduct(product);
              return fetch(`${API_BASE_URL}/wishlist`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  product_id: normalizedProduct.id,
                  title: normalizedProduct.title,
                  image_url:
                    normalizedProduct.image &&
                    typeof normalizedProduct.image === "object" &&
                    "uri" in normalizedProduct.image
                      ? normalizedProduct.image.uri
                      : null,
                  category: normalizedProduct.category ?? null,
                  price:
                    normalizedProduct.price !== undefined
                      ? String(normalizedProduct.price)
                      : null,
                  old_price:
                    normalizedProduct.oldPrice !== undefined
                      ? String(normalizedProduct.oldPrice)
                      : null,
                  rating:
                    normalizedProduct.rating !== undefined
                      ? String(normalizedProduct.rating)
                      : null,
                  reviews:
                    normalizedProduct.reviews !== undefined
                      ? String(normalizedProduct.reviews)
                      : null,
                }),
              });
            }),
          );
        }

        if (cancelled) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load wishlist.");
        }

        const payload = (await response.json()) as WishlistApiItem[];
        if (!cancelled) {
          setWishlist(payload.map(mapWishlistApiItem));
        }
      } catch {
        if (!cancelled && pending.length > 0) {
          setWishlist((prev) => {
            const seen = new Set(prev.map((item) => item.id));
            const next = [...prev];
            pending.forEach((item) => {
              const normalized = normalizeProduct(item);
              if (!seen.has(normalized.id)) {
                seen.add(normalized.id);
                next.push(normalized);
              }
            });
            return next;
          });
        }
      } finally {
        if (!cancelled) {
          setIsSyncingWishlist(false);
        }
      }
    };

    void syncGuestWishlistOnLogin();

    return () => {
      cancelled = true;
    };
  }, [accessToken, user]);

  const addToWishlist = useCallback(
    async (product: WishlistProduct) => {
      const normalizedProduct = normalizeProduct(product);

      setWishlist((prev) => {
        const exists = prev.some((item) => item.id === normalizedProduct.id);
        if (exists) {
          return prev;
        }

        return [...prev, normalizedProduct];
      });

      if (!user) {
        return;
      }

      const token = accessToken || (await getStoredAccessToken());
      if (!token) {
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: normalizedProduct.id,
            title: normalizedProduct.title,
            image_url:
              normalizedProduct.image &&
              typeof normalizedProduct.image === "object" &&
              "uri" in normalizedProduct.image
                ? normalizedProduct.image.uri
                : null,
            category: normalizedProduct.category ?? null,
            price:
              normalizedProduct.price !== undefined
                ? String(normalizedProduct.price)
                : null,
            old_price:
              normalizedProduct.oldPrice !== undefined
                ? String(normalizedProduct.oldPrice)
                : null,
            rating:
              normalizedProduct.rating !== undefined
                ? String(normalizedProduct.rating)
                : null,
            reviews:
              normalizedProduct.reviews !== undefined
                ? String(normalizedProduct.reviews)
                : null,
          }),
        });
        trackBehaviorEvent({
          eventType: BEHAVIOR_EVENT_TYPES.ADD_TO_WISHLIST,
          productId: normalizedProduct.id,
          category: normalizedProduct.category ?? null,
          sourceScreen: "wishlist",
          metadata: {
            price: normalizedProduct.price,
          },
        });
      } catch {
        // Keep optimistic UI state for now.
      }
    },
    [accessToken, user],
  );

  const removeFromWishlist = useCallback(
    async (id: string) => {
      const normalizedId = String(id);
      let removedItem: WishlistProduct | undefined;
      setWishlist((prev) => {
        removedItem = prev.find((item) => item.id === normalizedId);
        return prev.filter((item) => item.id !== normalizedId);
      });

      if (!user) {
        return;
      }

      const token = accessToken || (await getStoredAccessToken());
      if (!token) {
        return;
      }

      try {
        await fetch(
          `${API_BASE_URL}/wishlist/${encodeURIComponent(normalizedId)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (removedItem) {
          trackBehaviorEvent({
            eventType: BEHAVIOR_EVENT_TYPES.REMOVE_FROM_WISHLIST,
            productId: removedItem.id,
            category: removedItem.category ?? null,
            sourceScreen: "wishlist",
          });
        }
      } catch {
        // Keep optimistic UI state for now.
      }
    },
    [accessToken, user],
  );

  const value = useMemo(
    () => ({
      wishlist,
      isSyncingWishlist,
      addToWishlist,
      removeFromWishlist,
      refreshWishlist,
    }),
    [addToWishlist, isSyncingWishlist, refreshWishlist, removeFromWishlist, wishlist],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
};
