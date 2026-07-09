"use client";

import { useMemo, useState } from "react";

import {
  RT_FUNNEL_RAW,
  RT_LIFECYCLE,
  RT_OPS,
  STAT_CAMPAIGN_RT,
  buildFunnel,
  type RtWindowKey,
} from "@/lib/stats-data";
import { CallingOverview } from "@/components/stats/calling-overview";
import { ConversionFunnel } from "@/components/stats/conversion-funnel";
import { TaskLifecycle } from "@/components/stats/task-lifecycle";
import { AgentCompare } from "@/components/stats/agent-compare";
import { StatsTypeTabs } from "@/components/stats/type-tabs";
import { AddWidgetButton } from "@/components/stats/add-widget";
import { AppShell } from "@/components/app-shell";
import { KpiCard, PageHeading } from "@/components/stats/ui";
import {
  DateRangePicker,
  type StatsRange,
} from "@/components/stats/date-range-picker";

/** Map a date-range preset to the funnel data window. */
const WINDOW_BY_PRESET: Record<string, RtWindowKey> = {
  today: "24h",
  yesterday: "24h",
  "24h": "24h",
  "7d": "7d",
  "30d": "lifetime",
  thisMonth: "lifetime",
  lastMonth: "lifetime",
  "3mo": "lifetime",
};

/** Compose RT_OPS into the KpiCard shape. */
const RT_KPIS = RT_OPS.map((k) => ({
  label: k.label,
  value: k.suffix ? (
    <span>
      {k.value}
      <span className="ml-1 font-mono text-lg text-muted-foreground">
        {k.suffix}
      </span>
    </span>
  ) : (
    k.value
  ),
  description: k.sub,
}));

export default function RealtimeStatsPage() {
  const [range, setRange] = useState<StatsRange | undefined>(undefined);
  const [funnelWindow, setFunnelWindow] = useState<RtWindowKey>("24h");

  const funnelData = useMemo(
    () => buildFunnel(RT_FUNNEL_RAW[funnelWindow]),
    [funnelWindow],
  );

  return (
    <AppShell activeNav="Campaigns">
      <div className="px-6 py-6">
        <PageHeading title={STAT_CAMPAIGN_RT.name} className="mb-6">
          <StatsTypeTabs />
          <DateRangePicker
            value={range}
            onChange={(r) => {
              setRange(r);
              const w = r.preset ? WINDOW_BY_PRESET[r.preset] : undefined;
              if (w) setFunnelWindow(w);
            }}
            defaultPreset="24h"
          />
          <AddWidgetButton />
        </PageHeading>

        {/* KPI card row */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {RT_KPIS.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ConversionFunnel data={funnelData} />
            <TaskLifecycle
              states={RT_LIFECYCLE.states}
              terminalLabel="Closed (cum.)"
            />
          </div>
          <CallingOverview />
          <AgentCompare />
        </div>
      </div>
    </AppShell>
  );
}
