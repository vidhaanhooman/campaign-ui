"use client";

import { useState } from "react";
import { Info, SlidersHorizontal } from "lucide-react";

import { NumberStepper } from "@/components/number-stepper";
import {
  PRIORITY_LEVELS,
  PRIORITY_MAX,
  PRIORITY_MIN,
} from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

const isPreset = (v: number) => PRIORITY_LEVELS.some((l) => l.value === v);

function LevelButtons({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border-strong bg-surface-2 p-0.5">
      {PRIORITY_LEVELS.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => onChange(l.value)}
          className={cn(
            "h-7 rounded-md px-3 text-xs transition-colors",
            value === l.value
              ? "bg-white text-black shadow-sm"
              : "text-text-dim hover:text-text",
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
}: {
  priority: number;
  setPriority: (v: number) => void;
  retries: number;
  prioMode: "all" | "perAttempt";
  setPrioMode: (m: "all" | "perAttempt") => void;
  getAttemptPrio: (i: number) => number;
  setAttemptPrio: (i: number, v: number) => void;
}) {
  // Open straight into Advanced if the current value isn't a preset.
  const [advanced, setAdvanced] = useState(() => !isPreset(priority));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text">Priority</div>
        <span className="group relative inline-flex">
          <Info size={13} className="cursor-help text-text-muted hover:text-text" />
          <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 w-56 -translate-x-1/2 rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-[11px] leading-relaxed text-text-dim opacity-0 shadow-xl shadow-black/40 transition-opacity group-hover:opacity-100">
            Select a preset level, or switch to Advanced to set a precise
            priority value from 1 to 10.
          </span>
        </span>
        <button
          type="button"
          onClick={() =>
            setAdvanced((a) => {
              const next = !a;
              if (!next && !isPreset(priority)) setPriority(5);
              return next;
            })
          }
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border-strong px-2.5 py-1 text-xs text-text-dim transition-colors hover:border-text-muted/40 hover:text-text"
        >
          <SlidersHorizontal size={12} />
          {advanced ? "Use presets" : "Advanced"}
        </button>
      </div>

      <div className="flex flex-col items-start gap-2">
        {retries > 1 && (
          <div className="inline-flex items-center rounded-md border border-border-strong bg-surface-2 p-0.5">
            {(
              [
                { v: "all", label: "Same for all" },
                { v: "perAttempt", label: "Per attempt" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setPrioMode(o.v)}
                className={cn(
                  "h-7 rounded-md px-3 text-xs transition-colors",
                  prioMode === o.v
                    ? "bg-white text-black shadow-sm"
                    : "text-text-dim hover:text-text",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {prioMode === "all" || retries <= 1 ? (
          advanced ? (
            <NumberStepper
              value={priority}
              onChange={setPriority}
              min={PRIORITY_MIN}
              max={PRIORITY_MAX}
              className="w-28"
            />
          ) : (
            <LevelButtons value={priority} onChange={setPriority} />
          )
        ) : (
          <div className="space-y-2">
            {Array.from({ length: retries }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-text-muted">
                  attempt {i + 1}
                </span>
                {advanced ? (
                  <NumberStepper
                    value={getAttemptPrio(i)}
                    onChange={(v) => setAttemptPrio(i, v)}
                    min={PRIORITY_MIN}
                    max={PRIORITY_MAX}
                    className="w-24"
                  />
                ) : (
                  <LevelButtons
                    value={getAttemptPrio(i)}
                    onChange={(v) => setAttemptPrio(i, v)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs leading-relaxed text-text-muted">
        Orders this task against every other task across all campaigns. Higher
        priority runs sooner.
        {retries > 1 && prioMode === "perAttempt"
          ? " A later retry can be prioritized ahead of new tasks."
          : ""}
      </div>
    </div>
  );
}
