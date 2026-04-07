# Backlog — Omiigo Car

All user stories grouped by the problem they solve. Each story follows the format: goal + outcome ("so I can..."). For the user research behind these problems, see [Jobs to Be Done](jtbd.md). For the prioritized journey view, see [Story Map](story-map.md).

## Personas

| Persona | Role | Primary job |
|---------|------|-------------|
| **Alltagsfahrer** | Daily commuter, maintains car out of necessity | Know what my car needs right now |
| **Familienverwalterin** | Manages 2–3 household vehicles | See all vehicles in one place |
| **Gelegenheitsnutzer** | Casual tech user, wants zero friction | Start using the app immediately |

---

## Epic 1: App Foundation

**Problem:** Users need the app to load instantly, work offline, and feel native on mobile — otherwise they'll close it and never return.
**Jobs:** [Job 6: Start using without friction](jtbd.md)

### 1.1 PWA Shell Loads Instantly
*Alltagsfahrer* — I open the app and see the home page in under 2 seconds, so I can check my car status without waiting.

### 1.2 Default Vehicle Auto-Created
*Gelegenheitsnutzer* — When I open the app for the first time, a default vehicle already exists with a name ("Mein Fahrzeug"), so I can start using the app without any setup.

### 1.3 Built-In Tasks Pre-Populated
*Alltagsfahrer* — The default vehicle has 16 German maintenance tasks pre-loaded (oil, tires, TÜV, brakes, etc.), so I can see what my car needs without entering anything manually.

### 1.4 PWA Install Banner
*Gelegenheitsnutzer* — I see a prompt to add the app to my home screen, so I can access it like a native app.

### 1.5 Offline Asset Caching
*Alltagsfahrer* — The app works without internet (cached via service worker), so I can check maintenance status in the garage with no signal.

### 1.6 Push Notifications (planned)
*Alltagsfahrer* — I receive a notification when a task becomes overdue, so I don't have to remember to open the app.

### 1.7 Offline Write Queue (planned)
*Alltagsfahrer* — Changes I make offline are synced when I reconnect, so I can mark tasks done without worrying about connectivity.

---

## Epic 2: Home Dashboard

**Problem:** Users need a single-screen overview that answers "does my car need anything right now?" without navigating deeper.
**Jobs:** [Job 1: Know what my car needs](jtbd.md)

### 2.1 Urgency Summary
*Alltagsfahrer* — I see how many tasks are overdue, due soon, and done at a glance, so I can decide if I need to act today.

### 2.2 Active Vehicle Card
*Familienverwalterin* — I see which vehicle is selected with its name, brand, and mileage, so I know which car I'm looking at.

### 2.3 Quick Module Links
*Gelegenheitsnutzer* — I see shortcuts to Map, Music, Maintenance, and Settings, so I can jump to any module in one tap.

### 2.4 Next Task Highlight
*Alltagsfahrer* — The home page highlights the single most urgent task (configurable per vehicle), so I can't miss what's important.

### 2.5 Widget Visibility Toggle
*Alltagsfahrer* — I can show/hide home widgets (stats, next task, recent completions, quick places, quick playlists, modules), so I can customize what I see.

### 2.6 Car Mode
*Gelegenheitsnutzer* — I enable "car mode" which simplifies the home screen and auto-opens my favorite place/playlist, so I can use the app while driving with minimal interaction.

### 2.7 Stats Widget (planned)
*Familienverwalterin* — I see maintenance statistics (tasks completed this month, streak, coverage), so I can feel good about staying on top of things.

---

## Epic 3: Maintenance Task Management

**Problem:** Users need to see, organize, and customize their maintenance checklist — not just the defaults.
**Jobs:** [Job 1: Know what my car needs](jtbd.md), [Job 2: Record that I did something](jtbd.md)

### 3.1 View Tasks by Status
*Alltagsfahrer* — Tasks are grouped into Dringend / Bald fällig / Geplant / Offen / Erledigt sections, so I can prioritize by urgency.

### 3.2 Create Custom Task
*Alltagsfahrer* — I can add a custom maintenance task with description, category, schedule type (recurring or scheduled), and frequency, so I can track things specific to my car.

### 3.3 Edit Existing Task
*Alltagsfahrer* — I can edit any task's details (description, category, frequency, notes, due date, mileage), so I can adjust as my car's needs change.

### 3.4 Archive and Restore Tasks
*Alltagsfahrer* — I can archive built-in tasks I don't need (e.g., no A/C) and restore them later, so my list stays relevant without losing anything permanently.

### 3.5 Scheduled (One-Off) Tasks
*Alltagsfahrer* — I can create a task with a specific due date instead of a recurring frequency, so I can track one-time events like "TÜV am 15.06."

### 3.6 Mileage-Based Due Triggers (planned)
*Alltagsfahrer* — Tasks can be due at a specific mileage (not just a date), so I can track oil changes by kilometers driven.

### 3.7 Bulk Import Tasks (planned)
*Familienverwalterin* — I can import a set of tasks (from a template or another vehicle), so I don't re-enter everything for my second car.

---

## Epic 4: Task Completion & Logging

**Problem:** Completing a task should be one tap, and the history should build automatically.
**Jobs:** [Job 2: Record that I did something](jtbd.md)

### 4.1 Mark Task as Done
*Alltagsfahrer* — I tap "Erledigt" and the task is marked done with today's date and current mileage, so I have a record without filling out a form.

### 4.2 Auto-Compute Next Due Date
*Alltagsfahrer* — When I mark a recurring task done, the next due date is calculated from the frequency (daily +1, weekly +7, monthly +30, etc.), so I don't have to figure out when it's due again.

### 4.3 Log Entry with Mileage
*Alltagsfahrer* — Each completion log records the odometer reading (from the vehicle profile), so I can see maintenance history by mileage, not just by date.

### 4.4 View Log History
*Alltagsfahrer* — I can open a log modal showing all past completions sorted by date, so I can prove to the mechanic (or myself) when things were last done.

### 4.5 Demo Tasks for Testing
*Alltagsfahrer* — A developer-only button generates sample tasks in every status group (urgent, due soon, planned, open, done), so I can test the UI without waiting for real due dates.

### 4.6 Export Logs (planned)
*Familienverwalterin* — I can export my maintenance history as a file, so I can share it with a buyer when selling the car.

---

## Epic 5: Vehicle Management

**Problem:** Users with multiple cars need to create, switch, edit, and delete vehicles.
**Jobs:** [Job 3: Keep car's identity in one place](jtbd.md), [Job 4: See all vehicles](jtbd.md)

### 5.1 Edit Vehicle Profile
*Alltagsfahrer* — I can edit my vehicle's name, plate, brand, model, year, VIN, mileage, notes, and icon, so the app reflects my actual car.

### 5.2 Switch Active Vehicle
*Familienverwalterin* — I can switch between vehicles from a dropdown in settings, so all maintenance views filter to the selected car.

### 5.3 Create New Vehicle
*Familienverwalterin* — I can add a second (or third) vehicle, which gets its own set of built-in tasks, so each car is tracked independently.

### 5.4 Delete Vehicle
*Familienverwalterin* — I can delete a vehicle I no longer own, so my list stays clean.

### 5.5 Vehicle Symbol/Icon
*Alltagsfahrer* — I can pick an icon for each vehicle (car, van, truck, gas pump, oil can, gauge, etc.), so they're visually distinct.

### 5.6 Edit Mileage from Home
*Alltagsfahrer* — I can update the odometer reading directly from the home page without navigating to settings, so I keep it current.

### 5.7 VIN Lookup (planned)
*Alltagsfahrer* — Entering a VIN auto-fills brand, model, and year, so I don't have to look them up manually.

---

## Epic 6: Vehicle Sharing

**Problem:** Households sharing a car need multiple people to see and update maintenance status.
**Jobs:** [Job 5: Share car responsibilities](jtbd.md)

### 6.1 Create Invite Code
*Familienverwalterin* — As the vehicle owner, I generate an 8-character invite code with a role (driver or viewer), so I can share access without exchanging passwords.

### 6.2 Accept Invite
*Alltagsfahrer* — I enter an invite code to join a shared vehicle, so I can see and contribute to its maintenance.

### 6.3 List Members
*Familienverwalterin* — I see all members of a shared vehicle with their roles and emails, so I know who has access.

### 6.4 Change Member Role
*Familienverwalterin* — I can promote or demote a member (owner/driver/viewer), so access matches responsibility.

### 6.5 Remove Member
*Familienverwalterin* — I can remove a member from a shared vehicle, so I can revoke access when someone no longer uses the car.

### 6.6 Revoke Invite
*Familienverwalterin* — I can delete an unused invite code, so old codes can't be redeemed by unintended people.

### 6.7 Role-Based Views (planned)
*Alltagsfahrer* — Viewers can see tasks but not mark them done; drivers can complete tasks; owners can manage members and settings, so permissions match real-world roles.

---

## Epic 7: Navigation Shortcuts

**Problem:** Drivers repeatedly navigate to the same places (mechanic, gas station) and waste time searching every time.
**Jobs:** [Job 7: Access car stuff while driving](jtbd.md)

### 7.1 Save a Place
*Gelegenheitsnutzer* — I save a place with a label, address, and preferred navigation provider, so I can get there in one tap next time.

### 7.2 Navigate with One Tap
*Gelegenheitsnutzer* — I tap a saved place and it opens in Google Maps, Apple Maps, or Waze via deep link, so I don't type the address again.

### 7.3 Toggle Navigation Provider
*Gelegenheitsnutzer* — I choose which nav app to use per place (or set a global default), so the right app opens automatically.

### 7.4 Edit and Delete Places
*Gelegenheitsnutzer* — I can update or remove saved places, so my list stays current.

---

## Epic 8: Music Shortcuts

**Problem:** Drivers want their driving playlist in one tap without searching through music apps.
**Jobs:** [Job 7: Access car stuff while driving](jtbd.md)

### 8.1 Save a Playlist
*Gelegenheitsnutzer* — I save a playlist shortcut with title, music provider (Spotify, YouTube Music, Apple Music, SoundCloud), and URL, so I can open it instantly.

### 8.2 Open Playlist with One Tap
*Gelegenheitsnutzer* — I tap a saved playlist and it opens in the correct music app, so I don't search for it every time.

### 8.3 Favorite and Pin Playlists
*Gelegenheitsnutzer* — I can mark a playlist as favorite (shows on home) and pin one as default startup, so my #1 playlist is always one tap away.

### 8.4 Provider Icons
*Gelegenheitsnutzer* — Each playlist shows the correct provider icon (Spotify green, YouTube red, etc.), so I can visually distinguish them.

---

## Epic 9: Authentication & Cloud

**Problem:** Users who want multi-device or sharing need an account, but signup must not block local-only users.
**Jobs:** [Job 8: Not lose my data](jtbd.md), [Job 5: Share car responsibilities](jtbd.md)

### 9.1 Magic Link Login
*Familienverwalterin* — I enter my email and receive a login link (no password), so authentication is simple and secure.

### 9.2 Session Display
*Familienverwalterin* — I see my logged-in email and session status in settings, so I know I'm connected.

### 9.3 Logout
*Familienverwalterin* — I can log out, reverting the app to local-only mode, so I control my session.

---

## Epic 10: Backup & Debug

**Problem:** Power users and developers need data portability and testing tools.
**Jobs:** [Job 8: Not lose my data](jtbd.md)

### 10.1 JSON Export
*Alltagsfahrer* — I export all vehicles, tasks, and logs as a JSON file, so I have a backup I control.

### 10.2 JSON Import
*Alltagsfahrer* — I import a JSON backup to restore my data, so I can recover from data loss or migrate devices.

### 10.3 Simulated Date
*Alltagsfahrer* — (Developer mode) I set a fake "today" date to test due-date logic without waiting, so I can verify status transitions.

### 10.4 Developer Tools Toggle
*Alltagsfahrer* — I can show/hide the demo data button and simulated date controls, so debug tools don't clutter normal use.

---

## Epic 11: Preferences

**Problem:** Users have different needs — some want a minimal dashboard, others want all widgets visible.
**Jobs:** [Job 6: Start using without friction](jtbd.md), [Job 7: Access car stuff while driving](jtbd.md)

### 11.1 Startup Module
*Gelegenheitsnutzer* — I choose which module opens on app launch (home, map, maintenance, music, settings), so the app starts where I need it.

### 11.2 Default Map Provider
*Gelegenheitsnutzer* — I set a global default navigation app (Google, Apple, Waze), so saved places open in my preferred app without per-place configuration.

### 11.3 Default Music Provider
*Gelegenheitsnutzer* — I set a preferred music provider, so new playlists default to it.

### 11.4 Home Widget Visibility
*Alltagsfahrer* — I toggle which cards appear on the home page (stats, next task, recent completions, quick places, quick playlists, modules), so I see only what I care about.

### 11.5 Per-Vehicle Task Highlight
*Alltagsfahrer* — I configure which maintenance task is highlighted on the home page for each vehicle (with an optional alias), so the most important check is always front and center.
