# User Journey

What a new user experiences from first encounter to first productive action.

## Persona: Der Alltagsfahrer (daily commuter, maintains car out of necessity)

### Step 1: Open the App

User taps the PWA link or home screen icon. No login, no onboarding screens. The app opens directly to the Home page with a default vehicle ("Mein Fahrzeug") already created and 7 core German maintenance tasks pre-populated (tire pressure, lights, washer fluid, oil, battery, brakes, inspection).

### Step 2: Scan the Dashboard

The home page loads immediately:

```
┌─────────────────────────────────────────────────────────────────┐
│  🚗 Omiigo Car                              [Home] [≡ Menu]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ Mein Fahrzeug ──────────────────────────────────────────┐  │
│  │  Opel · — km                         [Bearbeiten]        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Nächste Wartung ────────────────────────────────────────┐  │
│  │  ⚠️ Ölstand prüfen              fällig: in 3 Tagen      │  │
│  │  ✅ Reifendruck kontrollieren    erledigt: vor 2 Tagen   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Quick Links ────────────────────────────────────────────┐  │
│  │  🗺️ Ziele    🎵 Musik    🔧 Wartung    ⚙️ Einstellungen │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [🏠 Home]  [🗺️ Map]  [🔧 Wartung]  [🎵 Musik]  [⚙️ Settings]│
└─────────────────────────────────────────────────────────────────┘
```

- **Vehicle card**: Name, brand, mileage — tappable to edit
- **Next maintenance**: The most urgent task with status color (red = overdue, amber = due soon, green = done)
- **Quick links**: Module shortcuts to Map, Music, Maintenance, Settings
- **Bottom nav**: 5-tab bar for all modules

### Step 3: Open the Maintenance Page

User taps "Wartung" in the nav. Tasks are grouped by urgency:

- **Dringend** (overdue) — red, tasks past their due date
- **Bald fällig** (due soon) — amber, within 7-day window
- **Geplant** (planned) — scheduled one-off tasks
- **Offen** (open) — recurring tasks never completed
- **Erledigt** (done) — recently completed, collapsed by default

Each task card shows: description, category badge, frequency, last check date, and a "✓ Erledigt" button.

### Step 4: Mark a Task as Done (the "aha" moment)

User taps "✓ Erledigt" on "Reifendruck kontrollieren." The app:

1. Records a log entry (task, date, mileage, category)
2. Computes the next due date (monthly = +30 days)
3. Updates the task status from "offen" to "erledigt"
4. Moves the card to the "Erledigt" section with a success toast

**This is the moment the value clicks.** The user realizes: "I just created a maintenance record in 1 tap, and I'll be reminded automatically when it's due again. I don't have to remember."

### Step 5: Customize the Vehicle Profile

User navigates to Settings → Fahrzeugprofil. Fills in:
- Name: "Opel Corsa"
- Kennzeichen: "M-AB 1234"
- Kilometerstand: 125000

The mileage is now attached to future log entries, building a maintenance history tied to odometer readings.

## Aha Moment

The value becomes obvious when the user can see, at a glance, that:

1. **7 core maintenance tasks exist** without any setup — the app already knows what a car needs
2. **One tap records a check** and schedules the next one — no forms, no dates to enter
3. **Status grouping shows urgency** — overdue items are impossible to miss

This visibility — which previously required a spreadsheet, a notebook, or pure memory — happens automatically.

## What Must Be True

For the first impression to succeed, the system needs:

- **Pre-populated tasks**: 7 core German maintenance tasks (tire pressure, lights, washer fluid, oil, battery, brakes, inspection) — created on first visit, covering biweekly through annual intervals
- **A default vehicle**: Automatically created so the user isn't greeted with an empty state
- **No auth requirement**: The app must work fully from localStorage on first open
- **Instant load**: PWA cached assets, no server round-trip for the initial view

Without pre-populated tasks, the maintenance page is empty and the value proposition ("see what your car needs") is invisible. Users can add custom tasks later for their specific needs.
