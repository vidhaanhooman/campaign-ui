# HoomanLabs Design System

A dark-first, near-black, white-accent system for voice-AI product surfaces
(campaigns, insights, QA, agent builder). Send this folder to Claude Design so
the design agent builds **with these tokens and component recipes** — every
screen it produces is on-brand and maps 1:1 to shippable React + Tailwind.

- `tokens.css` — the complete token set (light + dark). The single source of color, radius, shadow, and font truth.
- `README.md` (this file) — the styling idiom, token vocabulary, and component catalog with copy-paste recipes.

Stack: **React + Tailwind CSS v4**, shadcn-style primitives on **base-ui**,
`lucide-react` icons, `sonner` toasts. Font: **Inter** (sans), **Geist Mono** (mono).

---

## 1. Philosophy (read first)

- **Dark-first.** The product runs on pure black (`--background: #000`) with near-black cards (`--card: #141414`). Design in dark; light mode is derived from the same tokens.
- **One translucent surface, warm hairline outlines, white accents.** Depth comes from a single card fill + a subtle border, not shadows or gradients.
- **Quiet, not empty.** Legibility comes from typography, alignment, and spacing — not chrome. Restraint is the default; "too cluttered" is the most common mistake.
- **Never hardcode color.** Use the token utilities below. No hex, no ad-hoc `white/[0.06]` overlays, no off-palette Tailwind colors (`violet-400`, `sky-500`, …). If you need a subtle surface, that's `bg-secondary` / `bg-accent`; a hairline is `border-border`.

---

## 2. The styling idiom — token vocabulary

Style with **Tailwind utilities backed by the CSS variables in `tokens.css`**. These are the only color names to use:

| Purpose | Utilities |
|---|---|
| Page background | `bg-background` |
| Card / panel surface | `bg-card` · `text-card-foreground` |
| Popover / menu surface | `bg-popover` · `text-popover-foreground` |
| Primary action (white in dark) | `bg-primary` · `text-primary-foreground` · `hover:bg-primary/90` |
| Secondary / hover fill | `bg-secondary` · `hover:bg-secondary/60` |
| Subtle raised fill | `bg-accent` · `hover:bg-accent` |
| Muted passive fill | `bg-muted` |
| Body text | `text-foreground` |
| Supporting text | `text-muted-foreground` |
| Hairline border | `border-border` |
| Emphasized / hover border | `border-input` |
| Focus ring | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` |
| Destructive | `bg-destructive` · `text-destructive` |
| Data / status accents | `text-chart-1` (gold) · `text-chart-2` (blue) · `chart-3..5` (greys) |

> **No green in the palette.** For status/quality scales use `destructive` (red), `chart-1` (gold), `chart-2` (blue), and greys. Don't reach for `emerald`/`amber`/`sky`.

**Typography** — two weights only (400, 500), never 600/700. Sentence case everywhere; never Title Case or ALL CAPS except tiny eyebrow labels.

| Role | Class |
|---|---|
| Page/section heading | `text-lg font-medium tracking-tight` |
| Card title | `text-sm font-medium text-foreground` |
| Body | `text-sm text-foreground` |
| Field sub-label / hint | `text-[11px] leading-relaxed text-muted-foreground` |
| Eyebrow / band label | `text-[11px] font-medium uppercase tracking-wider text-muted-foreground` |
| Big number (KPI) | `text-3xl font-semibold tracking-tight tabular-nums` |

**Radius** — `rounded-lg` controls · `rounded-xl` cards · `rounded-md` chips/inputs.
**Spacing** — vertical rhythm in `rem` (1, 1.5, 2); internal gaps in px (8/12/16). Sections separate with `border-t border-white/[0.04]`… **use `border-border`** for that hairline.
**Shadows** — reserve for floating layers only (`shadow-lg`/`shadow-2xl` on dialogs/popovers). Flat in-flow cards get no shadow.

---

## 3. Component catalog

Recipes are real, shippable React + Tailwind. Compose layouts from these; don't invent new controls or colors.

### Buttons
```tsx
// Primary (white)
<button className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">Save changes</button>
// Secondary (outline)
<button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent">Cancel</button>
// Ghost
<button className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">Ghost</button>
```
At most **one** primary per view.

### Text input / textarea
```tsx
<input className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground" placeholder="name@company.com" />
<textarea className="min-h-20 w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground" />
```
Field wrapper: label (`text-sm font-medium`) + optional hint (`text-[11px] text-muted-foreground`) + control, stacked with `gap-1.5`.

### Select (dropdown) — base-ui / shadcn `Select`
Single-color surface, white overlays only. Trigger looks like the input; menu on `bg-popover`, selected row `bg-accent`, hover `hover:bg-secondary`.

### Segmented tabs — active pill is WHITE
```tsx
<div className="inline-flex h-8 items-center gap-1 rounded-xl border border-border bg-card p-1">
  {opts.map(o => (
    <button key={o} onClick={() => set(o)}
      className={cn("inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium transition-colors",
        value === o ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
      {o}
    </button>
  ))}
</div>
```

### Switch, Checkbox, Radio
Use the shadcn/base-ui primitives. Checked state uses `bg-primary` / `border-primary`; checkbox check mark is `text-primary-foreground`. A settings toggle row: card row with label + hint on the left, `<Switch>` on the right.

### Cards
```tsx
// Panel / section card
<div className="overflow-hidden rounded-xl border border-border bg-card">
  <div className="flex items-center justify-between border-b border-border px-5 py-3">
    <span className="text-sm font-medium text-foreground">Title</span>
  </div>
  <div className="p-4">…</div>
</div>
// KPI tile
<div className="flex flex-col rounded-xl border border-border bg-card px-6 py-5">
  <span className="text-sm text-muted-foreground">Calls received</span>
  <span className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground">146</span>
</div>
```

### Table — transparent header, row hover
`rounded-xl border border-border bg-card` wrapper; header row `border-b border-border`, cells `text-xs font-medium text-muted-foreground`; body rows `border-b border-border last:border-0 hover:bg-secondary/40`, numeric cells `text-right font-mono tabular-nums`.

### Chips / pills / badges
```tsx
<span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-2 py-0.5 text-xs text-foreground">+91800…<X size={11} className="text-muted-foreground hover:text-foreground" /></span>
```
Status chip: `inline-flex items-center gap-1.5 text-xs` + a `h-1.5 w-1.5 rounded-full` dot (`bg-chart-2` active, `bg-muted-foreground/60` idle, `bg-destructive` error).

### Dialog / Drawer (multi-step flows)
Right-side drawer: `<Dialog><DialogContent variant="drawer" className="!max-w-[1040px] flex flex-col bg-card border-l border-border p-0 shadow-2xl">`. Inside: a header (title + `X` close) with a **centered numbered stepper**, a scrollable body (`max-w-2xl mx-auto px-8 py-6`), and a footer (`border-t border-border`) with Back (left) + Cancel/Continue (right, Continue is primary).

### Filter dropdown (schema-driven)
Grouped taxonomy filter: a "Filter"/"Add filter" outline button opens a `bg-popover` panel with a search box, uppercase section headers, and rows of `icon · label · chevron`. Field value editors: multi-select (searchable checkbox list), text, range slider, pills, and a custom key-input. Active filters render as removable chips.

### Number stepper, Date/Time, Time field
Compact numeric input with ▲▼ + drag-to-scrub (`NumberStepper`), a combined date+time picker (`DatePickerTime`), and a `TimeField`. All share the input recipe (`h-9 rounded-md border-border`).

### Empty states
Centered icon (in a subtle ring), `text-sm font-medium` title, `text-xs text-muted-foreground` description, and one primary CTA. Distinguish "filtered → no results" (offer reset) from "no data yet" (offer create).

### Toasts, Page header, Sidebar
`sonner` toasts (bottom). Page header: icon + label + sublabel on the left, actions on the right. Sidebar on `bg-sidebar` with `border-sidebar-border`; active item `bg-sidebar-accent`.

---

## 4. Layout rules

- **Center forms** at `max-w-2xl` (or `max-w-5xl` for tables/dashboards); consistent `px-8` gutters.
- **Section** long forms with an eyebrow label + a `flex flex-col gap-4/6` group; one primary action per view.
- **Progressive disclosure** — reveal fields based on prior choices; hide advanced settings behind an "Advanced" / collapsible.
- **Responsive** — relative units, `grid` with `repeat(auto-fit, minmax(…, 1fr))`; wide content scrolls inside its own `overflow-x-auto` container.

---

## 5. Do / Don't

| Do | Don't |
|---|---|
| `bg-card`, `border-border`, `text-muted-foreground` | hex, `white/[0.06]`, `violet-400`, `sky-500` |
| One primary (white) action per view | multiple primary buttons |
| Sentence case, weights 400/500 | Title Case, ALL CAPS, weight 600/700 |
| Segmented active pill = white | grey active pill |
| Flat cards, shadow only on floating layers | gradients, glossy fills, drop shadows on in-flow cards |
| Status via chart-1/chart-2/destructive + greys | emerald/amber/sky (not in palette) |
