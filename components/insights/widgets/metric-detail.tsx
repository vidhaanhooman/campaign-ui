"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  useAttemptWise,
  useGrouped,
  useNumberWise,
  usePickupByTime,
} from "@/lib/insights/hooks";
import type { TimeRange } from "@/lib/insights/types";
import { cn } from "@/lib/utils";
import { INSIGHT_RAMP } from "../charts";
import { Skeleton } from "../skeleton";

/** Titled surface used for each detail sub-panel. */
function DetailCard({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <header className="border-b border-border px-5 py-3">
        <span className="text-sm font-medium text-foreground">{title}</span>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function MetricDetail({
  label,
  range,
  refreshKey,
  full = false,
}: {
  label: string;
  range: TimeRange;
  refreshKey: number;
  /** Show the fuller 5-panel layout (adds Outcome pie + Agent bar). */
  full?: boolean;
}) {
  const numbers = useNumberWise(range, refreshKey);
  const attempts = useAttemptWise(range, refreshKey);
  const byTime = usePickupByTime(range, refreshKey);
  const outcome = useGrouped("outcome", range, refreshKey);
  const agents = useGrouped("agent", range, refreshKey);

  const barConfig = { pickup: { label, color: "var(--chart-1)" } } satisfies ChartConfig;
  const lineConfig = { value: { label, color: "var(--chart-1)" } } satisfies ChartConfig;

  return (
    <div className="space-y-3.5">
      <div className="grid gap-3.5 lg:grid-cols-2">
        <DetailCard title={`Number Wise ${label}`}>
          {numbers.loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="scroll-thin max-h-[300px] overflow-y-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="py-2 pr-3 text-left font-medium">callInfo.from</th>
                    <th className="px-3 py-2 text-right font-medium">Pickup Rate (%)</th>
                    <th className="py-2 pl-3 text-right font-medium">Calls</th>
                  </tr>
                </thead>
                <tbody>
                  {numbers.data.map((r) => (
                    <tr key={r.from} className="border-t border-border">
                      <td className="py-2 pr-3 font-mono text-xs text-foreground">
                        {r.from}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                        {r.pickup}
                      </td>
                      <td className="py-2 pl-3 text-right font-mono tabular-nums text-foreground">
                        {r.calls}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DetailCard>

        <DetailCard title={`Attempt Wise ${label}`}>
          {attempts.loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ChartContainer config={barConfig} className="aspect-auto h-[300px] w-full">
              <BarChart data={attempts.data} margin={{ top: 8, right: 12, left: -12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="attempt" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={36} domain={[0, 100]} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="pickup" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={64} />
              </BarChart>
            </ChartContainer>
          )}
        </DetailCard>
      </div>

      {full && (
        <div className="grid gap-3.5 lg:grid-cols-2">
          <DetailCard title="Outcome Wise">
            {outcome.loading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <ChartContainer
                config={{ value: { label: "Calls" } } satisfies ChartConfig}
                className="mx-auto aspect-square h-[260px]"
              >
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={outcome.data} dataKey="value" nameKey="name" outerRadius={96} stroke="0">
                    {outcome.data.map((_, i) => (
                      <Cell key={i} fill={INSIGHT_RAMP[i % 5]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </DetailCard>

          <DetailCard title="Agent Wise">
            {agents.loading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <ChartContainer
                config={{ value: { label: "Calls", color: "var(--chart-1)" } } satisfies ChartConfig}
                className="aspect-auto h-[260px] w-full"
              >
                <BarChart data={agents.data} layout="vertical" margin={{ top: 4, right: 16, left: 4 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tickMargin={6}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={26}>
                    {agents.data.map((_, i) => (
                      <Cell key={i} fill={INSIGHT_RAMP[i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </DetailCard>
        </div>
      )}

      <DetailCard title={`${label} By Time`}>
        {byTime.loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : (
          <ChartContainer config={lineConfig} className="aspect-auto h-[240px] w-full">
            <LineChart data={byTime.data} margin={{ top: 8, right: 12, left: -12 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} width={36} domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="value" name={label} type="monotone" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        )}
      </DetailCard>
    </div>
  );
}
