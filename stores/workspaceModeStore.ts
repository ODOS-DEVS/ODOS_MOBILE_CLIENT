import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

export type WorkspaceMode = "shop_and_sell" | "sell_only";

const STORAGE_KEY = "odos_workspace_mode_v1";

type WorkspaceModeState = {
  mode: WorkspaceMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: WorkspaceMode) => Promise<void>;
  toggleMode: () => Promise<WorkspaceMode>;
};

async function persistMode(mode: WorkspaceMode) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, mode);
  } catch {
    // Non-fatal — in-memory mode still works for the session.
  }
}

export const useWorkspaceModeStore = create<WorkspaceModeState>((set, get) => ({
  mode: "shop_and_sell",
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored === "shop_and_sell" || stored === "sell_only") {
        set({ mode: stored, hydrated: true });
        return;
      }
    } catch {
      // Fall through to default.
    }
    set({ hydrated: true });
  },

  setMode: async (mode) => {
    set({ mode });
    await persistMode(mode);
  },

  toggleMode: async () => {
    const next: WorkspaceMode =
      get().mode === "sell_only" ? "shop_and_sell" : "sell_only";
    set({ mode: next });
    await persistMode(next);
    return next;
  },
}));
