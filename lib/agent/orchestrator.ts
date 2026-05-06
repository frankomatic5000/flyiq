import { planTravel } from "./planner";
import { executeToolCall, staticIntelligence } from "./tools";
import type { AgentCard, AgentChatResponse } from "./types";

export async function runAgentChat(message: string, userId?: string): Promise<AgentChatResponse> {
  const plan = await planTravel(message, userId);
  const results = await Promise.all(plan.toolCalls.map((call) => executeToolCall(call)));
  const route = plan.intent.route || [plan.intent.origin, plan.intent.destination].filter(Boolean).join("-");
  const intelligence = staticIntelligence(route);

  return {
    assistantMessage: buildAssistantMessage(plan.intent.intent, route),
    reasoningSummary: buildReasoningSummary(plan.toolCalls.map((call) => call.name)),
    intent: plan.intent,
    toolCalls: plan.toolCalls,
    cards: buildCards(results, intelligence.pricing.proactive),
    actions: [
      { type: "set_alert", label: "Monitor this route", payload: { route } },
      { type: "save_route", label: "Save route", payload: { route } },
      { type: "search_backup", label: "Open backup search", payload: { route } }
    ]
  };
}

function buildAssistantMessage(intent: string, route: string) {
  if (intent === "price_alert") {
    return `I can monitor ${route || "that route"} and flag meaningful drops. I also recommend checking Tuesday movement before booking.`;
  }

  if (intent === "booking_window") {
    return `For ${route || "that route"}, the booking window matters more than incognito mode. I calculated the likely timing window and day-pattern guidance.`;
  }

  if (intent === "nearby_airports") {
    return `I compared nearby airport options and found where flexibility may reduce the fare.`;
  }

  return `I checked the route, flexible-date patterns, and price intelligence. The strongest next move is to compare Monday departures with Wednesday returns and set a monitor if you are not ready to book.`;
}

function buildReasoningSummary(toolNames: string[]) {
  return `Classified the message, selected ${toolNames.join(", ")}, then combined route data with booking-window and day-of-week intelligence.`;
}

function buildCards(results: unknown[], proactive: string): AgentCard[] {
  const serialized = results.map((result) => summarizeResult(result)).filter(Boolean);

  return [
    {
      title: "Flight options",
      body: serialized[0] || "No route result yet. Ask with origin, destination, and timing for a stronger answer.",
      tone: "blue"
    },
    {
      title: "Savings insight",
      body: "Monday departures, Wednesday returns, and Sunday booking checks can be favorable. Airline repricing is frequent, so alerts are useful.",
      tone: "green"
    },
    {
      title: "Proactive prompt",
      body: proactive,
      tone: "amber"
    }
  ];
}

function summarizeResult(result: unknown): string {
  if (Array.isArray(result)) {
    return result
      .slice(0, 2)
      .map((item) => summarizeObject(item))
      .join(" ");
  }

  if (result && typeof result === "object") {
    return summarizeObject(result);
  }

  return "";
}

function summarizeObject(value: object): string {
  const record = value as Record<string, unknown>;
  if (typeof record.summary === "string") return record.summary;
  if (typeof record.guidance === "string") return record.guidance;
  if (typeof record.insight === "string") return record.insight;
  if (typeof record.route === "string" && typeof record.estimatedPrice === "number") {
    return `${record.route}: estimated $${record.estimatedPrice}.`;
  }
  return Object.entries(record)
    .slice(0, 3)
    .map(([key, item]) => `${key}: ${String(item)}`)
    .join(", ");
}
