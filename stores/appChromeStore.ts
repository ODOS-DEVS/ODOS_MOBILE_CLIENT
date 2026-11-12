import { create } from "zustand";

/**
 * Chrome that overlays the whole app needs to know what is already at the
 * bottom of the screen.
 *
 * The tab bar's height lives in `TabBarMetricsContext`, but that provider sits
 * *inside* the `(tabs)` route while app-wide overlays are mounted above the
 * root Stack — context only flows down, so they can never read it. Publishing
 * the measured height here lets an overlay sit above the bar on tab screens
 * and drop to the safe-area inset on pushed screens, which have no bar.
 */
type AppChromeState = {
  /** Current tab bar height, or 0 when no tab bar is mounted. */
  tabBarHeight: number;
  setTabBarHeight: (height: number) => void;
};

export const useAppChromeStore = create<AppChromeState>((set) => ({
  tabBarHeight: 0,
  setTabBarHeight: (height) =>
    // Guarded so an unchanged measurement does not wake every subscriber on
    // each layout pass.
    set((state) => (state.tabBarHeight === height ? state : { tabBarHeight: height })),
}));
