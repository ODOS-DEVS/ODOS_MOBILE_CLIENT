import React, { createContext, useContext, type ReactNode } from "react";

import { useTabBarMetrics, type TabBarMetrics } from "@/components/navigation/tabBarMetrics";

const TabBarMetricsContext = createContext<TabBarMetrics | null>(null);

type TabBarMetricsProviderProps = {
  tabCount: number;
  children: ReactNode;
};

export function TabBarMetricsProvider({
  tabCount,
  children,
}: TabBarMetricsProviderProps) {
  const metrics = useTabBarMetrics(tabCount);

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
