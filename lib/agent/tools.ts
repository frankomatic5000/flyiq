import { setPriceAlert } from "@/lib/actions/alerts";
import { calculateBookingWindow, dayOfWeekOptimizer, priceInsight } from "@/lib/intelligence";
import { getUserPreferences } from "@/lib/memory/supabase";
import { compareNearbyAirports, findCheapestDates, searchFlights } from "@/lib/search/ignav";
import type { ToolCall } from "./types";

export async function executeToolCall(call: ToolCall) {
  const args = call.arguments;

  switch (call.name) {
    case "search_flights":
      return searchFlights({
        origin: stringArg(args.origin),
        dest: stringArg(args.dest),
        dates: dateArg(args.dates)
      });
    case "find_cheapest_dates":
      return findCheapestDates(stringArg(args.origin), stringArg(args.dest), stringArg(args.month));
    case "calculate_booking_window":
      return calculateBookingWindow(stringArg(args.route) || "", stringArg(args.travel_date) || "requested travel date");
    case "compare_nearby_airports":
      return compareNearbyAirports(stringArg(args.origin), stringArg(args.dest));
    case "set_price_alert":
      return setPriceAlert(stringArg(args.route), numberArg(args.target_price) || 350);
    case "get_user_preferences":
      return getUserPreferences(stringArg(args.user_id));
  }
}

export function staticIntelligence(route: string) {
  return {
    dayPatterns: dayOfWeekOptimizer(),
    pricing: priceInsight(route)
  };
}

function stringArg(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberArg(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function dateArg(value: unknown): { depart?: string; return?: string } | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Record<string, unknown>;
  return {
    depart: stringArg(candidate.depart),
    return: stringArg(candidate.return)
  };
}
