"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Bot,
  Braces,
  ClipboardCheck,
  Clock,
  Filter,
  Flag,
  Gauge,
  Grid3x3,
  Hash,
  ListChecks,
  Megaphone,
  MessageSquare,
  Phone,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  PieChart,
  Plus,
  RotateCw,
  Search,
  Table as TableIcon,
  TrendingUp,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type VizKind = "number" | "line" | "bar" | "pie" | "table" | "heatmap";

const VIZ: { key: VizKind; label: string; icon: LucideIcon }[] = [
  { key: "number", label: "Number", icon: Hash },
  { key: "line", label: "Line", icon: TrendingUp },
  { key: "bar", label: "Bar", icon: BarChart3 },
  { key: "pie", label: "Pie", icon: PieChart },
  { key: "table", label: "Table", icon: TableIcon },
  { key: "heatmap", label: "Heatmap", icon: Grid3x3 },
];

const METRICS = [
  "Calls count",
  "Calls connected",
  "Pick-up rate",
  "Conversion rate",
  "Avg duration",
  "Tasks created",
  "Transfer rate",
  "CSAT",
  "Cost / call",
];

type FilterGroup = {
  label?: string;
  items: { key: string; label: string; icon: LucideIcon }[];
};

const FILTER_GROUPS: FilterGroup[] = [
  {
    items: [
      { key: "quick", label: "Quick filters", icon: Zap },
      { key: "type", label: "Type", icon: Phone },
      { key: "direction", label: "Direction", icon: ArrowLeftRight },
      { key: "agent", label: "Agent", icon: Bot },
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
      { key: "outcome", label: "Outcome", icon: Flag },
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

export function AddWidgetButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
      >
        <Plus size={14} />
        Add widget
      </button>
      <AddWidgetDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function AddWidgetDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [viz, setViz] = React.useState<VizKind>("number");
  const [metric, setMetric] = React.useState<string>("");
  const [useCustomRange, setUseCustomRange] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const canSubmit = title.trim().length > 0 && metric.length > 0;

  const handleClose = (v: boolean) => {
    if (!v) {
      // reset on close
      setTitle("");
      setMetric("");
      setUseCustomRange(false);
      setViz("number");
    }
    onOpenChange(v);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          variant="modal"
          showCloseButton={false}
          className="flex max-h-[85vh] w-full !max-w-[560px] flex-col overflow-hidden p-0"
        >
          <DialogTitle className="sr-only">Add widget</DialogTitle>

          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Plus size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Add widget</span>
            <button
              type="button"
              onClick={() => handleClose(false)}
              aria-label="Close"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="widget-title"
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                Title <span className="text-foreground">*</span>
              </label>
              <Input
                id="widget-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled widget"
              />
            </div>

            {/* Visualization */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Visualization</div>
              <div className="grid grid-cols-6 gap-1 rounded-md border border-border bg-secondary/30 p-1">
                {VIZ.map((v) => {
                  const active = viz === v.key;
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => setViz(v.key)}
                      className={cn(
                        "inline-flex h-8 items-center justify-center gap-1.5 rounded-[5px] px-2 text-xs transition-colors",
                        active
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon size={13} />
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metric */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                Metric <span className="text-foreground">*</span>
              </label>
              <Select
                value={metric}
                onValueChange={(v) => v && setMetric(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {METRICS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Filter size={12} /> Add filter
              </button>
            </div>

            <div className="border-t border-border" />

            {/* Range */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Range</div>
              <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/20 px-4 py-3">
                <Switch
                  checked={useCustomRange}
                  onCheckedChange={setUseCustomRange}
                />
                <div className="flex-1">
                  <div className="text-sm text-foreground">
                    Use a custom time range
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {useCustomRange
                      ? "On — set a custom range for this widget."
                      : "Off — follows the dashboard's range."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
            <span
              className={cn(
                "text-xs",
                canSubmit ? "text-muted-foreground" : "text-amber-400",
              )}
            >
              {canSubmit ? "Ready to add." : "Add a title and pick a metric."}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="inline-flex h-8 items-center rounded-md px-3 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => handleClose(false)}
                className={cn(
                  "inline-flex h-8 items-center rounded-md px-3 text-xs transition-colors",
                  canSubmit
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "cursor-not-allowed bg-secondary text-muted-foreground",
                )}
              >
                Add widget
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
    </>
  );
}

function FiltersSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query.trim()) return FILTER_GROUPS;
    const q = query.toLowerCase();
    return FILTER_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="drawer"
        showCloseButton={false}
        className="!max-w-[400px] flex flex-col p-0"
      >
        <DialogTitle className="sr-only">Filters</DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border px-5 py-3">
          <div className="flex h-8 items-center gap-2 rounded-md border border-border bg-transparent px-2.5">
            <Search size={13} className="shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search filters..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {filtered.length === 0 ? (
            <div className="px-3 py-10 text-center text-xs text-muted-foreground">
              No filters match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((g, gi) => (
              <div key={g.label ?? `_g${gi}`} className={gi > 0 ? "mt-3" : ""}>
                {g.label && (
                  <div className="px-3 pb-1 text-[10px] font-medium text-muted-foreground">
                    {g.label}
                  </div>
                )}
                {g.items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.key}
                      type="button"
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                    >
                      <Icon size={14} className="text-muted-foreground" />
                      <span className="flex-1 truncate">{it.label}</span>
                      <span className="text-muted-foreground">›</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <button
            type="button"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-8 items-center rounded-md bg-foreground px-3 text-xs text-background transition-colors hover:bg-foreground/90"
          >
            Add
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
