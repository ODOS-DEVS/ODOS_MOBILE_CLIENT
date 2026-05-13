import type { Href } from "expo-router";

type RouterLike = {
  back: () => void;
  canGoBack?: () => boolean;
  push?: (href: Href) => void;
  replace: (href: Href) => void;
};

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
