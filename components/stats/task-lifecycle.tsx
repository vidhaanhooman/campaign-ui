"use client";

import { Activity, CheckCircle2, Zap, type LucideIcon } from "lucide-react";

import { LIFECYCLE, fmtInt, fmtPct } from "@/lib/stats-data";
import { ChartCard } from "./ui";

type LifecycleState = (typeof LIFECYCLE.states)[number];

export function TaskLifecycle({
  states = LIFECYCLE.states,
  terminalLabel = "Closed",
}: {
  states?: readonly LifecycleState[];
  terminalLabel?: string;
} = {}) {
  const total = states.reduce((s, x) => s + x.count, 0);

  const inflight = states
    .filter((s) => s.bucket === "in-flight")
    .sort((a, b) => b.count - a.count);
  const terminal = states
    .filter((s) => s.bucket === "terminal")
    .sort((a, b) => b.count - a.count);

  const groups: { label: string; icon: LucideIcon; rows: LifecycleState[] }[] = [
    { label: "In-flight", icon: Zap, rows: inflight },
    { label: terminalLabel, icon: CheckCircle2, rows: terminal },
  ];

  return (
    <ChartCard
      title="Task lifecycle"
      icon={<Activity size={14} />}
      action={
        <span className="font-mono text-sm tabular-nums text-foreground">
          {fmtInt(total)}
        </span>
      }
    >
      <div className="flex flex-col gap-2">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-foreground">
              <g.icon size={13} className="text-muted-foreground" />
              {g.label}
            </div>
            <table className="w-full border-collapse text-sm">
              <colgroup>
                <col />
                <col className="w-[30%]" />
              </colgroup>
              <tbody>
                {g.rows.map((s) => (
                  <Row key={s.state} state={s} total={total} />
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function Row({ state, total }: { state: LifecycleState; total: number }) {
  return (
    <tr className="border-b border-border transition-colors last:border-0 hover:bg-secondary/40">
      <td className="py-2.5 pl-6 pr-3">
        <span className="truncate text-sm font-medium text-foreground">
          {state.state}
        </span>
      </td>
      <td className="py-2.5 pl-3 pr-6 text-right">
        <span className="inline-flex items-baseline justify-end gap-2.5">
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {fmtInt(state.count)}
          </span>
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {fmtPct(state.count / total, 0)}
          </span>
        </span>
      </td>
    </tr>
  );
}
