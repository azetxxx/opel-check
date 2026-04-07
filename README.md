# Omiigo Car

**Mission:** Help car owners stay on top of vehicle maintenance without relying on dealership schedules or spreadsheets.

**Vision:** Every car owner sees at a glance what their vehicle needs — and handles it in seconds, not hours.

## Status

**PWA live** on Netlify. Core maintenance tracking, multi-vehicle support, and optional Supabase cloud sync are implemented. Vehicle sharing via invite codes is functional. Map and music modules are local-only shortcuts. Push notifications for overdue tasks are active. Local-to-cloud migration wizard migrates all user data (vehicles, tasks, logs, places, playlists) on first sign-in.

**Branch:** `main`

## Next Steps

- Mileage-based task triggers (wire `due_mileage` / `last_mileage` into status computation)
- Offline write queue for Supabase writes
- Role-based views (hide actions based on viewer/driver/owner role)
- E2E test sharing flows (invite, accept, role change, revoke)
- Production validation of all major flows

## Stack

- Vue 3 (Composition API)
- TypeScript
- Vite
- Tailwind CSS
- Heroicons + Font Awesome
- Supabase (optional backend: auth, Postgres, RLS)
- localStorage for local-first persistence
- vite-plugin-pwa (injectManifest, custom service worker with periodic sync)

## Workspace

```
omiigo-car/
├── README.md
├── product/
│   ├── strategy.md                        # Business strategy, pricing, GTM
│   ├── jtbd.md                            # Jobs to Be Done (3 personas, 8 jobs)
│   ├── user-journey.md                    # First-time user flow + aha moment
│   ├── story-map.md                       # Journey columns × priority rows
│   ├── backlog.md                         # 11 epics, ~50 user stories
│   └── scenarios/                         # BDD feature files
│       ├── app-foundation.feature
│       ├── home-dashboard.feature
│       ├── maintenance-tasks.feature
│       ├── task-completion.feature
│       ├── vehicle-management.feature
│       ├── vehicle-sharing.feature
│       ├── navigation-shortcuts.feature
│       ├── music-shortcuts.feature
│       ├── auth-and-cloud.feature
│       ├── backup-and-debug.feature
│       └── preferences.feature
├── design/
│   ├── brand.md                           # Colors, typography, spacing, effects, icons
│   └── styles/
│       ├── gradient-cards.md              # Signature gradient card system
│       └── clean-forms.md                 # Form inputs, buttons, modals
├── engineering/
│   ├── architecture.md                    # System diagram, data model, data flows
│   └── decisions/
│       ├── 001-local-first-with-optional-cloud.md
│       ├── 002-supabase-over-firebase.md
│       └── 003-security-definer-rpcs.md
├── marketing/
│   ├── campaign.md                        # 4-phase launch playbook
│   ├── content-plan.md                    # 8-week content calendar
│   └── posters/
│       ├── launch-poster.md               # "Dein Auto vergisst nichts."
│       └── werkstatt-poster.md            # "Wann war der letzte Ölwechsel?"
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router.ts
│   ├── style.css
│   ├── pages/                             # One page per route
│   ├── components/                        # Reusable UI components
│   ├── composables/                       # Reactive state + business logic
│   ├── services/storage/                  # Storage facade (local ↔ Supabase)
│   ├── types/                             # TypeScript interfaces
│   ├── constants/                         # Static data (built-in tasks, storage keys)
│   ├── utils/                             # Pure functions
│   └── lib/
│       └── supabase.ts
├── supabase/
│   ├── schema.sql                         # Full schema + RLS + RPCs
│   └── patch-*.sql                        # Incremental SQL patches
├── public/                                # PWA icons
├── vite.config.ts
├── tailwind.config.js
├── package.json
└── netlify.toml
```

## Development

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Dev Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

### Environment

Copy `.env.example` → `.env`. Set `VITE_STORAGE_PROVIDER=local` for offline-only, or `supabase` with valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for cloud sync.
