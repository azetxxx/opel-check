# Milestone Checkup — Production Smoke Test

**Date:** 2026-04-04
**Target:** Netlify deployed version
**Device:** Phone (incognito/private browser)

---

## Local-Only Mode (no account)

- [ ] App loads, shows Home with default vehicle
- [ ] Maintenance page shows 16 built-in tasks
- [ ] Tap "Erledigt" on a task — toast confirms, task moves to Erledigt section
- [ ] Open log modal — the completion appears with date
- [ ] Create a custom task — it shows up in the list
- [ ] Save a destination in Ziele — tap opens Google Maps / Apple Maps
- [ ] Save a playlist in Musik — tap opens the music app
- [ ] Settings > Fahrzeuge > create a second vehicle — switch between them
- [ ] No errors, no "Auth session missing" messages anywhere

## Cloud Mode (with account)

- [ ] Settings > Cloud > enter email > magic link arrives
- [ ] Click magic link — app shows you're logged in
- [ ] Create a new vehicle — appears in Supabase
- [ ] Mark a task done — log appears in Supabase
- [ ] Create an invite code — code is generated and visible

## Sharing (second device/browser)

- [ ] Second user logs in, enters invite code
- [ ] Second user sees the shared vehicle
- [ ] Both can mark tasks done
- [ ] Owner can see members in sharing section
- [ ] Owner can change a role / remove a member

---

## Result

**Status:** _pending_

**Notes:**

_(Fill in after running the test)_
