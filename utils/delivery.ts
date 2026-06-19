export type DeliveryMethodId = "economy" | "express" | "same_day";

export type DeliveryOption = {
  id: DeliveryMethodId;
  title: string;
  subtitle: string;
  eta: string;
  amount: number;
  badge?: string;
  available: boolean;
  unavailableReason?: string;
};

const FREE_SHIPPING_THRESHOLD = 299;

const GREATER_ACCRA_ALIASES = [
  "greater accra",
  "accra",
  "tema",
  "madina",
  "ashaiman",
  "ga east",
  "ga west",
  "ga central",
  "ga south",
  "la dade kotopon",
  "ledzokuku",
  "krowor",
  "adenta",
  "ablekuma",
];

export function isSameDayEligibleRegion(region?: string | null) {
  const normalized = (region ?? "").trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return GREATER_ACCRA_ALIASES.some(
    (alias) => normalized === alias || normalized.includes(alias),
  );
}

export function formatDeliveryAmount(amount: number) {
  return amount <= 0 ? "Free" : `GH₵${amount.toFixed(2)}`;
}

export function buildDeliveryOptions(input: {
  subtotal: number;
  region?: string | null;
}): DeliveryOption[] {
  const sameDayEligible = isSameDayEligibleRegion(input.region);
  const economyAmount =
    input.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 19;
  const expressAmount = 29;
  const sameDayAmount = 49;

  return [
    {
      id: "economy",
      title: "Standard delivery",
      subtitle:
        economyAmount === 0
          ? `Free shipping on orders over GH₵${FREE_SHIPPING_THRESHOLD}`
          : "Reliable nationwide delivery with tracking updates",
      eta: "3–5 business days",
      amount: economyAmount,
      badge: economyAmount === 0 ? "Free" : undefined,
      available: true,
    },
    {
      id: "express",
      title: "Express delivery",
      subtitle: "Priority dispatch from the seller warehouse",
      eta: "1–2 business days",
      amount: expressAmount,
      available: true,
    },
    {
      id: "same_day",
      title: "Same-day delivery",
      subtitle: sameDayEligible
        ? "Order before 2:00 PM for evening drop-off"
        : "Available when your delivery address is in Greater Accra",
      eta: sameDayEligible ? "Today" : "Greater Accra only",
      amount: sameDayAmount,
      available: sameDayEligible,
      unavailableReason: sameDayEligible
        ? undefined
        : "Select a Greater Accra address at checkout",
    },
  ];
}

export function resolveDeliveryAmount(
  options: DeliveryOption[],
  methodId: DeliveryMethodId,
) {
  const selected = options.find((option) => option.id === methodId);
  if (selected?.available) {
    return selected.amount;
  }

  const fallback =
    options.find((option) => option.id === "economy" && option.available) ??
    options.find((option) => option.available);

  return fallback?.amount ?? 0;
}

export function resolveActiveDeliveryMethod(
  options: DeliveryOption[],
  methodId: DeliveryMethodId,
): DeliveryMethodId {
  const selected = options.find((option) => option.id === methodId);
  if (selected?.available) {
    return methodId;
  }

  return options.find((option) => option.available)?.id ?? "economy";
}
