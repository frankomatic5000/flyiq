export type ChatRequest = {
  message: string;
  userId?: string;
};

export function parseChatRequest(body: unknown): ChatRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be an object.");
  }

  const candidate = body as Record<string, unknown>;
  const message = typeof candidate.message === "string" ? candidate.message.trim() : "";
  const userId = typeof candidate.userId === "string" ? candidate.userId.trim() : undefined;

  if (message.length < 2) {
    throw new Error("Message must be at least 2 characters.");
  }

  if (message.length > 500) {
    throw new Error("Message must be 500 characters or fewer.");
  }

  return { message, userId };
}

export function sanitizeAirportCode(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.toUpperCase().replace(/[^A-Z]/g, "");
  return normalized.length >= 3 ? normalized.slice(0, 3) : undefined;
}
