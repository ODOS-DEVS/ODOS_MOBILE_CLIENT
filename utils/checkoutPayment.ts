import type { CustomerWallet } from "@/hooks/useOrders";
import type { PaymentMethod } from "@/context/ProfileContext";

/** Stable id used in ProfileContext checkout selection for in-app wallet. */
export const WALLET_CHECKOUT_PAYMENT_ID = "wallet";

export function buildWalletPaymentMethod(
  wallet: CustomerWallet | null | undefined,
): PaymentMethod | null {
  if (!wallet) {
    return null;
  }

  return {
    id: WALLET_CHECKOUT_PAYMENT_ID,
    type: "wallet",
    label: `ODOS Wallet · ₵${wallet.available_balance.toFixed(2)}`,
    isDefault: false,
  };
}

export function isWalletCheckoutSelection(
  payment: PaymentMethod | null | undefined,
  checkoutPaymentId?: string | null,
): boolean {
  if (checkoutPaymentId === WALLET_CHECKOUT_PAYMENT_ID) {
    return true;
  }
  if (!payment) {
    return false;
  }
  return payment.id === WALLET_CHECKOUT_PAYMENT_ID || payment.type === "wallet";
}

export function walletCoversOrder(
  wallet: CustomerWallet | null | undefined,
  orderTotal: number,
): boolean {
  if (!wallet) {
    return false;
  }
  return wallet.available_balance >= orderTotal;
}
