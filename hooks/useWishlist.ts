import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  title: string;
  image_url?: string;
  category?: string;
  price?: string;
  old_price?: string;
  rating?: string;
  reviews?: string;
  created_at: string;
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const wishlist = await apiClient.get<WishlistItem[]>('/wishlist');
      setItems(wishlist ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(
    async (productData: Partial<WishlistItem>) => {
      try {
        setError(null);
        const created = await apiClient.post<WishlistItem>('/wishlist', productData);
        setItems((prev) => [created, ...prev]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add to wishlist');
        return false;
      }
    },
    []
  );

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      setError(null);
      await apiClient.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist');
      return false;
    }
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.product_id === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    async (
      productId: string,
      productData?: Partial<WishlistItem>
    ) => {
      const inWishlist = isInWishlist(productId);
      if (inWishlist) {
        return removeFromWishlist(productId);
      } else {
        return addToWishlist({
          product_id: productId,
          ...productData,
        });
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist]
  );

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    items,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  };
}
