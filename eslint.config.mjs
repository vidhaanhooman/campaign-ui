import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Design-system enforcement — the eight mechanically-catchable drifts.
 * Vendored `components/ui/*` primitives are excluded (as-shipped from the
 * Base UI shadcn registry; not forked). Semantic drift (row alignment,
 * chevron presence, active-state pattern, empty/error expression, etc.)
 * is not catchable by regex and is caught by code review + L3 API design.
 */
const DESIGN_RULES = {
  "no-restricted-syntax": [
    "error",
    {
      selector: "Literal[value=/\\brounded-(2xl|3xl)\\b/]",
      message:
        "Off-scale radius. Use rounded-sm|md|lg|xl (or rounded-full for pills).",
    },
    {
      selector:
        "Literal[value=/\\b(bg|text|border|ring|fill|stroke|from|to|via|divide|shadow|outline|decoration)-(amber|emerald|violet|rose|red|sky|blue|indigo|purple|pink|fuchsia|lime|green|teal|cyan|yellow|orange|slate|gray|zinc|neutral|stone)-\\d{2,3}\\b/]",
      message:
        "Raw Tailwind palette color. Use a semantic token: success/warning/info/destructive/primary/muted/chart-*.",
    },
    {
      selector: "Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]",
      message:
        "Hex color inside arbitrary Tailwind class. Move to a token in globals.css.",
    },
    {
      selector: "Literal[value=/\\bdark:(bg|text|border|ring|fill|stroke)-(?!\\b(background|foreground|card|popover|primary|secondary|muted|accent|destructive|success|warning|info|border|input|ring|sidebar|chart-\\d)\\b)[a-z0-9#\\[\\/]/]",
      message:
        "Literal dark: color override. Dark mode must go through token redefinitions in globals.css, never per-utility.",
    },
    {
      selector: "Literal[value=/\\btext-\\[(9|10|11|12|13|15)px\\]/]",
      message:
        "Off-scale text size. Use text-3xs (10px), text-2xs (11px), text-xs (12px), text-sm (14px), or text-base (16px).",
    },
    {
      selector: "Literal[value=/\\bshadow-\\[/]",
      message:
        "Arbitrary shadow. Use shadow-2xs|xs|sm|md|lg|xl|2xl.",
    },
    {
      selector: "Literal[value=/\\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-x|space-y|w|h|size|top|right|bottom|left|inset)-\\[\\d+(?:\\.\\d+)?(?:px|rem)\\]/]",
      message:
        "Off-scale spacing/sizing. Snap to the 4px scale (--spacing: 0.25rem).",
    },
    {
      selector:
        "JSXAttribute[name.name='style'] Property[key.name=/^(color|background(Color)?|background|border(Color)?|border|fill|stroke|boxShadow)$/] Literal[value=/^(?!.*var\\(--).+/]",
      message:
        "Inline style color. Use a token utility (className) or var(--token) reference.",
    },
  ],
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    ignores: [
      // Vendored Base UI primitives — as-shipped, not forked.
      "components/ui/**",
      // Standalone demo pages that intentionally display non-token values.
      "app/dev/**",
      "app/styleguide/**",
    ],
    rules: DESIGN_RULES,
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
