import { API_BASE_URL } from "@/constants/auth";
import type {
  DeliveryMethodId,
  DeliveryOption,
  DeliveryPackageQuote,
} from "@/utils/delivery";

type DeliveryOptionApi = {
  id: DeliveryMethodId;
  title: string;
  subtitle: string;
  eta: string;
  amount: number;
  badge?: string | null;
  available: boolean;
  unavailable_reason?: string | null;
};

type DeliveryPackageApi = {
  store_id?: string | null;
  store_name?: string | null;
  items_subtotal: number;
  delivery_fee: number;
  fee_waived: boolean;
  free_threshold: number;
  amount_to_free_delivery?: number | null;
};

export type DeliveryQuoteResponse = {
  options: DeliveryOption[];
  selectedMethod: DeliveryMethodId;
  shippingAmount: number;
  freeShippingThreshold: number;
  sameDayCutoffPassed: boolean;
  /** Per-shop breakdown of shippingAmount. Empty when no items were sent. */
  packages: DeliveryPackageQuote[];
};

/** What the quote needs to know about a cart line to price it per shop. */
export type DeliveryQuoteItem = {
  product_id: string;
  quantity: number;
  unit_price: number;
};

function mapDeliveryOption(option: DeliveryOptionApi): DeliveryOption {
  return {
    id: option.id,
    title: option.title,
    subtitle: option.subtitle,
    eta: option.eta,
    amount: option.amount,
    badge: option.badge ?? undefined,
    available: option.available,
    unavailableReason: option.unavailable_reason ?? undefined,
  };
}

function mapDeliveryPackage(pkg: DeliveryPackageApi): DeliveryPackageQuote {
  return {
    storeId: pkg.store_id ?? undefined,
    storeName: pkg.store_name ?? undefined,
    itemsSubtotal: pkg.items_subtotal,
    deliveryFee: pkg.delivery_fee,
    feeWaived: pkg.fee_waived,
    freeThreshold: pkg.free_threshold,
    amountToFreeDelivery: pkg.amount_to_free_delivery ?? undefined,
  };
}

export async function fetchDeliveryQuote(input: {
  subtotal: number;
  region?: string | null;
  city?: string | null;
  selectedMethod?: DeliveryMethodId;
  /**
   * The cart itself. Delivery is priced per shop, so a flat subtotal cannot
   * tell a GH₵300 basket from one shop apart from the same GH₵300 spread
   * across three. Omitting it falls back to a single-package quote.
   */
  items?: DeliveryQuoteItem[];
}): Promise<DeliveryQuoteResponse> {
  const response = await fetch(`${API_BASE_URL}/delivery/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subtotal: input.subtotal,
      region: input.region ?? null,
      city: input.city ?? null,
      selected_method: input.selectedMethod ?? "economy",
      items: input.items?.length
        ? input.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        : null,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not load delivery options right now.");
  }

  const payload = (await response.json()) as {
    options: DeliveryOptionApi[];
    selected_method: DeliveryMethodId;
    shipping_amount: number;
    free_shipping_threshold: number;
    same_day_cutoff_passed: boolean;
    packages?: DeliveryPackageApi[];
  };

  return {
    options: payload.options.map(mapDeliveryOption),
    selectedMethod: payload.selected_method,
    shippingAmount: payload.shipping_amount,
    freeShippingThreshold: payload.free_shipping_threshold,
    sameDayCutoffPassed: payload.same_day_cutoff_passed,
    packages: (payload.packages ?? []).map(mapDeliveryPackage),
  };
}
