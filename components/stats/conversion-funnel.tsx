"use client";

import * as React from "react";
import { Filter, ListChecks, PhoneCall, type LucideIcon } from "lucide-react";

import { FUNNEL, fmtInt } from "@/lib/stats-data";
import { ChartCard } from "./ui";

type Stage = (typeof FUNNEL)[number];
type FunnelData = readonly Stage[];

/** Two-group structure: call-events vs distinct leads, each with its own base. */
const GROUPS: {
  label: string;
  icon: LucideIcon;
  baseStage: string;
  stages: string[];
}[] = [
  {
    label: "Call funnel",
    icon: PhoneCall,
    baseStage: "Dials",
    stages: ["Dials", "Delivered", "Picked up", "Human answered", "Engaged"],
  },
  {
    label: "Task funnel",
    icon: ListChecks,
    baseStage: "Tasks",
    stages: ["Tasks", "Unique reached", "Converted"],
  },
];

export function ConversionFunnel({ data = FUNNEL }: { data?: FunnelData } = {}) {
  return (
    <ChartCard
      title="Conversion funnel"
      icon={<Filter size={14} />}
      action={
        <span className="text-xs text-muted-foreground">{data.length} stages</span>
      }
    >
      <div className="flex h-full flex-col gap-2">
        {GROUPS.map((g) => {
          const stages = g.stages
            .map((name) => data.find((s) => s.stage === name))
            .filter((s): s is Stage => Boolean(s));
          if (!stages.length) return null;
          const base = data.find((s) => s.stage === g.baseStage)?.count ?? 0;
          return (
            <div key={g.label}>
              <div className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-foreground">
                <g.icon size={13} className="text-muted-foreground" />
                {g.label}
              </div>
              <table className="w-full border-collapse text-sm">
                <colgroup>
                  <col />
                  <col className="w-[36%]" />
                </colgroup>
                <tbody>
                  {stages.map((s) => (
                    <Row key={s.stage} stage={s} />
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

function Row({ stage: s }: { stage: Stage }) {
  return (
    <tr className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-secondary/40">
      <td className="py-2.5 pl-6 pr-3">
        <span className="truncate text-sm font-medium text-foreground">{s.stage}</span>
      </td>
      <td className="py-2.5 pl-3 pr-6 text-right">
        <span className="inline-flex items-baseline justify-end gap-2.5">
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {fmtInt(s.count)}
          </span>
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {s.rel}
          </span>
          <span className="truncate text-sm text-muted-foreground">{s.note}</span>
        </span>
      </td>
    </tr>
  );
}
