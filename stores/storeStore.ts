import { create } from "zustand";

import {
  acknowledgeVendorOrderApi,
  createVendorProduct,
  deleteVendorProduct,
  fetchVendorOrder,
  fetchVendorOrders,
  fetchVendorProducts,
  fetchVendorStore,
  patchVendorProductStock,
  updateVendorProduct,
  updateVendorProductStatus,
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
import { acknowledgeVendorOrder } from "@/utils/vendorOrderReminders";

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
  updatingOrderId: string | null;
  updatingProductId: string | null;
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
  deleteProduct: (session: VendorSessionContext, productId: string) => Promise<void>;
  setProductStatus: (
    session: VendorSessionContext,
    productId: string,
    status: "active" | "hidden",
  ) => Promise<VendorProduct>;
  patchProductStock: (
    session: VendorSessionContext,
    productId: string,
    stock: number,
  ) => Promise<VendorProduct>;
  fetchOrders: (session: VendorSessionContext) => Promise<void>;
  fetchOrder: (session: VendorSessionContext, orderId: string) => Promise<VendorOrder>;
  updateOrderStatus: (
    session: VendorSessionContext,
    orderId: string,
    status: VendorOrderStatus,
  ) => Promise<VendorOrder>;
  acknowledgeOrder: (session: VendorSessionContext, orderId: string) => Promise<VendorOrder>;
  upsertRealtimeProduct: (product: VendorProduct) => void;
  upsertRealtimeOrder: (order: VendorOrder) => void;
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
  updatingOrderId: null,
  updatingProductId: null,
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

  deleteProduct: async (session, productId) => {
    set({ updatingProductId: productId, error: null });
    try {
      await deleteVendorProduct(session, productId);
      set((state) => ({
        products: state.products.filter((product) => product.id !== productId),
        updatingProductId: null,
      }));
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't remove that product right now.";
      set({
        updatingProductId: null,
        error: nextMessage,
      });
      throw error;
    }
  },

  setProductStatus: async (session, productId, status) => {
    set({ updatingProductId: productId, error: null });
    try {
      const updatedProduct = await updateVendorProductStatus(session, productId, status);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product,
        ),
        updatingProductId: null,
      }));
      return updatedProduct;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't update that product right now.";
      set({
        updatingProductId: null,
        error: nextMessage,
      });
      throw error;
    }
  },

  patchProductStock: async (session, productId, stock) => {
    set({ updatingProductId: productId, error: null });
    try {
      const updatedProduct = await patchVendorProductStock(session, productId, stock);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product,
        ),
        updatingProductId: null,
      }));
      return updatedProduct;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't update stock right now.";
      set({
        updatingProductId: null,
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

  fetchOrder: async (session, orderId) => {
    const order = await fetchVendorOrder(session, orderId);
    set((state) => {
      const existingIndex = state.orders.findIndex((item) => item.id === order.id);
      if (existingIndex < 0) {
        return { orders: [order, ...state.orders] };
      }
      const next = [...state.orders];
      next[existingIndex] = order;
      return { orders: next };
    });
    return order;
  },

  updateOrderStatus: async (session, orderId, status) => {
    set({ isUpdatingOrder: true, updatingOrderId: orderId, error: null });
    try {
      const updatedOrder = await updateVendorOrderStatus(session, orderId, status);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
        isUpdatingOrder: false,
        updatingOrderId: null,
      }));
      if (status === "delivered" || status === "cancelled") {
        await acknowledgeVendorOrder(orderId);
      }
      return updatedOrder;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't update that order right now.";
      set({
        isUpdatingOrder: false,
        updatingOrderId: null,
        error: nextMessage,
      });
      throw error;
    }
  },

  acknowledgeOrder: async (session, orderId) => {
    set({ isUpdatingOrder: true, updatingOrderId: orderId, error: null });
    try {
      const updatedOrder = await acknowledgeVendorOrderApi(session, orderId);
      await acknowledgeVendorOrder(orderId);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
        isUpdatingOrder: false,
        updatingOrderId: null,
      }));
      return updatedOrder;
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "We couldn't acknowledge that order right now.";
      set({
        isUpdatingOrder: false,
        updatingOrderId: null,
        error: nextMessage,
      });
      throw error;
    }
  },

  upsertRealtimeProduct: (product) => {
    set((state) => {
      const existingIndex = state.products.findIndex((item) => item.id === product.id);
      if (existingIndex < 0) {
        return { products: [product, ...state.products] };
      }

      const next = [...state.products];
      next[existingIndex] = product;
      return { products: next };
    });
  },

  upsertRealtimeOrder: (order) => {
    set((state) => {
      const existingIndex = state.orders.findIndex((item) => item.id === order.id);
      if (existingIndex < 0) {
        return { orders: [order, ...state.orders] };
      }

      const next = [...state.orders];
      next[existingIndex] = order;
      return { orders: next };
    });
  },

  clearStoreState: () => {
    set({ ...initialState });
  },
}));
