import { API_BASE_URL } from "@/constants/auth";
import type { DeliveryMethodId, DeliveryOption } from "@/utils/delivery";

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

export type DeliveryQuoteResponse = {
  options: DeliveryOption[];
  selectedMethod: DeliveryMethodId;
  shippingAmount: number;
  freeShippingThreshold: number;
  sameDayCutoffPassed: boolean;
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

export async function fetchDeliveryQuote(input: {
  subtotal: number;
  region?: string | null;
  city?: string | null;
  selectedMethod?: DeliveryMethodId;
}): Promise<DeliveryQuoteResponse> {
  const response = await fetch(`${API_BASE_URL}/delivery/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subtotal: input.subtotal,
      region: input.region ?? null,
      city: input.city ?? null,
      selected_method: input.selectedMethod ?? "economy",
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
  };

  return {
    options: payload.options.map(mapDeliveryOption),
    selectedMethod: payload.selected_method,
    shippingAmount: payload.shipping_amount,
    freeShippingThreshold: payload.free_shipping_threshold,
    sameDayCutoffPassed: payload.same_day_cutoff_passed,
  };
}
