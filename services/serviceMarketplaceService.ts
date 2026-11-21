/**
 * Client for the services marketplace API.
 *
 * Every function here is a thin, typed wrapper over an endpoint — the
 * mapping from the backend's snake_case to the app's camelCase lives in one
 * place so screens never touch raw payloads, and so a field rename is a
 * single edit rather than a sweep.
 *
 * No pricing arithmetic happens in this file or above it. The backend is
 * authoritative on every amount; `quoteBooking` exists precisely so the UI
 * can show a total it did not compute.
 */

import { apiJson } from "@/services/apiClient";
import type {
  Booking,
  BookingHold,
  BookingQuote,
  Quotation,
  ServiceCategory,
  ServiceDetail,
  ServiceSearchFilters,
  ServiceSlot,
  ServiceSummary,
} from "@/types/service";

type Json = Record<string, any>;

function mapCategory(raw: Json): ServiceCategory {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle ?? null,
    icon: raw.icon ?? null,
    imageUrl: raw.image_url ?? null,
    parentId: raw.parent_id ?? null,
    sortOrder: raw.sort_order ?? 0,
  };
}

function mapSummary(raw: Json): ServiceSummary {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    summary: raw.summary ?? null,
    storeId: raw.store_id,
    categoryId: raw.category_id ?? null,
    pricingModel: raw.pricing_model,
    bookingType: raw.booking_type,
    basePrice: Number(raw.base_price ?? 0),
    currency: raw.currency ?? "GHS",
    durationMinutes: raw.duration_minutes ?? null,
    locationModes: raw.location_modes ?? null,
    rating: raw.rating ?? null,
    reviewCount: raw.review_count ?? 0,
    imageUrl: raw.image_url ?? null,
  };
}

function mapDetail(raw: Json): ServiceDetail {
  return {
    ...mapSummary(raw),
    description: raw.description ?? null,
    paymentTiming: raw.payment_timing ?? "upfront",
    serviceAreas: raw.service_areas ?? null,
    leadTimeHours: raw.lead_time_hours ?? 2,
    maxAdvanceDays: raw.max_advance_days ?? 60,
    requirementsNote: raw.requirements_note ?? null,
    cancellationPolicy: raw.cancellation_policy ?? null,
    bookingCount: raw.booking_count ?? 0,
    packages: (raw.packages ?? []).map((p: Json) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description ?? null,
      price: Number(p.price ?? 0),
      durationMinutes: p.duration_minutes ?? null,
      inclusions: p.inclusions ?? null,
    })),
    addons: (raw.addons ?? []).map((a: Json) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      description: a.description ?? null,
      price: Number(a.price ?? 0),
      durationMinutes: a.duration_minutes ?? 0,
      maxQuantity: a.max_quantity ?? 1,
    })),
    images: (raw.images ?? []).map((i: Json) => ({
      id: i.id,
      imageUrl: i.image_url ?? null,
      caption: i.caption ?? null,
      isPortfolio: Boolean(i.is_portfolio),
    })),
  };
}

function mapBooking(raw: Json): Booking {
  return {
    id: raw.id,
    bookingNumber: raw.booking_number,
    serviceId: raw.service_id,
    storeId: raw.store_id,
    status: raw.status,
    bookingType: raw.booking_type,
    scheduledStartAt: raw.scheduled_start_at ?? null,
    scheduledEndAt: raw.scheduled_end_at ?? null,
    locationMode: raw.location_mode ?? null,
    locationAddress: raw.location_address ?? null,
    customerNote: raw.customer_note ?? null,
    currency: raw.currency ?? "GHS",
    totalAmount: Number(raw.total_amount ?? 0),
    amountPaid: Number(raw.amount_paid ?? 0),
    paymentStatus: raw.payment_status ?? "unpaid",
    paymentDeadlineAt: raw.payment_deadline_at ?? null,
    confirmedAt: raw.confirmed_at ?? null,
    completedAt: raw.completed_at ?? null,
    createdAt: raw.created_at,
    addons: (raw.addons ?? []).map((a: Json) => ({
      title: a.title,
      unitPrice: Number(a.unit_price ?? 0),
      quantity: a.quantity ?? 1,
      lineTotal: Number(a.line_total ?? 0),
    })),
  };
}

function mapQuotation(raw: Json): Quotation {
  return {
    id: raw.id,
    reference: raw.reference,
    serviceId: raw.service_id,
    status: raw.status,
    customerBrief: raw.customer_brief,
    quotedAmount: raw.quoted_amount ?? null,
    currency: raw.currency ?? "GHS",
    providerMessage: raw.provider_message ?? null,
    estimatedDurationMinutes: raw.estimated_duration_minutes ?? null,
    expiresAt: raw.expires_at ?? null,
    bookingId: raw.booking_id ?? null,
    createdAt: raw.created_at,
  };
}

// --- Discovery -------------------------------------------------------------

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const raw = await apiJson<Json[]>("/services/categories");
  return raw.map(mapCategory);
}

export async function searchServices(
  filters: ServiceSearchFilters = {},
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<ServiceSummary[]> {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categoryId) params.set("category_id", filters.categoryId);
  if (filters.city) params.set("city", filters.city);
  if (filters.minPrice != null) params.set("min_price", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("max_price", String(filters.maxPrice));
  if (filters.minRating != null) params.set("min_rating", String(filters.minRating));
  if (filters.locationMode) params.set("location_mode", filters.locationMode);
  if (filters.bookingType) params.set("booking_type", filters.bookingType);
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  const raw = await apiJson<Json[]>(`/services?${params.toString()}`);
  return raw.map(mapSummary);
}

export async function fetchService(serviceId: string): Promise<ServiceDetail> {
  return mapDetail(await apiJson<Json>(`/services/${encodeURIComponent(serviceId)}`));
}

export async function fetchServiceSlots(
  serviceId: string,
  {
    day,
    packageId,
    addonIds,
    hours,
  }: { day: string; packageId?: string; addonIds?: string[]; hours?: number },
): Promise<ServiceSlot[]> {
  const params = new URLSearchParams({ day });
  if (packageId) params.set("package_id", packageId);
  if (hours != null) params.set("hours", String(hours));
  // Duration depends on the chosen extras, so the slot query must carry
  // them — otherwise the list offers times the booking cannot fit into.
  for (const id of addonIds ?? []) params.append("addon_ids", id);

  const raw = await apiJson<Json[]>(
    `/services/${encodeURIComponent(serviceId)}/slots?${params.toString()}`,
  );
  return raw.map((slot) => ({ startAt: slot.start_at, endAt: slot.end_at }));
}

// --- Pricing ---------------------------------------------------------------

export async function quoteBooking(
  serviceId: string,
  selection: {
    packageId?: string;
    addons?: { addonId: string; quantity: number }[];
    hours?: number;
  },
): Promise<BookingQuote> {
  const raw = await apiJson<Json>(
    `/services/${encodeURIComponent(serviceId)}/quote`,
    {
      method: "POST",
      json: {
        package_id: selection.packageId ?? null,
        addons: (selection.addons ?? []).map((a) => ({
          addon_id: a.addonId,
          quantity: a.quantity,
        })),
        hours: selection.hours ?? null,
      },
    },
  );
  return {
    currency: raw.currency,
    baseAmount: Number(raw.base_amount ?? 0),
    addonsAmount: Number(raw.addons_amount ?? 0),
    totalAmount: Number(raw.total_amount ?? 0),
    dueNow: Number(raw.due_now ?? 0),
    durationMinutes: raw.duration_minutes ?? 0,
    addons: (raw.addons ?? []).map((a: Json) => ({
      title: a.title,
      unitPrice: Number(a.unit_price ?? 0),
      quantity: a.quantity ?? 1,
      lineTotal: Number(a.line_total ?? 0),
    })),
  };
}

// --- Booking ---------------------------------------------------------------

export async function createBooking(
  serviceId: string,
  accessToken: string,
  input: {
    packageId?: string;
    addons?: { addonId: string; quantity: number }[];
    hours?: number;
    startAt?: string;
    locationMode?: string;
    locationAddress?: string;
    locationCity?: string;
    customerNote?: string;
  },
): Promise<Booking> {
  const raw = await apiJson<Json>(
    `/services/${encodeURIComponent(serviceId)}/bookings`,
    {
      method: "POST",
      accessToken,
      json: {
        package_id: input.packageId ?? null,
        addons: (input.addons ?? []).map((a) => ({
          addon_id: a.addonId,
          quantity: a.quantity,
        })),
        hours: input.hours ?? null,
        start_at: input.startAt ?? null,
        location_mode: input.locationMode ?? null,
        location_address: input.locationAddress ?? null,
        location_city: input.locationCity ?? null,
        customer_note: input.customerNote ?? null,
      },
    },
  );
  return mapBooking(raw);
}

export async function fetchMyBookings(
  accessToken: string,
  { status }: { status?: string } = {},
): Promise<Booking[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const raw = await apiJson<Json[]>(
    `/bookings${params.toString() ? `?${params}` : ""}`,
    { accessToken },
  );
  return raw.map(mapBooking);
}

export async function fetchBooking(
  bookingId: string,
  accessToken: string,
): Promise<Booking> {
  return mapBooking(await apiJson<Json>(`/bookings/${bookingId}`, { accessToken }));
}

/** Opens a KutanaPay checkout for the full amount. */
export async function startBookingCheckout(
  bookingId: string,
  accessToken: string,
  { paymentPhone, callbackUrl }: { paymentPhone?: string; callbackUrl?: string } = {},
): Promise<{ reference: string; authorizationUrl: string; amount: number }> {
  const params = new URLSearchParams();
  if (paymentPhone) params.set("payment_phone", paymentPhone);
  if (callbackUrl) params.set("callback_url", callbackUrl);

  const raw = await apiJson<Json>(
    `/bookings/${bookingId}/checkout${params.toString() ? `?${params}` : ""}`,
    { method: "POST", accessToken },
  );
  return {
    reference: raw.reference,
    authorizationUrl: raw.authorization_url,
    amount: Number(raw.amount ?? 0),
  };
}

/**
 * Asks the backend to confirm the payment with the gateway.
 *
 * The app never decides a payment succeeded — returning from the checkout
 * page only means the customer came back, not that money moved.
 */
export async function verifyBookingPayment(
  reference: string,
  accessToken: string,
): Promise<{ paid: boolean; bookingStatus?: string }> {
  const raw = await apiJson<Json>(`/bookings/payments/${reference}/verify`, {
    method: "POST",
    accessToken,
  });
  return { paid: Boolean(raw.paid), bookingStatus: raw.booking_status ?? undefined };
}

export async function fetchBookingHold(
  bookingId: string,
  accessToken: string,
): Promise<BookingHold> {
  const raw = await apiJson<Json>(`/bookings/${bookingId}/hold`, { accessToken });
  return {
    amountHeld: Number(raw.amount_held ?? 0),
    workCompletedAt: raw.work_completed_at ?? null,
    autoReleaseAt: raw.auto_release_at ?? null,
    customerConfirmedAt: raw.customer_confirmed_at ?? null,
    releasedAt: raw.released_at ?? null,
    awaitingConfirmation: Boolean(raw.awaiting_confirmation),
  };
}

/** Releases the held payment to the provider. */
export async function confirmBookingWork(
  bookingId: string,
  accessToken: string,
): Promise<Booking> {
  return mapBooking(
    await apiJson<Json>(`/bookings/${bookingId}/confirm`, {
      method: "POST",
      accessToken,
    }),
  );
}

export async function transitionBooking(
  bookingId: string,
  accessToken: string,
  toStatus: string,
  note?: string,
): Promise<Booking> {
  return mapBooking(
    await apiJson<Json>(`/bookings/${bookingId}/transition`, {
      method: "POST",
      accessToken,
      json: { to_status: toStatus, note: note ?? null },
    }),
  );
}

// --- Quotations ------------------------------------------------------------

export async function requestQuotation(
  serviceId: string,
  accessToken: string,
  input: {
    brief: string;
    preferredDate?: string;
    locationMode?: string;
    locationCity?: string;
  },
): Promise<Quotation> {
  return mapQuotation(
    await apiJson<Json>(`/services/${encodeURIComponent(serviceId)}/quotations`, {
      method: "POST",
      accessToken,
      json: {
        brief: input.brief,
        preferred_date: input.preferredDate ?? null,
        location_mode: input.locationMode ?? null,
        location_city: input.locationCity ?? null,
      },
    }),
  );
}

export async function fetchMyQuotations(accessToken: string): Promise<Quotation[]> {
  const raw = await apiJson<Json[]>("/quotations", { accessToken });
  return raw.map(mapQuotation);
}

export async function acceptQuotation(
  quotationId: string,
  accessToken: string,
  input: { startAt?: string; locationAddress?: string; customerNote?: string } = {},
): Promise<Booking> {
  return mapBooking(
    await apiJson<Json>(`/quotations/${quotationId}/accept`, {
      method: "POST",
      accessToken,
      json: {
        start_at: input.startAt ?? null,
        location_address: input.locationAddress ?? null,
        customer_note: input.customerNote ?? null,
      },
    }),
  );
}

export async function declineQuotation(
  quotationId: string,
  accessToken: string,
): Promise<Quotation> {
  return mapQuotation(
    await apiJson<Json>(`/quotations/${quotationId}/decline`, {
      method: "POST",
      accessToken,
    }),
  );
}
