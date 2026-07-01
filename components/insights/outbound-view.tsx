"use client";

import { Clock, Percent, PhoneCall, PhoneOutgoing } from "lucide-react";

import {
  useAgentTable,
  useGrouped,
  useOutboundSummary,
  useSeries,
} from "@/lib/insights/hooks";
import { formatValue } from "@/lib/insights/resolver";
import type { TimeRange } from "@/lib/insights/types";
import { INSIGHT_RAMP } from "./charts";
import { LinePanel, PiePanel, TablePanel } from "./panels";
import { StatCards } from "./sections";
import { MetricDeepDive } from "./widgets/metric-deep-dive";

export function OutboundView({
  range,
  refreshKey,
  onEdit,
}: {
  range: TimeRange;
  refreshKey: number;
  onEdit?: () => void;
}) {
  const summary = useOutboundSummary(range, refreshKey);
  const series = useSeries(range, refreshKey);
  const outcome = useGrouped("outcome", range, refreshKey);
  const endReason = useGrouped("callInfo.endReason", range, refreshKey);
  const agents = useAgentTable(range, refreshKey);

  const d = summary.data;
  const stats = [
    { label: "Calls Attempted", icon: PhoneOutgoing, value: formatValue(d.attempted, "count"), breakdown: true },
    { label: "Calls Connected", icon: PhoneCall, value: formatValue(d.connected, "count"), breakdown: true },
    { label: "Avg Duration", icon: Clock, value: formatValue(d.avgDur, "duration"), breakdown: false },
    { label: "Pickup Rate", icon: Percent, value: formatValue(d.pickup, "percent"), breakdown: false, fullDetail: true },
  ];

  return (
    <div className="space-y-3.5 p-5">
      <StatCards items={stats} range={range} refreshKey={refreshKey} />

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <LinePanel
          className="lg:col-span-2"
          onEdit={onEdit}
          title="Calls Attempted & Connected"
          loading={series.loading}
          data={series.data as unknown as Record<string, string | number>[]}
          series={[
            { key: "Attempted", label: "Attempted", color: INSIGHT_RAMP[0] },
            { key: "Connected", label: "Connected", color: INSIGHT_RAMP[1] },
          ]}
          enlargedContent={
            <MetricDeepDive
              metric="calls"
              label="Calls Attempted & Connected"
              range={range}
              refreshKey={refreshKey}
            />
          }
        />
        <PiePanel
          onEdit={onEdit}
          title="Outcome Wise Connected Calls"
          loading={outcome.loading}
          data={outcome.data}
        />
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <PiePanel
          onEdit={onEdit}
          title="End Reason Wise Count"
          loading={endReason.loading}
          data={endReason.data}
        />
        <TablePanel
          className="lg:col-span-2"
          onEdit={onEdit}
          title="Agent Wise Data"
          loading={agents.loading}
          columns={[
            { key: "agent", label: "Agent" },
            { key: "calls", label: "Calls", numeric: true },
            { key: "connected", label: "Connected", numeric: true },
            { key: "pickup", label: "Pickup Rate (%)", numeric: true },
            { key: "avgdur", label: "Avg Duration (s)", numeric: true },
          ]}
          rows={agents.data}
        />
      </div>
    </div>
  );
}
