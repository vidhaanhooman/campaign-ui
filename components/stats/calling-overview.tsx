"use client";

import { Phone } from "lucide-react";

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
  const totalDials = ATTEMPTS.reduce((s, a) => s + a.dials, 0);
  const totalConnected = ATTEMPTS.reduce((s, a) => s + a.connected, 0);
  const totalRate = totalConnected / totalDials;

  let cum = 0;
  const rows = ATTEMPTS.map((a) => {
    cum += a.connected;
    return { ...a, cumulative: cum / totalConnected };
  });

  // Scroll the row area if the campaign has many attempts (≥ 6).
  const scroll = ATTEMPTS.length > 5;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-secondary/30 text-left text-[10px] text-muted-foreground">
            <th className="py-2.5 pl-4 pr-3 font-medium">Attempt</th>
            <th className="px-3 py-2.5 text-right font-medium">Dials</th>
            <th className="px-3 py-2.5 text-right font-medium">Connected</th>
            <th className="px-3 py-2.5 text-left font-medium">Connect rate</th>
            <th className="py-2.5 pl-3 pr-4 text-right font-medium">Cumulative</th>
          </tr>
        </thead>
      </table>

      <div
        className={
          scroll ? "scroll-thin max-h-[260px] overflow-y-auto" : undefined
        }
      >
        <table className="w-full border-collapse text-sm">
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.attempt}
                className={i > 0 || scroll ? "border-t border-border" : ""}
              >
                <td className="py-3 pl-4 pr-3 text-muted-foreground">attempt {r.attempt}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
                  {fmtInt(r.dials)}
                </td>
                <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
                  {fmtInt(r.connected)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-52 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.connectRate * 100}%`,
                          backgroundColor: "var(--chart-1)",
                        }}
                      />
                    </div>
                    <span className="font-mono tabular-nums text-foreground">
                      {fmtPct(r.connectRate, 0)}
                    </span>
                  </div>
                </td>
                <td className="py-3 pl-3 pr-4 text-right font-mono tabular-nums text-muted-foreground">
                  {fmtPct(r.cumulative, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr className="border-t border-border bg-secondary/30">
            <td className="py-3 pl-4 pr-3 text-[10px] text-muted-foreground">
              Total
            </td>
            <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
              {fmtInt(totalDials)}
            </td>
            <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
              {fmtInt(totalConnected)}
            </td>
            <td className="px-3 py-3 font-mono tabular-nums text-foreground">
              {fmtPct(totalRate, 0)}
            </td>
            <td className="py-3 pl-3 pr-4 text-right font-mono tabular-nums text-foreground">
              100%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
  const sorted = [...DISPOSITION].sort((a, b) => b.pct - a.pct);
  let cursor = 0;
  const segs = sorted.map((d, i) => {
    const start = cursor * 360;
    cursor += d.pct;
    const end = cursor * 360;
    return { ...d, start, end, color: BLUE_RAMP[i] ?? BLUE_RAMP[BLUE_RAMP.length - 1] };
  });

  return (
    <div className="flex w-full items-center gap-6">
      <svg viewBox="0 0 200 200" className="h-52 w-52 shrink-0">
        {segs.map((s) => (
          <path
            key={s.label}
            d={arcPath(100, 100, 95, 65, s.start, s.end)}
            fill={s.color}
          >
            <title>{`${s.label}: ${fmtPct(s.pct, 0)}`}</title>
          </path>
        ))}
      </svg>
      <ul className="flex-1 space-y-1.5 text-xs">
        {segs.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate text-muted-foreground">{s.label}</span>
            <span className="font-mono tabular-nums text-foreground">{fmtPct(s.pct, 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CallingOverview() {
  return (
    <Panel
      title="Calling overview"
      icon={<Phone size={14} />}
      action={<span className="text-xs text-muted-foreground">last 30 days</span>}
    >
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="mb-3 text-xs text-muted-foreground">
            Attempt-wise dials &amp; connect rate
          </div>
          <AttemptsTable />
        </div>
        <div className="flex flex-col">
          <div className="mb-3 text-xs text-muted-foreground">
            Dial disposition · sums to 100%
          </div>
          <div className="flex flex-1 items-center">
            <DispositionDonut />
          </div>
        </div>
      </div>
    </Panel>
  );
}
