"use client";

/**
 * Living style guide — renders every recipe from DESIGN_SYSTEM.md for visual QA.
 * Standalone (no AppShell) so it can be copied into any project as a reference.
 */

import * as React from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Bot,
  Check,
  ChevronDown,
  Clock,
  CornerDownRight,
  Flag,
  Inbox,
  Megaphone,
  MessageSquare,
  MoreVertical,
  Network,
  Pencil,
  Phone,
  PhoneOff,
  PlugZap,
  Plus,
  RotateCw,
  Search,
  SearchX,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState, EmptyAction } from "@/components/ui/empty-state";
import { FilterDropdown, type FilterValues } from "@/components/filter-dropdown";

/* Shared recipe strings (kept verbatim from DESIGN_SYSTEM.md) */
const ELEMENT = "border border-border bg-card";
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

        <Section title="Color tokens — surfaces & roles">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {[
              ["Background", "--background"],
              ["Foreground", "--foreground"],
              ["Card", "--card"],
              ["Card FG", "--card-foreground"],
              ["Popover", "--popover"],
              ["Popover FG", "--popover-foreground"],
              ["Primary", "--primary"],
              ["Primary FG", "--primary-foreground"],
              ["Secondary", "--secondary"],
              ["Secondary FG", "--secondary-foreground"],
              ["Muted", "--muted"],
              ["Muted FG", "--muted-foreground"],
              ["Accent", "--accent"],
              ["Accent FG", "--accent-foreground"],
              ["Destructive", "--destructive"],
              ["Destructive FG", "--destructive-foreground"],
              ["Border", "--border"],
              ["Input", "--input"],
              ["Ring", "--ring"],
            ].map(([name, v]) => (
              <Tok key={v} name={name} v={v} />
            ))}
          </div>
        </Section>

        <Section title="Color tokens — chart & sidebar">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {[
              ["Chart 1", "--chart-1"],
              ["Chart 2", "--chart-2"],
              ["Chart 3", "--chart-3"],
              ["Chart 4", "--chart-4"],
              ["Chart 5", "--chart-5"],
              ["Sidebar", "--sidebar"],
              ["Sidebar FG", "--sidebar-foreground"],
              ["Sidebar Primary", "--sidebar-primary"],
              ["Sidebar Accent", "--sidebar-accent"],
              ["Sidebar Border", "--sidebar-border"],
              ["Sidebar Ring", "--sidebar-ring"],
            ].map(([name, v]) => (
              <Tok key={v} name={name} v={v} />
            ))}
          </div>
        </Section>

        <Section title="Semantic layers">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Swatch name="Element fill" cls="bg-card border border-border" note="#333/30 + border-border" />
            <Swatch name="Card" cls="rounded-xl border border-border bg-card" note="rounded-xl" />
            <Swatch name="Dropdown surface" cls={cn("rounded-lg", SURFACE)} note="color-mix #333/30" />
            <Swatch name="Internal separator" cls="border-t-2 border-border bg-transparent" note="white/[0.04]" />
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

        <Section title="Filter dropdown — search · sections · typed editors">
          <FilterDropdownDemo />
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
              <div key={k.label} className="flex flex-col rounded-xl border border-border bg-card px-6 py-5">
                <span className="text-sm text-muted-foreground">{k.label}</span>
                <span className="mt-2 text-3xl font-semibold leading-tight tracking-tight tabular-nums text-foreground">
                  {k.value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Table — transparent header, row hover">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
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
                  <tr key={ri} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/40">
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

        <Section title="Empty states — filtered vs no-data">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* A filter/range excludes everything */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3 text-sm font-medium text-foreground">
                Agent Wise Data
              </div>
              <EmptyState
                icon={<SearchX size={18} />}
                title="No agent activity in the last 24 hours"
                description="No calls were placed in this window. Try a wider date range."
                action={
                  <>
                    <EmptyAction>Reset to 7 days</EmptyAction>
                    <EmptyAction>Clear filters</EmptyAction>
                  </>
                }
              />
            </div>
            {/* Never had data — onboarding */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3 text-sm font-medium text-foreground">
                Campaigns
              </div>
              <EmptyState
                icon={<Inbox size={18} />}
                title="No campaigns yet"
                description="Create your first campaign and it will show up here."
                action={
                  <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    <Plus size={14} /> Create campaign
                  </button>
                }
              />
            </div>
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
              <div key={r} className={cn("flex h-16 w-32 flex-col items-center justify-center border border-border bg-card text-xs text-muted-foreground", r)}>
                <span className="font-mono text-foreground">{r}</span>
                <span>{use}</span>
              </div>
            ))}
          </div>
        </Section>

        <header className="pt-4">
          <h2 className="text-lg font-semibold tracking-tight">Flow builder</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Node canvas primitives used in the agent builder (<code>/agents/new</code>).
          </p>
        </header>

        <Section title="Node card — bare icon · title · description · category footer">
          <div className="flex flex-wrap gap-6">
            <FlowNodeCard icon={Sparkles} accent="text-sky-400" name="Greeting" category="LLM" desc="Greets the caller and asks how to help." />
            <FlowNodeCard icon={Network} accent="text-amber-400" name="Detect intent" category="Condition" desc="Routes the call by what the caller wants." />
            <FlowNodeCard icon={PlugZap} accent="text-emerald-400" name="Create appointment" category="Endpoint" desc="Calls the scheduling API." invalid />
          </div>
        </Section>

        <Section title="Ports — neutral dark knob (input left · output right)">
          <div className="flex items-center gap-6">
            <span className={PORT} />
            <span className="font-mono text-[10px] text-muted-foreground">
              h-[11px] w-[11px] rounded-full bg-[#0b0b0b] border border-white/25
            </span>
          </div>
        </Section>

        <Section title="Transition label — forward chip vs backward jump chip">
          <div className="flex flex-wrap items-center gap-6">
            <button className="inline-flex max-w-[160px] items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-[10px] text-foreground shadow-sm">
              <span className="truncate">If true</span>
              <Pencil size={9} className="shrink-0 text-muted-foreground" />
            </button>
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/50 bg-violet-500/[0.14] px-2 py-0.5 text-[10px] font-medium text-violet-200">
              <CornerDownRight size={10} className="rotate-180" /> to Greeting
            </span>
            <span className="flex h-5 w-4 items-center justify-center rounded-sm border border-violet-500/50 bg-violet-500/[0.14] text-violet-200">
              <CornerDownRight size={9} className="rotate-180" />
            </span>
          </div>
        </Section>

        <Section title="Transition detail — hover popover">
          <div className="w-max min-w-[160px] max-w-[260px] rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
            <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground/60">Transition</div>
            <div className="text-[11px] leading-relaxed text-foreground">caller intent is booking</div>
            <div className="mt-1.5 inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Zap size={9} className="text-amber-400" /> check_calendar
            </div>
            <div className="mt-1.5 border-t border-border pt-1.5 text-[10px] text-muted-foreground/70">
              Detect intent <span className="text-muted-foreground/40">→</span> Booking
            </div>
          </div>
        </Section>

        <Section title="Add-node chip toolbar">
          <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card/95 p-1.5 shadow-2xl">
            <span className="pl-1.5 pr-0.5 text-muted-foreground/70"><Plus size={15} /></span>
            {[
              { icon: Sparkles, accent: "text-sky-400", label: "LLM" },
              { icon: MessageSquare, accent: "text-violet-400", label: "Static" },
              { icon: Network, accent: "text-amber-400", label: "Condition" },
              { icon: PlugZap, accent: "text-emerald-400", label: "Endpoint" },
            ].map(({ icon: Icon, accent, label }) => (
              <button key={label} className="flex items-center gap-1.5 rounded-xl border border-transparent px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground">
                <Icon size={14} className={accent} /> {label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Add-node menu — anchored popover">
          <div className="w-48 rounded-xl border border-border bg-popover p-1 shadow-2xl">
            {[
              { icon: Sparkles, accent: "text-sky-400", label: "LLM", desc: "Understands the caller" },
              { icon: Network, accent: "text-amber-400", label: "Condition", desc: "Branch the flow" },
            ].map(({ icon: Icon, accent, label, desc }) => (
              <button key={label} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary/60">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-white/[0.08]" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <Icon size={13} className={accent} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-foreground">{label}</span>
                  <span className="block truncate text-[10px] text-muted-foreground/70">{desc}</span>
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Canvas controls — tidy up · loop toggle · add branch">
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-lg transition-colors hover:text-foreground">
              <Network size={13} /> Tidy up
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-lg transition-colors hover:text-foreground">
              <CornerDownRight size={13} className="rotate-180" /> Show loops
              <span className="rounded bg-white/[0.06] px-1 text-[10px]">3</span>
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/[0.14] px-2.5 py-1.5 text-[11px] font-medium text-violet-200 shadow-lg">
              <CornerDownRight size={13} className="rotate-180" /> Hide loops
              <span className="rounded bg-violet-500/25 px-1 text-[10px]">3</span>
            </button>
            <button className="inline-flex h-6 items-center gap-1 rounded-full border border-border bg-card px-2 text-[10px] font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground">
              <Plus size={11} /> Branch
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────── */

const PORT = "block h-[11px] w-[11px] rounded-full border border-white/25 bg-[#0b0b0b]";

function FlowNodeCard({
  icon: Icon,
  accent,
  name,
  category,
  desc,
  invalid,
}: {
  icon: LucideIcon;
  accent: string;
  name: string;
  category: string;
  desc: string;
  invalid?: boolean;
}) {
  return (
    <div className="relative w-[288px] rounded-xl border border-border bg-card">
      <span className={cn(PORT, "absolute left-[-6px] top-8")} />
      <span className={cn(PORT, "absolute right-[-6px] top-8")} />
      <div className="flex items-start gap-2.5 px-4 pt-3.5">
        <Icon size={17} className={cn(accent, "mt-px shrink-0")} />
        <div className="min-w-0 flex-1 truncate text-[15px] font-medium leading-snug text-foreground">{name}</div>
        <MoreVertical size={15} className="shrink-0 text-muted-foreground/60" />
      </div>
      <p className="line-clamp-2 px-4 pt-1.5 text-[12.5px] leading-relaxed text-muted-foreground/70">{desc}</p>
      <div className="flex items-center justify-between px-4 pb-3.5 pt-3">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground/45">{category}</span>
        {invalid && <AlertTriangle size={14} className="text-amber-400" />}
      </div>
    </div>
  );
}

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

function Tok({ name, v }: { name: string; v: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="h-8 w-8 shrink-0 rounded-md border border-border"
        style={{ background: `var(${v})` }}
      />
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-foreground">{name}</div>
        <div className="truncate font-mono text-[10px] text-muted-foreground">{v}</div>
      </div>
    </div>
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
      <div className="border-b border-border p-2">
        <div className="flex h-8 items-center gap-2 rounded-lg border border-border bg-transparent px-2.5">
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

function FilterDropdownDemo() {
  const [value, setValue] = React.useState<FilterValues>({});
  return (
    <FilterDropdown
      value={value}
      onChange={setValue}
      align="start"
      schema={[
        {
          items: [
            { id: "type", label: "Type", icon: <Phone size={15} />, type: "multi-select", options: [
              { value: "phone", label: "Phone" }, { value: "web", label: "Web session" },
            ] },
            { id: "direction", label: "Direction", icon: <ArrowLeftRight size={15} />, type: "multi-select", options: [
              { value: "in", label: "Inbound" }, { value: "out", label: "Outbound" },
            ] },
            { id: "agent", label: "Agent", icon: <Bot size={15} />, type: "multi-select", searchable: true, options: [
              { value: "a1", label: "multi-llm" }, { value: "a2", label: "palmonas" }, { value: "a3", label: "standard" },
            ] },
            { id: "campaign", label: "Campaign", icon: <Megaphone size={15} />, type: "text", placeholder: "Campaign name…" },
          ],
        },
        {
          title: "Outcome & status",
          items: [
            { id: "outcome", label: "Outcome", icon: <Flag size={15} />, type: "multi-select", options: [
              { value: "resolved", label: "Resolved", dot: "bg-emerald-400" },
              { value: "transferred", label: "Transferred", dot: "bg-amber-400" },
              { value: "dropped", label: "Dropped", dot: "bg-rose-400" },
            ] },
            { id: "endReason", label: "End reason", icon: <PhoneOff size={15} />, type: "text" },
          ],
        },
        {
          title: "Metrics",
          items: [
            { id: "duration", label: "Call duration", icon: <Clock size={15} />, type: "range", min: 0, max: 600, unit: "s" },
            { id: "attempt", label: "Attempt", icon: <RotateCw size={15} />, type: "pill", maxExact: 4 },
          ],
        },
      ]}
    />
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
