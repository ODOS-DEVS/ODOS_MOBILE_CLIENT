import * as SecureStore from "expo-secure-store";

import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import { parseApiErrorMessage } from "@/services/apiClient";

/** Mirrors `chatService`'s own helper, which is module-private there. */
async function requireAccessToken(currentToken?: string | null) {
  const token = currentToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY));
  if (!token) {
    throw new Error("Please sign in to continue.");
  }
  return token;
}

export type NegotiationActor = "customer" | "vendor";

export type NegotiationOffer = {
  id: string;
  actorRole: NegotiationActor;
  unitPrice: number;
  quantity: number;
  message?: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "superseded";
  createdAt: string;
};

export type NegotiationAgreement = {
  id: string;
  reference: string;
  listedUnitPrice: number;
  agreedUnitPrice: number;
  quantity: number;
  currency: string;
  status: "accepted" | "used" | "expired" | "cancelled";
  expiresAt: string;
  /** Counted by the server, so a wrong device clock cannot show a dead deal as live. */
  secondsRemaining: number;
  orderNumber?: string | null;
};

export type Negotiation = {
  id: string;
  reference: string;
  productId: string;
  productTitle: string;
  productImageUrl?: string | null;
  storeId: string;
  storeName?: string | null;
  vendorUserId: string;
  customerUserId: string;
  customerName?: string | null;
  listedUnitPrice: number;
  status: "open" | "agreed" | "rejected" | "withdrawn" | "expired" | "completed";
  /** Whose move it is, or null when nothing is pending. */
  awaiting?: NegotiationActor | null;
  latestOffer?: NegotiationOffer | null;
  agreement?: NegotiationAgreement | null;
  offers: NegotiationOffer[];
  updatedAt: string;
};

type OfferApi = {
  id: string;
  actor_role: NegotiationActor;
  unit_price: number;
  quantity: number;
  message?: string | null;
  status: NegotiationOffer["status"];
  created_at: string;
};

type AgreementApi = {
  id: string;
  reference: string;
  listed_unit_price: number;
  agreed_unit_price: number;
  quantity: number;
  currency: string;
  status: NegotiationAgreement["status"];
  expires_at: string;
  seconds_remaining?: number;
  order_number?: string | null;
};

type NegotiationApi = {
  id: string;
  reference: string;
  product_id: string;
  product_title: string;
  product_image_url?: string | null;
  store_id: string;
  store_name?: string | null;
  vendor_user_id: string;
  customer_user_id: string;
  customer_name?: string | null;
  listed_unit_price: number;
  status: Negotiation["status"];
  awaiting?: NegotiationActor | null;
  latest_offer?: OfferApi | null;
  agreement?: AgreementApi | null;
  offers?: OfferApi[];
  updated_at: string;
};

const mapOffer = (row: OfferApi): NegotiationOffer => ({
  id: row.id,
  actorRole: row.actor_role,
  unitPrice: row.unit_price,
  quantity: row.quantity,
  message: row.message ?? null,
  status: row.status,
  createdAt: row.created_at,
});

const mapAgreement = (row: AgreementApi): NegotiationAgreement => ({
  id: row.id,
  reference: row.reference,
  listedUnitPrice: row.listed_unit_price,
  agreedUnitPrice: row.agreed_unit_price,
  quantity: row.quantity,
  currency: row.currency,
  status: row.status,
  expiresAt: row.expires_at,
  secondsRemaining: row.seconds_remaining ?? 0,
  orderNumber: row.order_number ?? null,
});

const mapNegotiation = (row: NegotiationApi): Negotiation => ({
  id: row.id,
  reference: row.reference,
  productId: row.product_id,
  productTitle: row.product_title,
  productImageUrl: row.product_image_url ?? null,
  storeId: row.store_id,
  storeName: row.store_name ?? null,
  vendorUserId: row.vendor_user_id,
  customerUserId: row.customer_user_id,
  customerName: row.customer_name ?? null,
  listedUnitPrice: row.listed_unit_price,
  status: row.status,
  awaiting: row.awaiting ?? null,
  latestOffer: row.latest_offer ? mapOffer(row.latest_offer) : null,
  agreement: row.agreement ? mapAgreement(row.agreement) : null,
  offers: (row.offers ?? []).map(mapOffer),
  updatedAt: row.updated_at,
});

async function call<T>(
  path: string,
  accessToken: string | null | undefined,
  init?: RequestInit,
): Promise<T> {
  const token = await requireAccessToken(accessToken);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response));
  }
  return (await response.json()) as T;
}

/**
 * Price negotiation.
 *
 * No call sends a price at checkout and none sends a user id: the API resolves the caller's
 * side from the negotiation itself and finds any agreed price from the signed-in shopper and
 * the product. There is nothing here a tampered request could redirect.
 */
export async function listNegotiations(
  role: NegotiationActor,
  accessToken?: string | null,
): Promise<Negotiation[]> {
  const rows = await call<NegotiationApi[]>(`/negotiations?role=${role}`, accessToken);
  return rows.map(mapNegotiation);
}

export async function getNegotiation(
  negotiationId: string,
  accessToken?: string | null,
): Promise<Negotiation> {
  return mapNegotiation(
    await call<NegotiationApi>(`/negotiations/${encodeURIComponent(negotiationId)}`, accessToken),
  );
}

export async function startNegotiation(
  input: {
    productId: string;
    unitPrice: number;
    quantity: number;
    message?: string | null;
    selectedColor?: string | null;
    selectedSize?: string | null;
  },
  accessToken?: string | null,
): Promise<Negotiation> {
  return mapNegotiation(
    await call<NegotiationApi>("/negotiations", accessToken, {
      method: "POST",
      body: JSON.stringify({
        product_id: input.productId,
        unit_price: input.unitPrice,
        quantity: input.quantity,
        message: input.message ?? null,
        selected_color: input.selectedColor ?? null,
        selected_size: input.selectedSize ?? null,
      }),
    }),
  );
}

export async function counterNegotiationOffer(
  negotiationId: string,
  input: { unitPrice: number; quantity?: number | null; message?: string | null },
  accessToken?: string | null,
): Promise<Negotiation> {
  return mapNegotiation(
    await call<NegotiationApi>(
      `/negotiations/${encodeURIComponent(negotiationId)}/counter`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          unit_price: input.unitPrice,
          quantity: input.quantity ?? null,
          message: input.message ?? null,
        }),
      },
    ),
  );
}

export async function acceptNegotiationOffer(
  negotiationId: string,
  accessToken?: string | null,
): Promise<Negotiation> {
  return mapNegotiation(
    await call<NegotiationApi>(
      `/negotiations/${encodeURIComponent(negotiationId)}/accept`,
      accessToken,
      { method: "POST" },
    ),
  );
}

export async function rejectNegotiationOffer(
  negotiationId: string,
  message?: string | null,
  accessToken?: string | null,
): Promise<Negotiation> {
  return mapNegotiation(
    await call<NegotiationApi>(
      `/negotiations/${encodeURIComponent(negotiationId)}/reject`,
      accessToken,
      { method: "POST", body: JSON.stringify({ message: message ?? null }) },
    ),
  );
}

export async function withdrawNegotiationOffer(
  negotiationId: string,
  accessToken?: string | null,
): Promise<Negotiation> {
  return mapNegotiation(
    await call<NegotiationApi>(
      `/negotiations/${encodeURIComponent(negotiationId)}/withdraw`,
      accessToken,
      { method: "POST" },
    ),
  );
}
