# Milestone Checkup — Production Smoke Test

**Date:** 2026-04-04
**Target:** Netlify deployed version
**Device:** Phone (incognito/private browser)

---

## Local-Only Mode (no account)

- [x] App loads, shows Home with default vehicle
- [x] Maintenance page shows 16 built-in tasks (if toggled on in settings)
- [x] Tap "Erledigt" on a task — toast confirms, task moves to Erledigt section
- [x] Open log modal — the completion appears with date
- [x] Create a custom task — it shows up in the list
- [x] Save a destination in Ziele — tap opens Google Maps / Apple Maps
- [x] Save a playlist in Musik — tap opens the music app
- [x] Settings > Fahrzeuge > create a second vehicle — switch between them
- [x] No errors, no "Auth session missing" messages anywhere

## Cloud Mode (with account)

- [x] Settings > Cloud > enter email > magic link arrives
- [x] Click magic link — app shows you're logged in
- [x] Create a new vehicle — appears in Supabase
- [x] Mark a task done — log appears in Supabase
- [x] Create an invite code — code is generated and visible

## Sharing (second device/browser)

- [x] Second user logs in, enters invite code
- [x] Second user sees the shared vehicle
- [ ] Both can mark tasks done
- [x] Owner can see members in sharing section
- [ ] Owner can change a role / remove a member

---

## Result

**Status:** _pending_

**Notes:**

_(Fill in after running the test)_
