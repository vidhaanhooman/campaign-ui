"use client";

import * as React from "react";
import {
  ListChecks,
  Maximize2,
  PhoneIncoming,
  PhoneOutgoing,
  type LucideIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useConversations,
  useKpiSummary,
} from "@/lib/insights/hooks";
import { formatValue } from "@/lib/insights/resolver";
import type { TimeRange } from "@/lib/insights/types";
import { cn } from "@/lib/utils";
import { InfoHint } from "@/components/stats/info-hint";
import { INSIGHT_RAMP, MultiLineChart, type LineSeriesDef } from "./charts";
import { ChartToolbar } from "./chart-toolbar";
import { LineDetailView } from "./widgets/line-detail";
import { MetricBreakdown } from "./widgets/metric-breakdown";
import { MetricDetail } from "./widgets/metric-detail";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[#333333]/30", className)} />;
}

/* ── KPI strip — three channel cards ─────────────────────────────────── */
export function KpiStrip({
  range,
  refreshKey,
}: {
  range: TimeRange;
  refreshKey: number;
}) {
  const { data, loading } = useKpiSummary(range, refreshKey);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[108px] w-full" />
        ))}
      </div>
    );
  }

  const groups: { channel: string; icon: LucideIcon; stats: { label: string; value: string }[] }[] = [
    {
      channel: "Inbound",
      icon: PhoneIncoming,
      stats: [
        { label: "Calls", value: formatValue(data.inbound.calls, "count") },
        { label: "Avg Duration", value: formatValue(data.inbound.avgDur, "duration") },
      ],
    },
    {
      channel: "Outbound",
      icon: PhoneOutgoing,
      stats: [
        { label: "Calls", value: formatValue(data.outbound.calls, "count") },
        { label: "Avg Duration", value: formatValue(data.outbound.avgDur, "duration") },
      ],
    },
    {
      channel: "Tasks",
      icon: ListChecks,
      stats: [
        { label: "Created", value: formatValue(data.tasks.created, "count") },
        { label: "Running", value: formatValue(data.tasks.running, "count") },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {groups.map((g) => (
        <div
          key={g.channel}
          className="rounded-xl border border-border bg-[#333333]/30 px-6 py-5"
        >
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <g.icon size={14} />
            {g.channel}
          </div>
          <div className="mt-3 flex items-end justify-between gap-4">
            {g.stats.map((s) => (
              <div key={s.label}>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1.5 text-2xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Conversations & Tasks hero chart ────────────────────────────────── */
const CONV_SERIES: LineSeriesDef[] = [
  { key: "Inbound", label: "Inbound", color: INSIGHT_RAMP[1] },
  { key: "Outbound", label: "Outbound", color: INSIGHT_RAMP[0] },
  { key: "Web", label: "Web", color: INSIGHT_RAMP[3] },
  { key: "Tasks", label: "Tasks created", color: INSIGHT_RAMP[2] },
];

export function ConversationsChart({
  range,
  refreshKey,
}: {
  range: TimeRange;
  refreshKey: number;
}) {
  const { data, loading } = useConversations(range, refreshKey);
  const [open, setOpen] = React.useState(false);
  const [visible, setVisible] = React.useState<Set<string>>(
    () => new Set(CONV_SERIES.map((s) => s.key)),
  );

  const legend = (
    <div className="flex flex-wrap justify-center gap-1.5 text-xs">
      {CONV_SERIES.map((s) => {
        const on = visible.has(s.key);
        return (
          <button
            key={s.key}
            onClick={() => isolate(s.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-opacity hover:bg-secondary",
              on ? "text-foreground" : "text-muted-foreground opacity-40",
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: s.color }}
            />
            {s.label}
          </button>
        );
      })}
    </div>
  );

  const total = React.useMemo(() => {
    let sum = 0;
    for (const d of data)
      for (const s of CONV_SERIES)
        if (visible.has(s.key)) sum += Number(d[s.key as keyof typeof d]) || 0;
    return sum;
  }, [data, visible]);

  function isolate(key: string) {
    setVisible((prev) =>
      prev.size === 1 && prev.has(key)
        ? new Set(CONV_SERIES.map((s) => s.key))
        : new Set([key]),
    );
  }

  return (
    <section className="group flex flex-col overflow-hidden rounded-xl border border-border bg-[#333333]/30">
      <header className="flex items-center gap-4 px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            Conversations &amp; Tasks
          </span>
          <span className="font-mono text-lg font-medium leading-none tabular-nums text-foreground">
            {total.toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          aria-label="Enlarge"
          onClick={() => setOpen(true)}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100"
        >
          <Maximize2 size={13} />
        </button>
      </header>
      <div className="px-5 pb-5">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <MultiLineChart
            data={data as unknown as Record<string, string | number>[]}
            series={CONV_SERIES.filter((s) => visible.has(s.key))}
            height={300}
          />
        )}
        <div className="mt-2">{legend}</div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-4xl">
          <DialogHeader>
            <DialogTitle>Conversations &amp; Tasks</DialogTitle>
          </DialogHeader>
          <ChartToolbar />
          <div className="flex max-h-[72vh] flex-col pt-1">
            <LineDetailView
              data={data as unknown as Record<string, string | number>[]}
              series={CONV_SERIES}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ── Stat cards — unified divided strip ──────────────────────────────── */
export interface Stat {
  label: string;
  value: string;
  /** Optional caption under the value. */
  sub?: string;
  /** Optional info tooltip next to the label. */
  hint?: string;
  /** Counts break down by agent (bars); rates/scores use the fuller detail. */
  breakdown?: boolean;
  /** Use the fuller 5-panel detail layout on enlarge. */
  fullDetail?: boolean;
  /** @deprecated no longer rendered — kept so callers can keep passing it. */
  icon?: LucideIcon;
}

export function StatCards({
  items,
  range = "today",
  refreshKey = 0,
}: {
  items: Stat[];
  range?: TimeRange;
  refreshKey?: number;
}) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const stat = items.find((s) => s.label === expanded);
  // Counts → simple agent breakdown; rates/scores → full detail layout.
  const barOnly = stat?.breakdown === true;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((s) => (
          <div
            key={s.label}
            className="group/tile relative flex flex-col rounded-xl border border-border bg-[#333333]/30 px-6 py-5"
          >
            <button
              type="button"
              aria-label="Enlarge"
              onClick={() => setExpanded(s.label)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover/tile:opacity-100"
            >
              <Maximize2 size={13} />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {s.label}
              {s.hint && <InfoHint>{s.hint}</InfoHint>}
            </div>
            <div className="mt-2 text-3xl font-semibold leading-tight tracking-tight tabular-nums text-foreground">
              {s.value}
            </div>
            {s.sub && (
              <div className="mt-3 text-sm text-muted-foreground">{s.sub}</div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!expanded} onOpenChange={(o) => !o && setExpanded(null)}>
        <DialogContent className={barOnly ? "!max-w-3xl" : "!max-w-5xl"}>
          <DialogHeader>
            <DialogTitle>{barOnly ? expanded : `${expanded} details`}</DialogTitle>
          </DialogHeader>
          <ChartToolbar />
          <div className="max-h-[70vh] overflow-y-auto pt-1">
            {barOnly ? (
              <MetricBreakdown range={range} refreshKey={refreshKey} />
            ) : (
              <MetricDetail
                label={expanded ?? ""}
                range={range}
                refreshKey={refreshKey}
                full={stat?.fullDetail}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
