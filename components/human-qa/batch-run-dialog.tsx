"use client";

/**
 * Batch run — a centered modal to define and run a cohort of conversations
 * through evaluation. Uses the platform FilterDropdown for filters (instead of
 * an inline filter builder) plus our inputs, select, and number stepper.
 */

import * as React from "react";
import {
  ArrowLeftRight,
  Bot,
  Braces,
  Calendar,
  ClipboardCheck,
  Clock,
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
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumberStepper } from "@/components/number-stepper";
import {
  FilterDropdown,
  type FilterSection,
  type FilterValues,
  type QuickFilter,
} from "@/components/filter-dropdown";
import { cn } from "@/lib/utils";

const FIELD =
  "h-9 w-full rounded-lg border border-border bg-transparent dark:bg-input/30 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const DATE_RANGES = ["Last 24 hours", "Last 7 days", "Last 30 days", "All time"];
const AGENTS = ["Debt Collection Pitch Agent", "Careers_360", "premium", "standard"];
const OUTCOMES = ["Resolved", "Transferred", "Dropped", "Voicemail", "No answer"];
const END_REASONS = ["Completed", "Caller hung up", "Agent ended", "Failed"];

const CAMPAIGNS = ["Q3 Win-back", "Real Estate inbound", "Debt collection"];

const SCHEMA: FilterSection[] = [
  {
    items: [
      { id: "type", label: "Type", icon: <Phone size={15} />, type: "multi-select", options: [{ value: "call", label: "Call" }, { value: "web", label: "Web session" }] },
      { id: "direction", label: "Direction", icon: <ArrowLeftRight size={15} />, type: "multi-select", options: [{ value: "inbound", label: "Inbound" }, { value: "outbound", label: "Outbound" }] },
      { id: "agent", label: "Agent", icon: <Bot size={15} />, type: "multi-select", searchable: true, options: AGENTS.map((a) => ({ value: a, label: a })) },
      { id: "caller", label: "Caller", icon: <PhoneIncoming size={15} />, type: "text", placeholder: "+91…" },
      { id: "callee", label: "Callee", icon: <PhoneOutgoing size={15} />, type: "text", placeholder: "+91…" },
      { id: "providerCallId", label: "Provider call ID", icon: <Hash size={15} />, type: "text", placeholder: "CA…" },
      { id: "campaign", label: "Campaign", icon: <Megaphone size={15} />, type: "multi-select", options: CAMPAIGNS.map((c) => ({ value: c, label: c })) },
      { id: "task", label: "Task", icon: <ListChecks size={15} />, type: "text", placeholder: "task_…" },
    ],
  },
  {
    title: "Outcome & status",
    items: [
      { id: "outcome", label: "Outcome", icon: <Flag size={15} />, type: "multi-select", options: OUTCOMES.map((o) => ({ value: o, label: o })) },
      { id: "endReason", label: "End reason", icon: <PhoneOff size={15} />, type: "multi-select", options: END_REASONS.map((e) => ({ value: e, label: e })) },
    ],
  },
  {
    title: "Metrics",
    items: [
      { id: "duration", label: "Call duration", icon: <Clock size={15} />, type: "range", min: 0, max: 1800, step: 5, unit: "sec" },
      { id: "turns", label: "Turns", icon: <MessageSquare size={15} />, type: "range", min: 0, max: 100, step: 1 },
      { id: "latency", label: "Turn latency", icon: <Gauge size={15} />, type: "range", min: 0, max: 5000, step: 50, unit: "ms" },
      { id: "attempt", label: "Attempt", icon: <RotateCw size={15} />, type: "pill", maxExact: 4 },
    ],
  },
  {
    title: "Dynamic fields",
    items: [
      { id: "postCall", label: "Post-call analysis", icon: <ClipboardCheck size={15} />, type: "text", placeholder: "metric name" },
      { id: "contextVars", label: "Context variables", icon: <Braces size={15} />, type: "text", placeholder: "order_id" },
    ],
  },
];

const QUICK_FILTERS: QuickFilter[] = [
  { id: "connected", label: "Connected calls", icon: <Phone size={14} />, values: { outcome: ["Resolved", "Transferred"] } },
  { id: "failed", label: "Failed calls", icon: <PhoneOff size={14} />, values: { endReason: ["Failed"] } },
  { id: "long", label: "Long calls (>3 min)", icon: <Clock size={14} />, values: { duration: { kind: "range", min: 180, max: null } } },
];

const LABELS: Record<string, string> = Object.fromEntries(SCHEMA.flatMap((s) => s.items).map((c) => [c.id, c.label]));

function isSet(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  if (v && typeof v === "object" && "kind" in v) {
    const o = v as { kind: string; min?: number | null; max?: number | null; value?: unknown };
    if (o.kind === "range") return o.min != null || o.max != null;
    if (o.kind === "pick") return o.value !== "any";
  }
  return v != null;
}
function summarize(v: unknown): string {
  if (Array.isArray(v)) return v.length <= 2 ? v.join(", ") : `${v.length} selected`;
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "kind" in v) {
    const o = v as { kind: string; min?: number | null; max?: number | null; value?: unknown };
    if (o.kind === "range") return `${o.min ?? "–"}–${o.max ?? "–"}`;
    if (o.kind === "pick") return typeof o.value === "object" ? `${(o.value as { ge: number }).ge}+` : String(o.value);
  }
  return "";
}

export function BatchRunDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = React.useState("");
  const [range, setRange] = React.useState("Last 24 hours");
  const [limit, setLimit] = React.useState(50);
  const [filters, setFilters] = React.useState<FilterValues>({});
  const [filterOpen, setFilterOpen] = React.useState(false);

  const activeKeys = Object.keys(filters).filter((k) => isSet(filters[k]));
  const matched = Math.max(0, 24 - activeKeys.length * 8);
  const evaluated = Math.min(matched, limit);

  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="modal"
        showCloseButton={false}
        style={{ backgroundColor: "var(--popover)", marginLeft: filterOpen ? 176 : 0, transition: "margin-left 150ms ease" }}
        className="flex h-[80vh] flex-col overflow-hidden p-0 sm:!max-w-2xl"
      >
        <DialogTitle className="sr-only">Batch run</DialogTitle>

        {/* header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-lg font-medium tracking-tight text-foreground">Batch run</h1>
          <button
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>

        {/* body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Cohort name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} placeholder="Enter cohort name" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Date range</label>
              <Select value={range} onValueChange={(v) => v && setRange(v)}>
                <SelectTrigger className="h-9 w-full">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-muted-foreground" />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Conversation limit</label>
              <NumberStepper value={limit} onChange={setLimit} min={1} max={5000} step={10} />
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Filters</span>
                {activeKeys.length > 0 && (
                  <span className="inline-flex h-5 items-center rounded-md bg-secondary px-1.5 text-[11px] font-medium text-muted-foreground">
                    {activeKeys.length} active
                  </span>
                )}
              </div>
              {activeKeys.length > 0 && (
                <button
                  onClick={() => setFilters({})}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
              <FilterDropdown
                schema={SCHEMA}
                value={filters}
                onChange={setFilters}
                quickFilters={QUICK_FILTERS}
                triggerLabel="Add filter"
                side="left"
                align="center"
                sideOffset={48}
                onOpenChange={setFilterOpen}
              />
              {activeKeys.length > 0 ? (
                activeKeys.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-2 py-0.5 text-xs text-foreground">
                    <span className="text-muted-foreground">{LABELS[k]}:</span>
                    {summarize(filters[k])}
                    <span role="button" onClick={() => setFilters((f) => ({ ...f, [k]: null }))} className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
                      <X size={11} />
                    </span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">— evaluates the whole window until you add one.</span>
              )}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{evaluated}</span> conversations to evaluate
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={close}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success(`Batch run started · ${evaluated} conversations`);
                close();
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Run
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
