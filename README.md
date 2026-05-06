# FlyIQ

FlyIQ is an agent-first flight intelligence app. The primary UX is a conversational flight agent that turns natural language into structured travel intent, calls flight tools, and returns guidance with cards and action prompts. The traditional search page is only a backup.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill only the services you use:

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

If `OPENAI_API_KEY` is absent, `/api/agent/chat` falls back to a deterministic local planner. If Amadeus or Supabase env vars are absent, server-side wrappers return clean demo data instead of failing.

## Architecture

- Agent layer: `lib/agent/*` classifies messages, plans tool calls, and orchestrates responses.
- Intelligence layer: `lib/intelligence.ts` encodes booking windows, day patterns, and pricing insights.
- Search layer: `lib/search/amadeus.ts` keeps Amadeus credentials server-side and returns demo options without env vars.
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
