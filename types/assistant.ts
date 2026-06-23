export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedActions?: AssistantAction[];
  escalatedToSupport?: boolean;
  createdAt: number;
};

export type AssistantAction = {
  label: string;
  route: string;
};

export type AssistantStatus = {
  enabled: boolean;
  provider: string;
  model?: string | null;
};
