"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { STAT_CAMPAIGN } from "@/lib/stats-data";
import { CallingOverview } from "@/components/stats/calling-overview";
import { CallPerformance } from "@/components/stats/call-performance";
import { ConversionFunnel } from "@/components/stats/conversion-funnel";
import { TaskLifecycle } from "@/components/stats/task-lifecycle";
import { AgentCompare } from "@/components/stats/agent-compare";
import { StatsTypeTabs } from "@/components/stats/type-tabs";
import { AddWidgetButton } from "@/components/stats/add-widget";
import { AppShell } from "@/components/app-shell";
import {
  DateRangePicker,
  type StatsRange,
} from "@/components/stats/date-range-picker";

export default function StatsPage() {
  const [range, setRange] = useState<StatsRange | undefined>(undefined);

  return (
    <AppShell activeNav="Campaigns">
      <div className="px-8 py-6">
        {/* Header */}
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Megaphone size={12} /> Campaign performance
            </div>
            <h1 className="text-lg font-medium tracking-tight text-foreground">
              {STAT_CAMPAIGN.name}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {STAT_CAMPAIGN.agentName}{" "}
                <span className="font-mono text-xs">· {STAT_CAMPAIGN.agentId}</span>
              </p>
              <Badge variant="secondary" className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Running
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatsTypeTabs />
            <DateRangePicker
              value={range}
              onChange={setRange}
              defaultPreset="30d"
            />
            <AddWidgetButton />
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <ConversionFunnel />
            <TaskLifecycle />
          </div>
          <CallingOverview />
          <CallPerformance />
          <AgentCompare />
        </div>
      </div>
    </AppShell>
  );
}
