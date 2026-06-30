"use client";

import { RT_OPS } from "@/lib/stats-data";

export function OpsStrip() {
  return (
    <div className="grid grid-cols-2 divide-x divide-border rounded-xl border border-border bg-card sm:grid-cols-4">
      {RT_OPS.map((k) => (
        <div key={k.label} className="px-5 py-4">
          <div className="text-[10px] font-medium text-muted-foreground">
            {k.label}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-lg leading-none tabular-nums text-foreground">
              {k.value}
            </span>
            {k.suffix && (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {k.suffix}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}
