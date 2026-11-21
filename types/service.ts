/**
 * Services marketplace types, mirroring the backend contract.
 *
 * Note what the booking input deliberately does NOT carry: no price, total,
 * commission or duration. The backend computes every figure from the
 * catalogue and rejects client-supplied amounts, so sending one here would
 * be at best ignored. The app sends choices and renders what it is told the
 * cost is.
 */

export type ServicePricingModel =
  | "fixed"
  | "starting_at"
  | "hourly"
  | "package"
  | "quote"
  | "consultation";

export type ServiceBookingType = "instant" | "request" | "quote" | "consultation";

export type ServiceLocationMode = "provider" | "customer" | "remote" | "agreed";

export type BookingStatus =
  | "pending_provider"
  | "pending_payment"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "declined"
  | "expired"
  | "disputed";

export type ServiceCategory = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder: number;
};

export type ServicePackage = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price: number;
  durationMinutes?: number | null;
  inclusions?: string[] | null;
};

export type ServiceAddon = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  maxQuantity: number;
};

export type ServiceImage = {
  id: string;
  imageUrl?: string | null;
  caption?: string | null;
  isPortfolio: boolean;
};

export type ServiceSummary = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  storeId: string;
  categoryId?: string | null;
  pricingModel: ServicePricingModel;
  bookingType: ServiceBookingType;
  basePrice: number;
  currency: string;
  durationMinutes?: number | null;
  locationModes?: ServiceLocationMode[] | null;
  rating?: number | null;
  reviewCount: number;
  imageUrl?: string | null;
};

export type ServiceDetail = ServiceSummary & {
  description?: string | null;
  paymentTiming: "upfront" | "free";
  serviceAreas?: string[] | null;
  leadTimeHours: number;
  maxAdvanceDays: number;
  requirementsNote?: string | null;
  cancellationPolicy?: string | null;
  bookingCount: number;
  packages: ServicePackage[];
  addons: ServiceAddon[];
  images: ServiceImage[];
};

export type ServiceSlot = {
  startAt: string;
  endAt: string;
};

/** What the backend says a configuration costs. Never computed locally. */
export type BookingQuote = {
  currency: string;
  baseAmount: number;
  addonsAmount: number;
  totalAmount: number;
  dueNow: number;
  durationMinutes: number;
  addons: {
    title: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
};

export type BookingAddonLine = {
  title: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Booking = {
  id: string;
  bookingNumber: string;
  serviceId: string;
  storeId: string;
  status: BookingStatus;
  bookingType: ServiceBookingType;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  locationMode?: ServiceLocationMode | null;
  locationAddress?: string | null;
  customerNote?: string | null;
  currency: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  paymentDeadlineAt?: string | null;
  confirmedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  addons: BookingAddonLine[];
};

/** What Odos is holding, and when it releases. */
export type BookingHold = {
  amountHeld: number;
  workCompletedAt?: string | null;
  autoReleaseAt?: string | null;
  customerConfirmedAt?: string | null;
  releasedAt?: string | null;
  awaitingConfirmation: boolean;
};

export type Quotation = {
  id: string;
  reference: string;
  serviceId: string;
  status: "requested" | "sent" | "accepted" | "declined" | "expired" | "withdrawn";
  customerBrief: string;
  quotedAmount?: number | null;
  currency: string;
  providerMessage?: string | null;
  estimatedDurationMinutes?: number | null;
  expiresAt?: string | null;
  bookingId?: string | null;
  createdAt: string;
};

export type ServiceSearchFilters = {
  query?: string;
  categoryId?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  locationMode?: ServiceLocationMode;
  bookingType?: ServiceBookingType;
};

/**
 * The single source of truth for what a service's primary button says.
 *
 * Derived from `bookingType` rather than chosen per screen, so the detail
 * page, a card and the booking sheet cannot disagree about what tapping
 * will do — and so a quote-only service can never show "Book now".
 */
export function primaryActionLabel(bookingType: ServiceBookingType): string {
  switch (bookingType) {
    case "instant":
      return "Book now";
    case "request":
      return "Request booking";
    case "quote":
      return "Request a quote";
    case "consultation":
      return "Request consultation";
  }
}

/** Whether choosing a date and time is part of this service's flow. */
export function needsSlotSelection(bookingType: ServiceBookingType): boolean {
  return bookingType === "instant" || bookingType === "request";
}

export function formatPriceLabel(service: ServiceSummary): string {
  const amount = `₵${service.basePrice.toFixed(2)}`;
  switch (service.pricingModel) {
    case "quote":
      return "Price on request";
    case "consultation":
      return "Free consultation";
    case "hourly":
      return `${amount} / hour`;
    case "starting_at":
      return `From ${amount}`;
    case "package":
      return `From ${amount}`;
    default:
      return amount;
  }
}
