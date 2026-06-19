import { useAuth } from "@/context/AuthContext";
import {
  BEHAVIOR_EVENT_TYPES,
  beginBehaviorSession,
  configureBehaviorTracking,
  flushBehaviorEvents,
  trackBehaviorEvent,
  type BehaviorEventInput,
} from "@/services/behaviorTracking";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

type BehaviorTrackingContextValue = {
  trackEvent: (input: BehaviorEventInput) => void;
  isTrackingEnabled: boolean;
};

const BehaviorTrackingContext = createContext<BehaviorTrackingContextValue | undefined>(
  undefined,
);

export function BehaviorTrackingProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuth();

  const isTrackingEnabled = Boolean(user?.analytics_enabled);

  useEffect(() => {
    beginBehaviorSession();
  }, [user?.id]);

  useEffect(() => {
    configureBehaviorTracking({
      enabled: isTrackingEnabled,
      getAccessToken: async () => accessToken,
    });
  }, [accessToken, isTrackingEnabled]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        void flushBehaviorEvents(true);
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
      void flushBehaviorEvents(true);
    };
  }, []);

  const trackEvent = useCallback((input: BehaviorEventInput) => {
    trackBehaviorEvent(input);
  }, []);

  const value = useMemo(
    () => ({
      trackEvent,
      isTrackingEnabled,
    }),
    [isTrackingEnabled, trackEvent],
  );

  return (
    <BehaviorTrackingContext.Provider value={value}>
      {children}
    </BehaviorTrackingContext.Provider>
  );
}

export function useBehaviorTracking() {
  const context = useContext(BehaviorTrackingContext);
  if (!context) {
    throw new Error("useBehaviorTracking must be used within BehaviorTrackingProvider.");
  }
  return context;
}

export { BEHAVIOR_EVENT_TYPES };
