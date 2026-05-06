import type { ToolName } from "./types";

export type AgentToolDefinition = {
  type: "function";
  function: {
    name: ToolName;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
};

const airportCodeProperty = {
  type: "string",
  description: "IATA airport or city code, e.g. NYC, LAX, PAR."
};

const datesProperty = {
  type: "object",
  properties: {
    depart: { type: "string", description: "ISO date or natural-language departure window." },
    return: { type: "string", description: "ISO date or natural-language return window." }
  }
};

export const agentToolDefinitions: AgentToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "search_flights",
      description: "Search flight options for a specific route and date window.",
      parameters: {
        type: "object",
        properties: { origin: airportCodeProperty, dest: airportCodeProperty, dates: datesProperty },
        required: ["origin", "dest"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "find_cheapest_dates",
      description: "Find cheaper flexible travel dates for a route and month.",
      parameters: {
        type: "object",
        properties: {
          origin: airportCodeProperty,
          dest: airportCodeProperty,
          month: { type: "string", description: "Target month or natural-language month window." }
        },
        required: ["origin", "dest", "month"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calculate_booking_window",
      description: "Calculate the best booking window for a route and travel date.",
      parameters: {
        type: "object",
        properties: {
          route: { type: "string", description: "Route formatted ORIGIN-DEST, e.g. NYC-PAR." },
          travel_date: { type: "string", description: "Travel date or travel window." }
        },
        required: ["route", "travel_date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "compare_nearby_airports",
      description: "Compare nearby airport alternatives for possible savings.",
      parameters: {
        type: "object",
        properties: { origin: airportCodeProperty, dest: airportCodeProperty, dates: datesProperty },
        required: ["origin", "dest"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "set_price_alert",
      description: "Create or stage a price alert for a route and target price.",
      parameters: {
        type: "object",
        properties: {
          route: { type: "string", description: "Route formatted ORIGIN-DEST, e.g. NYC-PAR." },
          target_price: { type: "number", description: "Target price in USD." }
        },
        required: ["route", "target_price"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_preferences",
      description: "Fetch remembered travel preferences for a user.",
      parameters: {
        type: "object",
        properties: { user_id: { type: "string", description: "Application user id." } },
        required: ["user_id"]
      }
    }
  }
];
