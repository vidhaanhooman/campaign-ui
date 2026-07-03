"use client";

import { PhoneCall } from "lucide-react";

import { CALL_PERF_KPIS } from "@/lib/stats-data";
import { InfoHint } from "./info-hint";
import { Panel } from "./ui";

export function CallPerformance() {
  return (
    <Panel
      title="Call performance"
      icon={<PhoneCall size={14} />}
      action={
        <span className="text-xs text-muted-foreground">human-answered only</span>
      }
      bodyClassName="px-0 pb-5"
    >
      {/* KPI list — same table treatment as other sections */}
      <table className="w-full border-collapse text-sm">
        <colgroup>
          <col className="w-[38%]" />
          <col className="w-[22%]" />
          <col />
        </colgroup>
        <tbody>
          {CALL_PERF_KPIS.map((k) => (
            <tr
              key={k.label}
              className="border-b border-white/10 transition-colors last:border-0 hover:bg-secondary/40"
            >
              <td className="py-2 pl-5 pr-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {k.label}
                  {"hint" in k && k.hint && <InfoHint>{k.hint}</InfoHint>}
                </span>
              </td>
              <td className="py-2 pr-3 font-mono text-sm font-semibold tabular-nums text-foreground">
                {k.value}
              </td>
              <td className="py-2 pr-5 text-sm text-muted-foreground">{k.sub}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
