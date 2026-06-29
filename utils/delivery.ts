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
const SAME_DAY_CUTOFF_HOUR = 14;

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethodId, string> = {
  economy: "Standard delivery",
  express: "Express delivery",
  same_day: "Same-day delivery",
};

export function getDeliveryMethodLabel(method?: string | null) {
  if (!method) {
    return DELIVERY_METHOD_LABELS.economy;
  }
  return DELIVERY_METHOD_LABELS[method as DeliveryMethodId] ?? "Standard delivery";
}

export function isSameDayOrderWindowOpen(date = new Date()) {
  if (date.getDay() === 0) {
    return false;
  }
  return date.getHours() < SAME_DAY_CUTOFF_HOUR;
}

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
  const sameDayWindowOpen = isSameDayOrderWindowOpen();
  const sameDayAvailable = sameDayEligible && sameDayWindowOpen;
  const economyAmount =
    input.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 19;
  const expressAmount = 29;
  const sameDayAmount = 49;

  let sameDaySubtitle = "Available when your delivery address is in Greater Accra";
  let sameDayEta = "Greater Accra only";
  let sameDayReason: string | undefined = "Select a Greater Accra address at checkout";

  if (sameDayEligible && !sameDayWindowOpen) {
    sameDaySubtitle = "Order before 2:00 PM for evening drop-off";
    sameDayEta = "Unavailable today";
    sameDayReason = "Same-day orders close at 2:00 PM (Mon–Sat)";
  } else if (sameDayEligible) {
    sameDaySubtitle = "Order before 2:00 PM for evening drop-off";
    sameDayEta = "Today";
    sameDayReason = undefined;
  }

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
      subtitle: sameDaySubtitle,
      eta: sameDayEta,
      amount: sameDayAmount,
      available: sameDayAvailable,
      unavailableReason: sameDayAvailable ? undefined : sameDayReason,
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
