import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';

export interface InventoryProduct {
  id: string;
  title: string;
  sku?: string;
  price: number;
  old_price?: number;
  stock: number;
  status: string;
  rating: number;
  category: string;
  views: number;
  sales: number;
  created_at: string;
  updated_at: string;
  low_stock: boolean;
}

export interface InventoryStats {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  total_stock_value: number;
  avg_price: number;
}

export interface LowStockAlert {
  id: string;
  title: string;
  stock: number;
  threshold: number;
  status: 'critical' | 'low';
}

export function useVendorInventory(storeId: string) {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchInventory = useCallback(
    async (skip = 0, limit = 50, search?: string, status?: string) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          store_id: storeId,
          skip: skip.toString(),
          limit: limit.toString(),
        });

        if (search) params.append('search', search);
        if (status) params.append('status', status);

        const response = await apiClient.get(
          `/vendor/inventory/?${params.toString()}`
        );

        setProducts(response.products || []);
        setTotal(response.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
      } finally {
        setLoading(false);
      }
    },
    [storeId]
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get(
        `/vendor/inventory/stats?store_id=${storeId}`
      );
      setStats(response);
    } catch (err) {
      console.error('Failed to fetch inventory stats:', err);
    }
  }, [storeId]);

  const fetchAlerts = useCallback(
    async (threshold = 10) => {
      try {
        const response = await apiClient.get(
          `/vendor/inventory/alerts/low-stock?store_id=${storeId}&threshold=${threshold}`
        );
        setAlerts(response.alerts || []);
      } catch (err) {
        console.error('Failed to fetch low stock alerts:', err);
      }
    },
    [storeId]
  );

  const updateStock = useCallback(
    async (productId: string, newStock: number) => {
      try {
        await apiClient.patch(
          `/vendor/inventory/products/${productId}/stock?new_stock=${newStock}`
        );
        // Refresh inventory
        await fetchInventory();
        return true;
      } catch (err) {
        console.error('Failed to update stock:', err);
        return false;
      }
    },
    [fetchInventory]
  );

  const updatePrice = useCallback(
    async (productId: string, newPrice: number, oldPrice?: number) => {
      try {
        const params = new URLSearchParams({
          new_price: newPrice.toString(),
        });
        if (oldPrice !== undefined) {
          params.append('old_price', oldPrice.toString());
        }

        await apiClient.patch(
          `/vendor/inventory/products/${productId}/price?${params.toString()}`
        );
        // Refresh inventory
        await fetchInventory();
        return true;
      } catch (err) {
        console.error('Failed to update price:', err);
        return false;
      }
    },
    [fetchInventory]
  );

  useEffect(() => {
    fetchInventory();
    fetchStats();
    fetchAlerts();
  }, [fetchInventory, fetchStats, fetchAlerts]);

  return {
    products,
    stats,
    alerts,
    loading,
    error,
    total,
    fetchInventory,
    fetchStats,
    fetchAlerts,
    updateStock,
    updatePrice,
  };
}
