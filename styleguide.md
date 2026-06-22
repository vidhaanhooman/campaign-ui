# Styleguide

A practical reference for keeping new screens consistent with the existing
filter / table / popover surfaces. **Copy the recipes below verbatim** — do not
re-derive classnames from scratch. Tokens live in `tailwind.config.ts` and
`app/globals.css`.

---

## 1. Color tokens

Tokens are CSS variables in `app/globals.css` exposed as Tailwind colors in
`tailwind.config.ts`. **Always go through tokens — never raw `gray-500`,
`zinc-700`, etc.** The vars hold `R G B` channels so `/opacity` modifiers work:
`bg-surface-2/60`, `text-text-muted/50`, etc.

| Token            | Use for                                                       |
|------------------|---------------------------------------------------------------|
| `bg`             | Page background only                                          |
| `surface`        | Cards, popovers, the menu itself                              |
| `surface-2`      | Inputs, hovered rows, active rows, segmented control container |
| `border`         | Dividers inside a card; default border for thin separators    |
| `border-strong`  | Borders on cards, inputs, buttons                             |
| `text`           | Primary copy + active row label                               |
| `text-dim`       | Default body copy in lists / clickable text at rest           |
| `text-muted`     | Helper / secondary text, icons inside cards                   |
| `accent`         | Reserved for pinned state / focus rings — do not over-use     |
| `accent-dim`     | Subtle accent bg (e.g. `bg-accent/15`)                        |

Status colors (use directly, don't tokenize):

| Color            | Use for                                                       |
|------------------|---------------------------------------------------------------|
| `emerald-400`    | "Active filter" dot, connected/success outcomes               |
| `red-400`        | Failed / negative outcomes                                    |
| `amber-400`      | Busy / warning                                                |
| `blue-400`       | Web / in-progress / info                                      |

Theming: `[data-theme="light"]` on `<html>` swaps every token. New screens
inherit themability automatically by using tokens.

---

## 2. Typography

| Size class           | Use for                                                  |
|----------------------|----------------------------------------------------------|
| `text-sm`            | Default body, menu rows, list items, inputs              |
| `text-xs`            | Buttons, helpers, footer labels                          |
| `text-[10px]`        | Section headers, type badges, tiny meta                  |
| `text-[11px]`        | Active-count strip, kbd badges                           |

| Weight class         | Use for                                                  |
|----------------------|----------------------------------------------------------|
| `font-medium`        | Card titles, active row label, "All" toggle              |
| `font-semibold`      | Section headers (`uppercase tracking-wider`)             |
| `font-mono`          | Agent ids, version slugs, anything machine-readable      |

`tabular-nums` on anything that displays counts / times so digits don't shift.

---

## 3. Spacing rhythm

Use these — nothing in between:

- **Inside rows / list items:** `py-1.5` (menu rows) or `py-2` (cards titles, search-as-input).
- **Inside cards:** `p-3` for picker / editor cards, `p-2` for compact card bodies (time wheels).
- **Between sibling cards in a flyout:** `gap-1` (4px).
- **Between form rows inside a card:** `gap-2` (8px).
- **Between segmented control entries:** `gap-1` (chips) or no gap (segmented container with `p-0.5`).
- **Outer flyout offset from anchor:** `mr-2` / `mt-1` / `mb-1`.

`min-h-0` + `flex-1` on the scrolling child whenever the parent is a flex column with a max-height.

---

## 4. Radii

| Class           | Use for                                                       |
|-----------------|---------------------------------------------------------------|
| `rounded-lg`    | Outer card chrome only                                        |
| `rounded-md`    | Every input, button, select, segmented container, list row    |
| `rounded-sm`    | Inside tight inline pills (rarely needed)                     |
| `rounded`       | Checkboxes, tiny chips                                        |
| `rounded-full`  | Status dots only                                              |

---

## 5. Icon sizes

lucide-react throughout. **Match icon size to context, never mix in the same component.**

| Size | Use for                                                            |
|------|--------------------------------------------------------------------|
| `13` | Icons inside cards (titles, search prefixes, pencil-edit, etc.)    |
| `14` | Toolbar buttons (date, filter funnel, segmented controls)          |
| `15` | Menu category rows                                                 |
| `11` | Checkbox tick (`strokeWidth={3}`)                                  |
| `12` | Tiny inline icons (pin chip, remove X inside cards)                |

---

## 6. Chrome recipes (copy verbatim)

### Card

```tsx
const CARD = "rounded-lg border border-border-strong bg-surface shadow-xl shadow-black/40";
<div className={`${CARD} p-3`}>…</div>
```

### Card title row (with bottom divider)

```tsx
<div className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm font-medium text-text">
  <Icon size={13} className="text-text-muted" /> Title
</div>
```

### Section header (uppercase microcaps)

```tsx
<div className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
  Group label
</div>
```

### Search input

```tsx
<div className="flex h-9 items-center gap-2 rounded-md border border-border-strong bg-surface-2 px-2.5">
  <Search size={13} className="shrink-0 text-text-muted" />
  <input
    placeholder="Search…"
    className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
  />
</div>
```

### Single-line text input

```tsx
<input
  className="h-9 w-full rounded-md border border-border-strong bg-surface-2 px-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-white"
/>
```

### Menu row (icon + label + chevron)

```tsx
<button
  className={`flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
    isActive ? "bg-surface-2 text-text"
    : isDisabled ? "cursor-not-allowed text-text-muted/50"
    : "text-text-dim hover:bg-surface-2/60 hover:text-text"
  }`}
>
  <span className="shrink-0 text-text-muted">{icon}</span>
  <span className="flex-1 truncate">{label}</span>
  {hasValue && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
  <ChevronRight size={14} className="shrink-0 text-text-muted" />
</button>
```

### Checkbox

```tsx
<span
  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
    checked ? "border-white bg-white text-black" : "border-border-strong"
  }`}
>
  {checked && <Check size={11} strokeWidth={3} />}
</span>
```

### Status dot

```tsx
<span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
// active filter:    bg-emerald-400
// outcome:          bg-emerald-400 / bg-red-400 / bg-amber-400 / bg-blue-400
```

### Primary button (Apply / commit)

```tsx
<button className="rounded-md bg-white px-4 py-1.5 text-xs font-medium text-black hover:bg-white/90">
  Apply
</button>
```

### Secondary / outlined button (Clear / cancel)

```tsx
<button className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-text-dim hover:text-text">
  Clear
</button>
```

### Segmented control (Any · Yes · No)

```tsx
<div className="inline-flex items-center rounded-md border border-border-strong bg-surface-2 p-0.5">
  {options.map(o => (
    <button
      className={`h-7 rounded-md px-3 text-xs transition-colors ${
        on ? "bg-white text-black shadow-sm" : "text-text-dim hover:text-text"
      }`}
    >
      {o}
    </button>
  ))}
</div>
```

### Active-count strip (above a list)

```tsx
<div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-text-muted">
  <span><span className="font-medium text-text">{n}</span> active</span>
  <span className="text-text-dim">·</span>
  <button className="text-text-dim hover:text-text">Clear all</button>
</div>
```

### Card-as-side-card layout (Added / Picker)

```tsx
<div className="flex items-start justify-end gap-1">
  {conditions.length > 0 && (
    <div className={`${CARD} flex w-[300px] shrink-0 flex-col`}>
      …
    </div>
  )}
  <div className={`${CARD} flex w-[400px] shrink-0 flex-col`}>
    …
  </div>
</div>
```

`items-start` so the side card sizes to content. `justify-end` so cards hug the
anchor; left grows are invisible.

---

## 7. Popover / flyout conventions

- **Anchor by row** — when a list row opens a side flyout, measure the row's
  top/bottom in the menu's coordinate system and pass it via `style={{ top }}`.
- **Flip upward when it would overflow** — measure the flyout's height after
  mount; if it would clip the viewport bottom, switch to `style={{ bottom }}`.
- **Block background scroll** for the main filter dropdown:
  - Render a transparent `fixed inset-0 z-20` overlay that captures clicks.
  - Lock `document.body.style.overflow = "hidden"` on open, restore on close.
- **Click outside / Escape closes** unless explicitly pinned.
- **Widths:** `220px` (compact picker), `300px` (side panel), `320px` (default),
  `400px` (primary picker), `580–720px` (two-pane flyouts).

---

## 8. Scrollbars

| Class            | Use for                                                       |
|------------------|---------------------------------------------------------------|
| `scroll-thin`    | Default for any internal scroll region — 4px translucent thumb |
| `scroll-hidden`  | When a visible scrollbar would overlay other UI (e.g. wheels) |

Defined in `app/globals.css`. Both cover Firefox (`scrollbar-width`) and WebKit
(`::-webkit-scrollbar`) so they look identical across browsers.

---

## 9. Motion

- **Color transitions:** `transition-colors` (no duration override — default 150ms).
- **Resize / scale:** none. The UI is mostly static; reach for motion only when
  the alternative is genuinely confusing (e.g. expandable DateRange summary).
- Never animate `width` or `height` of layout containers.

---

## 10. Disabled state

Always:
1. `disabled` attribute on the button (or `aria-disabled`).
2. `cursor-not-allowed`.
3. `text-text-muted/50` (and the icon color matches).
4. Hover removed.
5. `title` attribute with a one-sentence reason ("Available only when Type includes Call.").

The `text-text-muted/50` opacity is the canonical "out of scope" look — don't
invent grayscale alternatives.

---

## 11. When to break a rule

The styleguide is a default, not a constraint. If a new screen needs a control
not listed here:

1. Look for the **closest existing pattern** in the filter menu, agent popout,
   or date popover. Use that as the starting point.
2. If you genuinely need a new atom, add it under `components/ui/` and **also
   add it to this file** so it doesn't drift.
3. New tokens go in `app/globals.css` + `tailwind.config.ts` together. Never
   one-off a color literal.

---

## 12. File-level conventions

- **Components** live in `components/`. UI atoms (when extracted) live in
  `components/ui/`.
- **Tokens** live in `tailwind.config.ts` + `app/globals.css`. Don't add colors
  anywhere else.
- **lucide-react** is the only icon library. Don't introduce another.
- **Inputs** are uncontrolled-feeling but controlled — `value` + `onChange`,
  never `defaultValue`.
- **State that drives UI** lives in the reducer (`lib/useFilters.ts`) or local
  component state. Don't mix.
