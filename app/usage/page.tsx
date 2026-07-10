"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Clock,
  Gauge,
  Phone,
  PhoneCall,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/stats/ui";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   Full usage view — expanded reference for the compact landing panel.
   Placeholder data mirrors /landing so swapping to a real feed touches
   one shape.
   ═══════════════════════════════════════════════════════════════════════ */

type UsageItem = {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number;
  unit?: string;
};

const USAGE_CYCLE: UsageItem[] = [
  { icon: <Clock size={14} />, label: "Voice minutes", used: 24800, limit: 50000, unit: "min" },
  { icon: <PhoneCall size={14} />, label: "Calls placed", used: 12400, limit: 25000 },
];

const USAGE_RESOURCES: UsageItem[] = [
  { icon: <Gauge size={14} />, label: "Concurrent slots", used: 43, limit: 50 },
  { icon: <Phone size={14} />, label: "Calling numbers", used: 12, limit: 25 },
  { icon: <Users size={14} />, label: "Team seats", used: 3, limit: 10 },
  { icon: <Bot size={14} />, label: "Agents", used: 9, limit: 20 },
];

function compact(n: number) {
  return n >= 1000
    ? `${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`
    : String(n);
}

export default function UsagePage() {
  const all = [...USAGE_CYCLE, ...USAGE_RESOURCES];
  const near = all.filter((u) => (u.used / u.limit) * 100 >= 85);

  return (
    <AppShell activeNav="Overview">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-8 py-8">
        <PageHeading
          title="Usage"
          desc={
            <span className="inline-flex items-center gap-1.5">
              Scale plan
              <span className="text-muted-foreground/80">· resets Aug 1</span>
            </span>
          }
        >
          <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Manage plan <ArrowUpRight size={13} />
          </button>
        </PageHeading>
        {/* Near-limit banner — only when something is actually near a cap. */}
        {near.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/25 bg-warning/6 px-4 py-3">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-foreground">
                {near.length === 1
                  ? `${near[0].label} is near its cap.`
                  : `${near.length} resources are near their cap.`}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {near
                  .map(
                    (n) =>
                      `${n.label} at ${Math.round((n.used / n.limit) * 100)}%`,
                  )
                  .join(" · ")}
              </div>
            </div>
            <button className="shrink-0 text-xs font-medium text-warning transition-opacity hover:opacity-80">
              Upgrade
            </button>
          </div>
        )}

        <UsageBlock
          title="This cycle"
          hint="Metered consumption that resets each billing cycle."
          rows={USAGE_CYCLE}
        />
        <UsageBlock
          title="Plan resources"
          hint="Concurrent allocation against your plan cap."
          rows={USAGE_RESOURCES}
        />
      </div>
    </AppShell>
  );
}

/* ── Full-page block ─────────────────────────────────────────────────── */

function UsageBlock({
  title,
  hint,
  rows,
}: {
  title: string;
  hint: string;
  rows: UsageItem[];
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={cn(
              "px-6 py-5",
              i < rows.length - 1 && "border-b border-border",
            )}
          >
            <FullRow {...r} />
          </div>
        ))}
      </div>
    </section>
  );
}

function FullRow({ icon, label, used, limit, unit }: UsageItem) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = pct >= 85;
  const left = Math.max(0, limit - used);
  const suffix = unit ? ` ${unit}` : "";
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex min-w-0 items-center gap-2.5 text-sm text-foreground">
          <span className="shrink-0 text-muted-foreground/70">{icon}</span>
          <span className="truncate font-medium">{label}</span>
        </span>
        <span className="shrink-0 font-mono text-sm tabular-nums">
          <span className={nearLimit ? "text-warning" : "text-foreground"}>
            {compact(used)}
            {suffix}
          </span>
          <span className="text-muted-foreground">
            {" "}
            / {compact(limit)}
            {suffix}
          </span>
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full ring-1 ring-inset ring-white/[0.06]">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700 ease-out",
              nearLimit ? "bg-warning" : "bg-foreground/70",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={cn(
            "w-10 shrink-0 text-right text-xs tabular-nums",
            nearLimit ? "text-warning" : "text-muted-foreground",
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          <span className={nearLimit ? "text-warning" : "text-foreground"}>
            {compact(left)}
            {suffix}
          </span>{" "}
          left this cycle
        </span>
        {nearLimit && (
          <button className="inline-flex items-center gap-0.5 font-medium text-warning transition-opacity hover:opacity-80">
            Upgrade <ArrowUpRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}
