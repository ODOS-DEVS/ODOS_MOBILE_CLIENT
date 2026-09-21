import { useCallback, useState } from "react";

/**
 * "Show the first N, reveal more on demand" for lists rendered inside a
 * ScrollView.
 *
 * Several screens had already grown their own copy of this three-piece state
 * (a count, a bump, a remaining tally). This is that pattern, once, so the
 * screens that were still rendering every row can adopt it without each one
 * inventing slightly different behaviour.
 *
 * Deliberately not a replacement for FlatList. A virtualised list is the right
 * answer when a list is long *and* scrolled as its own screen; this is for
 * sections embedded in a larger scrolling page, where a nested FlatList would
 * fight the parent scroll view.
 */
export function useVisibleCount(total: number, pageSize = 10) {
  const [requestedCount, setRequestedCount] = useState(pageSize);

  // Clamped on read rather than corrected in an effect. If the list shrinks --
  // a filter changes, a refresh returns fewer rows -- an effect would have to
  // notice and write state, costing a second render and leaving a frame where
  // "See more" offers rows that no longer exist. Deriving it cannot go stale.
  const visibleCount = Math.min(requestedCount, Math.max(pageSize, total));

  const showMore = useCallback(() => {
    setRequestedCount((current) => current + pageSize);
  }, [pageSize]);

  const reset = useCallback(() => {
    setRequestedCount(pageSize);
  }, [pageSize]);

  const remaining = Math.max(0, total - visibleCount);

  return { visibleCount, showMore, reset, remaining, hasMore: remaining > 0 };
}
