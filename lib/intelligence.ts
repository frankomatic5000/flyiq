export type BookingWindow = {
  routeType: "domestic" | "international";
  idealWindow: string;
  guidance: string;
};

export function calculateBookingWindow(route: string, travelDate: string): BookingWindow {
  const routeType = isInternationalRoute(route) ? "international" : "domestic";
  const idealWindow = routeType === "domestic" ? "21-30 days" : "31-45 days";

  return {
    routeType,
    idealWindow,
    guidance: `For ${route || "this route"}, target ${idealWindow} before ${travelDate}. Monday departures and Wednesday returns often improve prices.`
  };
}

export function dayOfWeekOptimizer() {
  return {
    departure: "Monday departures are commonly cheaper.",
    return: "Wednesday returns can be favorable.",
    booking: "Sunday booking can be favorable, but route timing matters more than browser mode.",
    note: "Incognito pricing is a busted myth for MVP purposes; VPN/location pricing is out of scope."
  };
}

export function priceInsight(route: string) {
  return {
    route,
    insight:
      "Airlines reprice frequently using revenue management concepts such as EMSRb, so alerts matter more than one-off checks.",
    proactive: `I noticed interest in ${route || "this route"}. Want me to monitor price movement and flag meaningful drops?`
  };
}

function isInternationalRoute(route: string) {
  const domesticPrefixes = ["NYC", "LAX", "BOS", "CHI", "MIA", "SFO", "SEA", "DFW", "ATL"];
  const parts = route.split("-").map((part) => part.trim().toUpperCase());
  return parts.some((part) => part && !domesticPrefixes.includes(part));
}
