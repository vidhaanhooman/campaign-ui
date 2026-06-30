"use client";

import * as React from "react";
import { Filter } from "lucide-react";

import { FUNNEL, fmtInt } from "@/lib/stats-data";
import { Panel } from "./ui";

type Stage = (typeof FUNNEL)[number];
type FunnelData = readonly Stage[];

/** Group stages into editorial sections. */
const GROUPS: { label: string | null; stages: string[] }[] = [
  { label: null, stages: ["Leads", "Dials", "Delivered", "Picked up"] },
  { label: "Call quality · per pickup", stages: ["Human answered", "Engaged"] },
  { label: "Lead progress", stages: ["Unique reached", "Converted"] },
];

export function ConversionFunnel({ data = FUNNEL }: { data?: FunnelData } = {}) {
  const max = Math.max(...data.map((s) => s.count));

  return (
    <Panel
      title="Conversion funnel"
      icon={<Filter size={14} />}
      action={
        <span className="text-xs text-muted-foreground">{data.length} stages</span>
      }
    >
      <div className="flex h-full flex-col justify-between gap-6">
        {GROUPS.map((g, gi) => {
          const stages = g.stages
            .map((name) => data.find((s) => s.stage === name))
            .filter((s): s is Stage => Boolean(s));
          if (!stages.length) return null;
          return (
            <div
              key={g.label ?? "_top"}
              className={gi > 0 ? "border-t border-border pt-4" : ""}
            >
              {g.label && (
                <div className="mb-3 text-[10px] font-medium text-muted-foreground">
                  {g.label}
                </div>
              )}
              <div className="flex flex-col gap-3">
                {stages.map((s) => (
                  <Row key={s.stage} stage={s} max={max} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Row({ stage: s, max }: { stage: Stage; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-36 shrink-0 items-center gap-1.5">
        <span className="truncate text-xs font-medium text-foreground">{s.stage}</span>
        <span className="rounded-sm border border-border px-1.5 py-px font-mono text-[10px] text-foreground">
          {s.kind}
        </span>
      </div>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(3, (s.count / max) * 100)}%`,
            backgroundColor: "var(--chart-1)",
          }}
        />
      </div>
      <div className="flex w-44 shrink-0 items-baseline justify-end gap-1.5">
        <span className="font-mono text-xs tabular-nums text-foreground">
          {fmtInt(s.count)}
        </span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {s.rel}
        </span>
        <span className="truncate text-[10px] text-muted-foreground">{s.note}</span>
      </div>
    </div>
  );
}
