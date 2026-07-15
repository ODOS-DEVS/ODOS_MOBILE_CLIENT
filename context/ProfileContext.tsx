import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { useAuth } from "@/context/AuthContext";
import { fetchCustomerWalletRequest, type CustomerWallet } from "@/hooks/useOrders";
import {
  buildWalletPaymentMethod,
  WALLET_CHECKOUT_PAYMENT_ID,
} from "@/utils/checkoutPayment";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface Address {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  gpsCode?: string;
  city: string;
  region: string;
  isDefault?: boolean;
}

export type PaymentType = "card" | "momo" | "wallet";
export type MomoNetwork = "MTN" | "Telecel" | "AT";

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  isDefault?: boolean;
  cardName?: string;
  cardLast4?: string;
  expiry?: string;
  network?: MomoNetwork;
  phone?: string;
}

type AddPaymentInput = {
  type: PaymentType;
  label?: string;
  isDefault?: boolean;
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  network?: MomoNetwork;
  phone?: string;
};

type ProfileContextType = {
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  checkoutAddressId: string | null;
  checkoutPaymentId: string | null;
  checkoutVoucherCode: string | null;
  customerWallet: CustomerWallet | null;
  isSyncingProfileData: boolean;
  isLoadingProfileData: boolean;
  defaultAddress: Address | null;
  defaultPayment: PaymentMethod | null;
  selectedAddress: Address | null;
  selectedPayment: PaymentMethod | null;
  addAddress: (address: Omit<Address, "id">) => Promise<string | null>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  addPayment: (payment: AddPaymentInput) => Promise<string | null>;
  removePayment: (id: string) => Promise<void>;
  setDefaultPayment: (id: string) => Promise<void>;
  setCheckoutAddressId: (id: string | null) => void;
  setCheckoutPaymentId: (id: string | null) => void;
  setCheckoutVoucherCode: (code: string | null) => void;
  clearCheckoutSelection: () => void;
  refreshProfileData: () => Promise<void>;
};

type AddressApiItem = {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  street: string;
  gps_code?: string | null;
  city: string;
  region: string;
  is_default: boolean;
};

type PaymentMethodApiItem = {
  id: string;
  type: PaymentType;
  label: string;
  is_default: boolean;
  card_name: string | null;
  card_last4: string | null;
  expiry: string | null;
  network: string | null;
  phone: string | null;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

function mapAddress(item: AddressApiItem): Address {
  return {
    id: item.id,
    label: item.label ?? undefined,
    fullName: item.full_name,
    phone: item.phone,
    street: item.street,
    gpsCode: item.gps_code ?? undefined,
    city: item.city,
    region: item.region,
    isDefault: item.is_default,
  };
}

function mapPaymentMethod(item: PaymentMethodApiItem): PaymentMethod {
  return {
    id: item.id,
    type: item.type,
    label: item.label,
    isDefault: item.is_default,
    cardName: item.card_name ?? undefined,
    cardLast4: item.card_last4 ?? undefined,
    expiry: item.expiry ?? undefined,
    network: (item.network as MomoNetwork | null) ?? undefined,
    phone: item.phone ?? undefined,
  };
}

async function getStoredAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [checkoutAddressId, setCheckoutAddressId] = useState<string | null>(null);
  const [checkoutPaymentId, setCheckoutPaymentId] = useState<string | null>(null);
  const [checkoutVoucherCode, setCheckoutVoucherCode] = useState<string | null>(null);
  const [customerWallet, setCustomerWallet] = useState<CustomerWallet | null>(null);
  const [isSyncingProfileData, setIsSyncingProfileData] = useState(false);
  const [hasLoadedProfileData, setHasLoadedProfileData] = useState(false);
  const isLoadingProfileData = Boolean(user) && !hasLoadedProfileData;

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses],
  );
  const defaultPayment = useMemo(
    () => {
      const walletPayment = buildWalletPaymentMethod(customerWallet);
      const savedDefault =
        paymentMethods.find((payment) => payment.isDefault) ?? paymentMethods[0] ?? null;
      return savedDefault ?? walletPayment;
    },
    [customerWallet, paymentMethods],
  );

  const selectedAddress = useMemo(() => {
    if (checkoutAddressId) {
      return addresses.find((address) => address.id === checkoutAddressId) ?? defaultAddress;
    }
    return defaultAddress;
  }, [addresses, checkoutAddressId, defaultAddress]);

  const selectedPayment = useMemo(() => {
    const walletPayment = buildWalletPaymentMethod(customerWallet);

    if (checkoutPaymentId === WALLET_CHECKOUT_PAYMENT_ID) {
      return walletPayment;
    }

    if (checkoutPaymentId) {
      return paymentMethods.find((payment) => payment.id === checkoutPaymentId) ?? defaultPayment;
    }
    return defaultPayment;
  }, [paymentMethods, checkoutPaymentId, customerWallet, defaultPayment]);

  const getToken = useCallback(async () => {
    return accessToken || (await getStoredAccessToken());
  }, [accessToken]);

  const refreshProfileData = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setPaymentMethods([]);
      setCheckoutAddressId(null);
      setCheckoutPaymentId(null);
      setCheckoutVoucherCode(null);
      setCustomerWallet(null);
      setHasLoadedProfileData(false);
      setIsSyncingProfileData(false);
      return;
    }

    const token = await getToken();
    if (!token) {
      setHasLoadedProfileData(true);
      return;
    }

    setIsSyncingProfileData(true);
    try {
      const [addressesResponse, paymentMethodsResponse, walletPayload] = await Promise.all([
        fetch(`${API_BASE_URL}/account/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/account/payment-methods`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetchCustomerWalletRequest(token).catch(() => null),
      ]);

      if (!addressesResponse.ok || !paymentMethodsResponse.ok) {
        throw new Error("Failed to load saved account details.");
      }

      const addressesPayload = (await addressesResponse.json()) as AddressApiItem[];
      const paymentMethodsPayload = (await paymentMethodsResponse.json()) as PaymentMethodApiItem[];
      setAddresses(addressesPayload.map(mapAddress));
      setPaymentMethods(paymentMethodsPayload.map(mapPaymentMethod));
      setCustomerWallet(walletPayload);
    } catch {
      setAddresses([]);
      setPaymentMethods([]);
      setCustomerWallet(null);
    } finally {
      setIsSyncingProfileData(false);
      setHasLoadedProfileData(true);
    }
  }, [getToken, user]);

  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setPaymentMethods([]);
      setCheckoutAddressId(null);
      setCheckoutPaymentId(null);
      setCheckoutVoucherCode(null);
      setCustomerWallet(null);
      setHasLoadedProfileData(false);
      return;
    }

    setHasLoadedProfileData(false);
    void refreshProfileData();
  }, [refreshProfileData, user?.id]);

  const addAddress = useCallback(
    async (address: Omit<Address, "id">) => {
      const token = await getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/account/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: address.label ?? null,
          full_name: address.fullName,
          phone: address.phone,
          street: address.street,
          gps_code: address.gpsCode ?? null,
          city: address.city,
          region: address.region,
          is_default: address.isDefault ?? false,
        }),
      });

      if (!response.ok) {
        throw new Error("We couldn't save this address.");
      }

      const payload = (await response.json()) as AddressApiItem;
      const savedAddress = mapAddress(payload);
      setAddresses((current) => {
        const filtered = current.filter((item) => item.id !== savedAddress.id);
        const next = [...filtered, savedAddress];
        return next
          .map((item) =>
            savedAddress.isDefault ? { ...item, isDefault: item.id === savedAddress.id } : item,
          )
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
      });
      return savedAddress.id;
    },
    [getToken],
  );

  const updateAddress = useCallback(
    async (id: string, address: Partial<Address>) => {
      const token = await getToken();
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/account/addresses/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: address.label,
          full_name: address.fullName,
          phone: address.phone,
          street: address.street,
          gps_code: address.gpsCode ?? null,
          city: address.city,
          region: address.region,
          is_default: address.isDefault,
        }),
      });

      if (!response.ok) {
        throw new Error("We couldn't update this address.");
      }

      const payload = (await response.json()) as AddressApiItem;
      const savedAddress = mapAddress(payload);
      setAddresses((current) =>
        current
          .map((item) =>
            item.id === savedAddress.id
              ? savedAddress
              : savedAddress.isDefault
                ? { ...item, isDefault: false }
                : item,
          )
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
      );
    },
    [getToken],
  );

  const removeAddress = useCallback(
    async (id: string) => {
      const token = await getToken();
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/account/addresses/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("We couldn't remove this address.");
      }

      setAddresses((current) => current.filter((item) => item.id !== id));
      setCheckoutAddressId((current) => (current === id ? null : current));
      await refreshProfileData();
    },
    [getToken, refreshProfileData],
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      const token = await getToken();
      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/account/addresses/${encodeURIComponent(id)}/default`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("We couldn't update your default address.");
      }

      const payload = (await response.json()) as AddressApiItem;
      const savedAddress = mapAddress(payload);
      setAddresses((current) =>
        current
          .map((item) => ({ ...item, isDefault: item.id === savedAddress.id }))
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
      );
    },
    [getToken],
  );

  const addPayment = useCallback(
    async (payment: AddPaymentInput) => {
      const token = await getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/account/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: payment.type,
          label: payment.label,
          is_default: payment.isDefault ?? false,
          card_name: payment.cardName,
          card_number: payment.cardNumber,
          expiry: payment.expiry,
          network: payment.network,
          phone: payment.phone,
        }),
      });

      if (!response.ok) {
        throw new Error("We couldn't save this payment method.");
      }

      const payload = (await response.json()) as PaymentMethodApiItem;
      const savedPayment = mapPaymentMethod(payload);
      setPaymentMethods((current) => {
        const filtered = current.filter((item) => item.id !== savedPayment.id);
        const next = [...filtered, savedPayment];
        return next
          .map((item) =>
            savedPayment.isDefault ? { ...item, isDefault: item.id === savedPayment.id } : item,
          )
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
      });
      return savedPayment.id;
    },
    [getToken],
  );

  const removePayment = useCallback(
    async (id: string) => {
      const token = await getToken();
      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/account/payment-methods/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("We couldn't remove this payment method.");
      }

      setPaymentMethods((current) => current.filter((item) => item.id !== id));
      setCheckoutPaymentId((current) => (current === id ? null : current));
      await refreshProfileData();
    },
    [getToken, refreshProfileData],
  );

  const setDefaultPayment = useCallback(
    async (id: string) => {
      const token = await getToken();
      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/account/payment-methods/${encodeURIComponent(id)}/default`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("We couldn't update your default payment method.");
      }

      const payload = (await response.json()) as PaymentMethodApiItem;
      const savedPayment = mapPaymentMethod(payload);
      setPaymentMethods((current) =>
        current
          .map((item) => ({ ...item, isDefault: item.id === savedPayment.id }))
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
      );
    },
    [getToken],
  );

  const clearCheckoutSelection = useCallback(() => {
    setCheckoutAddressId(null);
    setCheckoutPaymentId(null);
    setCheckoutVoucherCode(null);
  }, []);

  const value = useMemo<ProfileContextType>(
    () => ({
      addresses,
      paymentMethods,
      checkoutAddressId,
      checkoutPaymentId,
      checkoutVoucherCode,
      customerWallet,
      isSyncingProfileData,
      isLoadingProfileData,
      defaultAddress,
      defaultPayment,
      selectedAddress,
      selectedPayment,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      addPayment,
      removePayment,
      setDefaultPayment,
      setCheckoutAddressId,
      setCheckoutPaymentId,
      setCheckoutVoucherCode,
      clearCheckoutSelection,
      refreshProfileData,
    }),
    [
      addresses,
      paymentMethods,
      checkoutAddressId,
      checkoutPaymentId,
      checkoutVoucherCode,
      customerWallet,
      isSyncingProfileData,
      isLoadingProfileData,
      defaultAddress,
      defaultPayment,
      selectedAddress,
      selectedPayment,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      addPayment,
      removePayment,
      setDefaultPayment,
      setCheckoutVoucherCode,
      clearCheckoutSelection,
      refreshProfileData,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}
