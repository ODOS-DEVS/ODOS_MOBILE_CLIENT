import { useCallback, useMemo, useState } from "react";

/**
 * Progressive disclosure for the long account lists (returns, reviews,
 * vouchers) that all render inside a single ScrollView.
 *
 * The visible count is keyed rather than held as one number, which does two
 * things: switching filter or tab starts that view back at one page without
 * needing a reset effect, and coming back to a tab you had expanded finds it
 * still expanded. A plain `useState` number would have required resetting in
 * an effect on every filter change — the exact pattern the project's lint
 * rules reject, and a worse experience besides.
 */

export const DEFAULT_PAGE_SIZE = 6;

export type PagedList<T> = {
  /** The slice to render. */
  items: T[];
  /** Total available, before slicing. */
  total: number;
  /** How many are still hidden. */
  remaining: number;
  hasMore: boolean;
  /** True once the reader has expanded past the first page. */
  isExpanded: boolean;
  /** How many the next tap reveals — never more than remain. */
  nextPageSize: number;
  showMore: () => void;
  showAll: () => void;
  collapse: () => void;
};

export function usePagedList<T>(
  items: T[],
  {
    pageSize = DEFAULT_PAGE_SIZE,
    key = "default",
  }: { pageSize?: number; key?: string } = {},
): PagedList<T> {
  const [expandedByKey, setExpandedByKey] = useState<Record<string, number>>({});

  const requested = expandedByKey[key] ?? pageSize;
  const visibleCount = Math.min(requested, items.length);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  const showMore = useCallback(() => {
    setExpandedByKey((current) => ({
      ...current,
      [key]: (current[key] ?? pageSize) + pageSize,
    }));
  }, [key, pageSize]);

  const showAll = useCallback(() => {
    setExpandedByKey((current) => ({ ...current, [key]: Number.MAX_SAFE_INTEGER }));
  }, [key]);

  const collapse = useCallback(() => {
    setExpandedByKey((current) => ({ ...current, [key]: pageSize }));
  }, [key, pageSize]);

  const remaining = Math.max(items.length - visibleCount, 0);

  return {
    items: visibleItems,
    total: items.length,
    remaining,
    hasMore: remaining > 0,
    isExpanded: visibleCount > pageSize,
    nextPageSize: Math.min(pageSize, remaining),
    showMore,
    showAll,
    collapse,
  };
}
