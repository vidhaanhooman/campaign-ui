"use client";

import { useState } from "react";
import { ChevronDown, PhoneOff, PhoneCall, X } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OUTCOME_GROUPS } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

const SURFACE_BG = { backgroundColor: "var(--surface)" } as const;
const CARD = "rounded-lg border border-border-strong shadow-xl shadow-black/40";

export function OutcomePicker({
  outcomes,
  onToggle,
  onClear,
  className,
}: {
  outcomes: string[];
  onToggle: (o: string) => void;
  onClear: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const total = OUTCOME_GROUPS.reduce((s, g) => s + g.outcomes.length, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "max-w-full min-w-[260px] w-fit min-h-9 flex items-center gap-2 rounded-md border border-border-strong bg-surface-2 px-3 py-1.5 text-left text-sm transition-colors hover:border-text-muted/40 focus:border-white outline-none",
              className,
            )}
          />
        }
      >
        {outcomes.length === 0 ? (
          <span className="flex-1 text-text-muted">
            Add more outcomes…
          </span>
        ) : (
          <span className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              +{outcomes.length}
            </span>
            {outcomes.slice(0, 3).map((o) => (
              <span
                key={o}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2 py-0.5 text-xs font-mono text-text"
              >
                {o}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(o);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      e.preventDefault();
                      onToggle(o);
                    }
                  }}
                  className="text-text-muted hover:text-text cursor-pointer"
                >
                  <X size={11} />
                </span>
              </span>
            ))}
            {outcomes.length > 3 && (
              <span className="text-xs font-mono text-text-muted">
                +{outcomes.length - 3} more
              </span>
            )}
          </span>
        )}
        <ChevronDown size={14} className="shrink-0 text-text-muted" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={16}
        collisionAvoidance={{
          side: "flip",
          align: "shift",
          fallbackAxisSide: "end",
        }}
        style={SURFACE_BG}
        className={cn(CARD, "w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden p-0")}
      >
        <div className="flex flex-col">
          <div className="px-4 h-11 flex items-center gap-2 border-b border-border">
            <span className="text-[13px] font-semibold text-text">
              Additional outcomes
            </span>
            <span className="ml-auto font-mono text-[11px] text-text-muted">
              {outcomes.length}/{total}
            </span>
          </div>

          <div className="scroll-thin max-h-[300px] overflow-y-auto">
            {OUTCOME_GROUPS.map((group, gi) => (
              <div key={group.label}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2",
                    gi > 0 && "border-t border-border",
                  )}
                >
                  {group.label === "Connected" ? (
                    <PhoneCall size={12} className="text-text-muted" />
                  ) : (
                    <PhoneOff size={12} className="text-text-muted" />
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                    {group.label}
                  </span>
                  <span className="text-[11px] text-text-muted ml-1">
                    · {group.description}
                  </span>
                </div>
                <div className="px-2 pb-2">
                  {group.outcomes.map((o) => {
                    const checked = outcomes.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => onToggle(o)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-md px-3 py-1.5 text-left transition-colors",
                          checked
                            ? "bg-surface-2 text-text"
                            : "text-text-dim hover:bg-surface-2/60 hover:text-text",
                        )}
                      >
                        <Checkbox checked={checked} />
                        <span className="flex-1 font-mono text-sm text-text">
                          {o}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {outcomes.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="text-[11px] text-text-muted">
                {outcomes.length} outcome{outcomes.length === 1 ? "" : "s"}{" "}
                will trigger a retry
              </span>
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] text-text-dim hover:text-text"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
        checked ? "border-white bg-white text-black" : "border-border-strong",
      )}
    >
      {checked && (
        <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
          <path d="M7.629 13.314 4.314 10l-1.057 1.057 4.372 4.371 9.114-9.114-1.057-1.057z" />
        </svg>
      )}
    </span>
  );
}
