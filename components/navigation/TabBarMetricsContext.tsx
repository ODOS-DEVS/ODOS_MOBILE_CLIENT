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
