"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { STAT_CAMPAIGN } from "@/lib/stats-data";
import { CallingOverview } from "@/components/stats/calling-overview";
import { CallPerformance } from "@/components/stats/call-performance";
import { ConversionFunnel } from "@/components/stats/conversion-funnel";
import { TaskLifecycle } from "@/components/stats/task-lifecycle";
import { AgentCompare } from "@/components/stats/agent-compare";
import { StatsTypeTabs } from "@/components/stats/type-tabs";

const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"];

export default function StatsPage() {
  const [range, setRange] = useState("Last 30 days");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link
              href="/campaigns"
              className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft size={15} />
            </Link>
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Megaphone size={12} /> Campaign performance
              </div>
              <h1 className="text-lg font-medium tracking-tight text-foreground">
                {STAT_CAMPAIGN.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {STAT_CAMPAIGN.agentName}{" "}
                <span className="font-mono text-xs">· {STAT_CAMPAIGN.agentId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatsTypeTabs />
            <Badge variant="secondary" className="gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Running
            </Badge>
            <Select value={range} onValueChange={(v) => v && setRange(v)}>
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
    </div>
  );
}
