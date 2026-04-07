# Gradient Cards

The app's signature visual element. Used for page headers, the vehicle card, alert cards, and featured items on the home page. Every gradient card follows the same structural rules.

## Mood

Bold, vibrant, confident, warm, glassy

## Color Palette

| Color | Gradient | Usage |
|-------|----------|-------|
| **Home header** | `from-blue-600 via-violet-600 to-fuchsia-600` | Home page top bar |
| **Vehicle card** | `from-blue-500 to-indigo-600` | Active vehicle identity |
| **Urgent alert** | `from-red-500 to-orange-500` | Overdue maintenance warning |
| **Favorite place** | `from-amber-400 to-orange-500` | Pinned navigation target |
| **Favorite playlist** | `from-violet-500 to-fuchsia-500` | Pinned music shortcut |
| **Maintenance header** | `from-orange-500 via-amber-500 to-yellow-500` | Maintenance module |
| **Map header** | `from-cyan-500 via-teal-500 to-emerald-500` | Map module |
| **Music header** | `from-fuchsia-500 via-violet-500 to-purple-600` | Music module |
| **Settings header** | `from-slate-700 via-slate-800 to-slate-900` | Settings module |
| **Urgent task card** | `from-red-600 via-red-500 to-orange-500` | Overdue task inline card |

### Rules

- Gradients always flow left-to-right (`bg-gradient-to-r`) or top-left-to-bottom-right (`bg-gradient-to-br`)
- Three-stop gradients for page headers (via- middle color), two-stop for cards
- All gradient cards use white text (`text-white`)
- Shadow is always `shadow-lg` — gradient cards must feel elevated
- Each module has exactly one gradient — don't mix module gradients

## Typography

| Use | Font | Weight |
|-----|------|--------|
| Card title | System (Tailwind default) | `font-semibold` (600) |
| Card subtitle | System (Tailwind default) | Normal (400) |

- Titles: `text-2xl` to `text-3xl font-semibold`
- Subtitles: `text-sm` with `text-white/85` or `text-<color>-100/90` opacity

## Imagery

- No images inside gradient cards — only icons and text
- Icons use Heroicons (outline) or Font Awesome (solid) in white
- Icon containers: `rounded-[20px] bg-white/20` (glass effect)

## Layout Principles

- Full-width on mobile (`-mx-4 -mt-4`), contained on desktop (`sm:mx-0 sm:rounded-[28px]`)
- Padding: `px-4 pb-6 pt-5` (mobile), `sm:px-5 sm:pt-5` (desktop)
- Content cards: `rounded-[28px] p-5`
- Inner interactive elements use glass overlay: `bg-white/10 hover:bg-white/15` or `bg-white/20 hover:bg-white/25`
- Action buttons in headers: `h-11 w-11 rounded-2xl bg-white/20`

## Do / Don't

### Do

- Use one gradient per card — single visual identity per element
- Keep text high-contrast: white on saturated gradients
- Use glass overlays (`bg-white/N`) for interactive zones within a gradient
- Apply `shadow-lg` to all gradient cards for depth
- Let the gradient define the module identity — users learn "orange = maintenance"

### Don't

- Don't stack two gradient cards with the same color palette adjacent to each other
- Don't use gradient cards for secondary content — reserve them for hero/featured elements
- Don't put form inputs inside gradient cards (readability suffers)
- Don't use gradients on the bottom nav bar — it stays `bg-white/95 backdrop-blur`
- Don't create new module gradients without assigning them a semantic meaning
