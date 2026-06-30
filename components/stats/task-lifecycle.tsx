"use client";

import { Activity } from "lucide-react";

import { LIFECYCLE, fmtInt, fmtPct } from "@/lib/stats-data";
import { Panel } from "./ui";

type LifecycleState = (typeof LIFECYCLE.states)[number];

export function TaskLifecycle({
  states = LIFECYCLE.states,
  terminalLabel = "Terminal",
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
  const inflightTotal = inflight.reduce((s, x) => s + x.count, 0);
  const terminalTotal = terminal.reduce((s, x) => s + x.count, 0);
  const inflightMax = Math.max(...inflight.map((s) => s.count));
  const terminalMax = Math.max(...terminal.map((s) => s.count));

  return (
    <Panel
      title="Task lifecycle"
      icon={<Activity size={14} />}
      action={
        <span className="font-mono text-sm tabular-nums text-foreground">
          {fmtInt(total)}
        </span>
      }
    >
      {/* Two number blocks */}
      <div className="grid grid-cols-2 divide-x divide-border rounded-lg border border-border bg-secondary/30">
        <div className="px-5 py-4">
          <div className="text-[10px] font-medium text-muted-foreground">
            In-flight
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-lg leading-none tabular-nums text-foreground">
              {fmtInt(inflightTotal)}
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {fmtPct(inflightTotal / total, 0)}
            </span>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="text-[10px] font-medium text-muted-foreground">
            {terminalLabel}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-lg leading-none tabular-nums text-foreground">
              {fmtInt(terminalTotal)}
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {fmtPct(terminalTotal / total, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* State list with progress bars per row, grouped by bucket */}
      <div className="mt-5 flex flex-col">
        <ul className="flex flex-col gap-2">
          {inflight.map((s) => (
            <Row key={s.state} state={s} max={inflightMax} total={total} />
          ))}
        </ul>
        <div className="my-3 border-t border-border" />
        <ul className="flex flex-col gap-2">
          {terminal.map((s) => (
            <Row key={s.state} state={s} max={terminalMax} total={total} />
          ))}
        </ul>
      </div>
    </Panel>
  );
}

function Row({
  state,
  max,
  total,
}: {
  state: LifecycleState;
  max: number;
  total: number;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-40 shrink-0">
        <span className="truncate text-xs font-medium text-foreground">{state.state}</span>
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(3, (state.count / max) * 100)}%`,
            backgroundColor: "var(--chart-1)",
          }}
        />
      </div>
      <div className="flex w-20 shrink-0 items-baseline justify-end gap-1.5">
        <span className="font-mono text-xs tabular-nums text-foreground">
          {fmtInt(state.count)}
        </span>
        <span className="w-8 text-right font-mono text-xs tabular-nums text-muted-foreground">
          {fmtPct(state.count / total, 0)}
        </span>
      </div>
    </li>
  );
}
