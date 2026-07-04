"use client";

import { Clock, PhoneIncoming, Repeat2, Star } from "lucide-react";

import {
  useGrouped,
  useInboundAgentTable,
  useInboundSeries,
  useInboundSummary,
} from "@/lib/insights/hooks";
import { formatValue } from "@/lib/insights/resolver";
import type { TimeRange } from "@/lib/insights/types";
import { INSIGHT_RAMP } from "./charts";
import { LinePanel, PiePanel, TablePanel } from "./panels";
import { StatCards } from "./sections";
import { MetricDeepDive } from "./widgets/metric-deep-dive";

export function InboundView({
  range,
  refreshKey,
  onEdit,
}: {
  range: TimeRange;
  refreshKey: number;
  onEdit?: () => void;
}) {
  const summary = useInboundSummary(range, refreshKey);
  const series = useInboundSeries(range, refreshKey);
  const outcome = useGrouped("outcome", range, refreshKey);
  const agents = useInboundAgentTable(range, refreshKey);

  const d = summary.data;
  const stats = [
    { label: "Calls Received", icon: PhoneIncoming, value: formatValue(d.received, "count"), breakdown: true },
    { label: "Avg Duration", icon: Clock, value: formatValue(d.avgDur, "duration"), breakdown: false },
    { label: "Transfer Rate", icon: Repeat2, value: formatValue(d.transferRate, "percent"), breakdown: false },
    { label: "CSAT", icon: Star, value: formatValue(d.csat, "ratio"), breakdown: false },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards items={stats} range={range} refreshKey={refreshKey} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <LinePanel
          className="lg:col-span-2"
          onEdit={onEdit}
          title="Calls & Transfers"
          loading={series.loading}
          data={series.data as unknown as Record<string, string | number>[]}
          series={[
            { key: "Calls", label: "Calls", color: INSIGHT_RAMP[0] },
            { key: "Transfers", label: "Transfers", color: INSIGHT_RAMP[2] },
          ]}
          enlargedContent={
            <MetricDeepDive
              metric="calls"
              label="Calls & Transfers"
              range={range}
              refreshKey={refreshKey}
            />
          }
        />
        <PiePanel
          onEdit={onEdit}
          title="Outcome Wise Calls"
          loading={outcome.loading}
          data={outcome.data}
        />
      </div>

      <TablePanel
        onEdit={onEdit}
        title="Agent Wise Data"
        loading={agents.loading}
        columns={[
          { key: "agent", label: "Agent" },
          { key: "calls", label: "Calls", numeric: true },
          { key: "transferred", label: "Transferred", numeric: true },
          { key: "transferRate", label: "Transfer Rate (%)", numeric: true },
          { key: "avgDur", label: "Avg Duration (s)", numeric: true },
        ]}
        rows={agents.data}
        empty={{
          title:
            range === "today"
              ? "No agent activity in the last 24 hours"
              : "No agent activity in this range",
          description:
            "No inbound calls were handled by any agent in this window. Try a wider date range.",
        }}
      />
    </div>
  );
}
