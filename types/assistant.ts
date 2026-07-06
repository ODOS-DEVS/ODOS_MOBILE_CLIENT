export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedActions?: AssistantAction[];
  products?: AssistantProduct[];
  stores?: AssistantStore[];
  escalatedToSupport?: boolean;
  feedbackRating?: number | null;
  createdAt: number;
};

export type AssistantAction = {
  label: string;
  route: string;
  params?: Record<string, string>;
};

export type AssistantProduct = {
  id: string;
  title: string;
  price: number;
  old_price?: number | null;
  discount?: string | null;
  image_url?: string | null;
  image_key?: string | null;
  store_id?: string | null;
  rating?: number | null;
  category?: string | null;
};

export type AssistantStore = {
  id: string;
  title: string;
  category?: string | null;
  image_url?: string | null;
  image_key?: string | null;
  market_slug?: string | null;
  market_title?: string | null;
  rating?: number | null;
};

export type AssistantNudge = {
  message: string;
  prompt: string;
  kind: string;
};

export type AssistantStatus = {
  enabled: boolean;
  provider: string;
  model?: string | null;
};

export type AssistantSession = {
  conversation_id?: string | null;
  messages: AssistantMessage[];
  nudge?: AssistantNudge | null;
};
