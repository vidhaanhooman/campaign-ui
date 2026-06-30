"use client";

import { PhoneCall } from "lucide-react";

import { CALL_OUTCOMES, CALL_PERF_KPIS } from "@/lib/stats-data";
import { InfoHint } from "./info-hint";
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

  return (
    <Panel
      title="Call performance"
      icon={<PhoneCall size={14} />}
      action={
        <span className="text-xs text-muted-foreground">human-answered only</span>
      }
    >
      {/* KPI strip — single bordered container with divided tiles */}
      <div className="grid grid-cols-2 divide-x divide-border rounded-lg border border-border bg-secondary/30 sm:grid-cols-3 lg:grid-cols-5">
        {CALL_PERF_KPIS.map((k) => (
          <div key={k.label} className="px-5 py-4">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
              {k.label}
              {"hint" in k && k.hint && <InfoHint>{k.hint}</InfoHint>}
            </div>
            <div className="mt-1 font-mono text-lg leading-none tabular-nums text-foreground">
              {k.value}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Outcome distribution — 2-column grid of horizontal bar rows */}
      <div className="mt-5 rounded-lg border border-border bg-secondary/20 p-4">
        <div className="mb-3 text-[10px] text-muted-foreground">
          Outcome distribution
        </div>
        <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {sortedOutcomes.map((o, i) => {
            const color = BLUE_RAMP[i] ?? BLUE_RAMP[BLUE_RAMP.length - 1];
            return (
              <div key={o.label} className="flex items-center gap-3">
                <span className="w-44 shrink-0 truncate text-xs text-foreground">
                  {o.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(2, o.pct * 100)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-foreground">
                  {Math.round(o.pct * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
