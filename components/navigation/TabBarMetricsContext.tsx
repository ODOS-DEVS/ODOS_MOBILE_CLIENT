import React, { createContext, useContext, type ReactNode } from "react";

import { useTabBarMetrics, type TabBarMetrics } from "@/components/navigation/tabBarMetrics";

const TabBarMetricsContext = createContext<TabBarMetrics | null>(null);

type TabBarMetricsProviderProps = {
  tabCount: number;
  bottomInset?: number;
  children: ReactNode;
};

export function TabBarMetricsProvider({
  tabCount,
  bottomInset = 0,
  children,
}: TabBarMetricsProviderProps) {
  const metrics = useTabBarMetrics(tabCount, bottomInset);

  return (
    <TabBarMetricsContext.Provider value={metrics}>
      {children}
    </TabBarMetricsContext.Provider>
  );
}

export function useTabBarMetricsContext(): TabBarMetrics {
  const metrics = useContext(TabBarMetricsContext);

  if (!metrics) {
    throw new Error("useTabBarMetricsContext must be used within TabBarMetricsProvider");
  }

  return metrics;
}

export function useTabBarContentInsetFromContext(): number {
  return useTabBarMetricsContext().contentBottomInset;
}

/**
 * Content inset for screens that may render outside the tab navigator.
 *
 * The provider lives in app/(root)/(tabs)/_layout.tsx, so a screen pushed on
 * top of the tabs -- anything under app/(root)/screens/ -- mounts without it.
 * The accessor above throws in that case, which is correct for a tab screen
 * (a missing provider there is a real bug) but fatal for a pushed screen that
 * has no tab bar beneath it and nothing to inset for.
 */
export function useOptionalTabBarContentInset(): number {
  return useContext(TabBarMetricsContext)?.contentBottomInset ?? 0;
}
