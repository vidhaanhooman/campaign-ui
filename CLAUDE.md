@AGENTS.md

## Design System Rules

**Only two sources of truth.** (1) The tokens in `app/globals.css`. (2) Base UI
primitives in `components/ui/`. Anything that fits neither → stop and ask.

### Tokens
- **Color** — use the semantic utility, never a raw value:
  `bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`, etc.
  Full set: background/foreground · card · popover · primary · secondary · muted ·
  accent · destructive (+ `-foreground` pairs) · border · input · ring · chart-1…5 ·
  sidebar-*. Opacity modifiers OK (`bg-primary/10`). Hex/rgb/hsl outside
  `globals.css` — never.
- **Radius** — `rounded-sm|md|lg|xl`; `rounded-full` for pills/avatars only.
  No `rounded-2xl`, no `rounded-[Npx]`.
- **Shadow** — `shadow-2xs|xs|sm|<none>|md|lg|xl|2xl`. No `shadow-[…]`, no inline box-shadow.
- **Type** — `font-sans|serif|mono` + the default Tailwind size/weight scales.
  No `text-[13px]`, no `font-[550]`.
- **Spacing** — integers on the 4px scale (`--spacing: 0.25rem`). No `p-[7px]`,
  no `w-[347px]`, no raw px/rem in inline `style`.
- **Dark mode** — `.dark` overrides token values only. Never `dark:bg-[#111]` or
  `dark:text-white`. If a component needs manual dark handling, a token is missing —
  flag it, don't patch with a literal.

### Components
- Missing primitive → install it: read `components.json`, then
  `npx shadcn@latest add <name>`. The configured registry is **Base UI** (not Radix) —
  if an install would pull Radix, stop and ask.
- Never hand-roll interactive/structural UI (div-as-button, custom modal/dropdown/
  tooltip/tabs, unstyled native `<select>`, DIY focus trap). Use the primitive.
- Never fork a primitive. Extend only via `cva` variants on the existing file in
  `components/ui/`. No one-off className overrides that bypass the variant system.

### Refactor discipline
- Token swaps are mechanical: replace the value, change nothing else.
- Primitive swaps preserve props, handlers, refs, and behavior exactly; visual shift
  (correct focus ring / radius) is expected, behavior shift is not.
- Never add or edit a token in `globals.css` without asking first.
- Never add a dependency other than a shadcn primitive from the configured registry.
- Don't touch business logic, data fetching, or routing. Consistency only — don't
  "improve" visual design. Ambiguous? Flag it, don't guess.
