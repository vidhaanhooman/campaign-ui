"use client";

import type { RtWindowKey } from "@/lib/stats-data";
import { cn } from "@/lib/utils";

const WINDOWS: { value: RtWindowKey; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "lifetime", label: "Lifetime" },
];

export function WindowSelector({
  value,
  onChange,
}: {
  value: RtWindowKey;
  onChange: (v: RtWindowKey) => void;
}) {
  return (
    <div className="inline-flex h-7 items-center gap-0.5 rounded-md border border-border bg-secondary/30 p-0.5">
      {WINDOWS.map((w) => {
        const active = value === w.value;
        return (
          <button
            key={w.value}
            type="button"
            onClick={() => onChange(w.value)}
            className={cn(
              "inline-flex h-6 items-center rounded-[5px] px-2.5 text-xs transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {w.label}
          </button>
        );
      })}
    </div>
  );
}
