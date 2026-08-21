import { useCallback, useEffect, useState } from 'react';
import { api } from '../utils/api';

export interface FeedProduct {
  id: string;
  title: string;
  price: number;
  old_price?: number;
  image_url?: string;
  rating?: number;
  reviews?: string;
}

export interface FeedSection {
  title: string;
  subtitle?: string;
  category?: string;
  count?: number;
  products: FeedProduct[];
  has_more?: boolean;
}

export interface HomeFeed {
  sections: Record<string, FeedSection>;
  personalized: boolean;
  generated_at: string;
}

export function useHomeFeed() {
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [sectionProducts, setSectionProducts] = useState<Record<string, FeedProduct[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (fullProducts = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/home-feed', {
        params: {
          full_products: fullProducts,
          limit_per_section: 12,
        },
      });
      setFeed(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch home feed');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSection = useCallback(
    async (sectionKey: string, limit = 30, offset = 0) => {
      try {
        setError(null);
        const response = await api.get(`/home-feed/section/${sectionKey}`, {
          params: { limit, offset },
        });
        setSectionProducts((prev) => ({
          ...prev,
          [sectionKey]: response.data.products,
        }));
        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to fetch ${sectionKey}`);
        return null;
      }
    },
    []
  );

  const getSectionProductCount = useCallback(
    (sectionKey: string) => {
      if (feed?.sections[sectionKey]) {
        return feed.sections[sectionKey].count || feed.sections[sectionKey].products.length;
      }
      return 0;
    },
    [feed]
  );

  const refreshFeed = useCallback(async () => {
    await fetchFeed(false);
  }, [fetchFeed]);

  useEffect(() => {
    fetchFeed(true);
  }, [fetchFeed]);

  return {
    feed,
    sectionProducts,
    loading,
    error,
    fetchFeed,
    fetchSection,
    getSectionProductCount,
    refreshFeed,
  };
}
