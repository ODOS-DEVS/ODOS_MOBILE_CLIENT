import { GHANA_REGION_CITIES } from "@/utils/ghanaLocations";

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

const ACCRA_TIME_ZONE = "Africa/Accra";

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

const SAME_DAY_CITIES = new Set(
  (GHANA_REGION_CITIES["Greater Accra"] ?? []).map((city) => city.trim().toLowerCase()),
);

function normalizeLocationValue(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function getAccraDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: ACCRA_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  let hour = Number(parts.hour ?? "0");
  if (!Number.isFinite(hour) || hour === 24) {
    hour = 0;
  }
  return {
    weekday: parts.weekday ?? "",
    hour,
  };
}

export function isSameDayOrderWindowOpen(date = new Date()) {
  const { weekday, hour } = getAccraDateParts(date);
  if (weekday === "Sun") {
    return false;
  }
  return hour < SAME_DAY_CUTOFF_HOUR;
}

export function getSameDayCutoffHour() {
  return SAME_DAY_CUTOFF_HOUR;
}

export function isSameDayEligibleRegion(region?: string | null) {
  const normalized = normalizeLocationValue(region);
  if (!normalized) {
    return false;
  }

  return GREATER_ACCRA_ALIASES.some(
    (alias) => normalized === alias || normalized.includes(alias),
  );
}

export function isSameDayEligibleCity(city?: string | null) {
  const normalized = normalizeLocationValue(city);
  if (!normalized) {
    return false;
  }
  if (SAME_DAY_CITIES.has(normalized)) {
    return true;
  }
  return GREATER_ACCRA_ALIASES.some(
    (alias) => normalized === alias || normalized.includes(alias),
  );
}

export function isSameDayEligibleLocation(input: {
  region?: string | null;
  city?: string | null;
}) {
  return (
    isSameDayEligibleRegion(input.region) || isSameDayEligibleCity(input.city)
  );
}

export function formatDeliveryAmount(amount: number) {
  return amount <= 0 ? "Free" : `GH₵${amount.toFixed(2)}`;
}

export function buildDeliveryOptions(input: {
  subtotal: number;
  region?: string | null;
  city?: string | null;
}): DeliveryOption[] {
  const sameDayEligible = isSameDayEligibleLocation({
    region: input.region,
    city: input.city,
  });
  const sameDayWindowOpen = isSameDayOrderWindowOpen();
  const sameDayAvailable = sameDayEligible && sameDayWindowOpen;
  const economyAmount =
    input.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 19;
  const expressAmount = 29;
  const sameDayAmount = 49;
  const cutoffLabel = `${SAME_DAY_CUTOFF_HOUR}:00`;

  let sameDaySubtitle = "Available for Greater Accra addresses";
  let sameDayEta = "Greater Accra";
  let sameDayReason: string | undefined =
    "Select a Greater Accra address to unlock same-day";

  if (!sameDayEligible) {
    sameDaySubtitle = "Available for Greater Accra addresses";
    sameDayEta = "Greater Accra only";
    sameDayReason = "Select a Greater Accra address to unlock same-day";
  } else if (!sameDayWindowOpen) {
    const { weekday } = getAccraDateParts();
    sameDaySubtitle = `Order before ${cutoffLabel} (Mon–Sat) for evening drop-off`;
    sameDayEta = weekday === "Sun" ? "Opens Monday" : "Closed for today";
    sameDayReason =
      weekday === "Sun"
        ? "Same-day resumes Monday before 2:00 PM"
        : `Same-day orders close at ${cutoffLabel} (Mon–Sat)`;
  } else {
    sameDaySubtitle = `Order before ${cutoffLabel} for evening drop-off`;
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
      badge: sameDayAvailable ? "Live" : undefined,
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
