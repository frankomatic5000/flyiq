# FlyIQ

FlyIQ is an agent-first flight intelligence app. The primary UX is a conversational flight agent that turns natural language into structured travel intent, calls flight tools, and returns guidance with cards and action prompts. The traditional search page is only a backup.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill the services you use:

```bash
OPENAI_API_KEY=              # Optional — falls back to local planner if absent
ANTHROPIC_API_KEY=           # Optional
IGNAV_API_KEY=               # Get free key at https://ignav.com/ (1,000 free requests)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

If `OPENAI_API_KEY` is absent, `/api/agent/chat` falls back to a deterministic local planner. If Ignav or Supabase env vars are absent, server-side wrappers return clean demo data instead of failing.

## Architecture

- Agent layer: `lib/agent/*` classifies messages, plans tool calls, and orchestrates responses.
- Intelligence layer: `lib/intelligence.ts` encodes booking windows, day patterns, and pricing insights.
- Search layer: `lib/search/ignav.ts` keeps Ignav API credentials server-side and returns demo options without env vars. **Amadeus is NOT used** — their self-service API shuts down July 2026.
- Memory layer: `lib/memory/supabase.ts` provides server-only preference helpers and stubs.
- Action layer: `lib/actions/alerts.ts` models price alert creation.

## Routes

- `/` agent chat cockpit
- `/search` backup traditional search
- `/insights` travel intelligence dashboard
- `/alerts` active monitoring
- `POST /api/agent/chat`
- `GET /api/health`

## Supabase

Migration: `supabase/migrations/20260506120000_agent_first_schema.sql`

Tables: `user_preferences`, `travel_searches`, `price_history`, `price_alerts`, `saved_routes`, and `airport_cache`. RLS is enabled. Service role access must remain server-only.

## Validation

Preferred checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub issue #1 could not be read during initial implementation because `gh` could not connect to `api.github.com`; this prompt was used as the source of truth.
