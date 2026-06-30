"use client";

import { useMemo, useState } from "react";
import { Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  RT_FUNNEL_RAW,
  RT_LIFECYCLE,
  STAT_CAMPAIGN_RT,
  buildFunnel,
  type RtWindowKey,
} from "@/lib/stats-data";
import { CallingOverview } from "@/components/stats/calling-overview";
import { CallPerformance } from "@/components/stats/call-performance";
import { ConversionFunnel } from "@/components/stats/conversion-funnel";
import { TaskLifecycle } from "@/components/stats/task-lifecycle";
import { AgentCompare } from "@/components/stats/agent-compare";
import { StatsTypeTabs } from "@/components/stats/type-tabs";
import { AddWidgetButton } from "@/components/stats/add-widget";
import { OpsStrip } from "@/components/stats/ops-strip";
import { AppShell } from "@/components/app-shell";
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

export default function RealtimeStatsPage() {
  const [range, setRange] = useState<StatsRange | undefined>(undefined);
  const [funnelWindow, setFunnelWindow] = useState<RtWindowKey>("24h");

  const funnelData = useMemo(
    () => buildFunnel(RT_FUNNEL_RAW[funnelWindow]),
    [funnelWindow],
  );

  return (
    <AppShell activeNav="Campaigns">
      <div className="px-8 py-6">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Zap size={12} /> Realtime · Campaign performance
            </div>
            <h1 className="text-lg font-medium tracking-tight text-foreground">
              {STAT_CAMPAIGN_RT.name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {STAT_CAMPAIGN_RT.agentName}{" "}
                <span className="font-mono text-xs">
                  · {STAT_CAMPAIGN_RT.agentId}
                </span>
              </p>
              <Badge variant="secondary" className="gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Ops strip */}
        <div className="mb-5">
          <OpsStrip />
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <ConversionFunnel data={funnelData} />
            <TaskLifecycle
              states={RT_LIFECYCLE.states}
              terminalLabel="Closed (cum.)"
            />
          </div>
          <CallingOverview />
          <CallPerformance />
          <AgentCompare />
        </div>
      </div>
    </AppShell>
  );
}
