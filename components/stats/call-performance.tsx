"use client";

import { PhoneCall } from "lucide-react";

import {
  CALL_OUTCOMES,
  CALL_PERF_KPIS,
  HUMAN_TRANSFER_NOTE,
  HUMAN_TRANSFER_REASONS,
} from "@/lib/stats-data";
import { cn } from "@/lib/utils";
import { Panel } from "./ui";

const BLUE_RAMP = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "color-mix(in oklab, var(--foreground) 18%, transparent)",
  "color-mix(in oklab, var(--foreground) 10%, transparent)",
];

export function CallPerformance() {
  const sortedOutcomes = [...CALL_OUTCOMES].sort((a, b) => b.pct - a.pct);
  const sortedReasons = [...HUMAN_TRANSFER_REASONS].sort((a, b) => b.pct - a.pct);

  return (
    <Panel
      title="Call performance"
      icon={<PhoneCall size={14} />}
      action={
        <span className="text-xs text-muted-foreground">human-answered only</span>
      }
    >
      {/* KPI strip — single bordered container with divided tiles */}
      <div className="grid grid-cols-2 divide-x divide-border rounded-lg border border-border bg-secondary/30 sm:grid-cols-3 lg:grid-cols-6">
        {CALL_PERF_KPIS.map((k) => (
          <div key={k.label} className="px-5 py-4">
            <div className="text-[10px] font-medium text-muted-foreground">
              {k.label}
            </div>
            <div className="mt-1 font-mono text-lg leading-none tabular-nums text-foreground">
              {k.value}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column: outcome distribution + transfer reasons */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Outcome distribution */}
        <div className="rounded-lg border border-border bg-secondary/20 p-4">
          <div className="mb-3 text-[10px] text-muted-foreground">
            Outcome distribution
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
            {sortedOutcomes.map((o, i) => (
              <div
                key={o.label}
                className="h-full"
                style={{
                  width: `${o.pct * 100}%`,
                  backgroundColor: BLUE_RAMP[i] ?? BLUE_RAMP[BLUE_RAMP.length - 1],
                }}
                title={`${o.label}: ${Math.round(o.pct * 100)}%`}
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {sortedOutcomes.map((o, i) => (
              <div key={o.label} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: BLUE_RAMP[i] ?? BLUE_RAMP[BLUE_RAMP.length - 1],
                  }}
                />
                <span className="flex-1 truncate text-muted-foreground">{o.label}</span>
                <span className="font-mono tabular-nums text-foreground">
                  {Math.round(o.pct * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Human transfer reasons */}
        <div className="rounded-lg border border-border bg-secondary/20 p-4">
          <div className="mb-3 text-[10px] text-muted-foreground">
            Human transfer · why the agent escalated
          </div>
          <div className="flex flex-col gap-2.5">
            {sortedReasons.map((r, i) => (
              <div key={r.label}>
                <div className="mb-1 flex items-baseline justify-between text-xs">
                  <span className="text-foreground">{r.label}</span>
                  <span className="font-mono tabular-nums text-foreground">
                    {Math.round(r.pct * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full")}
                    style={{
                      width: `${r.pct * 100}%`,
                      backgroundColor: BLUE_RAMP[i] ?? BLUE_RAMP[BLUE_RAMP.length - 1],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">{HUMAN_TRANSFER_NOTE}</div>
        </div>
      </div>
    </Panel>
  );
}
