"use client";

import { NumberStepper } from "@/components/number-stepper";
import {
  PRIORITY_LEVELS,
  PRIORITY_MAX,
  PRIORITY_MIN,
} from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

function LevelButtons({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="inline-flex h-8 items-center gap-1 rounded-xl border border-sidebar-border/30 bg-secondary p-1">
      {PRIORITY_LEVELS.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => onChange(l.value)}
          className={cn(
            "inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium transition-colors",
            value === l.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function PriorityField({
  priority,
  setPriority,
  retries,
  prioMode,
  setPrioMode,
  getAttemptPrio,
  setAttemptPrio,
  hideLabel = false,
}: {
  priority: number;
  setPriority: (v: number) => void;
  retries: number;
  prioMode: "all" | "perAttempt";
  setPrioMode: (m: "all" | "perAttempt") => void;
  getAttemptPrio: (i: number) => number;
  setAttemptPrio: (i: number, v: number) => void;
  /** Hide the built-in "Priority" heading (when a parent already labels it). */
  hideLabel?: boolean;
}) {
  return (
    <div className="space-y-2">
      {!hideLabel && (
        <div className="text-sm font-medium text-foreground">Priority</div>
      )}

      <div className="flex flex-col items-start gap-2">
        {retries > 1 && (
          <div className="inline-flex h-8 items-center gap-1 rounded-xl border border-sidebar-border/30 bg-secondary p-1">
            {(
              [
                { v: "all", label: "All attempts" },
                { v: "perAttempt", label: "Per attempt" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setPrioMode(o.v)}
                className={cn(
                  "inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium transition-colors",
                  prioMode === o.v
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {prioMode === "all" || retries <= 1 ? (
          // Same level applied to every attempt — chosen by label.
          <LevelButtons value={priority} onChange={setPriority} />
        ) : (
          // Per-attempt fine-tuning — exact numeric rank.
          <div className="space-y-2">
            {Array.from({ length: retries }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-muted-foreground">
                  attempt {i + 1}
                </span>
                <NumberStepper
                  value={getAttemptPrio(i)}
                  onChange={(v) => setAttemptPrio(i, v)}
                  min={PRIORITY_MIN}
                  max={PRIORITY_MAX}
                  className="w-24"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs leading-relaxed text-muted-foreground">
        Higher priority runs sooner across all campaigns.
      </div>
    </div>
  );
}
