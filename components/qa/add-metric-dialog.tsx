"use client";

/**
 * Add metric — 4-step flow (Define · Cohort and Schedule · Dry Run · Activate)
 * hosted in the Create-Campaign right-drawer shell. Built to the Platform
 * Updates "Create Metric" Figma frames, mapped onto campaign-b0 tokens and
 * shared primitives (Segmented, Select, Slider, FilterDropdown).
 */

import * as React from "react";
import {
  ArrowLeftRight,
  Bot,
  Braces,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Flag,
  Gauge,
  Hash,
  ListChecks,
  Loader2,
  Maximize2,
  Megaphone,
  Minimize2,
  MessageSquare,
  Phone,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  Play,
  Plus,
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
import { Slider } from "@/components/ui/slider";
import { TimeSelect } from "@/components/time-picker";
import { ConversationReview, type ReviewItem } from "@/components/conversation-review";
import { EmptyState, EmptyAction } from "@/components/ui/empty-state";
import {
  FilterDropdown,
  type FilterSection,
  type FilterValues,
  type QuickFilter,
} from "@/components/filter-dropdown";
import { TIMEZONES } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Define" },
  { id: 2, title: "Cohort & Schedule" },
  { id: 3, title: "Dry Run" },
  { id: 4, title: "Review" },
] as const;

// Exact input recipe from Create Campaign (batch wizard).
const FIELD =
  "h-9 w-full rounded-lg border border-border bg-transparent dark:bg-input/30 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AddMetricDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const close = () => onOpenChange(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="drawer"
        showCloseButton={false}
        style={{ backgroundColor: "var(--card)" }}
        className="!max-w-[960px] flex flex-col overflow-hidden border-l border-border p-0 shadow-2xl"
      >
        <DialogTitle className="sr-only">Add metric</DialogTitle>
        <MetricWizard onClose={close} />
      </DialogContent>
    </Dialog>
  );
}

function MetricWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = React.useState(1);
  const [maxStep, setMaxStep] = React.useState(1);

  const goto = (id: number) => {
    if (id <= maxStep) setStep(id);
  };
  const advance = () => {
    if (step < STEPS.length) {
      const next = step + 1;
      setStep(next);
      setMaxStep((m) => Math.max(m, next));
    } else {
      toast.success("Metric created");
      onClose();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* header — title + stepper */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-8 py-4">
          <h1 className="text-lg font-medium tracking-tight text-foreground">Add metric</h1>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
        <nav className="flex items-center justify-center gap-1 px-8 pb-3">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const done = s.id < step;
            const reachable = s.id <= maxStep;
            return (
              <div key={s.id} className="flex items-center gap-1">
                <button
                  onClick={() => goto(s.id)}
                  disabled={!reachable}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors",
                    active
                      ? "bg-card text-foreground"
                      : reachable
                        ? "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        : "cursor-default text-muted-foreground/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums",
                      active
                        ? "bg-primary font-medium text-primary-foreground"
                        : "bg-card text-muted-foreground",
                    )}
                  >
                    {done ? <Check size={10} strokeWidth={3} /> : s.id}
                  </span>
                  <span className="font-medium">{s.title}</span>
                </button>
                {i < STEPS.length - 1 && <span className="h-px w-4 bg-sidebar-border/15" />}
              </div>
            );
          })}
        </nav>
      </header>

      {/* content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {step === 1 ? (
          <DefineStep />
        ) : step === 2 ? (
          <CohortStep />
        ) : step === 3 ? (
          <DryRunStep />
        ) : (
          <ActivateStep />
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-border px-8 py-3">
        <button
          onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft size={14} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={advance}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {step === STEPS.length ? "Create metric" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step 1 · Define ─────────────────────────────────────────────────────── */

const PROVIDERS = ["OpenAI", "Anthropic", "Google"];
const MODELS = ["gpt-4o-mini", "gpt-4o", "claude-haiku-4-5", "claude-sonnet-5"];

type MetricTemplate = {
  id: string;
  type: string;
  name: string;
  blurb: string;
  value: string;
  output: string;
  success: string;
  prompt: string;
};

const TEMPLATES: MetricTemplate[] = [
  {
    id: "phone",
    type: "Boolean",
    name: "phone_number_collection",
    blurb: "Was the caller's phone number collected correctly, end to end?",
    value: "true, false",
    output:
      "true — the phone number was collected correctly end to end. false — something in the collection flow failed.",
    success: "true",
    prompt:
      "Decide whether the caller's phone number was collected correctly.\nReturn true only if it was asked for, captured, and confirmed. Otherwise false.\n\nTranscript:\n${fullTranscript}",
  },
  {
    id: "call_end",
    type: "Enum",
    name: "appropriate_call_end",
    blurb: "Did the agent end the call at the right time with a clean close?",
    value: "correct, incorrect",
    output:
      "correct — ended at the right time with a relevant message and clean close. incorrect — abrupt, premature, or farewell chains.",
    success: "correct",
    prompt:
      "Classify whether the agent ended the call appropriately using the labels below.\n\nTranscript:\n${fullTranscript}",
  },
  {
    id: "detail",
    type: "Boolean",
    name: "detail_collection_exp",
    blurb: "Was every detail-collection exchange smooth — no repeats or confusion?",
    value: "true, false",
    output:
      "true — no detail collection happened, or every exchange was smooth. false — repeats or confusion occurred.",
    success: "true",
    prompt:
      "Judge whether detail collection in this call was smooth.\nReturn true if smooth or not applicable, otherwise false.\n\nTranscript:\n${fullTranscript}",
  },
];

function DefineStep() {
  const [name, setName] = React.useState("");
  const [value, setValue] = React.useState<string[]>([]);
  const [outputDesc, setOutputDesc] = React.useState("");
  const [success, setSuccess] = React.useState<string[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [userMsg, setUserMsg] = React.useState("");
  const [provider, setProvider] = React.useState("OpenAI");
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [temp, setTemp] = React.useState("0");
  const [template, setTemplate] = React.useState<string | null>(null);
  const [promptExpanded, setPromptExpanded] = React.useState(false);

  const applyTemplate = (t: MetricTemplate) => {
    setTemplate(t.id);
    setName(t.name);
    setValue(t.value.split(",").map((s) => s.trim()).filter(Boolean));
    setSuccess(t.success.split(",").map((s) => s.trim()).filter(Boolean));
    setOutputDesc(t.output);
    setPrompt(t.prompt);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-6">
      <StepHeader
        title="Define metric"
        subtitle="Configure your metric name, criteria, prompt, and model settings."
      />

      {/* Start from a template */}
      <div className="mt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Start from a template</span>
          {template && (
            <button
              onClick={() => setTemplate(null)}
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TEMPLATES.slice(0, 2).map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className={cn(
                "flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
                template === t.id ? "border-ring bg-accent" : "border-border bg-popover hover:border-input",
              )}
            >
              <span className="truncate text-sm font-medium text-foreground">{t.name}</span>
              <span className="truncate text-[11px] leading-relaxed text-muted-foreground">{t.blurb}</span>
            </button>
          ))}
          <button
            onClick={() => toast("Browse the metric template library")}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-popover px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-input hover:text-foreground"
          >
            <Plus size={14} /> See more
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
            placeholder="e.g. phone_number_collection (letters, numbers, _ and -)"
          />
        </Field>

        <Field label="Value" hint="Type a value and press comma or Enter to add it.">
          <PillInput values={value} onChange={setValue} placeholder="e.g. positive, neutral, negative" />
        </Field>

        <Field label="Output Description">
          <input
            value={outputDesc}
            onChange={(e) => setOutputDesc(e.target.value)}
            className={FIELD}
            placeholder="What each value means, so the judge picks correctly."
          />
        </Field>

        <Field label="Success Criteria" hint="Pick which value(s) count as a pass. Type to add a new one.">
          <div className="flex flex-wrap items-center gap-1.5">
            {value.map((v) => {
              const on = success.includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSuccess(on ? success.filter((s) => s !== v) : [...success, v])}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs transition-colors",
                    on
                      ? "border-ring bg-accent text-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {on && <Check size={11} strokeWidth={3} />}
                  {v}
                </button>
              );
            })}
            <InlineAdd
              placeholder={value.length ? "Add value…" : "e.g. positive"}
              onAdd={(v) => {
                if (!value.includes(v)) setValue((prev) => [...prev, v]);
                setSuccess((prev) => (prev.includes(v) ? prev : [...prev, v]));
              }}
            />
          </div>
        </Field>

        <Field label="Prompt">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={cn(
                FIELD,
                "resize-none py-2.5 pr-10 font-mono text-[12px] leading-relaxed transition-[height]",
                promptExpanded ? "h-[62vh]" : "h-64",
              )}
              placeholder="Tell the judge what to evaluate and how to decide."
            />
            <button
              type="button"
              onClick={() => setPromptExpanded((v) => !v)}
              aria-label={promptExpanded ? "Collapse" : "Expand"}
              title={promptExpanded ? "Collapse" : "Expand"}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            >
              {promptExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </Field>

        <Field
          label="User Message"
          hint="Optional. The user message to use for the evaluation. If not specified, the full transcript will be used."
        >
          <textarea
            value={userMsg}
            onChange={(e) => setUserMsg(e.target.value)}
            className={cn(FIELD, "h-20 resize-none py-2.5")}
            placeholder="Leave empty to use the full transcript."
          />
        </Field>

        <Collapsible title="LLM Settings" summary={`${provider} · ${model} · temp ${temp}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Provider">
              <Sel value={provider} onChange={setProvider} options={PROVIDERS} />
            </Field>
            <Field label="Model">
              <Sel value={model} onChange={setModel} options={MODELS} />
            </Field>
            <Field label="Temperature">
              <input
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className={FIELD}
                inputMode="decimal"
                placeholder="0"
              />
            </Field>
          </div>
        </Collapsible>
      </div>
    </div>
  );
}

/* ── Step 2 · Cohort and Schedule ────────────────────────────────────────── */

type Cadence = "Daily" | "Weekly" | "Periodic";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const INTERVALS = ["15m", "30m", "1hr", "6hr", "12hr"];

const AGENTS = ["Debt Collection Pitch Agent", "Debt Collection Outbound Agent", "Careers_360", "premium", "standard", "palmonas hoomanlabs"];
const OUTCOMES = ["Resolved", "Transferred", "Dropped", "Voicemail", "No answer"];
const END_REASONS = ["Completed", "Caller hung up", "Agent ended", "No answer", "Failed"];
const CAMPAIGNS = ["Q3 Win-back", "Real Estate inbound", "Debt collection"];

// Full conversation filter taxonomy — every field active, grouped like the
// insights conversations filter.
const COHORT_SCHEMA: FilterSection[] = [
  {
    items: [
      { id: "type", label: "Type", icon: <Phone size={15} />, type: "multi-select", options: [{ value: "phone", label: "Phone call" }, { value: "web", label: "Web session" }] },
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
      {
        id: "contextVars",
        label: "Context variables",
        icon: <Braces size={15} />,
        type: "custom",
        render: ({ value, setValue, close }) => (
          <ContextVarEditor value={typeof value === "string" ? value : ""} onChange={(v) => setValue(v || null)} onDone={close} />
        ),
      },
    ],
  },
];

const QUICK_FILTERS: QuickFilter[] = [
  { id: "connected", label: "Connected calls", icon: <Phone size={14} />, values: { outcome: ["Resolved", "Transferred"] } },
  { id: "failed", label: "Failed calls", icon: <PhoneOff size={14} />, values: { endReason: ["Failed"] } },
  { id: "voicemail", label: "Voicemails", icon: <PhoneOff size={14} />, values: { outcome: ["Voicemail"] } },
  { id: "long", label: "Long calls (>3 min)", icon: <Clock size={14} />, values: { duration: { kind: "range", min: 180, max: null } } },
];

const LABELS: Record<string, string> = Object.fromEntries(COHORT_SCHEMA.flatMap((s) => s.items).map((c) => [c.id, c.label]));

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

function ContextVarEditor({ value, onChange, onDone }: { value: string; onChange: (v: string) => void; onDone: () => void }) {
  const [key, setKey] = React.useState(value);
  return (
    <div className="p-1">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { onChange(key); onDone(); } }}
          placeholder="Type a variable key…"
          className={cn(FIELD, "h-8")}
        />
        <button onClick={() => { onChange(key); onDone(); }} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/60">
          <Plus size={13} /> Add
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">Enter a variable key (e.g. order_id).</p>
    </div>
  );
}

function CohortStep() {
  const [cadence, setCadence] = React.useState<Cadence>("Weekly");
  const [day, setDay] = React.useState("Monday");
  const [time, setTime] = React.useState("09:00");
  const [tz, setTz] = React.useState("Asia/Kolkata");
  const [interval, setInterval] = React.useState("1hr");
  const [filters, setFilters] = React.useState<FilterValues>({});
  const [limit, setLimit] = React.useState(200);
  const [alert, setAlert] = React.useState(50);

  const activeKeys = Object.keys(filters).filter((k) => isSet(filters[k]));

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-6">
      {/* Schedule */}
      <Section title="Schedule" subtitle="When to run">
        <Segmented value={cadence} onChange={(v) => setCadence(v as Cadence)} options={["Daily", "Weekly", "Periodic"]} />

        {cadence === "Periodic" ? (
          <div className="mt-4">
            <Field label="Runs every" hint="Select interval">
              <Segmented value={interval} onChange={setInterval} options={INTERVALS} />
            </Field>
          </div>
        ) : (
          <div
            className={cn(
              "mt-4 grid grid-cols-1 gap-4",
              cadence === "Weekly" ? "sm:grid-cols-3" : "sm:grid-cols-2",
            )}
          >
            {cadence === "Weekly" && (
              <SchedField label="Day" hint="The metric runs at this time.">
                <Sel value={day} onChange={setDay} options={DAYS} />
              </SchedField>
            )}
            <SchedField label="Time" hint={cadence === "Weekly" ? undefined : "The metric runs at this time."}>
              <TimeSelect value={time} onChange={setTime} className="h-9 w-full" />
            </SchedField>
            <SchedField label="Timezone">
              <Sel value={tz} onChange={setTz} options={TIMEZONES} />
            </SchedField>
          </div>
        )}
      </Section>

      {/* Cohort */}
      <div className="mt-8">
        <div className="mb-3">
          <div className="text-sm font-medium text-foreground">Cohort</div>
          <p className="mt-0.5 text-xs text-muted-foreground">Filter which conversations this metric scores.</p>
        </div>

        {/* Add filter — standalone, out of any box. Opens side="left" so its menu
            runs parallel to the drawer. */}
        <div className="mb-3 flex items-center gap-3">
          <FilterDropdown
            schema={COHORT_SCHEMA}
            value={filters}
            onChange={setFilters}
            quickFilters={QUICK_FILTERS}
            triggerLabel="Add filter"
            side="left"
            align="center"
            sideOffset={136}
          />
          {activeKeys.length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="ml-auto text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>

        {activeKeys.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5 rounded-xl border border-border bg-card px-4 py-3">
            {activeKeys.map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-2 py-0.5 text-xs text-foreground">
                <span className="text-muted-foreground">{LABELS[k]}:</span>
                {summarize(filters[k])}
                <span role="button" onClick={() => setFilters((f) => ({ ...f, [k]: null }))} className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
                  <X size={11} />
                </span>
              </span>
            ))}
          </div>
        )}

        <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2", activeKeys.length === 0 && "mt-6")}>
          <SliderField
            label="Conversation Limit"
            hint="Max conversations evaluated per run."
            value={limit}
            onChange={setLimit}
            min={0}
            max={1000}
            step={10}
          />
          <SliderField
            label="Alert"
            hint="Notify when the failure rate exceeds this percent per run."
            value={alert}
            onChange={setAlert}
            min={0}
            max={100}
            step={1}
            unit="%"
          />
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="inline-flex items-center gap-0.5">
          <input
            value={value}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/[^0-9]/g, ""));
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
            inputMode="numeric"
            className="h-7 w-14 rounded-md border border-input bg-transparent px-2 text-center font-mono text-xs tabular-nums text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
        </span>
      </div>
      <p className="-mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      <Slider
        value={value}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        min={min}
        max={max}
        step={step}
        className="mt-1"
      />
    </div>
  );
}

/* ── Step 3 · Dry Run ────────────────────────────────────────────────────── */

type DryTab = "Failure" | "All Runs" | "Reviewed";
type Outcome = "pass" | "fail" | "na";
type DryRow = { id: string; result: string; runs: number; outcome: Outcome; reviewed: boolean };

// Outcome pill styling. PASS is green — the only non-token hue in the flow,
// per the QA "Create Metric" design (success elsewhere uses chart-2 blue).
const OUTCOME: Record<Outcome, { label: string; cls: string }> = {
  pass: { label: "PASS", cls: "bg-emerald-500/15 text-emerald-400" },
  fail: { label: "FAIL", cls: "bg-destructive/15 text-destructive" },
  na: { label: "NA", cls: "bg-secondary text-muted-foreground" },
};

const DRY_ROWS: DryRow[] = [
  { id: "LC8xFnkZE7HCEvfDqmk", result: "The phone number collection was never attempted in this call. No phone number was asked for or provided at any point.", runs: 1, outcome: "na", reviewed: true },
  { id: "LC8xFnkZE7HCEvfDqmn", result: "Phone number collected correctly end to end, read back and confirmed with the caller.", runs: 1, outcome: "pass", reviewed: false },
  { id: "LC8xFnkZE7HCEvfDqmp", result: "The agent asked for the number but never confirmed the digits before ending the call.", runs: 1, outcome: "na", reviewed: false },
  { id: "LC8xFnkZE7HCEvfDqmq", result: "Number captured on the first attempt with a clean confirmation. No repeats needed.", runs: 1, outcome: "pass", reviewed: true },
  { id: "LC8xFnkZE7HCEvfDqmr", result: "The caller declined to share a phone number; agent handled the refusal correctly.", runs: 1, outcome: "na", reviewed: false },
  { id: "LC8xFnkZE7HCEvfDqms", result: "Collection attempted twice due to background noise; final digits were never verified.", runs: 1, outcome: "na", reviewed: false },
];

const DRY_TOTAL = 20; // sample size for the dry run

// Shared mock transcript + analysis for the conversation review overlay.
const MOCK_TRANSCRIPT = [
  { role: "AGENT", text: "Hello, this is Rohan, an AI assistant from Hooman Labs. You requested a call from our website, right? Just wanted to check, would you prefer we chat in English or Hindi?" },
  { role: "USER", text: "English." },
  { role: "AGENT", text: "Great, English it is. So, tell me a bit about your business — what do you guys do?" },
  { role: "USER", text: "But the same woman that was connected, is it? We are continuing." },
];
const MOCK_SUMMARY =
  "The customer engaged with Rohan, an AI assistant from Hooman Labs, confirming their preferred language as English. The customer inquired about the call's purpose and indicated a desire to continue the conversation.";

function toReviewItem(r: DryRow): ReviewItem {
  return {
    id: r.id,
    durationSec: 34,
    transcript: MOCK_TRANSCRIPT,
    verdict: {
      outcome: r.outcome,
      reasoning: r.result,
      output: r.outcome === "na" ? "NA" : r.outcome === "pass" ? "true" : "false",
    },
    analysis: { outcome: "dropped_early", summary: MOCK_SUMMARY },
  };
}

function DryRunStep() {
  const [tab, setTab] = React.useState<DryTab>("All Runs");
  const [status, setStatus] = React.useState<"running" | "done">("running");
  const [scored, setScored] = React.useState(0);
  const [reviewIdx, setReviewIdx] = React.useState<number | null>(null);

  // Simulate the synchronous judge scoring the sample. Runs on first arrival
  // and on every Re-run (status flipped back to "running").
  React.useEffect(() => {
    if (status !== "running") return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setScored(n);
      if (n >= DRY_TOTAL) {
        clearInterval(id);
        setTimeout(() => setStatus("done"), 400);
      }
    }, 130);
    return () => clearInterval(id);
  }, [status]);

  const rerun = () => {
    setScored(0);
    setStatus("running");
  };

  const rows = DRY_ROWS.filter((r) =>
    tab === "All Runs" ? true : tab === "Failure" ? r.outcome === "fail" : r.reviewed,
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-6">
      <StepHeader
        title="Dry run"
        subtitle="Sample up to 20 conversations from your cohort window and run the judge synchronously. Results appear below; this does not create a batch evaluation job."
      />

      {status === "running" ? (
        <DryRunLoading scored={scored} total={DRY_TOTAL} />
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between">
            <Segmented value={tab} onChange={(v) => setTab(v as DryTab)} options={["Failure", "All Runs", "Reviewed"]} />
            <button
              onClick={rerun}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Play size={13} /> Re-run
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 text-xs font-medium text-muted-foreground">
              <span>Result and ID</span>
              <span>Outcome</span>
            </div>
            {rows.length === 0 ? (
              <DryRunEmpty tab={tab} onViewAll={() => setTab("All Runs")} />
            ) : (
              <ul>
                {rows.map((r, i) => {
                  const o = OUTCOME[r.outcome];
                  return (
                    <li
                      key={r.id}
                      onClick={() => setReviewIdx(i)}
                      className="flex cursor-pointer items-center justify-between gap-4 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-secondary/40"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] leading-relaxed text-foreground">{r.result}</p>
                        <p className="mt-1 font-mono text-[11px] text-muted-foreground">{r.id}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {r.runs} {r.runs === 1 ? "run" : "runs"}
                        </span>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide", o.cls)}>
                          {o.label}
                        </span>
                        <ChevronRight size={15} className="text-muted-foreground" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      <ConversationReview
        open={reviewIdx !== null}
        onOpenChange={(v) => !v && setReviewIdx(null)}
        items={rows.map(toReviewItem)}
        index={reviewIdx ?? 0}
        onIndexChange={setReviewIdx}
        metric="phone_number_collection"
      />
    </div>
  );
}

function DryRunLoading({ scored, total }: { scored: number; total: number }) {
  const pct = Math.round((scored / total) * 100);
  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-5 rounded-xl border border-border bg-card px-6 py-16 text-center">
      <Loader2 size={22} className="animate-spin text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">Running the judge…</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Scoring <span className="font-mono tabular-nums text-foreground">{scored}</span> of{" "}
          <span className="font-mono tabular-nums">{total}</span> sample conversations
        </p>
      </div>
      <div className="h-1 w-56 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DryRunEmpty({ tab, onViewAll }: { tab: DryTab; onViewAll: () => void }) {
  const copy: Record<DryTab, { icon: React.ReactNode; title: string; description: string }> = {
    Failure: {
      icon: <Check size={18} />,
      title: "No failures",
      description: "Every scored conversation passed the judge in this sample.",
    },
    Reviewed: {
      icon: <ClipboardCheck size={18} />,
      title: "Nothing reviewed yet",
      description: "Conversations you mark as reviewed will collect here.",
    },
    "All Runs": {
      icon: <ListChecks size={18} />,
      title: "No sample runs",
      description: "The dry run didn't score any conversations from this cohort.",
    },
  };
  const c = copy[tab];
  return (
    <EmptyState
      icon={c.icon}
      title={c.title}
      description={c.description}
      action={tab !== "All Runs" ? <EmptyAction onClick={onViewAll}>View all runs</EmptyAction> : undefined}
    />
  );
}

/* ── Step 4 · Activate ───────────────────────────────────────────────────── */

type ReviewRow = [string, React.ReactNode] | null;

// Same review-table format as the Create Campaign wizard (RtReviewSection):
// a titled group with a bordered table, [180px | 1fr] rows.
function ReviewSection({ title, rows }: { title: string; rows: ReviewRow[] }) {
  const visible = rows.filter(Boolean) as Exclude<ReviewRow, null>[];
  return (
    <div>
      <div className="mb-2 text-xs font-medium text-muted-foreground">{title}</div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {visible.map(([label, value], i) => (
          <div
            key={i}
            className={cn(
              "grid grid-cols-[180px_1fr] text-sm",
              i < visible.length - 1 && "border-b border-border",
            )}
          >
            <div className="border-r border-border bg-card px-3 py-2.5 text-muted-foreground">{label}</div>
            <div className="px-3 py-2.5 text-foreground">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivateStep() {
  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-6">
      <div className="flex flex-col gap-6">
        <ReviewSection
          title="Metric"
          rows={[
            ["Name", <span key="n" className="font-medium">Phone_number_collection_check</span>],
            ["Checks for", "true means the phone number was collected correctly end to end. false means something in the collection flow failed."],
            ["Output", "boolean · pass when true"],
            ["Success criteria", "Pass when true"],
          ]}
        />

        <ReviewSection
          title="Judge"
          rows={[
            ["Provider", "google"],
            ["Model", "gemini-2.5-flash"],
            ["Temperature", "0.1"],
          ]}
        />

        <ReviewSection
          title="Cohort"
          rows={[
            [
              "Filters",
              <div key="f" className="flex flex-wrap gap-1.5">
                {["outcome: Resolved", "duration: 180+"].map((f) => (
                  <span key={f} className="rounded-md border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>,
            ],
            ["Limit", "cap 50 calls/run"],
          ]}
        />

        <ReviewSection
          title="Schedule"
          rows={[
            ["Cadence", "Every day at 09:00"],
            ["Alert", "Email you when pass rate < 75%"],
          ]}
        />

        <ReviewSection
          title="Dry run"
          rows={[
            [
              "Result",
              <span key="r" className="text-emerald-400">
                <Check size={13} className="mr-1 inline align-[-1px]" strokeWidth={3} />
                Validated · 100% pass rate on 20 sample calls
              </span>,
            ],
          ]}
        />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        You can pause, edit, or delete this metric anytime from its detail page.
      </p>
    </div>
  );
}

/* ── Primitives ──────────────────────────────────────────────────────────── */

// Collapsible section — a header row that toggles its body. Collapsed by
// default; shows a one-line summary of the current values when closed.
function Collapsible({ title, summary, children }: { title: string; summary?: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left"
      >
        <ChevronRight size={15} className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
        <span className="text-sm font-medium text-foreground">{title}</span>
        {!open && summary && (
          <span className="ml-auto truncate text-xs text-muted-foreground">{summary}</span>
        )}
      </button>
      {open && <div className="mt-3 pl-[23px]">{children}</div>}
    </div>
  );
}

// Comma/Enter-to-capsule input for the metric's possible values. Same field
// recipe + pill style as the platform's multi-value inputs.
function PillInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = React.useState("");
  const commit = () => {
    const v = draft.trim().replace(/,$/, "").trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
      {values.map((v, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-xs text-foreground">
          {v}
          <span
            role="button"
            tabIndex={0}
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={11} />
          </span>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => (e.target.value.includes(",") ? commit() : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "," || e.key === "Enter") { e.preventDefault(); commit(); }
          else if (e.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1));
        }}
        onBlur={commit}
        placeholder={values.length ? "" : placeholder}
        className="min-w-[80px] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

// Tiny inline add-input — commits on comma / Enter / blur. Used in Success
// Criteria to add a value that also flows back into the Value capsules.
function InlineAdd({ onAdd, placeholder }: { onAdd: (v: string) => void; placeholder?: string }) {
  const [draft, setDraft] = React.useState("");
  const commit = () => {
    const v = draft.trim().replace(/,$/, "").trim();
    if (v) onAdd(v);
    setDraft("");
  };
  return (
    <input
      value={draft}
      onChange={(e) => (e.target.value.includes(",") ? commit() : setDraft(e.target.value))}
      onKeyDown={(e) => {
        if (e.key === "," || e.key === "Enter") { e.preventDefault(); commit(); }
      }}
      onBlur={commit}
      placeholder={placeholder}
      className="h-9 min-w-[120px] flex-1 rounded-lg border border-border bg-transparent px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
    />
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-base font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

// Field variant for the schedule row: always reserves the hint line (renders a
// blank placeholder when no hint) so every column's control aligns on one row.
function SchedField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <p className="-mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{hint ?? " "}</p>
      {children}
    </div>
  );
}

// Segmented tabs — same recipe as PriorityField in Create Campaign.
function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="inline-flex h-8 items-center gap-1 rounded-xl border border-border bg-input/30 p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium transition-colors",
            value === o ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// Shared Select from the design system (same as Create Campaign).
function Sel({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className={cn("h-9 w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
