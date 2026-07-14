# AGENTS.md — OdontoVida CRM

Next.js 15 (App Router) + React 19 + TypeScript + Supabase (auth + DB) + Tailwind v4 + shadcn/ui + React Query.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Start production build |
| `npm run db:types` | Generate Supabase TS types from project `pvbpoyykyzcgyavvtdrq` → `src/types/supabase.generated.ts` |

No test framework configured — do not run tests.

## Architecture

- **Route protection**: `src/middleware.ts` guards `/dashboard/*` via Supabase SSR session; root `/` redirects to `/dashboard` if authenticated.
- **Supabase clients**: 3 files in `src/lib/supabase/` — `client.ts` (browser), `server.ts` (Server Components), `middleware.ts` (cookie sync).
- **Service pattern**: Each domain has `*.service.ts` (API calls) + `use-*.ts` (React Query hooks), e.g. `appointments.service.ts` + `use-appointments.ts`.
- **Auth**: `AuthServerService` (`src/services/auth/server.service.ts`) for Server Components; `AuthClientService` (`client.service.ts`) for client.
- **Rate limiting**: Uses Upstash Redis (optional). Gracefully disables if `UPSTASH_REDIS_REST_URL/TOKEN` unset.
- **Path alias**: `@/` → `./src/*`.

## Database

- Supabase project ID: `pvbpoyykyzcgyavvtdrq`
- 4 main tables: `professionals`, `services`, `clientes`, `appointments` + business-hours, treatment_plans, professional_schedules, professional_services.
- **TypeScript types**: `src/types/database.types.ts` has **manual** interfaces. Auto-generated file (`src/types/supabase.generated.ts`) does not exist yet — run `npm run db:types` to create it.
- Migration SQL in `supabase/migrations/` and `scripts/`.

## Notable

- UI language: Portuguese (pt-BR). Code comments, commit messages, and variable names follow same convention.
- `.agent/` directory contains the Antigravity Kit (agent routing, skills, workflows) — a custom agent framework layered on top.
- `Components/`, `Types/`, `SQL/` at root are a standalone "Business Hours" package extracted for reuse, separate from `src/`.
- shadcn/ui uses `new-york` style with RSC enabled.
- Rate limit: 5 logins/min, 100 API req/min, 20 transaction creates/min.
- CSP in `next.config.ts` uses `'unsafe-eval'` in dev only.
