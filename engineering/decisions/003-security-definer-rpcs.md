# ADR 003: Security-Definer RPCs for Transactional Operations

**Date:** 2026-03-31
**Status:** Accepted

## Context

Several operations require atomicity that PostgREST's table-level CRUD can't provide:

- **Create vehicle**: Must insert into `vehicles` AND `vehicle_members` (owner row) in one transaction. If the membership insert fails, the vehicle should not exist.
- **Accept invite**: Must insert a membership, mark the invite as used, and handle the case where the user is already a member — all atomically.
- **Remove member**: Must check the user isn't the last owner before deletion.
- **Update role**: Must prevent downgrading the last owner.

Doing these as separate client-side requests (insert vehicle → insert membership) creates race conditions and partial-failure states.

## Decision

Use PostgreSQL functions with `security definer` and `set search_path = public`:

- `create_vehicle_with_owner(...)` → returns `uuid`
- `accept_vehicle_invite(p_code)` → returns `vehicle_members` row
- `list_vehicle_members_with_profiles(p_vehicle_id)` → returns joined table
- `update_vehicle_member_role(p_member_id, p_role)` → returns updated row
- `remove_vehicle_member(p_member_id)` → returns deleted id
- `revoke_vehicle_invite(p_invite_id)` → returns deleted id

Each RPC validates `auth.uid()`, checks permissions (is the caller an owner?), enforces business rules (can't remove last owner), and performs all mutations in a single transaction.

## Consequences

**Positive:**

- Atomicity guaranteed by Postgres transactions
- Business rules enforced at the database level, not the client
- Client code is simple: one `.rpc()` call instead of multiple `.from()` queries

**Negative:**

- RPCs are harder to test than table operations (no PostgREST test tools)
- Return shapes from `.rpc()` vary (scalar, row, array of rows) — client must handle all shapes defensively
- Schema changes require updating both the SQL and the TypeScript types manually
