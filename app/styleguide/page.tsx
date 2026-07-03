"use client";

/**
 * Living style guide — renders every recipe from DESIGN_SYSTEM.md for visual QA.
 * Standalone (no AppShell) so it can be copied into any project as a reference.
 */

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

/* Shared recipe strings (kept verbatim from DESIGN_SYSTEM.md) */
const ELEMENT = "border border-border bg-[#333333]/30";
const SURFACE =
  "bg-[color-mix(in_srgb,#333333_30%,var(--background))] ring-1 ring-foreground/10";

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-background px-8 py-10 text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Design system</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dark-first · single translucent element fill · warm hairline outlines ·
            white accents. Live reference for <code>DESIGN_SYSTEM.md</code>.
          </p>
        </header>

        <Section title="Semantic layers">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Swatch name="Element fill" cls="bg-[#333333]/30 border border-border" note="#333/30 + border-border" />
            <Swatch name="Card" cls="rounded-xl border border-border bg-[#333333]/30" note="rounded-xl" />
            <Swatch name="Dropdown surface" cls={cn("rounded-lg", SURFACE)} note="color-mix #333/30" />
            <Swatch name="Internal separator" cls="border-t-2 border-white/[0.04] bg-transparent" note="white/[0.04]" />
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Primary (white)
            </button>
            <button className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent", ELEMENT)}>
              Secondary
            </button>
            <button className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Ghost
            </button>
            <button disabled className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground opacity-50">
              Disabled
            </button>
          </div>
        </Section>

        <Section title="Inputs & select trigger">
          <div className="grid max-w-xl gap-3 sm:grid-cols-2">
            <input
              placeholder="Text input"
              className={cn("h-8 w-full rounded-lg px-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50", ELEMENT)}
            />
            <button className={cn("flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-sm text-muted-foreground", ELEMENT)}>
              Select trigger
              <ChevronDown size={14} />
            </button>
          </div>
        </Section>

        <Section title="Segmented / tabs — active pill is WHITE">
          <SegmentedDemo />
        </Section>

        <Section title="Dropdown — one color, white overlays only">
          <DropdownDemo />
        </Section>

        <Section title="Checkbox">
          <CheckboxDemo />
        </Section>

        <Section title="KPI tiles — separate cards, gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Calls Received", value: "146" },
              { label: "Avg Duration", value: "27s" },
              { label: "Transfer Rate", value: "19.9%" },
              { label: "CSAT", value: "4.47" },
            ].map((k) => (
              <div key={k.label} className="flex flex-col rounded-xl border border-border bg-[#333333]/30 px-6 py-5">
                <span className="text-sm text-muted-foreground">{k.label}</span>
                <span className="mt-2 text-3xl font-semibold leading-tight tracking-tight tabular-nums text-foreground">
                  {k.value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Table — transparent header, row hover">
          <div className="overflow-hidden rounded-xl border border-border bg-[#333333]/30">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Agent", "Calls", "Transferred", "Rate (%)"].map((h, i) => (
                    <th key={h} className={cn("py-2.5 px-3 text-xs font-medium text-muted-foreground first:pl-5 last:pr-5", i === 0 ? "text-left" : "text-right")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["multi-llm", 29, 4, 14],
                  ["palmonas", 25, 4, 16],
                  ["standard", 24, 4, 17],
                ].map((r, ri) => (
                  <tr key={ri} className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-secondary/40">
                    {r.map((c, ci) => (
                      <td key={ci} className={cn("py-2.5 px-3 first:pl-5 last:pr-5", ci === 0 ? "text-left text-sm text-muted-foreground" : "text-right font-mono text-sm tabular-nums text-foreground")}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Typography & radii">
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Band label</div>
            <div className="text-sm font-medium text-foreground">Section heading</div>
            <div className="text-xs font-normal text-muted-foreground">Field sub-label</div>
            <div className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">1,234</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              ["rounded-lg", "controls"],
              ["rounded-xl", "cards"],
              ["rounded-md", "chips"],
            ].map(([r, use]) => (
              <div key={r} className={cn("flex h-16 w-32 flex-col items-center justify-center border border-border bg-[#333333]/30 text-xs text-muted-foreground", r)}>
                <span className="font-mono text-foreground">{r}</span>
                <span>{use}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, cls, note }: { name: string; cls: string; note: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("h-16 w-full rounded-lg", cls)} />
      <div>
        <div className="text-xs font-medium text-foreground">{name}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{note}</div>
      </div>
    </div>
  );
}

function SegmentedDemo() {
  const [v, setV] = React.useState("all");
  return (
    <div className={cn("inline-flex h-8 items-center gap-1 rounded-lg p-1", ELEMENT)}>
      {[
        { k: "all", label: "All attempts" },
        { k: "per", label: "Per attempt" },
      ].map((o) => (
        <button
          key={o.k}
          onClick={() => setV(o.k)}
          className={cn(
            "inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium transition-colors",
            v === o.k
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function DropdownDemo() {
  const [selected, setSelected] = React.useState("Calling Hours");
  const options = ["Agent", "Calling Number", "Calling Hours", "Timezone", "Retries"];
  return (
    <div className={cn("w-72 overflow-hidden rounded-lg p-0", SURFACE)}>
      <div className="border-b border-white/[0.04] p-2">
        <div className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.06] bg-transparent px-2.5">
          <Search size={13} className="text-muted-foreground" />
          <input
            placeholder="Search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="p-1">
        {options.map((o) => {
          const on = o === selected;
          return (
            <button
              key={o}
              onClick={() => setSelected(o)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                on ? "bg-white/[0.06] text-foreground" : "text-muted-foreground hover:bg-white/[0.04]",
              )}
            >
              {o}
              {on && <Check size={15} className="text-[var(--chart-1)]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = React.useState(true);
  return (
    <button
      onClick={() => setChecked((c) => !c)}
      className="inline-flex items-center gap-2.5 text-sm text-foreground"
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border",
          checked ? "border-foreground bg-foreground text-background" : "border-white/25",
        )}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
      Toggle me
    </button>
  );
}
