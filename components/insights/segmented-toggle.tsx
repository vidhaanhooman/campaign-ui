"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SegmentOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
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
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex h-7 items-center justify-center gap-1.5 rounded-[5px] px-3 text-xs transition-colors",
              active
                ? "bg-foreground text-background shadow-sm"
                : opt.disabled
                  ? "cursor-not-allowed text-muted-foreground/30"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon size={13} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
