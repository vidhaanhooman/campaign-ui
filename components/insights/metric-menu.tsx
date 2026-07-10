"use client";

import * as React from "react";
import { Check, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { METRICS, METRIC_CATEGORIES } from "@/lib/insights/registry";
import { cn } from "@/lib/utils";

/** "Add metric" → searchable, categorized metric list → emits a metric id. */
export function MetricMenu({
  selected,
  onAdd,
  anchor,
}: {
  selected: string[];
  onAdd: (id: string) => void;
  anchor?: React.RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const change = (v: boolean) => {
    if (!v) setQuery("");
    setOpen(v);
  };

  const filtered = METRICS.filter(
    (m) =>
      !query.trim() ||
      m.label.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={change}>
      <PopoverTrigger
        render={
          <Button type="button" variant="ghost" size="sm" className="w-fit text-muted-foreground">
            <Plus /> Add metric
          </Button>
        }
      />
      <PopoverContent
        anchor={anchor}
        side="right"
        align="start"
        sideOffset={12}
        className="w-[320px] p-0"
      >
        <div className="flex flex-col">
          <div className="border-b border-border p-2">
            <div className="flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5">
              <Search size={13} className="shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search metrics…"
                autoFocus
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="scroll-thin max-h-[320px] overflow-y-auto p-1">
            {METRIC_CATEGORIES.map((cat) => {
              const items = filtered.filter((m) => m.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} className="mb-1 last:mb-0">
                  <div className="px-2.5 pt-1.5 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </div>
                  {items.map((m) => {
                    const active = selected.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={active}
                        onClick={() => {
                          onAdd(m.id);
                          change(false);
                        }}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left transition-colors",
                          active
                            ? "opacity-50"
                            : "hover:bg-secondary",
                        )}
                      >
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground">
                            {m.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {m.description}
                          </span>
                        </span>
                        {active && (
                          <Check size={14} className="mt-0.5 shrink-0 text-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                No metrics found.
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
