# ADR 002: Supabase Over Firebase

**Date:** 2026-03-28
**Status:** Accepted

## Context

The app needed a backend for multi-user vehicle sharing. The codebase originally had a `firebase/config.ts` placeholder but Firebase was never activated. Two options were evaluated:

1. **Firebase**: Firestore + Firebase Auth. Mature ecosystem, generous free tier.
2. **Supabase**: PostgreSQL + PostgREST + Supabase Auth. Open-source, SQL-native.

## Decision

Use Supabase. Key reasons:

- **Row-Level Security (RLS)** policies in Postgres enforce access control at the database level. The vehicle sharing model (owner/driver/viewer roles via `vehicle_members` table) maps directly to RLS policies — no server-side middleware needed.
- **Security-definer RPCs** enable transactional operations (create vehicle + owner membership in one call) that can't be done safely through PostgREST alone.
- **SQL is the source of truth** — schema, policies, and RPCs are version-controlled as `.sql` files, not configured through a web console.
- **Magic link auth** works out of the box — no password management, no OAuth provider setup.

## Consequences

**Positive:**

- All access control is enforced at the database, not the client — a compromised frontend can't bypass RLS
- Schema and RPCs are auditable `.sql` files in the repo
- No custom server code — the Supabase JS client talks directly to PostgREST

**Negative:**

- RLS policies are verbose and must be carefully tested (a missing policy = data leak or access denial)
- RPC return shapes can be surprising (wrapped in arrays, nested objects) — defensive parsing needed in `supabaseVehiclesRepository.ts`
- Firebase's offline-first SDK (Firestore) would have given automatic offline sync; Supabase requires manual implementation
