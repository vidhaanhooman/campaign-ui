"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

/* ── Interactive donut ───────────────────────────────────────────────── */

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}
function arcPath(
  cx: number,
  cy: number,
  rO: number,
  rI: number,
  start: number,
  end: number,
) {
  const large = end - start > 180 ? 1 : 0;
  const [x1, y1] = polar(cx, cy, rO, start);
  const [x2, y2] = polar(cx, cy, rO, end);
  const [x3, y3] = polar(cx, cy, rI, end);
  const [x4, y4] = polar(cx, cy, rI, start);
  return [
    `M ${x1} ${y1}`,
    `A ${rO} ${rO} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rI} ${rI} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

/**
 * Hover-interactive donut: hovering a slice (or legend row) dims the others and
 * shows that slice's name / share / count in the center. Matches the stats
 * "Dial disposition" donut.
 */
export function Donut({
  data,
  unit = "calls",
}: {
  data: { name: string; value: number }[];
  /** Noun shown after counts, e.g. "calls" / "dials". */
  unit?: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const [hover, setHover] = React.useState<string | null>(null);

  let cursor = 0;
  const segs = data.map((d, i) => {
    const start = cursor * 360;
    cursor += total ? d.value / total : 0;
    const end = cursor * 360;
    return {
      ...d,
      start,
      end,
      color: INSIGHT_RAMP[i] ?? INSIGHT_RAMP[INSIGHT_RAMP.length - 1],
    };
  });
  const active = hover ? segs.find((s) => s.name === hover) ?? null : null;

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-6">
      <div className="relative shrink-0">
        <svg
          viewBox="0 0 200 200"
          className="h-44 w-44"
          onMouseLeave={() => setHover(null)}
        >
          {segs.map((s) => {
            const dim = active !== null && active.name !== s.name;
            return (
              <path
                key={s.name}
                d={arcPath(100, 100, 95, 62, s.start, s.end)}
                fill={s.color}
                opacity={dim ? 0.25 : 1}
                style={{ transition: "opacity 120ms ease", cursor: "pointer" }}
                onMouseEnter={() => setHover(s.name)}
              >
                <title>{`${s.name}: ${Math.round((s.value / total) * 100)}%`}</title>
              </path>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {active ? (
            <>
              <div className="max-w-[110px] truncate text-[10px] text-muted-foreground">
                {active.name}
              </div>
              <div className="font-mono text-lg leading-tight tabular-nums text-foreground">
                {Math.round((active.value / total) * 100)}%
              </div>
              <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {active.value.toLocaleString()} {unit}
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] text-muted-foreground">total {unit}</div>
              <div className="font-mono text-lg leading-tight tabular-nums text-foreground">
                {total.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground">hover a slice</div>
            </>
          )}
        </div>
      </div>

      <ul
        className="flex flex-1 flex-col gap-1.5 text-xs"
        onMouseLeave={() => setHover(null)}
      >
        {segs.map((s) => {
          const dim = active !== null && active.name !== s.name;
          return (
            <li
              key={s.name}
              onMouseEnter={() => setHover(s.name)}
              className="flex cursor-pointer items-center gap-2 transition-opacity"
              style={{ opacity: dim ? 0.4 : 1 }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: s.color }}
              />
              <span className="flex-1 truncate text-muted-foreground">{s.name}</span>
              <span className="font-mono tabular-nums text-foreground">
                {Math.round((s.value / total) * 100)}%
              </span>
            </li>
          );
        })}
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
