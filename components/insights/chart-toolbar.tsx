"use client";

import * as React from "react";

import {
  DateRangePicker,
  type StatsRange,
} from "@/components/stats/date-range-picker";
import { AgentPicker } from "./agent-picker";

/** Toolbar for enlarged chart views — mirrors the main page filters (date + agent). */
export function ChartToolbar() {
  const [range, setRange] = React.useState<StatsRange | undefined>(undefined);
  const [agentId, setAgentId] = React.useState("");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangePicker value={range} onChange={setRange} defaultPreset="7d" />
      <AgentPicker agentId={agentId} onChange={setAgentId} />
    </div>
  );
}
