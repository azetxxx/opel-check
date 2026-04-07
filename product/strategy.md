# Omiigo Car — Business Strategy

**Date**: 2026-04-03
**Status**: Post-MVP, iterating on multi-user sharing

## Vision

A PWA that replaces the mental overhead of car maintenance with a single glance — showing what's due, what's overdue, and what's coming up, for any vehicle you own or share.

## Hypothesis

> If we give German car owners a mobile-first maintenance checklist that pre-populates with sensible defaults (oil, tires, TÜV, brakes) and tracks completion history, they will use it regularly instead of forgetting tasks or relying on dealership reminders.

## Target Customer

**German car owners (25–55)** who:

- Own 1–3 vehicles and handle maintenance themselves or want to track it
- Don't want to install a heavy "car app" with social features and ads
- Currently use nothing, a note in their phone, or forget entirely
- Value knowing their car is safe and roadworthy over enthusiast features

## Pricing Model

| Tier | Price | Purpose |
|------|-------|---------|
| Local mode | **FREE** | Full app, localStorage only — zero friction, zero signup |
| Cloud sync | **FREE** (for now) | Supabase-backed sync + sharing. Free during validation; convert to paid tier once value is proven |
| Pro (future) | **€2–4/mo** | Multi-vehicle households, family sharing, push reminders, mileage analytics |

Free-first because the biggest risk is adoption, not monetization. A user who checks off "Reifendruck kontrollieren" weekly is worth more than a paid user who never opens the app.

## Activities / Features (MVP Scope)

### 1. Maintenance Tracking 🔧

The core. Recurring and scheduled tasks with built-in German presets.

- **Input**: Vehicle profile (name, plate, brand, mileage) + task list (16 built-in + custom)
- **Logic**: Date-based status engine — `pending`, `dueSoon`, `dueNow`, `overdue`, `done` — using `frequencyToDays` mapping
- **Value**: At-a-glance view of what needs attention now, grouped by urgency

### 2. Multi-Vehicle Support 🚗

Switch between vehicles. Each has its own task set, logs, and profile.

- **Input**: Vehicle profiles with name, plate, brand, model, year, VIN, mileage, icon
- **Logic**: Active vehicle selection filters all maintenance views
- **Value**: Households with 2–3 cars manage them from one app

### 3. Navigation Shortcuts 🗺️

Saved places with one-tap deep links to Google Maps / Apple Maps / Waze.

- **Input**: Label, address, preferred provider
- **Value**: Quick access to mechanic, gas station, inspection center without searching every time

### 4. Music Shortcuts 🎵

Playlist links for Spotify, YouTube Music, Apple Music, SoundCloud.

- **Input**: Title, provider, URL
- **Value**: One tap to driving playlist — the app becomes the car dashboard launcher

### 5. Cloud Sync & Sharing 👥

Optional Supabase backend for multi-device and multi-user.

- **Input**: Magic link email auth (no passwords)
- **Logic**: Invite codes with role-based access (owner/driver/viewer), RLS-enforced
- **Value**: Share a family car's maintenance with your partner

## What We Build First (Sprint 1)

### Minimum testable product:

1. Single-vehicle maintenance checklist with built-in German tasks
2. Mark tasks as done, compute next due date
3. Maintenance log history
4. localStorage persistence with versioned envelope
5. PWA with install banner and offline support

### What we deliberately skip:

- Cloud sync (added later as opt-in)
- Multi-vehicle (added in sprint 2)
- Push notifications (requires service worker messaging — deferred)
- Mileage-based triggers (date-based is sufficient for v1)
- User accounts and auth (local-only first)

## Success Metrics

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Weekly active users (PWA opens) | 50 | 3 months post-launch |
| Tasks marked done per user per month | ≥ 4 | Ongoing |
| Retention (opens app 2+ weeks in a row) | 40% | 3 months |
| Vehicles shared (cloud mode) | 10 | 6 months |
| App install (PWA add to home screen) | 30% of visitors | 3 months |

## Go-to-Market

1. Launch on Product Hunt and Hacker News (German indie dev angle)
2. Post in German car forums (motor-talk.de, gutefrage.net auto section)
3. Reddit r/de, r/Autos, r/selfhosted
4. Share with friends/family who own cars — word of mouth
5. SEO: "Auto Wartung App", "KFZ Checkliste", "TÜV Erinnerung"

## Competitive Advantage

- **No signup required** — works instantly from localStorage
- **German-first** — all default tasks, labels, and categories in German
- **No bloat** — no social features, no dealer upsells, no VIN decoder spam
- **Open architecture** — Supabase backend is transparent, RLS-protected, user-owned data
- **PWA** — no app store gatekeeping, instant updates

## Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| Users don't form a habit of checking maintenance | Push notification reminders (planned); weekly email digest |
| localStorage data loss (cleared browser) | Backup export/import (built); cloud sync (built) |
| Supabase free tier limits | App works fully offline; cloud is additive, not required |
| German-only limits market | Internationalization is a theme, not a rewrite — string extraction later |
| Competition from dealer apps (myOpel, Mercedes Me) | Those are brand-locked; Omiigo works for any car |

## Next Steps

1. ✅ Single-vehicle maintenance tracking (localStorage)
2. ✅ PWA with install banner
3. ✅ Multi-vehicle support
4. ✅ Navigation and music shortcut modules
5. ✅ Supabase cloud sync (opt-in)
6. ✅ Magic link authentication
7. ✅ Vehicle sharing with invite codes
8. ✅ Member management (roles, remove, revoke)
9. 🔲 Push notifications for overdue tasks
10. 🔲 Mileage-based task triggers
11. 🔲 Offline write queue (sync when reconnected)
12. 🔲 Data migration wizard (local → cloud)
13. 🔲 Internationalization (English)
