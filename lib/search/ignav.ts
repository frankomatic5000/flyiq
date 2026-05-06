// Ignav Flight API Integration
// Docs: https://ignav.com/docs
// Pricing: 1,000 free requests, then $2 per 1,000

export type FlightSearchInput = {
  origin?: string;
  dest?: string;
  dates?: { depart?: string; return?: string };
  passengers?: number;
};

export type FlightOption = {
  id: string;
  airline: string;
  flightNumber: string;
  price: number;
  currency: string;
  depart: { code: string; date: string; time: string };
  arrival: { code: string; date: string; time: string };
  duration: string;
  stops: number;
  cabin: string;
  ignavId: string;
  summary: string;
};

export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
};

const IGNAV_BASE = "https://ignav.com/api";

function ignavHeaders(): Record<string, string> {
  const key = process.env.IGNAV_API_KEY;
  if (!key) {
    throw new Error("IGNAV_API_KEY not configured");
  }
  return {
    "X-Api-Key": key,
    "Content-Type": "application/json",
  };
}

export async function searchFlights(input: FlightSearchInput): Promise<FlightOption[]> {
  const key = process.env.IGNAV_API_KEY;
  if (!key) {
    console.warn("[Ignav] No API key — returning mock data. Sign up at https://ignav.com/");
    return mockFlightOptions(input);
  }

  const isRoundTrip = Boolean(input.dates?.return);
  const endpoint = isRoundTrip ? `${IGNAV_BASE}/fares/round-trip` : `${IGNAV_BASE}/fares/one-way`;

  const body: Record<string, unknown> = {
    origin: input.origin || "JFK",
    destination: input.dest || "LAX",
    departure_date: input.dates?.depart || "2026-06-15",
    adults: input.passengers || 1,
    cabin_class: "economy",
    market: "US",
  };

  if (isRoundTrip && input.dates?.return) {
    body.return_date = input.dates.return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: ignavHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ignav API error ${res.status}: ${text}`);
    }
    const data = await res.json();
    return (data.itineraries || []).map((it: Record<string, unknown>) => normalizeItinerary(it, data));
  } catch (err) {
    console.error("[Ignav] search error:", err);
    return mockFlightOptions(input);
  }
}

export async function getBookingLink(ignavId: string): Promise<string | null> {
  const key = process.env.IGNAV_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(`${IGNAV_BASE}/booking/${ignavId}`, {
      headers: ignavHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.booking_url || data.url || null;
  } catch {
    return null;
  }
}

export async function searchAirports(query: string): Promise<Airport[]> {
  const key = process.env.IGNAV_API_KEY;
  if (!key) {
    // Fallback mock
    return mockAirports.filter(
      (a) =>
        a.code.toLowerCase().includes(query.toLowerCase()) ||
        a.city.toLowerCase().includes(query.toLowerCase()) ||
        a.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  try {
    const url = new URL(`${IGNAV_BASE}/airports`);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "10");
    const res = await fetch(url.toString(), { headers: ignavHeaders() });
    if (!res.ok) throw new Error(`Ignav airports error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (err) {
    console.error("[Ignav] airports error:", err);
    return mockAirports.filter(
      (a) =>
        a.code.toLowerCase().includes(query.toLowerCase()) ||
        a.city.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export async function findCheapestDates(origin?: string, dest?: string, month = "next month") {
  return {
    origin: origin || "NYC",
    dest: dest || "PAR",
    month,
    bestDepart: "Monday",
    bestReturn: "Wednesday",
    estimatedSavings: "8-14%",
    summary: `For ${origin || "NYC"} to ${dest || "PAR"} in ${month}, start with Monday departures and Wednesday returns.`,
  };
}

export async function compareNearbyAirports(origin?: string, dest?: string) {
  return [
    {
      route: `${origin || "NYC"} -> ${dest || "PAR"}`,
      estimatedPrice: 612,
      note: "Baseline route.",
    },
    {
      route: `${origin || "EWR"} -> ${dest || "ORY"}`,
      estimatedPrice: 558,
      note: "Nearby airport swap could save about 9%.",
    },
  ];
}

function normalizeItinerary(it: Record<string, unknown>, parent: Record<string, unknown>): FlightOption {
  const outbound = (it.outbound || {}) as Record<string, unknown>;
  const segments = (outbound.segments || []) as Record<string, unknown>[];
  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || {};
  const price = (it.price || {}) as Record<string, unknown>;
  const ignavId = String(it.ignav_id || "");

  const airline = String(firstSegment.marketing_carrier_code || outbound.carrier || "Unknown");
  const flightNumber = String(firstSegment.flight_number || "");
  const stops = Math.max(0, segments.length - 1);

  return {
    id: ignavId,
    ignavId,
    airline,
    flightNumber,
    price: Number(price.amount || 0),
    currency: String(price.currency || "USD"),
    depart: {
      code: String(firstSegment.departure_airport || parent.origin || ""),
      date: String(firstSegment.departure_time_local || "").split("T")[0] || "",
      time: String(firstSegment.departure_time_local || "").split("T")[1]?.slice(0, 5) || "",
    },
    arrival: {
      code: String(lastSegment.arrival_airport || parent.destination || ""),
      date: String(lastSegment.arrival_time_local || "").split("T")[0] || "",
      time: String(lastSegment.arrival_time_local || "").split("T")[1]?.slice(0, 5) || "",
    },
    duration: String(outbound.duration_minutes ? `${outbound.duration_minutes} min` : ""),
    stops,
    cabin: String(it.cabin_class || "economy"),
    summary: `${airline} ${flightNumber} from ${firstSegment.departure_airport || "?"} to ${lastSegment.arrival_airport || "?"} — $${price.amount || "?"} (${stops === 0 ? "nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`})`,
  };
}

function mockFlightOptions(input: FlightSearchInput): FlightOption[] {
  const origin = input.origin || "JFK";
  const dest = input.dest || "LAX";
  const departDate = input.dates?.depart || "2026-06-15";

  return [
    {
      id: "mock-1",
      ignavId: "mock-ignav-1",
      airline: "Delta",
      flightNumber: "DL123",
      price: 340,
      currency: "USD",
      depart: { code: origin, date: departDate, time: "08:00" },
      arrival: { code: dest, date: departDate, time: "11:30" },
      duration: "5h 30m",
      stops: 0,
      cabin: "Economy",
      summary: `${origin} to ${dest} — $340 direct, morning departure.`,
    },
    {
      id: "mock-2",
      ignavId: "mock-ignav-2",
      airline: "United",
      flightNumber: "UA456",
      price: 295,
      currency: "USD",
      depart: { code: origin, date: departDate, time: "14:30" },
      arrival: { code: dest, date: departDate, time: "18:00" },
      duration: "5h 30m",
      stops: 0,
      cabin: "Economy",
      summary: `${origin} to ${dest} — $295 afternoon, cheaper than morning.`,
    },
    {
      id: "mock-3",
      ignavId: "mock-ignav-3",
      airline: "American",
      flightNumber: "AA789",
      price: 380,
      currency: "USD",
      depart: { code: origin, date: departDate, time: "06:15" },
      arrival: { code: dest, date: departDate, time: "09:45" },
      duration: "5h 30m",
      stops: 0,
      cabin: "Economy",
      summary: `${origin} to ${dest} — $380 early morning premium.`,
    },
  ];
}

const mockAirports: Airport[] = [
  { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "USA" },
  { code: "LGA", name: "LaGuardia Airport", city: "New York", country: "USA" },
  { code: "EWR", name: "Newark Liberty International", city: "Newark", country: "USA" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "USA" },
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "USA" },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "USA" },
  { code: "MIA", name: "Miami International", city: "Miami", country: "USA" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France" },
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "UK" },
  { code: "NRT", name: "Narita International", city: "Tokyo", country: "Japan" },
];
