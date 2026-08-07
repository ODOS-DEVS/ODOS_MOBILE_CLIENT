import type { Href } from "expo-router";

export const HOME_TABS_HREF = "/(root)/(tabs)" as Href;
export const HOME_TAB_HREF = "/(root)/(tabs)/" as Href;
// Seller Center home for approved vendors in "sell_only" workspace mode — the
// customer `index` tab is hidden (href: null) for them, so HOME_TAB_HREF is unreachable.
export const VENDOR_HOME_TAB_HREF = "/(root)/(tabs)/vendor" as Href;

export type RouterLike = {
  back: () => void;
  canGoBack?: () => boolean;
  canDismiss?: () => boolean;
  dismiss?: (count?: number) => void;
  dismissAll?: () => void;
  dismissTo?: (href: Href) => void;
  push?: (href: Href) => void;
  navigate?: (href: Href) => void;
  replace: (href: Href) => void;
};

/** Pop back to the home tab without leaving store screens in the stack. */
export function navigateToHome(router: RouterLike) {
  if (typeof router.dismissTo === "function") {
    router.dismissTo(HOME_TAB_HREF);
    return;
  }

  if (typeof router.canDismiss === "function" && router.canDismiss()) {
    router.dismiss?.();
    return;
  }

  if (typeof router.canGoBack === "function" && router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(HOME_TAB_HREF);
}

type GoBackOptions = {
  fallback: Href;
  strategy?: "replace" | "push";
};

export function goBackOr(
  router: RouterLike,
  { fallback, strategy = "replace" }: GoBackOptions,
) {
  if (typeof router.canGoBack === "function" && router.canGoBack()) {
    router.back();
    return;
  }

  if (strategy === "push" && typeof router.push === "function") {
    router.push(fallback);
    return;
  }

  router.replace(fallback);
}
