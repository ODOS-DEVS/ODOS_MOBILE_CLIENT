import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

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

export interface FeedSectionPage {
  section: string;
  title: string;
  subtitle?: string;
  products: FeedProduct[];
  total_count: number;
  offset: number;
  limit: number;
  has_more: boolean;
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
      // Trailing slash matches the server route (GET /api/home-feed/); without
      // it the request takes a 307 redirect on every load.
      const homeFeed = await apiClient.get<HomeFeed>('/home-feed/', {
        params: {
          full_products: fullProducts,
          limit_per_section: 12,
        },
      });
      setFeed(homeFeed);
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
        const page = await apiClient.get<FeedSectionPage>(
          `/home-feed/section/${sectionKey}`,
          { params: { limit, offset } }
        );
        setSectionProducts((prev) => ({
          ...prev,
          [sectionKey]: page.products ?? [],
        }));
        return page;
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
