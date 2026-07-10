"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Bot,
  Braces,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Filter,
  Flag,
  Gauge,
  Hash,
  ListChecks,
  Megaphone,
  MessageSquare,
  Phone,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  RotateCw,
  Search,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FILTER_FIELDS } from "@/lib/insights/registry";
import type { FilterClause, GroupField } from "@/lib/insights/types";
import { cn } from "@/lib/utils";

type FilterItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Data-backed fields map to a real group field; the rest are browse-only. */
  field?: GroupField;
};
type FilterGroup = { label?: string; items: FilterItem[] };

const TAXONOMY: FilterGroup[] = [
  {
    items: [
      { key: "quick", label: "Quick filters", icon: Zap },
      { key: "type", label: "Type", icon: Phone },
      { key: "direction", label: "Direction", icon: ArrowLeftRight },
      { key: "agent", label: "Agent", icon: Bot, field: "agent" },
      { key: "caller", label: "Caller", icon: PhoneIncoming },
      { key: "callee", label: "Callee", icon: PhoneOutgoing },
      { key: "providerCallId", label: "Provider call ID", icon: Hash },
      { key: "campaign", label: "Campaign", icon: Megaphone },
      { key: "task", label: "Task", icon: ListChecks },
    ],
  },
  {
    label: "Outcome & status",
    items: [
      { key: "outcome", label: "Outcome", icon: Flag, field: "outcome" },
      { key: "endReason", label: "End reason", icon: PhoneOff },
    ],
  },
  {
    label: "Metrics",
    items: [
      { key: "callDuration", label: "Call duration", icon: Clock },
      { key: "turns", label: "Turns", icon: MessageSquare },
      { key: "turnLatency", label: "Turn latency", icon: Gauge },
      { key: "attempt", label: "Attempt", icon: RotateCw },
    ],
  },
  {
    label: "Dynamic fields",
    items: [
      { key: "postCall", label: "Post-call analysis", icon: ClipboardCheck },
      { key: "context", label: "Context variables", icon: Braces },
    ],
  },
];

/** Just the trigger — parent owns whether/where the panel opens. */
export function FilterMenu({
  onClick,
  disabled,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className="text-muted-foreground"
    >
      <Filter /> Filter
    </Button>
  );
}

/**
 * The categorized filter picker + value submenu — rendered inline (e.g. as a
 * side panel of the modal). Fills the height of its container.
 */
export function FilterPanel({
  onAdd,
  onClose,
}: {
  onAdd: (c: FilterClause) => void;
  onClose?: () => void;
}) {
  const [query, setQuery] = React.useState("");

  const groups = TAXONOMY.map((g) => ({
    ...g,
    items: g.items.filter(
      (i) => !query.trim() || i.label.toLowerCase().includes(query.toLowerCase()),
    ),
  })).filter((g) => g.items.length);

  return (
    <div className="flex h-full min-h-0 w-[300px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-popover">
      <div className="border-b border-border p-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 flex-1 items-center gap-2 rounded-md border border-border bg-card px-2.5">
            <Search size={13} className="shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filters…"
              autoFocus
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          {onClose && (
            <button
              type="button"
              aria-label="Close filter panel"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-1">
        {groups.map((g, gi) => (
          <div key={g.label ?? `_g${gi}`} className={gi > 0 ? "mt-2" : ""}>
            {g.label && (
              <div className="px-2.5 pt-1.5 pb-1 text-3xs font-medium uppercase tracking-wider text-muted-foreground">
                {g.label}
              </div>
            )}
            {g.items.map((it) => (
              <FilterFieldRow key={it.key} item={it} onAdd={onAdd} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** One field row — active fields open a multi-select values Popover on click. */
function FilterFieldRow({
  item,
  onAdd,
}: {
  item: FilterItem;
  onAdd: (c: FilterClause) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const Icon = item.icon;
  const enabled = !!item.field;
  const values = item.field
    ? (FILTER_FIELDS.find((f) => f.field === item.field)?.values ?? [])
    : [];

  const change = (v: boolean) => {
    if (!v) {
      setQuery("");
      setSelected(new Set());
    }
    setOpen(v);
  };
  const toggle = (val: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  };
  const apply = () => {
    if (!item.field) return;
    selected.forEach((val) => onAdd({ field: item.field!, value: val }));
    change(false);
  };
  const filtered = values.filter(
    (v) => !query.trim() || v.toLowerCase().includes(query.toLowerCase()),
  );

  const row = (
    <button
      type="button"
      disabled={!enabled}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
        enabled
          ? "text-foreground hover:bg-secondary"
          : "cursor-not-allowed text-muted-foreground/40",
      )}
    >
      <Icon size={14} className={enabled ? "text-muted-foreground" : ""} />
      <span className="flex-1 truncate">{item.label}</span>
      {enabled ? (
        <ChevronRight size={14} className="text-muted-foreground" />
      ) : (
        <span className="text-3xs text-muted-foreground/50">no data</span>
      )}
    </button>
  );

  if (!enabled) return row;

  return (
    <Popover open={open} onOpenChange={change}>
      <PopoverTrigger render={row} />
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="flex w-[280px] flex-col gap-0 p-0"
      >
        {/* Header — field name */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Icon size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{item.label}</span>
        </div>

        {/* Search */}
        <div className="border-b border-border p-2">
          <div className="flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5">
            <Search size={13} className="shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${item.label.toLowerCase()}…`}
              autoFocus
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Multi-select checkbox list */}
        <div className="scroll-thin max-h-[240px] min-h-0 flex-1 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              No matches.
            </div>
          ) : (
            filtered.map((val) => {
              const checked = selected.has(val);
              return (
                <label
                  key={val}
                  className="flex cursor-pointer items-center gap-2.5 border-b border-border/60 px-2.5 py-2 text-sm text-foreground transition-colors last:border-b-0 hover:bg-secondary"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(val)}
                  />
                  <span className="flex-1 truncate">{val}</span>
                </label>
              );
            })
          )}
        </div>

        {/* Footer — Clear + Apply */}
        <div className="flex items-center justify-between gap-2 border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={selected.size === 0}
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={selected.size === 0}
            onClick={apply}
          >
            Apply {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
