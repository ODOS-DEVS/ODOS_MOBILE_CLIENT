import { API_BASE_URL } from "@/constants/auth";
import type {
  VendorVoucher,
  VendorVoucherInput,
} from "@/types/store";
import type { VendorSessionContext } from "@/types/vendor";

type VendorVoucherApi = {
  id: string;
  code?: string;
  title?: string;
  description?: string | null;
  issuer_name?: string | null;
  availability?: VendorVoucher["availability"];
  reward_text?: string;
  discount_type?: VendorVoucher["discountType"];
  discount_value?: number;
  min_subtotal?: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  per_user_limit?: number | null;
  is_active?: boolean;
  status?: string;
  redemption_count?: number;
  unique_user_count?: number;
  total_discount_amount?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
};

function requireToken(session: VendorSessionContext) {
  if (!session.accessToken) {
    throw new Error("Please sign in to continue.");
  }
}

async function parseErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    return typeof payload?.detail === "string"
      ? payload.detail
      : "We couldn't complete that request.";
  } catch {
    return response.statusText || "We couldn't complete that request.";
  }
}

function mapVoucher(payload: VendorVoucherApi): VendorVoucher {
  return {
    id: payload.id,
    code: payload.code ?? "",
    title: payload.title ?? "",
    description: payload.description ?? undefined,
    issuerName: payload.issuer_name ?? undefined,
    availability: payload.availability ?? "claim",
    rewardText: payload.reward_text ?? "",
    discountType: payload.discount_type ?? "percent",
    discountValue: payload.discount_value ?? 0,
    minSubtotal: payload.min_subtotal ?? 0,
    maxDiscount: payload.max_discount ?? undefined,
    usageLimit: payload.usage_limit ?? undefined,
    perUserLimit: payload.per_user_limit ?? undefined,
    isActive: payload.is_active ?? true,
    status: payload.status ?? "active",
    redemptionCount: payload.redemption_count ?? 0,
    uniqueUserCount: payload.unique_user_count ?? 0,
    totalDiscountAmount: payload.total_discount_amount ?? 0,
    startsAt: payload.starts_at ?? undefined,
    endsAt: payload.ends_at ?? undefined,
    createdAt: payload.created_at ?? new Date().toISOString(),
  };
}

function toPayload(input: VendorVoucherInput) {
  return {
    code: input.code.trim().toUpperCase(),
    title: input.title.trim(),
    description: input.description?.trim() || null,
    issuer_name: input.issuerName?.trim() || null,
    availability: input.availability,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_subtotal: input.minSubtotal,
    max_discount: input.maxDiscount ?? null,
    usage_limit: input.usageLimit ?? null,
    per_user_limit: input.perUserLimit ?? null,
    is_active: input.isActive,
    starts_at: input.startsAt ?? null,
    ends_at: input.endsAt ?? null,
  };
}

export async function fetchVendorVouchers(session: VendorSessionContext) {
  requireToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/vouchers`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  const payload = (await response.json()) as VendorVoucherApi[];
  return payload.map(mapVoucher);
}

export async function createVendorVoucher(session: VendorSessionContext, input: VendorVoucherInput) {
  requireToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/vouchers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(toPayload(input)),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return mapVoucher((await response.json()) as VendorVoucherApi);
}

export async function updateVendorVoucher(
  session: VendorSessionContext,
  voucherId: string,
  input: VendorVoucherInput,
) {
  requireToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/vouchers/${encodeURIComponent(voucherId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(toPayload(input)),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return mapVoucher((await response.json()) as VendorVoucherApi);
}

export async function archiveVendorVoucher(session: VendorSessionContext, voucherId: string) {
  requireToken(session);
  const response = await fetch(`${API_BASE_URL}/vendor/vouchers/${encodeURIComponent(voucherId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function giftVendorVoucher(
  session: VendorSessionContext,
  voucherId: string,
  recipientEmail: string,
  note?: string,
) {
  requireToken(session);
  const response = await fetch(
    `${API_BASE_URL}/vendor/vouchers/${encodeURIComponent(voucherId)}/gift`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        recipient_email: recipientEmail.trim().toLowerCase(),
        note: note?.trim() || null,
      }),
    },
  );
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return mapVoucher((await response.json()) as VendorVoucherApi);
}
