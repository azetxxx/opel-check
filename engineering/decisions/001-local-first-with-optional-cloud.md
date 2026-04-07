# ADR 001: Local-First with Optional Cloud

**Date:** 2026-03-17
**Status:** Accepted

## Context

The app needs to persist vehicle data, maintenance tasks, and completion logs. Two architectures were considered:

1. **Cloud-first**: Require an account; sync everything to a backend.
2. **Local-first**: Work entirely from localStorage; add cloud sync as an opt-in layer.

The target user (casual German car owner) is unlikely to create an account for a maintenance checklist. Any signup friction on first visit kills adoption.

## Decision

Use localStorage as the default storage with a versioned JSON envelope (`{ version: N, data: [...] }`). Add Supabase as an optional backend that activates only when:

- `VITE_STORAGE_PROVIDER` is set to `supabase` at build time
- The Supabase environment variables are configured
- The user has an active authenticated session

The storage facade (`services/storage/index.ts`) checks all three conditions on every repository call and falls back to local repos if any are missing.

## Consequences

**Positive:**

- Zero-friction first experience — app works instantly with no server
- No backend cost for users who don't need sync
- Graceful degradation — logout or lost connection falls back to local
- Privacy by default — data stays on device unless user opts in

**Negative:**

- Two code paths for every data operation (local + Supabase repos)
- Data doesn't automatically migrate from local to cloud when a user signs up (manual export/import or future migration wizard needed)
- localStorage is vulnerable to browser clearing — mitigated by backup export and cloud sync
