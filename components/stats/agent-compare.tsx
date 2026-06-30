"use client";

import { useState } from "react";
import { ChevronDown, GitBranch, Table as TableIcon } from "lucide-react";

import {
  VERSION_STATS,
  type VersionStat,
  fmtInt,
  fmtPct,
  fmtDur,
  fmtMoney,
} from "@/lib/stats-data";
import { cn } from "@/lib/utils";
import { Panel } from "./ui";

type Row = {
  key: keyof VersionStat;
  label: string;
  format: (v: number) => string;
  /** true when a higher value is the winner */
  higherBetter: boolean;
};

type Group = { label: string; rows: Row[] };

const BASE_GROUPS: Group[] = [
  {
    label: "Volume",
    rows: [
      { key: "calls", label: "Calls count", format: fmtInt, higherBetter: true },
      { key: "callsConnected", label: "Calls connected", format: fmtInt, higherBetter: true },
      { key: "tasksCreated", label: "Tasks created", format: fmtInt, higherBetter: true },
    ],
  },
  {
    label: "Quality",
    rows: [
      { key: "connectRate", label: "Pick-up rate", format: (v) => fmtPct(v, 0), higherBetter: true },
      { key: "avgTalkSec", label: "Avg duration", format: fmtDur, higherBetter: false },
      { key: "transferRate", label: "Transfer rate", format: (v) => fmtPct(v, 0), higherBetter: false },
      { key: "csat", label: "CSAT", format: (v) => v.toFixed(1), higherBetter: true },
      { key: "conversionRate", label: "Conversion rate", format: (v) => fmtPct(v, 1), higherBetter: true },
    ],
  },
  {
    label: "Cost",
    rows: [
      { key: "costPerCall", label: "Cost / call", format: fmtMoney, higherBetter: false },
    ],
  },
];

const EXTRA_GROUPS: Group[] = [
  {
    label: "Reach",
    rows: [
      { key: "uniqueReached", label: "Unique reached", format: fmtInt, higherBetter: true },
    ],
  },
  {
    label: "Conversation",
    rows: [
      { key: "humanAnswerRate", label: "Human-answer rate", format: (v) => fmtPct(v, 0), higherBetter: true },
      { key: "engagementRate", label: "Engagement rate", format: (v) => fmtPct(v, 0), higherBetter: true },
    ],
  },
  {
    label: "Economics",
    rows: [
      { key: "costPerConversion", label: "Cost / conversion", format: fmtMoney, higherBetter: false },
      { key: "dialingSec", label: "Avg dialing time", format: fmtDur, higherBetter: false },
    ],
  },
];

function bestValue(rows: Row[], stats: VersionStat[]) {
  const out: Partial<Record<keyof VersionStat, number>> = {};
  for (const r of rows) {
    const values = stats.map((s) => s[r.key] as number);
    out[r.key] = r.higherBetter ? Math.max(...values) : Math.min(...values);
  }
  return out;
}

export function AgentCompare() {
  const [expanded, setExpanded] = useState(false);
  const groups = expanded ? [...BASE_GROUPS, ...EXTRA_GROUPS] : BASE_GROUPS;
  const allRows = groups.flatMap((g) => g.rows);
  const best = bestValue(allRows, VERSION_STATS);

  return (
    <Panel
      title="Agent version compare"
      icon={<GitBranch size={14} />}
      action={
        <span className="text-xs text-muted-foreground">
          {VERSION_STATS.length} versions
        </span>
      }
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {/* Column headers — version names */}
          <thead>
            <tr className="border-y border-border bg-secondary/40">
              <th className="w-[28%] py-2.5 pl-5 pr-3 text-left text-xs font-medium text-muted-foreground">
                Metric
              </th>
              {VERSION_STATS.map((v) => (
                <th
                  key={v.version}
                  className={cn(
                    "px-3 py-2.5 text-left text-xs font-medium",
                    v.live ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {v.live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    <span>{v.version}</span>
                  </div>
                  <span className="block truncate text-[10px] font-normal text-muted-foreground/70">
                    {v.tag}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groups.map((g) => (
              <GroupBody
                key={g.label}
                group={g}
                stats={VERSION_STATS}
                best={best}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center border-t border-border bg-secondary/20 px-5 py-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
        >
          <TableIcon size={13} className="text-foreground" />
          {expanded ? "Show core comparison" : "Full comparison"}
          <ChevronDown
            size={13}
            className={cn(
              "text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>
    </Panel>
  );
}

function GroupBody({
  group,
  stats,
  best,
}: {
  group: Group;
  stats: VersionStat[];
  best: Partial<Record<keyof VersionStat, number>>;
}) {
  return (
    <>
      {group.rows.map((r, i) => (
        <tr
          key={r.key}
          className={cn(
            "border-b border-border/40 last:border-0",
            i === 0 && "border-t-2 border-border",
          )}
        >
          <td className="py-2.5 pl-5 pr-3 text-xs text-muted-foreground">{r.label}</td>
          {stats.map((s) => {
            const val = s[r.key] as number;
            const isBest = val === best[r.key];
            return (
              <td
                key={s.version}
                className={cn(
                  "px-3 py-2.5 font-mono text-xs tabular-nums",
                  s.live && "bg-secondary/15",
                  isBest ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {r.format(val)}
                  {isBest && <span className="h-1 w-1 rounded-full bg-emerald-400" />}
                </span>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
