import { API_BASE_URL } from "@/constants/auth";
import type {
  VendorFlashSaleNomination,
  VendorFlashSaleNominationInput,
} from "@/types/store";
import type { VendorSessionContext } from "@/types/vendor";
import { resolveApiMediaUrl } from "@/utils/media";

type VendorFlashSaleNominationApi = {
  id: string;
  event_id?: string | null;
  event_title?: string | null;
  product_id: string;
  product_title?: string | null;
  product_image_url?: string | null;
  proposed_price?: number | null;
  proposed_old_price?: number | null;
  stock_limit?: number | null;
  max_per_user?: number | null;
  vendor_note?: string | null;
  status: string;
  review_notes?: string | null;
  created_at: string;
  updated_at: string;
};

function requireAccessToken(session: VendorSessionContext) {
  if (!session.accessToken) {
    throw new Error("Sign in again to manage flash sale nominations.");
  }
  return session.accessToken;
}

function buildHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function parseErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    return typeof payload?.detail === "string"
      ? payload.detail
      : "We couldn't complete that flash sale request.";
  } catch {
    return "We couldn't complete that flash sale request.";
  }
}

function mapNomination(payload: VendorFlashSaleNominationApi): VendorFlashSaleNomination {
  return {
    id: payload.id,
    eventId: payload.event_id ?? undefined,
    eventTitle: payload.event_title ?? undefined,
    productId: payload.product_id,
    productTitle: payload.product_title ?? undefined,
    productImageUrl:
      resolveApiMediaUrl(payload.product_image_url) ?? payload.product_image_url ?? undefined,
    proposedPrice: payload.proposed_price ?? undefined,
    proposedOldPrice: payload.proposed_old_price ?? undefined,
    stockLimit: payload.stock_limit ?? undefined,
    maxPerUser: payload.max_per_user ?? undefined,
    vendorNote: payload.vendor_note ?? undefined,
    status: payload.status,
    reviewNotes: payload.review_notes ?? undefined,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

export async function fetchVendorFlashSaleNominations(session: VendorSessionContext) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/flash-sale-nominations`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as VendorFlashSaleNominationApi[];
  return payload.map(mapNomination);
}

export async function createVendorFlashSaleNomination(
  session: VendorSessionContext,
  input: VendorFlashSaleNominationInput,
) {
  const accessToken = requireAccessToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/flash-sale-nominations`, {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: JSON.stringify({
      product_id: input.productId,
      event_id: input.eventId ?? null,
      proposed_price: input.proposedPrice ?? null,
      proposed_old_price: input.proposedOldPrice ?? null,
      stock_limit: input.stockLimit ?? null,
      max_per_user: input.maxPerUser ?? null,
      vendor_note: input.vendorNote ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as VendorFlashSaleNominationApi;
  return mapNomination(payload);
}
