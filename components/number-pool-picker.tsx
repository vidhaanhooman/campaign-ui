"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Phone, Search, X } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NUMBERS } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

const SURFACE_BG = { backgroundColor: "var(--card)" } as const;
const CARD = "rounded-lg border border-input shadow-xl shadow-black/40";

export function NumberPoolPicker({
  pool,
  onToggle,
  onClear,
  className,
}: {
  pool: string[];
  onToggle: (n: string) => void;
  onClear: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  // When the popover opens, scroll the trigger near the top of its scroll
  // container so the popover has room to expand downward and the user can
  // still scroll the page to reach anything below it.
  useEffect(() => {
    if (!open) return;
    const t = triggerRef.current;
    if (!t) return;
    const id = requestAnimationFrame(() => {
      t.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return NUMBERS;
    const q = query.replace(/\s/g, "").toLowerCase();
    return NUMBERS.filter((n) => n.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              ref={triggerRef}
              type="button"
              className={cn(
                "w-full min-h-8 flex items-center gap-2 rounded-lg border border-input bg-transparent dark:bg-secondary px-3 py-1.5 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 scroll-mt-6",
                className,
              )}
            />
          }
        >
          {pool.length === 0 ? (
            <>
              <Phone size={13} className="shrink-0 text-muted-foreground" />
              <span className="flex-1 text-muted-foreground">
                Select calling numbers
              </span>
            </>
          ) : (
            <>
              <span className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
                <span className="text-xs text-muted-foreground font-medium">
                  {pool.length} selected
                </span>
                {pool.slice(0, 3).map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-2 py-0.5 text-xs font-mono text-foreground"
                  >
                    {n}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(n);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          e.preventDefault();
                          onToggle(n);
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X size={11} />
                    </span>
                  </span>
                ))}
                {pool.length > 3 && (
                  <span className="text-xs font-mono text-muted-foreground">
                    +{pool.length - 3} more
                  </span>
                )}
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    onClear();
                  }
                }}
                className="text-xs text-muted-foreground hover:text-foreground px-1.5 shrink-0 cursor-pointer"
              >
                Clear
              </span>
            </>
          )}
          <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
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
              <Phone size={13} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Calling numbers
              </span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {pool.length}/{NUMBERS.length}
              </span>
            </div>
            <div className="p-2 border-b border-border">
              <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-2.5">
                <Search size={13} className="shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search numbers…"
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
            <div className="scroll-thin max-h-[200px] overflow-y-auto px-2 py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                  No numbers match &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map((n) => {
                  const checked = pool.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onToggle(n)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                        checked
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                      )}
                    >
                      <Checkbox checked={checked} />
                      <span className="flex-1 font-mono text-sm text-foreground">
                        {n}
                      </span>
                      {checked && (
                        <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                          In pool
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {pool.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  {pool.length === 1
                    ? "Single number — add more to rotate across attempts."
                    : `Rotated across all ${pool.length} numbers, one per attempt.`}
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
    </div>
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
      {checked && (
        <Check size={11} strokeWidth={3} />
      )}
    </span>
  );
}
