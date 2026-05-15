export type ChatParticipantRole = "customer" | "vendor" | "admin";
export type ChatThreadScope = "customer" | "vendor" | "support";
export type ChatThreadType = "store" | "support";
export type SupportChatStatus =
  | "waiting_on_admin"
  | "waiting_on_customer"
  | "resolved";

export type ChatStoreSummary = {
  id: string;
  title: string;
  imageKey?: string | null;
  imageUrl?: string | null;
};

export type ChatProductSummary = {
  id?: string | null;
  title?: string | null;
  imageUrl?: string | null;
};

export type ChatCounterpart = {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  role: ChatParticipantRole;
};

export type ChatThread = {
  id: string;
  customerUserId: string;
  vendorUserId: string;
  threadType: ChatThreadType;
  store: ChatStoreSummary;
  counterpart: ChatCounterpart;
  subject?: string | null;
  product?: ChatProductSummary | null;
  supportStatus?: SupportChatStatus | null;
  assignedAdminUserId?: string | null;
  assignedAdminName?: string | null;
  assignedAdminAt?: string | null;
  resolvedAt?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderUserId: string;
  recipientUserId: string;
  senderRole: ChatParticipantRole;
  text: string;
  isRead: boolean;
  readAt?: string | null;
  time: string;
};

export type EnsureChatThreadInput = {
  storeId: string;
  productId?: string | null;
  productTitle?: string | null;
  productImageUrl?: string | null;
};

export type EnsureSupportChatThreadInput = {
  subject?: string | null;
};
