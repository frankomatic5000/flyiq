export type UserPreferences = {
  homeAirport: string;
  cabin: "economy" | "premium_economy" | "business";
  maxStops: number;
  preferredAirlines: string[];
};

export function hasSupabaseBrowserConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasSupabaseServiceConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getUserPreferences(userId?: string): Promise<UserPreferences> {
  if (!userId || !hasSupabaseServiceConfig()) {
    return {
      homeAirport: "NYC",
      cabin: "economy",
      maxStops: 1,
      preferredAirlines: []
    };
  }

  // Server-only service role access belongs here. Keep this stub until Supabase env is available.
  return {
    homeAirport: "NYC",
    cabin: "economy",
    maxStops: 1,
    preferredAirlines: []
  };
}
