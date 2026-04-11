# 90-90-1 Roadmap — Omiigo Car

**Method:** 90 days, 90 minutes/day, 1 project.
**Start:** 2026-04-01 (Day 1)
**End:** 2026-06-29 (Day 90)
**Goal:** Ship a stable, Android-ready car maintenance app that real users can rely on daily.

## Guiding Principles

- Keep daily focus narrow — one theme per day
- Stabilize before expanding — no new features until the base works end-to-end
- Android readiness is the finish line, not feature count
- Every day produces a visible result (commit, validated flow, fixed bug, or documented decision)

---

## Phase 1: Stabilization (Days 1–14 · Apr 1–14)

Get the existing feature set production-solid. No new features — only fixes, validation, and UX polish.

| Day | Date | Theme | Status |
|-----|------|-------|--------|
| 1 | Apr 01 | Review project state, plan 90-90-1 scope | -- |
| 2 | Apr 02 | Home screen interactivity: mileage edit, configurable highlight card, clickable cards | done |
| 3 | Apr 02 | Vehicle creation flow: fix Supabase RPC, stabilize built-in task creation | done |
| 4 | Apr 03 | Onboarding: empty vehicle state, local-only mode, delete last vehicle | done |
| 5 | Apr 03 | Member management: list members, role change, remove, revoke invites | done |
| 6 | Apr 04–06 | -- | (no commits) |
| 7 | Apr 07 | Onboarding: empty state for new users, built-in tasks off by default | done |
| 8 | Apr 07 | Push notifications for overdue tasks (service worker periodic sync) | done |
| 9 | Apr 07 | Local-to-cloud migration wizard (vehicles, tasks, logs, places, playlists) | done |
| 10 | Apr 07 | Product/design/engineering/marketing docs generated | done |
| 11 | Apr 08 | Email infra: Resend SMTP, DNS setup, Magic Link delivery validated | done |
| 12 | Apr 08 | Reduce built-in tasks to 7 core defaults, add `biweekly` frequency | done |
| 13 | Apr 08 | Legacy task cleanup for existing vehicles, simplify task creation frequencies | done |
| 14 | Apr 09–10 | -- | (no commits) |
| 15 | Apr 11 | Biweekly SQL patch created, schema.sql updated, docs synced | done |
| | | **Open — remaining stabilization work:** | |
| | | - [x] Apply `patch-biweekly-frequency.sql` in Supabase (already applied) | |
| | | - [x] Apply `patch-member-management-rpcs.sql` in Supabase (already applied) | |
| | | - [x] Confirm `patch-user-data-table.sql` is applied | |
| | | - [x] Verify reduced built-in set in production UI → [milestone-checkup.md](milestone-checkup.md) §A (biweekly chip + `getNextCheckDate` fixed in app) | |
| | | - [x] Test full Magic Link login → redirect → session creation → §B | |
| | | - [x] Test migration wizard: local data → sign up → migrate → verify → §C | |
| | | - [x] Sharing + member management E2E → §D | |
| | | - [ ] Validate push notification delivery on Android PWA → §E | |
| | | - [ ] Local-only regression + post-logout empty state → §F | |

---

## Phase 2: Production Validation (Days 15–30 · Apr 15–30)

Every major flow tested end-to-end on real devices. Fix what breaks. Harden what works.

| Day(s) | Theme |
|--------|-------|
| 15–16 | Full auth flow validation: sign up, magic link, session, logout, re-login |
| 17–18 | Migration wizard real test: local data → cloud account → verify all 5 data types |
| 19–20 | Sharing flow E2E: create invite → accept → role check → member remove → revoke |
| 21–22 | Multi-vehicle E2E: create 2nd vehicle, switch, verify task isolation, delete |
| 23–24 | Push notification validation: overdue triggers, Android PWA behavior, permission states |
| 25–26 | Offline behavior audit: local-only mode, network loss during cloud ops, edge cases |
| 27–28 | Responsive / UX sweep: test all pages on small screens, fix layout issues |
| 29–30 | Bug-fix buffer + update all product docs to match current state |

**Exit criteria for Phase 2:**
- [ ] All major flows work on deployed Netlify version
- [ ] No blocking bugs in auth, migration, sharing, or maintenance
- [ ] Docs (strategy, backlog, architecture) reflect reality

---

## Phase 3: MVP Cleanup (Days 31–45 · May 1–15)

Strip rough edges. Make the app feel finished, not "developer demo."

| Day(s) | Theme |
|--------|-------|
| 31–33 | Role-based views: hide actions for viewers, restrict editing for drivers |
| 34–36 | Mileage-based task triggers: wire `due_mileage` / `last_mileage` into status computation |
| 37–39 | Offline write queue: queue Supabase writes when offline, sync on reconnect |
| 40–42 | Onboarding polish: first-time hints, empty states, progressive disclosure |
| 43–45 | Performance: bundle size reduction, lazy loading, PWA cache strategy review |

**Exit criteria for Phase 3:**
- [ ] App feels complete for a single-car daily driver
- [ ] No features feel half-built
- [ ] Bundle under 500 kB (or justified)

---

## Phase 4: Android / Capacitor (Days 46–65 · May 16–Jun 4)

Wrap the PWA in a native shell for Play Store distribution.

| Day(s) | Theme |
|--------|-------|
| 46–48 | Capacitor setup: init project, configure Android platform, first build |
| 49–51 | Native integration: status bar, splash screen, deep link handling |
| 52–54 | Push notifications: migrate from periodic sync to native push (FCM) |
| 55–57 | Magic Link redirect: handle auth callback in native app context |
| 58–60 | Testing on real Android devices: install, auth, sync, notifications |
| 61–63 | Play Store prep: app listing, screenshots, privacy policy, icon/assets |
| 64–65 | Internal testing track upload, fix submission issues |

**Exit criteria for Phase 4:**
- [ ] Android app installable from Play Store (internal track)
- [ ] Auth, sync, and notifications work natively
- [ ] No PWA-only workarounds visible to users

---

## Phase 5: Launch Prep (Days 66–80 · Jun 5–19)

Get real users. Validate the hypothesis.

| Day(s) | Theme |
|--------|-------|
| 66–68 | Beta program: invite 5–10 real car owners, set up feedback channel |
| 69–71 | Beta feedback round 1: collect, triage, fix critical issues |
| 72–74 | Content: App Store listing copy (German), landing page, social media assets |
| 75–77 | SEO: "Auto Wartung App", "KFZ Checkliste" — metadata, structured data |
| 78–80 | Beta feedback round 2: polish, edge cases, final fixes |

**Exit criteria for Phase 5:**
- [ ] 5+ real users have tried the app and given feedback
- [ ] Critical beta issues resolved
- [ ] Landing page and store listing ready

---

## Phase 6: Ship It (Days 81–90 · Jun 20–29)

Public launch. Marketing push. Measure.

| Day(s) | Theme |
|--------|-------|
| 81–83 | Play Store public release, Netlify PWA polished for sharing |
| 84–86 | Launch posts: Product Hunt, motor-talk.de, Reddit r/de, r/Autos |
| 87–88 | Monitor: crash reports, user feedback, server load, email delivery |
| 89–90 | Retrospective: what worked, what didn't, next 90-day plan |

**Exit criteria for Phase 6:**
- [ ] App publicly available on Play Store + web
- [ ] Launch announced on 3+ channels
- [ ] Success metrics baseline captured (WAU, tasks/month, retention)

---

## Progress Tracker

| Phase | Days | Dates | Status |
|-------|------|-------|--------|
| 1. Stabilization | 1–14 | Apr 1–14 | **in progress** (Day 11) |
| 2. Production Validation | 15–30 | Apr 15–30 | upcoming |
| 3. MVP Cleanup | 31–45 | May 1–15 | upcoming |
| 4. Android / Capacitor | 46–65 | May 16–Jun 4 | upcoming |
| 5. Launch Prep | 66–80 | Jun 5–19 | upcoming |
| 6. Ship It | 81–90 | Jun 20–29 | upcoming |

## What's Already Shipped (Days 1–11)

Significant progress during the first 11 days:

- Supabase vehicle creation flow fixed
- Home screen: mileage editing, configurable highlight card, clickable cards
- Empty vehicle state + onboarding for new users
- Local-only mode without auth errors
- Member management UI (list, role change, remove, revoke)
- Push notifications for overdue tasks
- Local-to-cloud migration wizard (5 data types)
- Product, design, engineering, marketing documentation
- Custom SMTP via Resend for Magic Link emails
- Built-in tasks reduced from 16 to 7 core defaults
- `biweekly` frequency added
- Legacy task cleanup for existing vehicles
