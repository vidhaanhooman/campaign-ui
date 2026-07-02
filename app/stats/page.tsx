"use client";

import { useState } from "react";
import { PanelLeft } from "lucide-react";

import { STAT_CAMPAIGN } from "@/lib/stats-data";
import { CallingOverview } from "@/components/stats/calling-overview";
import { ConversionFunnel } from "@/components/stats/conversion-funnel";
import { TaskLifecycle } from "@/components/stats/task-lifecycle";
import { AgentCompare } from "@/components/stats/agent-compare";
import { StatsTypeTabs } from "@/components/stats/type-tabs";
import { AddWidgetButton } from "@/components/stats/add-widget";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/stats/ui";
import {
  DateRangePicker,
  type StatsRange,
} from "@/components/stats/date-range-picker";

export default function StatsPage() {
  const [range, setRange] = useState<StatsRange | undefined>(undefined);

  return (
    <AppShell activeNav="Campaigns">
      <PageHeader
        icon={<PanelLeft size={16} />}
        label={STAT_CAMPAIGN.name}
      />

      <div className="px-6 py-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
          <StatsTypeTabs />
          <DateRangePicker
            value={range}
            onChange={setRange}
            defaultPreset="30d"
          />
          <AddWidgetButton />
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ConversionFunnel />
            <TaskLifecycle />
          </div>
          <CallingOverview />
          <AgentCompare />
        </div>
      </div>
    </AppShell>
  );
}
