"use client";

import * as React from "react";
import { BarChart3, LayoutDashboard, Plus, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DateRangePicker,
  type StatsRange,
} from "@/components/stats/date-range-picker";
import { AgentPicker } from "@/components/insights/agent-picker";
import { KpiStrip, ConversationsChart } from "@/components/insights/sections";
import { OutboundView } from "@/components/insights/outbound-view";
import { InboundView } from "@/components/insights/inbound-view";
import { WidgetBuilder } from "@/components/insights/widget-builder";
import { WidgetRenderer } from "@/components/insights/widget-renderer";
import type { TimeRange, Widget } from "@/lib/insights/types";
import { cn } from "@/lib/utils";

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
  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [builderMode, setBuilderMode] = React.useState<"add" | "edit">("add");
  const [editingWidget, setEditingWidget] = React.useState<Widget | null>(null);
  const [widgetsByTab, setWidgetsByTab] = React.useState<Record<string, Widget[]>>({});
  const dragIndex = React.useRef<number | null>(null);

  const refresh = () => setRefreshKey((k) => k + 1);
  const widgets = widgetsByTab[tab] ?? [];
  const setTabWidgets = (fn: (w: Widget[]) => Widget[]) =>
    setWidgetsByTab((prev) => ({ ...prev, [tab]: fn(prev[tab] ?? []) }));

  const addWidget = (w: Widget) => setTabWidgets((ws) => [...ws, w]);
  const removeWidget = (id: string) =>
    setTabWidgets((ws) => ws.filter((w) => w.id !== id));
  const updateWidget = (id: string, patch: Partial<Widget>) =>
    setTabWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const resizeWidget = (id: string) =>
    setTabWidgets((ws) =>
      ws.map((w) => (w.id === id ? { ...w, span: w.span === 2 ? 1 : 2 } : w)),
    );
  const openEdit = (w: Widget) => {
    setEditingWidget(w);
    setBuilderMode("edit");
    setBuilderOpen(true);
  };
  /** Edit on a built-in panel (no widget behind it) → open the builder in Edit mode. */
  const openBuilderInEdit = () => {
    setEditingWidget(null);
    setBuilderMode("edit");
    setBuilderOpen(true);
  };
  /** Add widget button — clean Add flow, no viz options section. */
  const openBuilderInAdd = () => {
    setEditingWidget(null);
    setBuilderMode("add");
    setBuilderOpen(true);
  };
  // Move: drag a card onto another to reorder.
  const moveWidget = (from: number, to: number) =>
    setTabWidgets((ws) => {
      if (from === to || from < 0 || to < 0) return ws;
      const next = [...ws];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

  const widgetGrid = widgets.length > 0 && (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {widgets.map((w, i) => (
        <div
          key={w.id}
          draggable
          onDragStart={() => (dragIndex.current = i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex.current !== null) moveWidget(dragIndex.current, i);
            dragIndex.current = null;
          }}
          className={cn(
            "cursor-grab active:cursor-grabbing",
            w.span === 2 ? "md:col-span-2" : "md:col-span-1",
          )}
        >
          <WidgetRenderer
            widget={w}
            range={range}
            refreshKey={refreshKey}
            onRemove={() => removeWidget(w.id)}
            onResize={() => resizeWidget(w.id)}
            onEdit={() => openEdit(w)}
          />
        </div>
      ))}
    </div>
  );

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
      <div className="px-8 py-6">
        {/* Row 1 — page identity + primary action */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-lg font-medium tracking-tight text-foreground">
            Insights
          </h1>
          <button
            type="button"
            onClick={openBuilderInAdd}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <Plus size={14} /> Add widget
          </button>
        </div>

        {/* Row 2 — underline tabs (left) + filters + icon Refresh (right) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList variant="line">
              {TABS.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 pb-2">
            <DateRangePicker
              value={dateValue}
              onChange={(r) => {
                setDateValue(r);
                if (r.preset) setRange(RANGE_BY_PRESET[r.preset] ?? "7d");
              }}
              defaultPreset="7d"
            />
            <AgentPicker agentId={agentId} onChange={setAgentId} />
            <button
              type="button"
              onClick={refresh}
              aria-label="Refresh"
              title="Refresh"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Tab content */}
        {tab === "Overview" ? (
          <div className="flex flex-col gap-5">
            <KpiStrip range={range} refreshKey={refreshKey} />
            <ConversationsChart
              range={range}
              refreshKey={refreshKey}
            />
            {widgetGrid}
          </div>
        ) : tab === "Outbound" ? (
          <div className="flex flex-col gap-5">
            <OutboundView range={range} refreshKey={refreshKey} onEdit={openBuilderInEdit} />
            {widgetGrid}
          </div>
        ) : tab === "Inbound" ? (
          <div className="flex flex-col gap-5">
            <InboundView range={range} refreshKey={refreshKey} onEdit={openBuilderInEdit} />
            {widgetGrid}
          </div>
        ) : (
          <div className="flex flex-col gap-5">{widgetGrid || emptyState}</div>
        )}
      </div>

      <WidgetBuilder
        open={builderOpen}
        onOpenChange={(v) => {
          setBuilderOpen(v);
          if (!v) {
            setEditingWidget(null);
            setBuilderMode("add");
          }
        }}
        onAdd={addWidget}
        onUpdate={updateWidget}
        editing={editingWidget}
        mode={builderMode}
      />
    </AppShell>
  );
}
