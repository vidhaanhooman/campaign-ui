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
import { AppShell, NotificationsButton, UsageChip } from "@/components/app-shell";
import { PageHeader } from "@/components/stats/ui";
import {
  DateRangePicker,
  type StatsRange,
} from "@/components/stats/date-range-picker";

/** Quiet uppercase band label — turns a wall of cards into scannable tiers. */
function BandLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

export default function StatsPage() {
  const [range, setRange] = useState<StatsRange | undefined>(undefined);

  return (
    <AppShell activeNav="Campaigns">
      <div className="min-h-full bg-background">
      {/* One tidy top bar: campaign identity left, all page-level controls
          right-pinned in the header — no floating toolbar band below. */}
      <PageHeader
        icon={<PanelLeft size={16} />}
        label={STAT_CAMPAIGN.name}
        sublabel={
          <span className="inline-flex items-center gap-1.5">
            {STAT_CAMPAIGN.agentName}
            <span className="font-mono text-muted-foreground/80">
              · {STAT_CAMPAIGN.agentId}
            </span>
            <span className="ml-1 inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Running
            </span>
          </span>
        }
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatsTypeTabs />
            <DateRangePicker
              value={range}
              onChange={setRange}
              defaultPreset="30d"
            />
            <UsageChip />
            <NotificationsButton />
            <AddWidgetButton />
          </div>
        }
      />

      {/* Three spaced bands: gap-6 within a band, gap-10 between — so seven
          cards read as three deliberate tiers instead of a flat wall. */}
      <div className="flex flex-col gap-10 px-6 py-8">
        <section>
          <BandLabel>Pipeline</BandLabel>
          <div className="grid gap-6 lg:grid-cols-2">
            <ConversionFunnel />
            <TaskLifecycle />
          </div>
        </section>

        <section>
          <BandLabel>Calling</BandLabel>
          <CallingOverview />
        </section>

        <section>
          <BandLabel>Agent versions</BandLabel>
          <AgentCompare />
        </section>
      </div>
      </div>
    </AppShell>
  );
}
