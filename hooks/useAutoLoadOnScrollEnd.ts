import { useCallback, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

/**
 * Turns a ScrollView into an auto-loading list.
 *
 * `FlatList` gets this from `onEndReached`, but the account, wallet and
 * loyalty screens render their lists inside a plain `ScrollView` — they mix
 * cards, filters and a list on one page, so they cannot be a FlatList without
 * restructuring the screen. Those screens disclosed more rows only when the
 * reader found and tapped a button, which is a different experience from the
 * rest of the app for no reason the reader can see.
 *
 * Firing is latched on content height rather than debounced: `showMore` adds a
 * page per call, and a scroll event near the bottom arrives many times a
 * second, so an unlatched handler would jump straight to the end of the list.
 * Height only changes once the new page has actually rendered, which makes it
 * a precise "one load per page" signal and needs no timer.
 */
export function useAutoLoadOnScrollEnd(
  onLoadMore: () => void,
  {
    enabled = true,
    /** How close to the bottom counts as "arrived", in points. */
    threshold = 280,
  }: { enabled?: boolean; threshold?: number } = {},
) {
  const lastLoadedHeight = useRef(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!enabled) {
        return;
      }

      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - contentOffset.y - layoutMeasurement.height;

      if (distanceFromBottom > threshold) {
        return;
      }
      // Already served this page; wait for the new rows to change the height.
      if (contentSize.height === lastLoadedHeight.current) {
        return;
      }

      lastLoadedHeight.current = contentSize.height;
      onLoadMore();
    },
    [enabled, onLoadMore, threshold],
  );

  return { onScroll, scrollEventThrottle: 16 } as const;
}
