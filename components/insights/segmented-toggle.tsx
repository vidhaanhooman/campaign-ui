"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption {
  value: string;
  label: string;
}

/** Segmented pill toggle — active option gets the white raised treatment. */
export function SegmentedToggle({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-8 items-center gap-0.5 rounded-md border border-border bg-secondary/30 p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-7 items-center rounded-[5px] px-3 text-xs transition-colors",
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
