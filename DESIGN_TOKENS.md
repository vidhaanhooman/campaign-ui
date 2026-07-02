# Design Tokens & Patterns

Reference for the current dashboard visual language. Use these tokens for existing surface updates and for setting up new pages consistently. Source of truth for colors/radii/shadows lives in `app/globals.css` (`@theme inline` block).

## 1 · Color tokens (dark mode)

All colors are OKLCH via CSS custom properties.

| Token | Value | Usage |
|---|---|---|
| `--background` | `oklch(0 0 0)` | Page + sidebar bg (same, no seam) |
| `--foreground` | `oklch(1 0 0)` | Body text, active icons |
| `--card` | `oklch(0.14 0 0)` | Card fill |
| `--popover` | `oklch(0.18 0 0)` | Popover/dropdown fill |
| `--primary` | `oklch(1 0 0)` | Solid CTA fill (rare) |
| `--primary-foreground` | `oklch(0 0 0)` | Text on primary |
| `--secondary` | `oklch(0.25 0 0)` | Button fill, delta chip, hover, tab track |
| `--muted-foreground` | `oklch(0.72 0 0)` | Section labels, sublabels, meta |
| `--accent` | `oklch(0.32 0 0)` | Button hover |
| `--border` | `oklch(0.216 0.006 56)` | **Every hairline separator** — card outline, row divider, group divider, sidebar rail, button outline |
| `--sidebar-border` | `oklch(1 0 0)` | Only for sidebar-scoped chrome; prefer `--border` for surface outlines |
| `--chart-1` | `oklch(0.81 0.17 75)` | Primary chart color (warm yellow-orange) |
| `--chart-2` | `oklch(0.58 0.21 261)` | Secondary chart color (blue) |
| `--chart-3..5` | greys | Ramp for donut/bar chart segments |

**Hairline rule:** every separator — card outline, row divider, group divider, active-tab pill, sidebar rail, button outline — uses **`border-border`** at full opacity. Do not synthesize opacity variants (`border-*/15`, `border-*/30`, etc.); the token is already tuned.

## 2 · Radius scale

| Token | rem | px | Usage |
|---|---|---|---|
| `--radius-sm` | 0.125 | 2px | (unused) |
| `--radius-md` | 0.375 | 6px | Small chips, inline hover targets |
| `--radius-lg` (`--radius`) | 0.5 | 8px | Nav items, dropdown items |
| `--radius-xl` | 0.75 | 12px | Cards, buttons, tab container, KPI cards |
| `2xl` (calc) | 1.0 | 16px | Only when a card needs extra prominence |

Cards → `rounded-xl`. Buttons → `rounded-xl`. Small pills → `rounded-lg`.

## 3 · Typography scale

**Tables & primary content:** all row text is `text-sm` (14px). One size across labels, values, percents, sublabels — no mixing `text-xs` and `text-base` inside a row.

**Weights:**
- `font-medium` — labels
- `font-semibold` — count/display numbers inside a row
- `font-bold` — KPI card display numbers only

**Sizes by role:**
| Role | Class |
|---|---|
| Row label / value / percent / note | `text-sm` |
| KPI card display number | `text-3xl font-bold tracking-tight` |
| Card header title | `text-sm font-semibold` |
| Section labels (sidebar) | `text-[11px] font-medium uppercase tracking-wider text-muted-foreground` |
| Group heading inside a card | `text-sm font-medium` |
| Delta chip / badge | `text-[11px] font-medium tabular-nums` |
| Sub-annotation (rare) | `text-xs text-muted-foreground` |

Numbers: always `font-mono tabular-nums` for consistent width.

## 4 · Spacing rhythm

Unified gap: **`gap-6`** for section grids (top-level page rhythm), **`gap-2`** between groups inside a card, **`py-2` / `py-2.5`** for table rows.

- Page container: `px-6 py-6`
- Card body inner padding: `px-5 pb-5` (`px-6` for `ChartCard`)
- KPI card: `px-6 py-5`
- Between page sections: `gap-6`
- Inside a card, between groups: `gap-2` (not `gap-6`) — group heading uses `py-2` so it matches the row rhythm
- Toolbar chips gap: `gap-2`

## 5 · Card shells

Two primitives in `components/stats/ui.tsx`:

### `<Panel>` — generic section card
```
rounded-xl border border-border bg-card
header: px-5 pt-4 pb-4
body:   px-5 pb-5 (default)   // pass bodyClassName="px-0 pb-5" for edge-to-edge tables
```

### `<ChartCard>` — larger card with title/subtitle/footer
```
rounded-xl border border-border bg-card
header: px-6 pt-5 pb-4  (title + optional subtitle + optional icon + optional action)
body:   flex-1  (no default horizontal padding — tables extend edge-to-edge)
footer: optional trend + description
```

### `<KpiCard>` — dashboard KPI tile
```
rounded-2xl border border-border
bg-gradient-to-t from-card to-secondary/20
px-6 py-5
```
Contents in order: **label (text-sm muted)** · **delta chip (top-right)** · **value (text-3xl bold)** · **trend (optional, text-sm medium)** · **description (text-sm muted)**.

## 6 · Table row pattern

Every table follows the same recipe:

```tsx
<tr className="border-b border-border transition-colors last:border-0 hover:bg-secondary/40">
  <td className="py-2.5 pl-6 pr-3">…label…</td>
  <td className="py-2.5 pl-3 pr-6 text-right">…values…</td>
</tr>
```

Key rules:
- Hairline `border-b border-border` between rows, `last:border-0` on the tail
- Full-row hover strip via `hover:bg-secondary/40`
- **Hover must extend edge-to-edge** — remove parent horizontal padding, pad first/last cells with `pl-6` / `pr-6` (ChartCard) or `pl-5` / `pr-5` (Panel)
- Group heading rows use `px-6 py-2` (matching row padding) so vertical rhythm stays consistent
- Row content is all `text-sm` — don't mix sizes inside a row

## 7 · Button pattern (compact chip)

Toolbar chips and secondary buttons:

```
inline-flex h-8 items-center gap-1.5 rounded-xl
border border-border bg-secondary
px-3 text-xs font-medium text-foreground
hover:bg-accent
```

Icon size in chips: **13px** (`size={13}`).

## 8 · Segmented tabs

Container:
```
inline-flex h-8 items-center gap-1 rounded-xl
border border-border bg-secondary p-1
```
Inactive tab:
```
h-6 rounded-lg px-2.5 text-xs font-medium
text-muted-foreground hover:text-foreground
```
Active tab:
```
h-6 rounded-lg px-2.5 text-xs font-medium
border border-border bg-background text-foreground
```

## 9 · Page header

Minimal — sidebar-toggle icon · vertical divider · label · optional right actions · hairline underline.

```
border-b border-border px-6 py-3
[toggle button] [4px vertical bar bg-border] [text-sm font-medium label] [action]
```

Toggle uses `useSidebar()` hook exported from `components/app-shell.tsx` — clicks call `toggle()` to collapse the sidebar to `w-0`.

## 10 · Sidebar

- Width: `w-[248px]`, shares `bg-background` with main content
- Vertical separator: `border-r border-border`
- Groups: uppercase label `text-[11px] font-medium tracking-wider text-muted-foreground`
- Groups are **collapsible** via `ChevronRight` on the label; state lives in `useState<Set<string>>`. `COLLAPSED_BY_DEFAULT` set determines initial state; a group containing `activeNav` is auto-expanded.
- Between groups: `mt-3 border-t border-border pt-3`
- Nav item: `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm`, icon `size={16} strokeWidth={1.75}`
- Active item: `bg-sidebar-accent text-sidebar-foreground` (subtle grey pill — no inverted white pill)
- Scrollbar hidden: `scroll-hidden`
- Workspace header: `CircleArrowUp` in a `size-7 rounded-full` ring
- Bottom: single `Settings` item under a hairline

## 11 · Chart colors

- Primary bar/donut segment: `var(--chart-1)` (warm)
- Secondary: `var(--chart-2)` (blue)
- Ramp for pie/bar categories:
  ```
  [chart-1, chart-2, chart-3, chart-4, chart-5,
   color-mix(in oklab, foreground 18%, transparent),
   color-mix(in oklab, foreground 10%, transparent)]
  ```

## 12 · Icons

- All icons are lucide-react
- Sidebar nav: `size={16} strokeWidth={1.75}`
- Card header: `size={14}` (via `text-muted-foreground`)
- Group-heading icons inside a card: `size={13} text-muted-foreground`
- Toolbar chip icons: `size={13}`
- Delta trend arrow inside chip: `size={11}`
- Info hint dots: `h-1.5 w-1.5 rounded-full bg-emerald-400`

## 13 · Rules of thumb

1. **One text size per table.** Everything in a row is `text-sm`. Only KPI display numbers break this.
2. **Hairlines, not boxes.** Prefer `border-border` (cards, groups) or `/30` (rows). Solid outlines are reserved for active segmented tabs.
3. **Hover strips run edge-to-edge.** Tables never inherit parent horizontal padding; pad the first/last cell instead.
4. **Cards float on the page background.** No shadows for section cards; the hairline border does the separation.
5. **Symmetric 2-column grid** for main content. `gap-6` between all pairs; `items-stretch` (grid default) balances heights.
6. **Group rhythm matches row rhythm.** Group headings inside a card use `py-2`, so the space between "In-flight" and the first row equals the space between two rows.
7. **Icons live in `muted-foreground`** unless the parent is an active nav item.
8. **Chart accent = `chart-1`** for the highlighted metric; muted-foreground/secondary for the rest.
