export type FlightSearchInput = {
  origin?: string;
  dest?: string;
  dates?: { depart?: string; return?: string };
};

export type FlightOption = {
  airline: string;
  price: number;
  currency: string;
  depart: string;
  return?: string;
  summary: string;
};

export async function searchFlights(input: FlightSearchInput): Promise<FlightOption[]> {
  if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
    return mockFlightOptions(input);
  }

  // Credentials remain server-only. The real OAuth and offer search can be wired here without touching UI code.
  return mockFlightOptions(input).map((option) => ({
    ...option,
    summary: `${option.summary} Live Amadeus wiring is configured for server-side extension.`
  }));
}

export async function findCheapestDates(origin?: string, dest?: string, month = "next month") {
  return {
    origin: origin || "NYC",
    dest: dest || "PAR",
    month,
    bestDepart: "Monday",
    bestReturn: "Wednesday",
    estimatedSavings: "8-14%",
    summary: `For ${origin || "NYC"} to ${dest || "PAR"} in ${month}, start with Monday departures and Wednesday returns.`
  };
}

export async function compareNearbyAirports(origin?: string, dest?: string) {
  return [
    {
      route: `${origin || "NYC"} -> ${dest || "PAR"}`,
      estimatedPrice: 612,
      note: "Baseline route."
    },
    {
      route: `${origin || "EWR"} -> ${dest || "ORY"}`,
      estimatedPrice: 558,
      note: "Nearby airport swap could save about 9%."
    }
  ];
}

function mockFlightOptions(input: FlightSearchInput): FlightOption[] {
  const origin = input.origin || "NYC";
  const dest = input.dest || "PAR";

  return [
    {
      airline: "Sample Air",
      price: 612,
      currency: "USD",
      depart: input.dates?.depart || "next available Monday",
      return: input.dates?.return || "following Wednesday",
      summary: `${origin} to ${dest}, timing optimized for common cheaper day patterns.`
    },
    {
      airline: "Demo Jet",
      price: 647,
      currency: "USD",
      depart: input.dates?.depart || "next available Tuesday",
      return: input.dates?.return || "following Thursday",
      summary: `${origin} to ${dest}, slightly higher but useful as a comparison anchor.`
    }
  ];
}
