"use client";

import * as React from "react";
import { LayoutDashboard, Plus, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import {
  DateRangePicker,
  type StatsRange,
} from "@/components/stats/date-range-picker";
import { AgentPicker } from "@/components/insights/agent-picker";
import { SegmentedToggle } from "@/components/insights/segmented-toggle";
import { KpiStrip, ConversationsChart } from "@/components/insights/sections";
import { OutboundView } from "@/components/insights/outbound-view";
import { InboundView } from "@/components/insights/inbound-view";
import type { TimeRange } from "@/lib/insights/types";

const TABS = ["Overview", "Outbound", "Inbound", "Tasks", "Tools"] as const;
type Tab = (typeof TABS)[number];

/** Map a date-range preset to the insights TimeRange the data hooks accept. */
const RANGE_BY_PRESET: Record<string, TimeRange> = {
  today: "today",
  yesterday: "today",
  "24h": "today",
  "7d": "7d",
  "30d": "30d",
  thisMonth: "30d",
  lastMonth: "30d",
  "3mo": "30d",
};

export default function InsightsPage() {
  const [tab, setTab] = React.useState<Tab>("Overview");
  const [range, setRange] = React.useState<TimeRange>("7d");
  const [dateValue, setDateValue] = React.useState<StatsRange | undefined>(undefined);
  const [agentId, setAgentId] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const emptyState = (
    <div className="flex items-center gap-4 rounded-lg border border-dashed border-border px-5 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
        <LayoutDashboard size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          Your dashboard is empty
        </p>
        <p className="text-xs text-muted-foreground">
          Add a widget to start tracking the metrics you care about.
        </p>
      </div>
    </div>
  );

  return (
    <AppShell activeNav="Overview">
      <div className="flex min-h-full flex-col">
        {/* Header */}
        <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border px-5 py-3.5">
          <span className="text-[15px] font-medium text-foreground">Insights</span>
          <SegmentedToggle
            options={TABS.map((t) => ({ value: t, label: t }))}
            value={tab}
            onChange={(v) => setTab(v as Tab)}
          />
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
            >
              <Plus size={14} /> Add widget
            </button>
          </div>
        </header>

        {/* Filter row */}
        <div className="flex items-center gap-3 px-5 pt-4">
          <DateRangePicker
            value={dateValue}
            onChange={(r) => {
              setDateValue(r);
              if (r.preset) setRange(RANGE_BY_PRESET[r.preset] ?? "7d");
            }}
            defaultPreset="7d"
          />
          <AgentPicker agentId={agentId} onChange={setAgentId} />
        </div>

        {/* Tab content */}
        {tab === "Overview" ? (
          <div className="space-y-5 p-5">
            <KpiStrip range={range} refreshKey={refreshKey} />
            <ConversationsChart range={range} refreshKey={refreshKey} />
          </div>
        ) : tab === "Outbound" ? (
          <OutboundView range={range} refreshKey={refreshKey} />
        ) : tab === "Inbound" ? (
          <InboundView range={range} refreshKey={refreshKey} />
        ) : (
          <div className="p-5">{emptyState}</div>
        )}
      </div>
    </AppShell>
  );
}
