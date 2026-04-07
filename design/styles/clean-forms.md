# Clean Forms

The design system for all form elements — inputs, selects, textareas, buttons, and modals. Prioritizes readability, generous touch targets, and consistent radius.

## Mood

Clean, spacious, approachable, trustworthy

## Color Palette

| Color | Hex / Tailwind | Usage |
|-------|---------------|-------|
| **Border default** | `gray-300` / `#d1d5db` | Input borders at rest |
| **Border focus** | `blue-500` / `#3b82f6` | Focus ring and border |
| **Label** | `gray-700` / `#374151` | Form labels (`text-sm font-medium`) |
| **Placeholder** | `gray-400` / `#9ca3af` | Input placeholder text |
| **Disabled bg** | `gray-50` / `#f9fafb` | Read-only and disabled inputs |
| **Primary button** | `blue-600` → `blue-700` | Primary actions (save, confirm) |
| **Danger button** | `red-600` border + text | Destructive actions (delete) |
| **Secondary button** | `gray-300` border + `gray-700` text | Cancel, dismiss |

### Rules

- Focus state is always `focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`
- Disabled/readonly inputs get `bg-gray-50` background
- Danger buttons use outline style: `border border-red-200 text-red-600 hover:bg-red-50`

## Typography

| Use | Font | Weight |
|-----|------|--------|
| Labels | System (Tailwind default) | `font-medium` (500) |
| Input text | System (Tailwind default) | Normal (400) |
| Button text | System (Tailwind default) | `font-medium` (500) |

- Labels: `text-sm font-medium text-gray-700 mb-1`
- Inputs: `text-sm` with `px-4 py-3`
- Buttons: `text-sm font-medium`

## Imagery

- No images in forms
- Icons in buttons: Heroicons at `h-5 w-5`, placed before text with `gap-2`

## Layout Principles

### Inputs

```
w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm
focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500
```

- Radius: `rounded-2xl` (16px) — softer than typical form design
- Padding: `px-4 py-3` — generous for touch
- Full-width by default (`w-full`)
- Grid layout for multi-field forms: `grid grid-cols-1 md:grid-cols-2 gap-4`

### Buttons

```
flex min-h-12 items-center justify-center rounded-[20px] px-4 py-3 text-sm font-medium
```

- Primary: `bg-blue-600 text-white hover:bg-blue-700`
- Secondary: `border border-gray-300 text-gray-700 hover:bg-gray-50`
- Danger: `border border-red-200 text-red-600 hover:bg-red-50`
- Minimum height: `min-h-12` (48px) — meets touch target guidelines
- Button groups: `flex gap-3` (equal width with `flex-1`)

### Modals

```
Container: max-w-md rounded-[28px] bg-white shadow-2xl border border-gray-100
Header:    border-b border-gray-100 px-5 py-4
Content:   px-5 py-5 space-y-4
Footer:    border-t border-gray-100 px-5 py-4 flex gap-3
```

- Responsive positioning: `items-end` (mobile bottom sheet) → `sm:items-center` (desktop centered)
- Overlay: `bg-black/50 backdrop-blur-sm`

### Selects

```
w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm
```

- Same styling as text inputs for visual consistency
- Disabled: `disabled:bg-gray-50`

## Do / Don't

### Do

- Use `rounded-2xl` on all form inputs — it's the form-level signature radius
- Use `rounded-[20px]` on all buttons — slightly larger than inputs for visual hierarchy
- Always include `min-h-12` on buttons for accessibility
- Use `gap-3` between button pairs in modal footers
- Place labels above inputs with `mb-1` spacing

### Don't

- Don't use `rounded-[28px]` on inputs or buttons — that's reserved for cards
- Don't mix button radius styles in the same context
- Don't use icon-only buttons without `h-11 w-11` minimum dimensions
- Don't put placeholder text that duplicates the label
- Don't use `outline` buttons for primary actions — they're for cancel/secondary only
