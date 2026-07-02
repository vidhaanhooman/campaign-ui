"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { LineSeriesDef } from "../charts";

/**
 * Enlarged view for a line panel — per-series totals with peak, the full-size
 * line chart, and a period breakdown table.
 */
export function LineDetailView({
  data,
  series,
}: {
  data: Record<string, string | number>[];
  series: LineSeriesDef[];
}) {
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;

  const tiles = series.map((s) => {
    const vals = data.map((d) => Number(d[s.key]) || 0);
    const total = vals.reduce((a, b) => a + b, 0);
    return {
      label: `Total ${s.label}`,
      value: total.toLocaleString(),
      sub: `peak ${Math.max(...vals, 0)}`,
    };
  });
  const tableRows = data.filter((d) => String(d.label ?? "").trim() !== "");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
      {/* Total tiles */}
      <div className="grid grid-cols-2 divide-x divide-border rounded-lg border border-border bg-card sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="px-5 py-4">
            <p className="truncate text-[10px] font-medium text-muted-foreground">
              {t.label}
            </p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-lg leading-none tabular-nums text-foreground">
                {t.value}
              </span>
              {t.sub && (
                <span className="text-xs text-muted-foreground">{t.sub}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Full-size line chart */}
      <div className="rounded-xl border border-border p-4">
        <ChartContainer config={config} className="aspect-auto h-[340px] w-full">
          <LineChart data={data} margin={{ top: 12, right: 16, left: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
            />
            <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                type="monotone"
                stroke={s.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>

      {/* Period breakdown table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Period</th>
              {series.map((s) => (
                <th key={s.key} className="px-4 py-2 text-right font-medium">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((d, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2 text-foreground">{String(d.label)}</td>
                {series.map((s) => (
                  <td
                    key={s.key}
                    className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground"
                  >
                    {Number(d[s.key]) || 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
