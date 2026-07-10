# Design-System Refactor Log

Token/primitive consistency refactor. Source of truth: `app/globals.css` tokens +
Base UI primitives in `components/ui/`. Ordered smallest-blast-radius first.

| Group | Files | Change | Build | Commit |
|---|---|---|---|---|
| G1 · Radius scale | `app/styleguide/page.tsx` | `rounded-2xl` → `rounded-xl` (2×) — off-scale radius snapped to token | ✅ | `27ecd2d` |
| — · CLAUDE.md | `CLAUDE.md` | Design System Rules added | — | `18c7c8a` |
| G2 · Tokens | `app/globals.css` | Add `--success/--warning/--info` (+fg) and `--text-2xs`(11px)/`--text-3xs`(10px) — approved | ✅ | `0490930` |
| G3 · Sub-xs type | 23 clean files (app + non-ui components) | `text-[11px]→text-2xs`, `text-[10px]→text-3xs`, `text-[12px]→text-xs` (101 exact swaps) | ✅ | `caf55f1` |
| G4 · Status colors | `error-summary`, `usage`, `campaigns` | `red→destructive`, `amber→warning`, `emerald→success`; arbitrary tint opacity `/[0.0x]→/x` | ✅ typecheck+build | `dc700c1` |
| G5 · Radius (2) | `app/agents/new/page.tsx` | 4 more `rounded-2xl` → `rounded-xl` (missed in G1 sweep) | ✅ | `5a977b2` |
| G6 · ESLint rules | `eslint.config.mjs` | 8 rules blocking mechanical drift: raw palette, hex-in-brackets, `dark:` literals, off-scale text/spacing/radius, arbitrary shadow, inline non-var style colors. Ignores vendored `ui/*` + demo pages. | ✅ | _next commit_ |

## Deferred (see report at bottom of session)
Not executed — each requires a decision that the hard rules reserve for the user:
- **Status colors** (amber/emerald/violet/rose/sky, ~180 uses) — no success/warning/info/accent-hue token exists → needs token add.
- **Sub-`xs` type** (`text-[10px]`/`[11px]`, ~168 uses) — no scale step below `text-xs` → needs token add or explicit snap approval.
- **Hairline separators** (`border-white/[0.04–0.08]`, `bg-white/…`) — intentional house pattern, no matching token → needs token add.
- **Motion / easing** (`duration-[…]`, `ease-[cubic-bezier…]`, `transition-[…]`) — no motion tokens exist (known gap).
- **Letter-spacing** (`tracking-[0.1em]`, `[0.12em]`) — partial; `tracking-widest` ≈ 0.1em, `0.12em` unmapped.
- **Vendored `components/ui/*` internals** (`has-[…]`, `text-[CanvasText]`, `ring-[3px]`, transform/transition arbitraries) — as-shipped from the Base UI registry; not forked.
- **Hardcoded hex in SVG charts** (`fill="#fff"`, `stroke="#fff"`) + agent-builder port dots (`bg-[#0b0b0b]`, `border-white/25`) — SVG/`color-mix` values, not class swaps; need per-case handling.
- **Files with uncommitted session work** (`app-shell.tsx`, `filter-dropdown.tsx`, `qa/add-metric-dialog.tsx`, untracked `conversation-review.tsx`, `human-qa/`) — not touched, to avoid entangling unrelated changes in design commits.
