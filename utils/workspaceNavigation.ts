import {
  useWorkspaceModeStore,
  type WorkspaceMode,
} from "@/stores/workspaceModeStore";
import { router } from "expo-router";

/** Home tab — never use `.../index` (Expo Router treats that as unmatched). */
const SHOPPING_HOME = "/(root)/(tabs)/" as const;
const SELLER_HOME = "/(root)/(tabs)/vendor" as const;

export async function switchWorkspaceMode(next: WorkspaceMode): Promise<WorkspaceMode> {
  await useWorkspaceModeStore.getState().setMode(next);

  // Let tab `href` options commit before navigating into a newly visible screen.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  if (next === "sell_only") {
    router.replace(SELLER_HOME as any);
  } else {
    router.replace(SHOPPING_HOME as any);
  }

  return next;
}

export async function toggleWorkspaceMode(): Promise<WorkspaceMode> {
  const current = useWorkspaceModeStore.getState().mode;
  const next: WorkspaceMode =
    current === "sell_only" ? "shop_and_sell" : "sell_only";
  return switchWorkspaceMode(next);
}
