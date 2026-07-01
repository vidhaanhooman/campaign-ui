"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
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

/** Shared blue ramp — the only palette insights charts draw from. */
export const INSIGHT_RAMP = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "color-mix(in oklab, var(--foreground) 18%, transparent)",
];

/* ── Multi-series line chart ─────────────────────────────────────────── */

export type LineSeriesDef = { key: string; label: string; color: string };

export function MultiLineChart({
  data,
  series,
  height = 260,
}: {
  data: Record<string, string | number>[];
  series: LineSeriesDef[];
  height?: number;
}) {
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;

  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height }}
    >
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={24}
        />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

/* ── Donut ───────────────────────────────────────────────────────────── */

export function Donut({
  data,
  centerLabel = "total",
}: {
  data: { name: string; value: number }[];
  centerLabel?: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);

  const config = Object.fromEntries([
    ["value", { label: "Calls" }],
    ...data.map((d, i) => [d.name, { label: d.name, color: INSIGHT_RAMP[i % 5] }]),
  ]) satisfies ChartConfig;

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-6">
      <ChartContainer config={config} className="aspect-square h-44 shrink-0">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={86}
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={INSIGHT_RAMP[i % 5]} />
            ))}
            <Label
              content={({ viewBox }) =>
                viewBox && "cx" in viewBox ? (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      className="fill-foreground text-lg font-medium"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      dy={18}
                      className="fill-muted-foreground text-[10px]"
                    >
                      {centerLabel}
                    </tspan>
                  </text>
                ) : null
              }
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="flex flex-1 flex-col gap-1.5 text-xs">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: INSIGHT_RAMP[i % 5] }}
            />
            <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
            <span className="font-mono tabular-nums text-foreground">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Vertical bar chart ──────────────────────────────────────────────── */

export function Bars({
  data,
  height = 240,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  const config = { value: { label: "Count", color: "var(--chart-1)" } } satisfies ChartConfig;
  if (!data.length) {
    return (
      <div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ChartContainer>
  );
}
