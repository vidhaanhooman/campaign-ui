"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { RealtimeBanner } from "@/components/stats/realtime-banner";
import { OpsStrip } from "@/components/stats/ops-strip";
import { WindowSelector } from "@/components/stats/window-selector";

const RANGES = [
  "Last hour",
  "Last 6 hours",
  "Last 24 hours",
  "Last 7 days",
  "Last 30 days",
];

const WINDOW_BY_RANGE: Record<string, RtWindowKey> = {
  "Last hour": "24h",
  "Last 6 hours": "24h",
  "Last 24 hours": "24h",
  "Last 7 days": "7d",
  "Last 30 days": "lifetime",
};

export default function RealtimeStatsPage() {
  const [range, setRange] = useState("Last 24 hours");
  const [funnelWindow, setFunnelWindow] = useState<RtWindowKey>("24h");

  const funnelData = useMemo(
    () => buildFunnel(RT_FUNNEL_RAW[funnelWindow]),
    [funnelWindow],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link
              href="/campaigns"
              className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft size={15} />
            </Link>
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Zap size={12} /> Realtime · Campaign performance
              </div>
              <h1 className="text-lg font-medium tracking-tight text-foreground">
                {STAT_CAMPAIGN_RT.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {STAT_CAMPAIGN_RT.agentName}{" "}
                <span className="font-mono text-xs">
                  · {STAT_CAMPAIGN_RT.agentId}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatsTypeTabs />
            <Badge variant="secondary" className="gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </Badge>
            <Select
              value={range}
              onValueChange={(v) => {
                if (!v) return;
                setRange(v);
                const w = WINDOW_BY_RANGE[v];
                if (w) setFunnelWindow(w);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Realtime banner */}
        <div className="mb-5">
          <RealtimeBanner />
        </div>

        {/* Ops strip */}
        <div className="mb-5">
          <OpsStrip />
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-5">
          {/* Window selector above the windowed sections */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Funnel · windowed
            </span>
            <WindowSelector value={funnelWindow} onChange={setFunnelWindow} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <ConversionFunnel data={funnelData} />
            <TaskLifecycle
              states={RT_LIFECYCLE.states}
              terminalLabel="Terminal (cum.)"
            />
          </div>
          <CallingOverview />
          <CallPerformance />
          <AgentCompare />
        </div>
      </div>
    </div>
  );
}
