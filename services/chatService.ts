import { ACCESS_TOKEN_STORAGE_KEY, API_BASE_URL } from "@/constants/auth";
import type {
  ChatMessage,
  ChatThread,
  ChatThreadScope,
  EnsureSupportChatThreadInput,
  EnsureChatThreadInput,
} from "@/types/chat";
import { resolveApiMediaUrl } from "@/utils/media";
import * as SecureStore from "expo-secure-store";

type ChatThreadApi = {
  id: string;
  customer_user_id: string;
  vendor_user_id: string;
  thread_type: "store" | "support";
  store: {
    id: string;
    title: string;
    image_key?: string | null;
    image_url?: string | null;
  };
  counterpart: {
    user_id: string;
    name: string;
    avatar_url?: string | null;
    role: "customer" | "vendor" | "admin";
  };
  subject?: string | null;
  product?: {
    id?: string | null;
    title?: string | null;
    image_url?: string | null;
  } | null;
  support_status?: "waiting_on_admin" | "waiting_on_customer" | "resolved" | null;
  assigned_admin_user_id?: string | null;
  assigned_admin_name?: string | null;
  assigned_admin_at?: string | null;
  resolved_at?: string | null;
  last_message_text?: string | null;
  last_message_at?: string | null;
  unread_count?: number;
  created_at: string;
  updated_at: string;
};

type ChatMessageApi = {
  id: string;
  thread_id: string;
  sender_user_id: string;
  recipient_user_id: string;
  sender_role: "customer" | "vendor" | "admin";
  body: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
};

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

async function requireAccessToken(currentToken?: string | null) {
  const token =
    currentToken || (await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY));
  if (!token) {
    throw new Error("Please sign in to continue.");
  }
  return token;
}

function mapThread(payload: ChatThreadApi): ChatThread {
  return {
    id: payload.id,
    customerUserId: payload.customer_user_id,
    vendorUserId: payload.vendor_user_id,
    threadType: payload.thread_type,
    store: {
      id: payload.store.id,
      title: payload.store.title,
      imageKey: payload.store.image_key ?? undefined,
      imageUrl:
        resolveApiMediaUrl(payload.store.image_url) ??
        payload.store.image_url ??
        undefined,
    },
    counterpart: {
      userId: payload.counterpart.user_id,
      name: payload.counterpart.name,
      avatarUrl:
        resolveApiMediaUrl(payload.counterpart.avatar_url) ??
        payload.counterpart.avatar_url ??
        undefined,
      role: payload.counterpart.role,
    },
    subject: payload.subject ?? undefined,
    product: payload.product
      ? {
          id: payload.product.id ?? undefined,
          title: payload.product.title ?? undefined,
          imageUrl:
            resolveApiMediaUrl(payload.product.image_url) ??
            payload.product.image_url ??
            undefined,
        }
      : undefined,
    supportStatus: payload.support_status ?? undefined,
    assignedAdminUserId: payload.assigned_admin_user_id ?? undefined,
    assignedAdminName: payload.assigned_admin_name ?? undefined,
    assignedAdminAt: payload.assigned_admin_at ?? undefined,
    resolvedAt: payload.resolved_at ?? undefined,
    lastMessageText: payload.last_message_text ?? undefined,
    lastMessageAt: payload.last_message_at ?? undefined,
    unreadCount: payload.unread_count ?? 0,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

function mapMessage(payload: ChatMessageApi): ChatMessage {
  return {
    id: payload.id,
    threadId: payload.thread_id,
    senderUserId: payload.sender_user_id,
    recipientUserId: payload.recipient_user_id,
    senderRole: payload.sender_role,
    text: payload.body,
    isRead: payload.is_read,
    readAt: payload.read_at ?? undefined,
    time: payload.created_at,
  };
}

export async function fetchChatThreads(
  scope: ChatThreadScope,
  accessToken?: string | null,
) {
  const token = await requireAccessToken(accessToken);
  const response = await fetch(
    `${API_BASE_URL}/chat/threads?scope=${encodeURIComponent(scope)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ChatThreadApi[];
  return payload.map(mapThread);
}

export async function ensureStoreChatThread(
  input: EnsureChatThreadInput,
  accessToken?: string | null,
) {
  const token = await requireAccessToken(accessToken);
  const response = await fetch(
    `${API_BASE_URL}/chat/threads/store/${encodeURIComponent(input.storeId)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: input.productId ?? undefined,
        product_title: input.productTitle ?? undefined,
        product_image_url: input.productImageUrl ?? undefined,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return mapThread((await response.json()) as ChatThreadApi);
}

export async function ensureSupportChatThread(
  input: EnsureSupportChatThreadInput,
  accessToken?: string | null,
) {
  const token = await requireAccessToken(accessToken);
  const response = await fetch(`${API_BASE_URL}/chat/threads/support`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      subject: input.subject ?? undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return mapThread((await response.json()) as ChatThreadApi);
}

export async function fetchChatMessages(
  threadId: string,
  accessToken?: string | null,
) {
  const token = await requireAccessToken(accessToken);
  const response = await fetch(
    `${API_BASE_URL}/chat/threads/${encodeURIComponent(threadId)}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ChatMessageApi[];
  return payload.map(mapMessage);
}

export async function createChatMessage(
  threadId: string,
  body: string,
  accessToken?: string | null,
) {
  const token = await requireAccessToken(accessToken);
  const response = await fetch(
    `${API_BASE_URL}/chat/threads/${encodeURIComponent(threadId)}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return mapMessage((await response.json()) as ChatMessageApi);
}
