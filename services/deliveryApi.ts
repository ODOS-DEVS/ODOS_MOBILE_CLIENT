import { API_BASE_URL } from "@/constants/auth";
import type { DeliveryMethodId, DeliveryOption } from "@/utils/delivery";

export type DeliveryQuoteResponse = {
  options: DeliveryOption[];
  selected_method: DeliveryMethodId;
  shipping_amount: number;
  free_shipping_threshold: number;
  same_day_cutoff_passed: boolean;
};

export async function fetchDeliveryQuote(input: {
  subtotal: number;
  region?: string | null;
  selectedMethod?: DeliveryMethodId;
}): Promise<DeliveryQuoteResponse> {
  const response = await fetch(`${API_BASE_URL}/delivery/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subtotal: input.subtotal,
      region: input.region ?? null,
      selected_method: input.selectedMethod ?? "economy",
    }),
  });

  if (!response.ok) {
    throw new Error("Could not load delivery options right now.");
  }

  return (await response.json()) as DeliveryQuoteResponse;
}
