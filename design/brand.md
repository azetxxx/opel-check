# Omiigo Car Brand

## Logo

SVG icons in `public/` — car silhouette motif.

- **Light background**: `car-maintenance.svg` — dark stroke on transparent
- **Dark background**: `pwa-192.svg` / `pwa-512.svg` — light fill for PWA icons
- **Apple Touch**: `apple-touch-icon.svg` — optimized for iOS home screen
- **Never**: Don't render the logo smaller than 24px. Don't place the icon on a busy background without a container.

## Brand Personality

- **Mission**: Help car owners stay on top of vehicle maintenance without friction.
- **Aesthetic pillars**: Warm, bold, glassy, approachable
- **Personality**: A reliable friend who knows about cars — not a mechanic lecturing you, but a buddy who taps you on the shoulder and says "hey, your oil is due." German-speaking, casual but competent. Never alarmist, always helpful.

## Voice & Tone

- **Tone**: Friendly-casual, slightly warm, never corporate
- **Language**: German (de), informal "du" address, plain language over technical jargon
- **Words to use**: prüfen, erledigt, fällig, Wartung, Aufgabe, Fahrzeug, speichern, Loslegen
- **Words to avoid**: Fehler (prefer "konnte nicht"), mandatory, kritisch (prefer "dringend"), Pflicht, Warnung

## Colors

### Semantic Roles

| Role | Name | Tailwind | Hex | Usage |
|------|------|----------|-----|-------|
| **Primary** | Blue 600 | `blue-600` | `#2563eb` | Buttons, active nav, focus rings, primary actions, theme-color |
| **Primary hover** | Blue 700 | `blue-700` | `#1d4ed8` | Button hover states |
| **Primary surface** | Blue 50 | `blue-50` | `#eff6ff` | PWA background, badges, onboarding pills |
| **Text** | Gray 900 | `gray-900` | `#111827` | Headings, card titles |
| **Text secondary** | Gray 600 | `gray-600` | `#4b5563` | Body text, descriptions |
| **Text muted** | Gray 500 | `gray-500` | `#6b7280` | Subtitles, nav labels, placeholders |
| **Text faint** | Gray 400 | `gray-400` | `#9ca3af` | Icons, chevrons, disabled text |
| **Background** | Blue 50 → Indigo 50 | `from-blue-50 to-indigo-50` | `#eff6ff → #eef2ff` | Page background (gradient) |
| **Surface** | White | `white` | `#ffffff` | Cards, modals, bottom nav |
| **Border** | Gray 100 | `gray-100` | `#f3f4f6` | Card borders, dividers |
| **Border input** | Gray 300 | `gray-300` | `#d1d5db` | Form field borders |

### Status Colors

| Status | Background | Text | Usage |
|--------|-----------|------|-------|
| **Success** | `emerald-50` | `emerald-700` | Done states, completed steps, positive feedback |
| **Error** | `red-50` | `red-700` | Error messages, urgent maintenance alerts |
| **Warning** | `amber-50` | `amber-800` | Auth warnings, due-soon indicators |
| **Info** | `blue-50` | `blue-700` | Onboarding badges, info callouts |

### Module Gradient Map

Each module page has a distinct header gradient — this is the app's signature visual identity.

| Module | Gradient | Tailwind classes |
|--------|----------|-----------------|
| **Home** | Blue → Violet → Fuchsia | `from-blue-600 via-violet-600 to-fuchsia-600` |
| **Map** | Cyan → Teal → Emerald | `from-cyan-500 via-teal-500 to-emerald-500` |
| **Maintenance** | Orange → Amber → Yellow | `from-orange-500 via-amber-500 to-yellow-500` |
| **Music** | Fuchsia → Violet → Purple | `from-fuchsia-500 via-violet-500 to-purple-600` |
| **Settings** | Slate 700 → 800 → 900 | `from-slate-700 via-slate-800 to-slate-900` |

### Card Gradient Map

Featured cards on the home page use distinct gradients to signal their purpose:

| Card | Gradient | Tailwind classes |
|------|----------|-----------------|
| **Active vehicle** | Blue 500 → Indigo 600 | `from-blue-500 to-indigo-600` |
| **Urgent maintenance** | Red 500 → Orange 500 | `from-red-500 to-orange-500` |
| **Favorite place** | Amber 400 → Orange 500 | `from-amber-400 to-orange-500` |
| **Favorite playlist** | Violet 500 → Fuchsia 500 | `from-violet-500 to-fuchsia-500` |
| **Map icon** | Cyan 400 → Teal 500 | `from-cyan-400 to-teal-500` |
| **Preferences** | Violet 600 → Purple 600 → Fuchsia 600 | `from-violet-600 via-purple-600 to-fuchsia-600` |

### Category Badge Colors

Maintenance categories have assigned color pairs for instant visual scanning:

| Category | Background | Text | Tailwind |
|----------|-----------|------|----------|
| Motor | Red 100 | Red 800 | `bg-red-100 text-red-800` |
| Reifen | Blue 100 | Blue 800 | `bg-blue-100 text-blue-800` |
| Bremsen | Yellow 100 | Yellow 800 | `bg-yellow-100 text-yellow-800` |
| Karosserie | Purple 100 | Purple 800 | `bg-purple-100 text-purple-800` |
| Beleuchtung | Green 100 | Green 800 | `bg-green-100 text-green-800` |
| Elektrik | Orange 100 | Orange 800 | `bg-orange-100 text-orange-800` |
| Dokumente | Slate 100 | Slate 800 | `bg-slate-100 text-slate-800` |
| Service | Emerald 100 | Emerald 800 | `bg-emerald-100 text-emerald-800` |
| Klimaanlage | Cyan 100 | Cyan 800 | `bg-cyan-100 text-cyan-800` |
| Allgemein (default) | Gray 100 | Gray 800 | `bg-gray-100 text-gray-800` |

## Typography

The app uses Tailwind's default font stack (system-ui / Inter) — no custom fonts loaded.

| Role | Tailwind | Weight | Size | Line-height | Usage |
|------|----------|--------|------|-------------|-------|
| **Page title** | `text-2xl font-semibold` | 600 | 24px | 32px | Module headers in gradient bars |
| **Card title (large)** | `text-3xl font-semibold` | 600 | 30px | 36px | Vehicle name, mileage value |
| **Card title** | `text-xl font-semibold` | 600 | 20px | 28px | Section headings in cards |
| **Card title (small)** | `text-lg font-semibold` | 600 | 18px | 28px | Modal titles, subsections |
| **Body** | `text-sm` | 400 | 14px | 20px | Descriptions, form labels, status text |
| **Small** | `text-xs` | 400 | 12px | 16px | Nav labels (desktop), timestamps |
| **Nav (mobile)** | `text-[11px] font-medium` | 500 | 11px | — | Bottom nav labels on mobile |
| **Button** | `text-sm font-medium` | 500 | 14px | 20px | All buttons |

## Spacing Scale

Uses Tailwind's default spacing. Key tokens used in the app:

| Token | Tailwind | px | Usage |
|-------|----------|----|-------|
| `gap-2` | 2 | 8 | Icon-to-text gaps, tight inline spacing |
| `gap-3` | 3 | 12 | Card inner gaps, button groups, form fields |
| `gap-4` | 4 | 16 | Grid gaps (module shortcuts) |
| `p-4` | 4 | 16 | Page padding (mobile) |
| `p-5` | 5 | 20 | Card padding, modal padding |
| `py-3` | 3 | 12 | Button vertical padding, nav item height |
| `py-4` | 4 | 16 | Modal header/footer padding |
| `space-y-3` | 3 | 12 | Tight section gaps |
| `space-y-4` | 4 | 16 | Default section gaps |
| `pb-24` | 24 | 96 | Bottom padding to clear the fixed nav bar |

## Effects

| Effect | Value | Usage |
|--------|-------|-------|
| **Card radius** | `rounded-[28px]` | All cards, modal containers, page headers (desktop) |
| **Button radius** | `rounded-[20px]` | Primary/secondary buttons in modals, icon containers (11×11) |
| **Inner button radius** | `rounded-[22px]` | Vehicle icon container, module shortcut icons |
| **Input radius** | `rounded-2xl` (16px) | Form inputs, selects, textareas |
| **Small radius** | `rounded-xl` (12px) | Close buttons, small controls |
| **Badge radius** | `rounded-full` | Status pills, onboarding counter |
| **Shadow sm** | `shadow-sm` | White cards, nav bar |
| **Shadow lg** | `shadow-lg` | Gradient cards, page headers, floating buttons |
| **Shadow 2xl** | `shadow-2xl` | Modals |
| **Backdrop** | `bg-black/50 backdrop-blur-sm` | Modal overlay |
| **Glass buttons** | `bg-white/20 hover:bg-white/25` | Buttons on gradient backgrounds (page headers) |
| **Glass inner** | `bg-white/10 hover:bg-white/15` | Buttons inside gradient cards (vehicle mileage, task highlight) |

## Interaction Patterns

### Touch Targets

All interactive elements meet iOS Human Interface Guidelines:

| Element | Min height | Tailwind |
|---------|-----------|----------|
| Nav items | 68px | `min-h-[68px]` |
| Buttons (modal) | 48px | `min-h-12` |
| Buttons (header) | 44px | `h-11 w-11` |
| Form inputs | ~46px | `px-4 py-3` on `text-sm` |

### Modal Pattern

Modals use a responsive bottom-sheet-to-center pattern:

- **Mobile**: Slides up from bottom (`items-end`)
- **Desktop**: Centers vertically (`sm:items-center`)
- **Container**: `max-w-md rounded-[28px] bg-white shadow-2xl border border-gray-100`
- **Structure**: Header (border-b) → Content → Footer (border-t, flex gap-3)
- **Close**: X button (`rounded-xl p-2 text-gray-400 hover:bg-gray-100`)

### Page Header Pattern

Each module page starts with a full-bleed gradient header:

```
Mobile:  -mx-4 -mt-4 px-4 pb-6 pt-5          (bleeds to edges)
Desktop: sm:mx-0 sm:mt-0 sm:rounded-[28px]    (contained with radius)
```

White text on gradient. Contains page title, subtitle, and action buttons (`bg-white/20` glass style).

## PWA Configuration

| Property | Value |
|----------|-------|
| `theme_color` | `#2563eb` (blue-600) |
| `background_color` | `#eff6ff` (blue-50) |
| `display` | `standalone` |
| `lang` | `de` |
| Icons | SVG, 192×192 and 512×512 |

## Icon Systems

| Library | Usage |
|---------|-------|
| **Heroicons (outline, 24px)** | Navigation, actions, status indicators — `h-5 w-5` in headers, `h-7 w-7` in module shortcuts |
| **Heroicons (solid, 20px)** | Chevrons in collapsible sections |
| **Font Awesome (solid)** | Vehicle symbols (car, truck, van, gas pump, oil can, gauge, etc.) |
| **Font Awesome (brands)** | Music provider logos (Spotify, YouTube, Apple, SoundCloud) |

## Styles

- **[Gradient Cards](styles/gradient-cards.md)** — The signature look: vibrant gradient cards with glass-effect overlays
- **[Clean Forms](styles/clean-forms.md)** — Minimal form design with generous radius and focus states
