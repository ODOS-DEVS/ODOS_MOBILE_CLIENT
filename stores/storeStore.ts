import { create } from "zustand";

import {
  createVendorProduct,
  fetchVendorOrders,
  fetchVendorProducts,
  fetchVendorStore,
  updateVendorProduct,
  updateVendorOrderStatus,
  updateVendorStore,
} from "@/services/storeService";
import type {
  ManagedStoreProfile,
  ManagedStoreUpdateInput,
  VendorOrder,
  VendorOrderStatus,
  VendorProduct,
  VendorProductInput,
} from "@/types/store";
import type { VendorSessionContext } from "@/types/vendor";

type StoreStoreState = {
  storeProfile: ManagedStoreProfile | null;
  products: VendorProduct[];
  orders: VendorOrder[];
  isLoadingStore: boolean;
  isSavingStore: boolean;
  isLoadingProducts: boolean;
  isSavingProduct: boolean;
  isLoadingOrders: boolean;
  isUpdatingOrder: boolean;
  error: string | null;
  fetchStoreProfile: (session: VendorSessionContext) => Promise<void>;
  updateStoreProfile: (
    session: VendorSessionContext,
    input: ManagedStoreUpdateInput,
  ) => Promise<ManagedStoreProfile>;
  fetchProducts: (session: VendorSessionContext) => Promise<void>;
  createProduct: (
    session: VendorSessionContext,
    input: VendorProductInput,
  ) => Promise<VendorProduct>;
  updateProduct: (
    session: VendorSessionContext,
    productId: string,
    input: VendorProductInput,
  ) => Promise<VendorProduct>;
  fetchOrders: (session: VendorSessionContext) => Promise<void>;
  updateOrderStatus: (
    session: VendorSessionContext,
    orderId: string,
    status: VendorOrderStatus,
  ) => Promise<VendorOrder>;
  clearStoreState: () => void;
};

const initialState = {
  storeProfile: null,
  products: [],
  orders: [],
  isLoadingStore: false,
  isSavingStore: false,
  isLoadingProducts: false,
  isSavingProduct: false,
  isLoadingOrders: false,
  isUpdatingOrder: false,
  error: null,
};

export const useStoreStore = create<StoreStoreState>((set) => ({
  ...initialState,

  fetchStoreProfile: async (session) => {
    set({ isLoadingStore: true, error: null });
    try {
      const storeProfile = await fetchVendorStore(session);
      set({ storeProfile, isLoadingStore: false });
    } catch (error) {
      set({
        isLoadingStore: false,
        error:
          error instanceof Error
            ? error.message
            : "We couldn't load the store profile right now.",
      });
    }
  },

  updateStoreProfile: async (session, input) => {
    set({ isSavingStore: true, error: null });
    try {
      const storeProfile = await updateVendorStore(session, input);
      set({ storeProfile, isSavingStore: false });
      return storeProfile;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't update the store profile right now.";
      set({
        isSavingStore: false,
        error: nextMessage,
      });
      throw error;
    }
  },

  fetchProducts: async (session) => {
    set({ isLoadingProducts: true, error: null });
    try {
      const products = await fetchVendorProducts(session);
      set({ products, isLoadingProducts: false });
    } catch (error) {
      set({
        isLoadingProducts: false,
        error:
          error instanceof Error
            ? error.message
            : "We couldn't load the vendor products right now.",
      });
    }
  },

  createProduct: async (session, input) => {
    set({ isSavingProduct: true, error: null });
    try {
      const nextProduct = await createVendorProduct(session, input);
      set((state) => ({
        products: [nextProduct, ...state.products],
        isSavingProduct: false,
      }));
      return nextProduct;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't save the product right now.";
      set({
        isSavingProduct: false,
        error: nextMessage,
      });
      throw error;
    }
  },

  updateProduct: async (session, productId, input) => {
    set({ isSavingProduct: true, error: null });
    try {
      const updatedProduct = await updateVendorProduct(session, productId, input);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product,
        ),
        isSavingProduct: false,
      }));
      return updatedProduct;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't update the product right now.";
      set({
        isSavingProduct: false,
        error: nextMessage,
      });
      throw error;
    }
  },

  fetchOrders: async (session) => {
    set({ isLoadingOrders: true, error: null });
    try {
      const orders = await fetchVendorOrders(session);
      set({ orders, isLoadingOrders: false });
    } catch (error) {
      set({
        isLoadingOrders: false,
        error:
          error instanceof Error
            ? error.message
            : "We couldn't load vendor orders right now.",
      });
    }
  },

  updateOrderStatus: async (session, orderId, status) => {
    set({ isUpdatingOrder: true, error: null });
    try {
      const updatedOrder = await updateVendorOrderStatus(session, orderId, status);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
        isUpdatingOrder: false,
      }));
      return updatedOrder;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't update that order right now.";
      set({
        isUpdatingOrder: false,
        error: nextMessage,
      });
      throw error;
    }
  },

  clearStoreState: () => {
    set({ ...initialState });
  },
}));
