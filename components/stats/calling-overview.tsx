"use client";

import { useState } from "react";
import { PieChart, Phone } from "lucide-react";

import { ATTEMPTS, DISPOSITION, fmtInt, fmtPct } from "@/lib/stats-data";
import { Panel } from "./ui";

const BLUE_RAMP = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "color-mix(in oklab, var(--foreground) 18%, transparent)",
];

/* ── Table: attempt-wise dials & connect rate ───────────────────────── */
function AttemptsTable() {
  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <colgroup>
        <col className="w-[18%]" />
        <col className="w-[14%]" />
        <col className="w-[14%]" />
        <col />
      </colgroup>
      <thead>
        <tr className="text-[10px] text-muted-foreground">
          <th className="pb-2.5 pr-3 text-left font-medium">Attempt</th>
          <th className="px-3 pb-2.5 text-right font-medium">Dials</th>
          <th className="px-3 pb-2.5 text-right font-medium">Connected</th>
          <th className="pb-2.5 pl-3 text-left font-medium">Connect rate</th>
        </tr>
      </thead>
      <tbody>
        {ATTEMPTS.map((r) => (
          <tr key={r.attempt} className="border-t border-border">
            <td className="py-3 pr-3 text-muted-foreground">attempt {r.attempt}</td>
            <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
              {fmtInt(r.dials)}
            </td>
            <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
              {fmtInt(r.connected)}
            </td>
            <td className="py-3 pl-3">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${r.connectRate * 100}%`,
                      backgroundColor: "var(--chart-1)",
                    }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right font-mono tabular-nums text-foreground">
                  {fmtPct(r.connectRate, 0)}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Donut: dial disposition ────────────────────────────────────────── */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}
function arcPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  const large = end - start > 180 ? 1 : 0;
  const [x1, y1] = polar(cx, cy, rOuter, start);
  const [x2, y2] = polar(cx, cy, rOuter, end);
  const [x3, y3] = polar(cx, cy, rInner, end);
  const [x4, y4] = polar(cx, cy, rInner, start);
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

function DispositionDonut() {
  const totalDials = ATTEMPTS.reduce((s, a) => s + a.dials, 0);
  const sorted = [...DISPOSITION].sort((a, b) => b.pct - a.pct);
  const [hovered, setHovered] = useState<string | null>(null);

  let cursor = 0;
  const segs = sorted.map((d, i) => {
    const start = cursor * 360;
    cursor += d.pct;
    const end = cursor * 360;
    return {
      ...d,
      start,
      end,
      color: BLUE_RAMP[i] ?? BLUE_RAMP[BLUE_RAMP.length - 1],
      count: Math.round(d.pct * totalDials),
    };
  });

  const active = hovered ? segs.find((s) => s.label === hovered) ?? null : null;

  return (
    <div className="flex w-full items-center gap-6">
      {/* Donut on the left with center readout */}
      <div className="relative shrink-0">
        <svg
          viewBox="0 0 200 200"
          className="h-48 w-48"
          onMouseLeave={() => setHovered(null)}
        >
          {segs.map((s) => {
            const dim = active !== null && active.label !== s.label;
            return (
              <path
                key={s.label}
                d={arcPath(100, 100, 95, 65, s.start, s.end)}
                fill={s.color}
                opacity={dim ? 0.2 : 1}
                style={{
                  transition: "opacity 120ms ease",
                  transformOrigin: "100px 100px",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(s.label)}
              >
                <title>{`${s.label}: ${fmtPct(s.pct, 0)} · ${fmtInt(s.count)}`}</title>
              </path>
            );
          })}
        </svg>

        {/* Center readout */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {active ? (
            <>
              <div className="max-w-[110px] truncate text-[10px] text-muted-foreground">
                {active.label}
              </div>
              <div className="font-mono text-lg leading-tight tabular-nums text-foreground">
                {fmtPct(active.pct, 0)}
              </div>
              <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {fmtInt(active.count)} dials
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] text-muted-foreground">total dials</div>
              <div className="font-mono text-lg leading-tight tabular-nums text-foreground">
                {fmtInt(totalDials)}
              </div>
              <div className="text-[10px] text-muted-foreground">hover a slice</div>
            </>
          )}
        </div>
      </div>

      {/* Legend on the right — single-column vertical stack */}
      <ul
        className="flex flex-1 flex-col gap-1.5 text-xs"
        onMouseLeave={() => setHovered(null)}
      >
        {segs.map((s) => {
          const dim = active !== null && active.label !== s.label;
          return (
            <li
              key={s.label}
              onMouseEnter={() => setHovered(s.label)}
              className="flex cursor-pointer items-center gap-1.5 transition-opacity"
              style={{ opacity: dim ? 0.4 : 1 }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="flex-1 truncate text-muted-foreground">{s.label}</span>
              <span className="font-mono tabular-nums text-foreground">
                {fmtPct(s.pct, 0)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CallingOverview() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel
        title="Attempt-wise dials & connect rate"
        icon={<Phone size={14} />}
      >
        <AttemptsTable />
      </Panel>

      <Panel
        title="Dial disposition"
        icon={<PieChart size={14} />}
      >
        <DispositionDonut />
      </Panel>
    </div>
  );
}
