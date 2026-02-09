import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types (shared by Addresses, Wallet, Checkout)
// ---------------------------------------------------------------------------

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  isDefault?: boolean;
}

export type PaymentType = "card" | "momo";
export type MomoNetwork = "MTN" | "Telecel" | "AT";

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  isDefault?: boolean;
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  network?: MomoNetwork;
  phone?: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type ProfileContextType = {
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  checkoutAddressId: string | null;
  checkoutPaymentId: string | null;

  defaultAddress: Address | null;
  defaultPayment: PaymentMethod | null;
  selectedAddress: Address | null;
  selectedPayment: PaymentMethod | null;

  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  addPayment: (payment: Omit<PaymentMethod, "id" | "label"> & { label?: string }) => void;
  removePayment: (id: string) => void;
  setDefaultPayment: (id: string) => void;

  setCheckoutAddressId: (id: string | null) => void;
  setCheckoutPaymentId: (id: string | null) => void;
  clearCheckoutSelection: () => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [checkoutAddressId, setCheckoutAddressId] = useState<string | null>(null);
  const [checkoutPaymentId, setCheckoutPaymentId] = useState<string | null>(null);

  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) ?? addresses[0] ?? null,
    [addresses]
  );
  const defaultPayment = useMemo(
    () => paymentMethods.find((p) => p.isDefault) ?? paymentMethods[0] ?? null,
    [paymentMethods]
  );

  const selectedAddress = useMemo(() => {
    if (checkoutAddressId) {
      return addresses.find((a) => a.id === checkoutAddressId) ?? defaultAddress;
    }
    return defaultAddress;
  }, [addresses, checkoutAddressId, defaultAddress]);

  const selectedPayment = useMemo(() => {
    if (checkoutPaymentId) {
      return (
        paymentMethods.find((p) => p.id === checkoutPaymentId) ?? defaultPayment
      );
    }
    return defaultPayment;
  }, [paymentMethods, checkoutPaymentId, defaultPayment]);

  const addAddress = useCallback((address: Omit<Address, "id">) => {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString(),
    };
    setAddresses((prev) =>
      address.isDefault
        ? prev
            .map((a) => ({ ...a, isDefault: false }))
            .concat({ ...newAddress, isDefault: true })
        : [...prev, newAddress]
    );
  }, []);

  const updateAddress = useCallback((id: string, payload: Partial<Address>) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...payload } : a))
    );
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    setCheckoutAddressId((current) => (current === id ? null : current));
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  }, []);

  const addPayment = useCallback(
    (payment: Omit<PaymentMethod, "id" | "label"> & { label?: string }) => {
      const label =
        payment.label ??
        (payment.type === "card"
          ? `**** ${payment.cardNumber?.slice(-4) ?? "****"}`
          : `${payment.network ?? ""} MoMo`);
      const newPayment: PaymentMethod = {
        ...payment,
        id: Date.now().toString(),
        label,
        isDefault: paymentMethods.length === 0,
      };
      setPaymentMethods((prev) => [...prev, newPayment]);
    },
    [paymentMethods.length]
  );

  const removePayment = useCallback((id: string) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
    setCheckoutPaymentId((current) => (current === id ? null : current));
  }, []);

  const setDefaultPayment = useCallback((id: string) => {
    setPaymentMethods((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id }))
    );
  }, []);

  const clearCheckoutSelection = useCallback(() => {
    setCheckoutAddressId(null);
    setCheckoutPaymentId(null);
  }, []);

  const value = useMemo<ProfileContextType>(
    () => ({
      addresses,
      paymentMethods,
      checkoutAddressId,
      checkoutPaymentId,
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
      clearCheckoutSelection,
    }),
    [
      addresses,
      paymentMethods,
      checkoutAddressId,
      checkoutPaymentId,
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
      clearCheckoutSelection,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}
