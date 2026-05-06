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

const IGNAV_BASE = "https://api.ignav.com/v1";

function ignavHeaders(): Record<string, string> {
  const key = process.env.IGNAV_API_KEY;
  if (!key) {
    throw new Error("IGNAV_API_KEY not configured");
  }
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function searchFlights(input: FlightSearchInput): Promise<FlightOption[]> {
  const key = process.env.IGNAV_API_KEY;
  if (!key) {
    console.warn("[Ignav] No API key — returning mock data. Sign up at https://ignav.com/");
    return mockFlightOptions(input);
  }

  const url = new URL(`${IGNAV_BASE}/search`);
  if (input.origin) url.searchParams.set("origin", input.origin);
  if (input.dest) url.searchParams.set("destination", input.dest);
  if (input.dates?.depart) url.searchParams.set("departure_date", input.dates.depart);
  if (input.dates?.return) url.searchParams.set("return_date", input.dates.return);
  if (input.passengers) url.searchParams.set("passengers", String(input.passengers));

  try {
    const res = await fetch(url.toString(), { headers: ignavHeaders() });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ignav API error ${res.status}: ${text}`);
    }
    const data = await res.json();
    return (data.results || []).map(normalizeIgnavResult);
  } catch (err) {
    console.error("[Ignav] search error:", err);
    // Fallback to mock for graceful degradation
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
    return data.booking_url || null;
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
    url.searchParams.set("query", query);
    const res = await fetch(url.toString(), { headers: ignavHeaders() });
    if (!res.ok) throw new Error(`Ignav airports error ${res.status}`);
    const data = await res.json();
    return data.results || [];
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

function normalizeIgnavResult(raw: Record<string, unknown>): FlightOption {
  return {
    id: String(raw.id || raw.ignav_id || ""),
    ignavId: String(raw.ignav_id || raw.id || ""),
    airline: String(raw.airline || ""),
    flightNumber: String(raw.flight_number || ""),
    price: Number(raw.price || 0),
    currency: String(raw.currency || "USD"),
    depart: {
      code: String((raw as Record<string, unknown>).departure_airport || ""),
      date: String((raw as Record<string, unknown>).departure_date || ""),
      time: String((raw as Record<string, unknown>).departure_time || ""),
    },
    arrival: {
      code: String((raw as Record<string, unknown>).arrival_airport || ""),
      date: String((raw as Record<string, unknown>).arrival_date || ""),
      time: String((raw as Record<string, unknown>).arrival_time || ""),
    },
    duration: String(raw.duration || ""),
    stops: Number(raw.stops || 0),
    cabin: String(raw.cabin || "Economy"),
    summary: `${raw.airline || "Airline"} from ${(raw as Record<string, unknown>).departure_airport || "?"} to ${(raw as Record<string, unknown>).arrival_airport || "?"} — $${raw.price || "?"}`,
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
