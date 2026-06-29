"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Flag, PhoneCall, PhoneOff, Search, X } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OUTCOME_COLORS, OUTCOME_GROUPS } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

const SURFACE_BG = { backgroundColor: "var(--card)" } as const;
const CARD = "rounded-lg border border-input shadow-xl shadow-black/40";

const TOTAL = OUTCOME_GROUPS.reduce((s, g) => s + g.outcomes.length, 0);

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
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OUTCOME_GROUPS.map((g) => ({
      ...g,
      rows: q ? g.outcomes.filter((o) => o.toLowerCase().includes(q)) : g.outcomes,
    })).filter((g) => g.rows.length > 0);
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "w-full min-h-8 flex items-center gap-2 rounded-lg border border-input bg-transparent dark:bg-secondary px-3 py-1.5 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              className,
            )}
          />
        }
      >
        {outcomes.length === 0 ? (
          <span className="flex-1 text-muted-foreground">Add outcomes</span>
        ) : (
          <span className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
            {outcomes.slice(0, 3).map((o) => (
              <span
                key={o}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-2 py-0.5 text-xs font-mono text-foreground"
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
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={11} />
                </span>
              </span>
            ))}
            {outcomes.length > 3 && (
              <span className="text-xs font-mono text-muted-foreground">
                +{outcomes.length - 3} more
              </span>
            )}
          </span>
        )}
        <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
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
        className={cn(CARD, "w-(--anchor-width) max-w-[calc(100vw-2rem)] overflow-hidden p-0")}
      >
        <div className="flex flex-col">
          <div className="px-4 h-11 flex items-center gap-2 border-b border-border">
            <Flag size={13} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Retry outcomes</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {outcomes.length}/{TOTAL}
            </span>
          </div>

          <div className="p-2 border-b border-border">
            <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-secondary px-2.5">
              <Search size={13} className="shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search outcomes…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="scroll-thin max-h-[300px] overflow-y-auto">
            {groups.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                No outcomes match &ldquo;{query}&rdquo;
              </div>
            ) : (
              groups.map((group, gi) => (
                <div key={group.label}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2",
                      gi > 0 && "border-t border-border",
                    )}
                  >
                    {group.label === "Connected" ? (
                      <PhoneCall size={12} className="text-muted-foreground" />
                    ) : (
                      <PhoneOff size={12} className="text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">
                      {group.label}
                    </span>
                  </div>
                  <div className="px-2 pb-2">
                    {group.rows.map((o) => {
                      const checked = outcomes.includes(o);
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => onToggle(o)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-md px-3 py-1.5 text-left transition-colors",
                            checked
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                          )}
                        >
                          <Checkbox checked={checked} />
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              OUTCOME_COLORS[o] ?? "bg-muted-foreground",
                            )}
                          />
                          <span className="flex-1 font-mono text-sm text-foreground">
                            {o}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {outcomes.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="text-xs text-muted-foreground">
                {outcomes.length} extra outcome{outcomes.length === 1 ? "" : "s"}{" "}
                will trigger a retry
              </span>
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-muted-foreground hover:text-foreground"
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
        checked ? "border-white bg-primary text-primary-foreground" : "border-input",
      )}
    >
      {checked && <Check size={11} strokeWidth={3} />}
    </span>
  );
}
