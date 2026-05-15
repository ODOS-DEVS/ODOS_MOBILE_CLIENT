import { create } from "zustand";

import {
  fetchMyVendorApplication,
  fetchVendorDashboard,
  fetchVendorProfile,
  submitVendorApplication,
} from "@/services/vendorService";
import {
  canAccessVendorDashboard,
  normalizeVendorStatus,
  type VendorApplication,
  type VendorApplicationInput,
  type VendorDashboardStats,
  type VendorProfile,
  type VendorSessionContext,
  type VendorStatus,
} from "@/types/vendor";

type VendorStoreState = {
  vendorStatus: VendorStatus;
  vendorProfile: VendorProfile | null;
  vendorApplication: VendorApplication | null;
  vendorDashboardStats: VendorDashboardStats | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastLoadedUserId: string | null;
  hydrateFromSession: (session: VendorSessionContext | null | undefined) => void;
  refreshVendorState: (session: VendorSessionContext) => Promise<void>;
  fetchMyVendorApplication: (session: VendorSessionContext) => Promise<void>;
  fetchVendorProfile: (session: VendorSessionContext) => Promise<void>;
  fetchVendorDashboard: (session: VendorSessionContext) => Promise<void>;
  setRealtimeVendorDashboard: (stats: VendorDashboardStats) => void;
  submitVendorApplication: (
    session: VendorSessionContext,
    input: VendorApplicationInput,
  ) => Promise<VendorApplication>;
  clearVendorState: () => void;
};

function resolveStatus(
  session: VendorSessionContext,
  application: VendorApplication | null,
  profile: VendorProfile | null,
) {
  return (
    profile?.status ??
    application?.status ??
    normalizeVendorStatus(session.vendorStatus, session.roles)
  );
}

const initialState = {
  vendorStatus: "none" as VendorStatus,
  vendorProfile: null,
  vendorApplication: null,
  vendorDashboardStats: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  lastLoadedUserId: null,
};

export const useVendorStore = create<VendorStoreState>((set, get) => ({
  ...initialState,

  hydrateFromSession: (session) => {
    if (!session?.userId) {
      set({ ...initialState });
      return;
    }

    set((state) => ({
      vendorStatus: resolveStatus(
        session,
        state.lastLoadedUserId === session.userId ? state.vendorApplication : null,
        state.lastLoadedUserId === session.userId ? state.vendorProfile : null,
      ),
      error: null,
      lastLoadedUserId: state.lastLoadedUserId ?? session.userId,
    }));
  },

  refreshVendorState: async (session) => {
    if (!session.userId) {
      set({ ...initialState });
      return;
    }

    set({
      isLoading: true,
      error: null,
      lastLoadedUserId: session.userId,
      vendorStatus: normalizeVendorStatus(session.vendorStatus, session.roles),
    });

    try {
      const [vendorApplication, vendorProfile] = await Promise.all([
        fetchMyVendorApplication(session),
        fetchVendorProfile(session),
      ]);
      const vendorStatus = resolveStatus(session, vendorApplication, vendorProfile);

      let vendorDashboardStats: VendorDashboardStats | null = null;
      if (
        vendorProfile ||
        canAccessVendorDashboard(session.roles, vendorStatus)
      ) {
        vendorDashboardStats = await fetchVendorDashboard(session);
      }

      set({
        vendorApplication,
        vendorProfile,
        vendorDashboardStats,
        vendorStatus,
        isLoading: false,
        error: null,
        lastLoadedUserId: session.userId,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "We couldn't load your vendor profile right now.",
      });
    }
  },

  fetchMyVendorApplication: async (session) => {
    set({ isLoading: true, error: null });
    try {
      const vendorApplication = await fetchMyVendorApplication(session);
      const vendorStatus = resolveStatus(
        session,
        vendorApplication,
        get().vendorProfile,
      );
      set({
        vendorApplication,
        vendorStatus,
        isLoading: false,
        lastLoadedUserId: session.userId,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "We couldn't load your vendor application right now.",
      });
    }
  },

  fetchVendorProfile: async (session) => {
    set({ isLoading: true, error: null });
    try {
      const vendorProfile = await fetchVendorProfile(session);
      const vendorStatus = resolveStatus(
        session,
        get().vendorApplication,
        vendorProfile,
      );
      set({
        vendorProfile,
        vendorStatus,
        isLoading: false,
        lastLoadedUserId: session.userId,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "We couldn't load your vendor profile right now.",
      });
    }
  },

  fetchVendorDashboard: async (session) => {
    set({ isLoading: true, error: null });
    try {
      const vendorDashboardStats = await fetchVendorDashboard(session);
      set({
        vendorDashboardStats,
        isLoading: false,
        lastLoadedUserId: session.userId,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "We couldn't load your vendor dashboard right now.",
      });
    }
  },

  setRealtimeVendorDashboard: (vendorDashboardStats) => {
    set({
      vendorDashboardStats,
      error: null,
    });
  },

  submitVendorApplication: async (session, input) => {
    set({ isSubmitting: true, error: null });
    try {
      const vendorApplication = await submitVendorApplication(session, input);
      set({
        vendorApplication,
        vendorProfile: null,
        vendorDashboardStats: null,
        vendorStatus: vendorApplication.status,
        isSubmitting: false,
        lastLoadedUserId: session.userId,
      });
      return vendorApplication;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't submit your vendor application.";
      set({
        isSubmitting: false,
        error: nextMessage,
      });
      throw error;
    }
  },

  clearVendorState: () => {
    set({ ...initialState });
  },
}));
