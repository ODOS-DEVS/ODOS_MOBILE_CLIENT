type StreamDonePayload = {
  reply: string;
  suggested_actions?: { label: string; route: string; params?: Record<string, string> }[];
  escalated_to_support?: boolean;
  conversation_id?: string | null;
  message_id?: string | null;
  products?: unknown[];
  stores?: unknown[];
};

export type AssistantStreamHandlers = {
  onToken: (text: string) => void;
  onDone: (payload: StreamDonePayload) => void;
  onError: (message: string) => void;
};

function parseSseBlock(block: string, handlers: AssistantStreamHandlers) {
  const lines = block.split("\n");
  let event = "message";
  let data = "";
  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data += line.slice(5).trim();
    }
  }
  if (!data) {
    return;
  }
  const payload = JSON.parse(data) as Record<string, unknown>;
  if (event === "token") {
    handlers.onToken(String(payload.text ?? ""));
    return;
  }
  if (event === "done") {
    handlers.onDone(payload as StreamDonePayload);
  }
}

export async function consumeAssistantStream(
  response: Response,
  handlers: AssistantStreamHandlers,
): Promise<boolean> {
  const reader = response.body?.getReader?.();
  if (!reader) {
    return false;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      if (part.trim()) {
        parseSseBlock(part.trim(), handlers);
      }
    }
  }

  if (buffer.trim()) {
    parseSseBlock(buffer.trim(), handlers);
  }

  return true;
}
