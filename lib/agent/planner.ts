import { agentToolDefinitions } from "./tool-definitions";
import type { AgentIntent, ToolCall, ToolName, TravelIntent } from "./types";
import { sanitizeAirportCode } from "./validation";

const cityToAirport: Record<string, string> = {
  paris: "PAR",
  "new york": "NYC",
  nyc: "NYC",
  la: "LAX",
  "los angeles": "LAX",
  boston: "BOS",
  rome: "FCO",
  london: "LON",
  chicago: "CHI",
  miami: "MIA"
};

export async function planTravel(message: string, userId?: string): Promise<{ intent: TravelIntent; toolCalls: ToolCall[] }> {
  const openAiPlan = await maybePlanWithOpenAi(message, userId);
  if (openAiPlan) return openAiPlan;

  const normalized = message.toLowerCase();
  const origin = extractOrigin(normalized);
  const destination = extractDestination(normalized);
  const route = origin && destination ? `${origin}-${destination}` : undefined;
  const month = extractMonth(normalized);
  const targetPrice = extractPrice(normalized);

  let intent: TravelIntent["intent"] = "flight_search";
  if (normalized.includes("cheapest") || normalized.includes("flexible")) intent = "cheapest_dates";
  if (normalized.includes("book") || normalized.includes("booking window")) intent = "booking_window";
  if (normalized.includes("nearby") || normalized.includes("airport")) intent = "nearby_airports";
  if (normalized.includes("alert") || normalized.includes("monitor")) intent = "price_alert";
  if (normalized.includes("preference")) intent = "preferences";

  const travelIntent: TravelIntent = {
    intent,
    origin,
    destination,
    month,
    route,
    targetPrice,
    userId
  };

  return {
    intent: travelIntent,
    toolCalls: toolCallsForIntent(travelIntent)
  };
}

function toolCallsForIntent(intent: TravelIntent): ToolCall[] {
  const route = intent.route || [intent.origin, intent.destination].filter(Boolean).join("-");
  const calls: ToolCall[] = [];

  if (intent.userId) {
    calls.push({ name: "get_user_preferences", arguments: { user_id: intent.userId } });
  }

  if (intent.intent === "cheapest_dates") {
    calls.push({
      name: "find_cheapest_dates",
      arguments: { origin: intent.origin, dest: intent.destination, month: intent.month || "next month" }
    });
  } else if (intent.intent === "booking_window") {
    calls.push({
      name: "calculate_booking_window",
      arguments: { route, travel_date: intent.dates?.depart || intent.month || "next trip" }
    });
  } else if (intent.intent === "nearby_airports") {
    calls.push({
      name: "compare_nearby_airports",
      arguments: { origin: intent.origin, dest: intent.destination, dates: intent.dates }
    });
  } else if (intent.intent === "price_alert") {
    calls.push({
      name: "set_price_alert",
      arguments: { route, target_price: intent.targetPrice || 350 }
    });
  } else if (intent.intent === "preferences") {
    calls.push({ name: "get_user_preferences", arguments: { user_id: intent.userId || "anonymous" } });
  } else {
    calls.push({
      name: "search_flights",
      arguments: { origin: intent.origin, dest: intent.destination, dates: intent.dates }
    });
  }

  return calls;
}

function extractOrigin(text: string): string | undefined {
  const fromMatch = text.match(/\bfrom\s+([a-z\s]{2,24})(?:\s+to|\s+for|\s+in|$)/);
  return sanitizeAirportCode(resolvePlace(fromMatch?.[1]));
}

function extractDestination(text: string): string | undefined {
  const toMatch = text.match(/\bto\s+([a-z\s]{2,24})(?:\s+next|\s+in|\s+for|\s+under|\s+on|$)/);
  return sanitizeAirportCode(resolvePlace(toMatch?.[1]));
}

function resolvePlace(place?: string): string | undefined {
  if (!place) return undefined;
  const cleaned = place.trim();
  return cityToAirport[cleaned] || sanitizeAirportCode(cleaned);
}

function extractMonth(text: string): string | undefined {
  if (text.includes("next month")) return "next month";
  const match = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/);
  return match?.[1];
}

function extractPrice(text: string): number | undefined {
  const match = text.match(/\$(\d{2,5})|under\s+(\d{2,5})/);
  const value = match?.[1] || match?.[2];
  return value ? Number(value) : undefined;
}

function parseOpenAiToolCalls(toolCalls?: Array<{ function?: { name?: string; arguments?: string } }>): ToolCall[] {
  if (!toolCalls) return [];

  return toolCalls.flatMap((call) => {
    const name = call.function?.name;
    if (!isToolName(name)) return [];

    try {
      const parsedArguments = JSON.parse(call.function?.arguments || "{}") as ToolCall["arguments"];
      return [{ name, arguments: parsedArguments }];
    } catch {
      return [];
    }
  });
}

function intentFromToolCalls(toolCalls: ToolCall[], userId?: string): TravelIntent {
  const primary = toolCalls.find((call) => call.name !== "get_user_preferences") || toolCalls[0];
  const args = primary.arguments;
  const origin = sanitizeAirportCode(typeof args.origin === "string" ? args.origin : undefined);
  const destination = sanitizeAirportCode(typeof args.dest === "string" ? args.dest : undefined);
  const route = typeof args.route === "string" ? args.route : origin && destination ? `${origin}-${destination}` : undefined;

  return {
    intent: intentForTool(primary.name),
    origin,
    destination,
    month: typeof args.month === "string" ? args.month : undefined,
    route,
    targetPrice: typeof args.target_price === "number" ? args.target_price : undefined,
    userId
  };
}

function intentForTool(name: ToolName): AgentIntent {
  const intentMap: Record<ToolName, AgentIntent> = {
    search_flights: "flight_search",
    find_cheapest_dates: "cheapest_dates",
    calculate_booking_window: "booking_window",
    compare_nearby_airports: "nearby_airports",
    set_price_alert: "price_alert",
    get_user_preferences: "preferences"
  };
  return intentMap[name];
}

function isToolName(name?: string): name is ToolName {
  return Boolean(
    name &&
      [
        "search_flights",
        "find_cheapest_dates",
        "calculate_booking_window",
        "compare_nearby_airports",
        "set_price_alert",
        "get_user_preferences"
      ].includes(name)
  );
}

async function maybePlanWithOpenAi(
  message: string,
  userId?: string
): Promise<{ intent: TravelIntent; toolCalls: ToolCall[] } | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are FlyIQ's planning layer. Select the best flight intelligence tool calls and summarize the travel intent as compact JSON when no tool call is needed. Use IATA-like city codes when obvious."
          },
          { role: "user", content: message }
        ],
        tools: agentToolDefinitions,
        tool_choice: "auto",
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
          tool_calls?: Array<{ function?: { name?: string; arguments?: string } }>;
        };
      }>;
    };
    const assistantMessage = data.choices?.[0]?.message;
    if (!assistantMessage) return null;

    const toolCalls = parseOpenAiToolCalls(assistantMessage.tool_calls);
    if (toolCalls.length > 0) {
      const intent = intentFromToolCalls(toolCalls, userId);
      return { intent, toolCalls };
    }

    if (!assistantMessage.content) return null;
    const parsed = JSON.parse(assistantMessage.content) as TravelIntent;
    const intent: TravelIntent = {
      ...parsed,
      origin: sanitizeAirportCode(parsed.origin),
      destination: sanitizeAirportCode(parsed.destination),
      userId
    };

    return { intent, toolCalls: toolCallsForIntent(intent) };
  } catch {
    return null;
  }
}
