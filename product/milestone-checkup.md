# Milestone Checkup — Phase 1 validation

**Target:** Netlify production (`omiigo-car.netlify.app` or your live URL)  
**Companion:** [90-90-1 Roadmap](roadmap-90-90-1.md) — Phase 1 app-level checks  
**How to run:** Use a real phone; use **incognito/private** for “fresh user” flows where noted.

Record pass/fail and one line of notes per section. When done, drop a short summary into `REPORT-YYYY-MM-DD.md` or update this file’s **Result** block.

---

## A. Production UI — 7 built-in tasks (cloud or local)

**Prep:** Logged-in user with at least one vehicle (or create one).

- [x] **Wartung** shows exactly **7** active built-in tasks (when none are archived):  
  Reifendruck prüfen, Lichtfunktionen prüfen, Scheibenwaschanlage…, Ölstand prüfen, Batterie prüfen, Bremsen prüfen, Inspektion nach Herstellervorgabe  
- [x] Three of them show interval **“Alle 2 Wochen”** (biweekly) — *UI: TaskCard now uses `FREQUENCY_LABELS`; `getNextCheckDate` handles `biweekly`.*  
- [x] **Einstellungen** → built-in task toggles match what you see on Wartung (archived = off)  
- [x] Mark a **biweekly** task **Erledigt** → next due moves forward ~14 days (or equivalent in UI) — *after `getNextCheckDate` biweekly branch*  
- [x] **Neues Fahrzeug** (cloud): create vehicle → 7 tasks appear without DB / toast errors  

---

## B. Magic Link — full click-through → session

**Prep:** Incognito; optional: log out first if testing on existing profile.

- [ ] **Einstellungen** → Cloud & Konto → enter email → **Magic Link** email arrives (sender `noreply@auth.az-studio.pro` or your configured sender)  
- [ ] Tap link → browser opens app URL → **you are logged in** (email shown in settings)  
- [ ] Refresh page or close tab and reopen PWA → **session still there** (or re-auth behaves as designed)  
- [ ] **Abmelden** → session ends; app clears local vehicle/task/log/Ziel/playlist caches and **reloads** (see §F)  
- [ ] Request link again → second login works  

**If the Magic Link opens in Chrome instead of the installed PWA (Android):** that is normal for many email clients. The app manifest sets `handle_links: preferred` and `launch_handler` so **Chromium can route same-origin opens into the installed app where supported**; it is not a guarantee. A **Trusted Web Activity / native shell** (see roadmap Phase 4) is required for reliable “always open in app” from arbitrary mail apps.

---

## C. Migration wizard — local → cloud

**Prep:** Incognito **or** clear site data for the origin. **Do not** log in yet.

**Why start clean:** Old local data can mix legacy vehicle ids (e.g. `default-vehicle`) with newer UUIDs and confuse a migration test. A failed migration **does not** wipe local data — clearing storage (or a new private window) only resets the *scenario*, not the app logic.

**Optional:** If the migration dialog never appears after a past attempt, remove `localStorage` key `local-to-cloud-migrated` (or clear all site data for this origin).

1. [x] Use app **without** login: add **one vehicle**, a few tasks (complete at least one), **one Ziel**, **one Musik** shortcut  
2. [x] **Then** sign in with Magic Link (same browser profile)  
3. [x] Migration dialog appears → run **migrate**  
4. [x] After success: **vehicles, tasks, logs** visible in cloud; **Ziele** and **playlists** still present (from `user_data` / local restore path)  
5. [x] No duplicate vehicles; no “Auth session missing” after migration  

---

## D. Sharing + member management (two accounts)

**Account A (owner):** vehicle exists, sharing section available.  
**Account B:** separate email, incognito or other device.

- [x] A creates **invite** (e.g. Fahrer) → code visible  
- [x] B accepts invite → B sees shared vehicle  
- [x] A: **Teilen** → member list shows A and B with roles  
- [ ] A: **change B’s role** (e.g. Fahrer → Mitleser) → persists after refresh  
- [x] A: **remove B** (or B leaves, per product) → B no longer sees vehicle / correct error  
- [ ] A: create unused invite → **revoke** → code no longer works  

---

## E. Push notifications — Android installed PWA

**Prep:** Chrome (or Edge) on Android; install **Add to Home screen** PWA if you test periodic sync.

- [ ] **Einstellungen** → Benachrichtigungen → grant permission → UI shows success (green)  
- [ ] If OS denies: amber “blocked” state is acceptable — note in results  
- [ ] **Optional hard check:** force an overdue task (dev **simulated date** if you use it, or wait) → within 24h periodic sync window, a notification appears (Chrome Android PWA only; iOS won’t get background sync)  

---

## F. Local-only regression (quick)

- [ ] Log out (or private window, no login): create vehicle, tasks, places — **no** “Auth session missing”  
- [x] **After Abmelden:** local caches for vehicles, tasks, logs, Ziele, playlists are cleared and the app reloads to an **empty** logged-out state (migration flag cleared; preferences such as Startseite / Fahrmodus stay in `app-preferences`).  
- [ ] Home: mileage edit, urgent card → Wartung shortcuts still work  

---

## Result

**Last run:** _(date)_  
**Environment:** _(URL, browser, OS)_  
**Overall:** _pass / partial / fail_

**Notes:**

_(Failures, screenshots, oddities)_
