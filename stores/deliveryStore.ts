import { create } from "zustand";

import type { DeliveryMethodId } from "@/utils/delivery";

type DeliveryStoreState = {
  selectedMethodId: DeliveryMethodId;
  setSelectedMethodId: (methodId: DeliveryMethodId) => void;
  resetDeliveryMethod: () => void;
};

export const useDeliveryStore = create<DeliveryStoreState>((set) => ({
  selectedMethodId: "economy",
  setSelectedMethodId: (methodId) => set({ selectedMethodId: methodId }),
  resetDeliveryMethod: () => set({ selectedMethodId: "economy" }),
}));
