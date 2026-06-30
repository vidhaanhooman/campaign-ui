"use client";

import * as React from "react";
import { Filter } from "lucide-react";

import { FUNNEL, fmtInt } from "@/lib/stats-data";
import { Panel } from "./ui";

type Stage = (typeof FUNNEL)[number];
type FunnelData = readonly Stage[];

/** Two-group structure: call-events vs distinct leads, each with its own base. */
const GROUPS: { label: string; baseStage: string; stages: string[] }[] = [
  {
    label: "Call funnel",
    baseStage: "Dials",
    stages: ["Dials", "Delivered", "Picked up", "Human answered", "Engaged"],
  },
  {
    label: "Task funnel",
    baseStage: "Tasks",
    stages: ["Tasks", "Unique reached", "Converted"],
  },
];

export function ConversionFunnel({ data = FUNNEL }: { data?: FunnelData } = {}) {
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
          const base = data.find((s) => s.stage === g.baseStage)?.count ?? 0;
          return (
            <div
              key={g.label}
              className={gi > 0 ? "border-t border-border pt-4" : ""}
            >
              <div className="mb-3 text-sm font-medium text-foreground">
                {g.label}
              </div>
              <div className="flex flex-col gap-3">
                {stages.map((s) => (
                  <Row key={s.stage} stage={s} max={base} />
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
      <div className="w-36 shrink-0">
        <span className="truncate text-xs font-medium text-foreground">{s.stage}</span>
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
