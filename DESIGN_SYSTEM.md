# Design System — dark-first, near-black, white-accent

A portable spec for reproducing this exact visual style in any project.
Two parts: a **prompt** to hand Claude Code, and the **token/recipe reference**
it points to. Dark mode is the default and only fully-designed theme.

---

## Part 1 — Prompt for Claude Code

> Apply the design system in `DESIGN_SYSTEM.md` to this project. It's a
> dark-first, near-black UI with a single translucent "element" fill, warm
> hairline outlines, dimmed-white internal separators, and white primary
> accents. Work surface by surface; make every component conform. Do not
> invent new colors, radii, or spacing — only use the tokens and recipes given.
>
> **Setup first:**
> 1. Add the token blocks (`:root`, `.dark`, `@theme inline`, scroll utilities)
>    to your global stylesheet. Keep existing framework/animation `@import`s.
> 2. Load **Inter** as `--font-sans` and a mono font for numerics. Remove any
>    competing font override.
> 3. App is **dark by default** — put the `dark` class on `<html>`/`<body>`.
>
> **Then apply the rules uniformly:**
> - Every input, trigger, select, card, secondary button, chip = the **element
>   style**: `border border-border bg-[#333333]/30`.
> - **Outer outlines** use `border-border` (warm #1C1917). **Internal
>   separators** (`border-b/t/l/r`, `divide-*`) use `border-white/[0.04]`.
>   Never mix the two.
> - **Dropdowns/popovers are one color.** The floating surface is the opaque
>   `#333/30` equivalent; inside it, selection/hover/search/chips use **white
>   overlays only** — never a second fill color.
> - **Radii:** controls/inputs/dropdown-rows = `rounded-lg`; cards/panels =
>   `rounded-xl`; chips/badges = `rounded-md`.
> - **Tabs/segmented controls:** track = element style; **active pill = white**
>   (`bg-primary text-primary-foreground shadow-sm`); inactive = muted.
> - **KPI/stat cards** are separate `rounded-xl` tiles with `gap-4` — never a
>   single divided strip.
> - **Tables:** transparent header with a `border-b border-white/[0.04]`
>   hairline (no filled header band); rows get `hover:bg-secondary/40`.
> - **Typography:** section heading = `text-sm font-medium text-foreground`;
>   field sub-label = `text-xs font-normal text-muted-foreground`; big number =
>   `text-3xl font-semibold tracking-tight tabular-nums`.
> - Keep **modal dialogs opaque** (`bg-popover`) — never translucent.
>
> Verify each screen compiles and looks consistent. Ask before changing
> information architecture; this task is visual only.

---

## Part 2 — Tokens

```css
@import "tailwindcss";
@import "tw-animate-css";        /* keep if used */

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.9900 0 0);
  --foreground: oklch(0 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0 0 0);
  --primary: oklch(0 0 0);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.9400 0 0);
  --muted: oklch(0.9700 0 0);
  --muted-foreground: oklch(0.4400 0 0);
  --accent: oklch(0.9400 0 0);
  --destructive: oklch(0.6300 0.1900 23.0300);
  --border: oklch(0.9200 0 0);
  --input: oklch(0.9400 0 0);
  --ring: oklch(0 0 0);
  --chart-1: oklch(0.8100 0.1700 75.3500);   /* amber — "active/best" dot */
  --sidebar: oklch(0.9900 0 0);
  --sidebar-border: oklch(0.9400 0 0);
  --font-sans: Inter, ui-sans-serif, sans-serif, system-ui;
  --font-mono: "Geist Mono", monospace;
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0 0 0);              /* pure black page             */
  --foreground: oklch(1 0 0);             /* white text                  */
  --card: oklch(0.1400 0 0);
  --popover: oklch(0.1800 0 0);
  --primary: oklch(1 0 0);                /* WHITE — primary accent      */
  --primary-foreground: oklch(0 0 0);     /* black text on white         */
  --secondary: oklch(0.2500 0 0);
  --muted-foreground: oklch(0.7200 0 0);  /* readable grey               */
  --accent: oklch(0.3200 0 0);
  --border: oklch(0.2160 0.0060 56.0430); /* #1C1917 warm hairline        */
  --input: oklch(0.3200 0 0);
  --ring: oklch(0.7200 0 0);
  --sidebar: oklch(0 0 0);
  --sidebar-border: oklch(1 0 0);         /* white — used at low opacity  */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-popover: var(--popover);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --color-sidebar-border: var(--sidebar-border);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* thin scrollbar for scroll areas */
.scroll-thin { scrollbar-width: thin; scrollbar-color: rgba(237,237,237,0.18) transparent; }
.scroll-thin::-webkit-scrollbar { width: 4px; height: 4px; }
.scroll-thin::-webkit-scrollbar-thumb { background: rgba(237,237,237,0.18); border-radius: 9999px; }
```

---

## Part 3 — The three semantic layers (memorize)

| Purpose | Class | Value |
|---|---|---|
| **Element fill** (inputs, triggers, cards, chips, 2° buttons) | `bg-[#333333]/30` | `#3333334d` |
| **Outer outline** (element/card border) | `border border-border` | `#1C1917` warm, 100% |
| **Internal separator** (`border-b/t/l/r`, `divide-*`) | `border-white/[0.04]` | dimmed white |
| **Dropdown surface** (floating popovers) | `bg-[color-mix(in_srgb,#333333_30%,var(--background))]` | opaque #333/30 |
| **In-dropdown selected** | `bg-white/[0.06]` | white overlay |
| **In-dropdown hover** | `bg-white/[0.04]` | white overlay |
| **In-dropdown search / chip** | `border-white/[0.06] bg-transparent` | no 2nd fill |
| **White accent** (primary btn, active tab, checkbox-on) | `bg-primary text-primary-foreground` (= `bg-foreground text-background`) | white |
| **Active/best dot** | `bg-[var(--chart-1)]` or `bg-emerald-400` | amber / green |

**Stroke heuristic:** full `border` → outer outline → `border-border`.
Directional `border-b/t/l/r` or `divide-*` → internal separator → `border-white/[0.04]`.

---

## Part 4 — Radius scale

- `rounded-lg` (8px) → buttons, inputs, selects, dropdown rows, segmented tracks, toolbar controls
- `rounded-xl` (12px) → cards, panels, KPI tiles, dialogs, large containers
- `rounded-md` (6px) → chips, badges, small icon buttons, table-row hover targets

---

## Part 5 — Component recipes

```txt
Input / Select trigger / field:
  h-8 w-full rounded-lg border border-border bg-[#333333]/30 px-2.5 text-sm
  outline-none transition-colors
  focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50

Secondary / ghost-outline button:
  inline-flex h-8 items-center gap-1.5 rounded-lg border border-border
  bg-[#333333]/30 px-3 text-xs font-medium text-foreground hover:bg-accent

Primary button (WHITE):
  inline-flex h-8 items-center rounded-lg bg-primary px-4 text-xs font-medium
  text-primary-foreground hover:bg-primary/90

Card / Panel:
  rounded-xl border border-border bg-[#333333]/30

KPI tile (grid gap-4, NOT a divided strip):
  relative flex flex-col rounded-xl border border-border bg-[#333333]/30 px-6 py-5
  label:  text-sm text-muted-foreground
  value:  mt-2 text-3xl font-semibold leading-tight tracking-tight tabular-nums text-foreground

Segmented / tabs track + pills:
  track:    inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-[#333333]/30 p-1
  active:   inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium
            bg-primary text-primary-foreground shadow-sm        ← WHITE pill
  inactive: text-muted-foreground hover:text-foreground

Dropdown / popover content:
  surface:  bg-[color-mix(in_srgb,#333333_30%,var(--background))]  ring-1 ring-foreground/10  rounded-lg
  header:   border-b border-white/[0.04]
  search:   flex h-8 items-center gap-2 rounded-lg border border-white/[0.06] bg-transparent px-2.5
  row:      w-full rounded-lg px-2.5 py-2  → selected: bg-white/[0.06] ; else hover:bg-white/[0.04]
  in-chip:  rounded-md border border-white/[0.06] bg-transparent px-2

Checkbox:
  h-4 w-4 rounded border  → checked:   border-foreground bg-foreground text-background
                            unchecked: border-white/25

Table (compare-table look):
  table:  w-full border-collapse text-sm
  thead:  <tr class="border-b border-white/[0.04]">   ← no filled header band
  th:     py-2.5 px-3 text-xs font-medium text-muted-foreground
  row:    border-b border-white/[0.04] last:border-0 transition-colors hover:bg-secondary/40
  cell:   py-2.5 px-3 text-sm  (numeric: text-right font-mono tabular-nums text-foreground)

Labels:
  band label:     text-[11px] font-medium uppercase tracking-wider text-muted-foreground
  section head:   text-sm font-medium text-foreground
  field sublabel: text-xs font-normal text-muted-foreground
```

---

## Part 6 — Hard rules / gotchas

1. **Dialogs stay opaque** (`bg-popover`) — never sweep modals to the translucent element fill.
2. **One color per dropdown** — differentiate only with white overlays + the checkmark, never a second grey fill.
3. **Number+unit fields go full-width**: `flex gap-2 w-full` with each child `flex-1` (not fixed `w-24`/`w-28`).
4. **Active tab is always white**, never a dark `bg-background` pill.
5. **Field labels are muted and smaller than section headings** — establish hierarchy; don't let them compete.
6. `--primary`, `--foreground`, `--sidebar-*` are **white** in dark mode by design; `--border` is the only warm token. Use `sidebar-border` at low opacity for legacy white dividers.
7. Keep numerics in the mono font with `tabular-nums`.

A live reference of every recipe is rendered at `/styleguide`.
