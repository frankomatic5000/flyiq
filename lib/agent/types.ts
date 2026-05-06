export type ToolName =
  | "search_flights"
  | "find_cheapest_dates"
  | "calculate_booking_window"
  | "compare_nearby_airports"
  | "set_price_alert"
  | "get_user_preferences";

export type AgentIntent =
  | "flight_search"
  | "cheapest_dates"
  | "booking_window"
  | "nearby_airports"
  | "price_alert"
  | "preferences";

export type TravelIntent = {
  intent: AgentIntent;
  origin?: string;
  destination?: string;
  month?: string;
  dates?: {
    depart?: string;
    return?: string;
  };
  route?: string;
  targetPrice?: number;
  userId?: string;
};

export type ToolCall = {
  name: ToolName;
  arguments: Record<string, string | number | undefined | { depart?: string; return?: string }>;
};

export type AgentCard = {
  title: string;
  body: string;
  tone: "blue" | "amber" | "green";
};

export type AgentAction = {
  type: "set_alert" | "save_route" | "search_backup" | "follow_up";
  label: string;
  payload?: Record<string, string | number | undefined>;
};

export type AgentChatResponse = {
  assistantMessage: string;
  reasoningSummary: string;
  intent: TravelIntent;
  toolCalls: ToolCall[];
  cards: AgentCard[];
  actions: AgentAction[];
};
