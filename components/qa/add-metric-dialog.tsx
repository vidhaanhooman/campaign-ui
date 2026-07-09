"use client";

/**
 * Add Metric — a 4-step flow (Define · Cohort and Schedule · Dry Run · Activate)
 * hosted in the same right-drawer shell as Create Campaign. Define is built;
 * the later steps are scaffolded.
 */

import * as React from "react";
import {
  ArrowLeftRight,
  Bot,
  Braces,
  Check,
  ChevronDown,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  Flag,
  Gauge,
  Hash,
  ListChecks,
  Maximize2,
  Megaphone,
  MessageSquare,
  Phone,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
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
import { Switch } from "@/components/ui/switch";
import { NumberStepper } from "@/components/number-stepper";
import { DatePickerTime } from "@/components/date-picker-time";
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
  { id: 4, title: "Activate" },
] as const;

// Same input recipe as Create Campaign (batch wizard).
const FIELD =
  "h-9 w-full rounded-md border border-border bg-transparent dark:bg-input/30 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground";

type MetricType = "Boolean" | "Enum" | "Number" | "Categorical";

type MetricTemplate = { type: string; name: string; desc: string };
const TEMPLATES: MetricTemplate[] = [
  {
    type: "ENUM",
    name: "Appropriate_call_end",
    desc: "CORRECT — The agent ended the call at the right time, with a relevant message, no farewell chains, and a clean close.",
  },
  {
    type: "BOOLEAN",
    name: "detail_collection_exp",
    desc: "true — either no detail collection happened in this call, or every detail collection exchange was smooth — no repeats, no confusion.",
  },
  {
    type: "BOOLEAN",
    name: "Phone_number_collection_check",
    desc: "true means the phone number was collected correctly end to end. false means something in the collection went wrong.",
  },
];

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
        className="!max-w-[1040px] flex flex-col overflow-hidden border-l border-border p-0 shadow-2xl shadow-black/60"
      >
        <DialogTitle className="sr-only">Add metric</DialogTitle>
        <MetricWizard onClose={close} />
      </DialogContent>
    </Dialog>
  );
}

function MetricWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = React.useState(1);

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
            return (
              <div key={s.id} className="flex items-center gap-1">
                <button
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors",
                    active ? "bg-card text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums",
                      active ? "bg-primary font-medium text-primary-foreground" : "bg-card text-muted-foreground",
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
        {step === 1 ? <DefineStep /> : step === 2 ? <CohortStep /> : <ScaffoldStep title={STEPS[step - 1].title} />}
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
            onClick={() => {
              if (step < STEPS.length) setStep(step + 1);
              else {
                toast.success("Metric added");
                onClose();
              }
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {step === STEPS.length ? "Add metric" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step 1 · Define ─────────────────────────────────────────────────────── */

const STARTER: Record<MetricType, string> = {
  Boolean:
    "Decide whether the criterion holds in the conversation.\nReturn true if it clearly holds, otherwise false.\n\nTranscript:\n${fullTranscript}",
  Enum:
    "Read the conversation and classify it into exactly one of the labels below.\n\nTranscript:\n${fullTranscript}",
  Number:
    "Score the conversation on the criterion using the range below.\nReturn only the number.\n\nTranscript:\n${fullTranscript}",
  Categorical:
    "Tag the conversation with the most fitting category and a one-line reason.\n\nTranscript:\n${fullTranscript}",
};

const TRANSCRIPT_VARS = ["${fullTranscript}", "${conversationTranscript}", "${agentTranscript}"];
const CONTEXT_VARS = ["${context.currentTime}", "${analysis.results.summary}"];

function DefineStep() {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<MetricType>("Boolean");
  const [enumValues, setEnumValues] = React.useState<string[]>([]);
  const [prompt, setPrompt] = React.useState(STARTER.Boolean);
  const [promptEdited, setPromptEdited] = React.useState(false);
  const [userMsg, setUserMsg] = React.useState("");
  const [active, setActive] = React.useState<string>("name");
  const [fromTemplate, setFromTemplate] = React.useState<string | null>(null);
  const promptRef = React.useRef<HTMLTextAreaElement>(null);

  const changeType = (t: MetricType) => {
    setType(t);
    if (!promptEdited) setPrompt(STARTER[t]);
  };

  const applyTemplate = (t: MetricTemplate) => {
    const tt: MetricType = t.type === "ENUM" ? "Enum" : "Boolean";
    setName(t.name);
    setType(tt);
    if (!promptEdited) setPrompt(STARTER[tt]);
    setFromTemplate(t.name);
  };

  const insertVar = (token: string) => {
    const ta = promptRef.current;
    if (!ta) { setPrompt((p) => `${p}${token}`); setPromptEdited(true); return; }
    const s = ta.selectionStart ?? prompt.length;
    const e = ta.selectionEnd ?? prompt.length;
    const next = prompt.slice(0, s) + token + prompt.slice(e);
    setPrompt(next);
    setPromptEdited(true);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = s + token.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-6">
      {/* start from an existing metric */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Start from an existing metric</span>
          {fromTemplate && (
            <button onClick={() => setFromTemplate(null)} className="text-[11px] text-muted-foreground transition-colors hover:text-foreground">
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TEMPLATES.slice(0, 2).map((t) => (
            <button
              key={t.name}
              onClick={() => applyTemplate(t)}
              className={cn(
                "flex flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-colors",
                fromTemplate === t.name ? "border-ring bg-accent" : "border-border bg-card hover:border-border",
              )}
            >
              <span className="w-fit rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{t.type}</span>
              <span className="text-sm font-medium text-foreground">{t.name}</span>
              <span className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{t.desc}</span>
            </button>
          ))}
          <button
            onClick={() => toast("Browse all metric templates")}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card/40 p-3.5 text-center transition-colors hover:border-border hover:bg-card"
          >
            <span className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground">
              <Plus size={15} />
            </span>
            <span className="text-sm font-medium text-foreground">More templates</span>
            <span className="text-[11px] text-muted-foreground">Browse the library</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
          {/* Identity */}
          <Section title="Identity">
            <Field label="Name" onActive={() => setActive("name")}>
              <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} placeholder="e.g. issue_resolved (letters, numbers, _ and -)" />
            </Field>
            <Field label="Type" onActive={() => setActive("type")}>
              <Segmented value={type} onChange={(v) => changeType(v as MetricType)} options={["Boolean", "Enum", "Number", "Categorical"]} />
            </Field>
            {type === "Enum" && (
              <Field label="Values" hint="Type a value and press comma to add it." onActive={() => setActive("type")}>
                <PillInput values={enumValues} onChange={setEnumValues} placeholder="e.g. positive, neutral, negative" />
              </Field>
            )}
          </Section>

          {/* Judge prompt with variable chips */}
          <Section title="Judge prompt">
            <Field label="Prompt" onActive={() => setActive("prompt")}>
              <div className="relative">
                <textarea
                  ref={promptRef}
                  value={prompt}
                  onChange={(e) => { setPrompt(e.target.value); setPromptEdited(true); }}
                  className={cn(FIELD, "h-44 resize-none py-2.5 font-mono text-[12px] leading-relaxed")}
                  placeholder="Tell the judge what to evaluate and how to decide."
                />
                <button onClick={() => toast("Expand editor")} aria-label="Expand" className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground">
                  <Maximize2 size={13} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Insert</span>
                {[...TRANSCRIPT_VARS, ...CONTEXT_VARS].map((v) => (
                  <button key={v} onClick={() => insertVar(v)} className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground">
                    {v.replace(/\$\{|\}/g, "")}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="User Message" hint="Optional. Defaults to the full transcript." onActive={() => setActive("prompt")}>
              <textarea value={userMsg} onChange={(e) => setUserMsg(e.target.value)} className={cn(FIELD, "h-20 resize-none py-2.5")} />
            </Field>
            <Collapsible title="LLM Settings" />
          </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{title}</div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

// Comma-to-pill input for Enum values — same pill style as Calling numbers,
// without the dropdown. Type a value + comma (or Enter) → pill.
function PillInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = React.useState("");
  const commit = () => {
    const v = draft.trim().replace(/,$/, "").trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm transition-colors focus-within:border-foreground">
      {values.length > 0 && (
        <span className="text-xs font-medium text-muted-foreground">{values.length} selected</span>
      )}
      {values.map((v, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-2 py-0.5 font-mono text-xs text-foreground"
        >
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

/* ── Step 2 · Cohort — which uploaded conversations to score (one-off) ─────── */

const BATCH_TOTAL = 6; // conversations in this uploaded batch (mock)
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const AGENTS = ["Debt Collection Pitch Agent", "Debt Collection Outbound Agent", "Careers_360", "premium", "standard", "palmonas hoomanlabs"];
const OUTCOMES = ["Resolved", "Transferred", "Dropped", "Voicemail", "No answer"];
const END_REASONS = ["Completed", "Caller hung up", "Agent ended", "No answer", "Failed"];
const CAMPAIGNS = ["Q3 Win-back", "Real Estate inbound", "Debt collection"];

// Full conversation filter taxonomy — every field active (multi-select · text ·
// range · pill · custom), grouped like the insights conversations filter.
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
  const [scope, setScope] = React.useState("all"); // all | filtered
  const [filters, setFilters] = React.useState<FilterValues>({});
  const [cap, setCap] = React.useState(false);
  const [limit, setLimit] = React.useState(BATCH_TOTAL);
  const [runMode, setRunMode] = React.useState("Run now"); // Run now | Schedule
  const [when, setWhen] = React.useState(""); // YYYY-MM-DDTHH:mm
  const [tz, setTz] = React.useState("Asia/Kolkata");

  const activeKeys = Object.keys(filters).filter((k) => isSet(filters[k]));
  const matched = scope === "all" ? BATCH_TOTAL : Math.max(1, BATCH_TOTAL - activeKeys.length);
  const evaluated = cap ? Math.min(matched, limit) : matched;

  return (
    <div className="mx-auto max-w-2xl px-8 py-6">
      {/* live preview — the answer to "who will this run on?" */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5">
        <div>
          <div className="text-2xl font-semibold tabular-nums text-foreground">
            {evaluated} <span className="text-sm font-normal text-muted-foreground">of {BATCH_TOTAL}</span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">conversations from this batch will be scored, once.</div>
        </div>
        <span className="rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground">q3_winback.csv</span>
      </div>

      <div className="flex flex-col gap-6">
        <Section title="Which conversations">
          <Segmented value={scope} onChange={setScope} options={["all", "filtered"]} />
          {scope === "filtered" && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {activeKeys.length ? `${activeKeys.length} filter${activeKeys.length === 1 ? "" : "s"} applied` : "No filters — all conversations"}
                </span>
                <FilterDropdown schema={COHORT_SCHEMA} value={filters} onChange={setFilters} quickFilters={QUICK_FILTERS} triggerLabel="Add filter" align="end" />
              </div>
              {activeKeys.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
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
            </div>
          )}
        </Section>

        <Section title="Limit">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-3.5 py-3">
            <span className="min-w-0">
              <span className="block text-sm text-foreground">Cap the number scored</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">Score a sample instead of the whole match set.</span>
            </span>
            <Switch checked={cap} onCheckedChange={(v) => setCap(Boolean(v))} />
          </label>
          {cap && (
            <Field label="Evaluate at most">
              <NumberStepper value={limit} onChange={setLimit} min={1} max={BATCH_TOTAL} step={1} suffix="calls" />
            </Field>
          )}
        </Section>

        <Section title="Schedule">
          <Segmented value={runMode} onChange={setRunMode} options={["Run now", "Schedule"]} />
          {runMode === "Schedule" && (
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
              <Field label="Date & time">
                <DatePickerTime
                  idPrefix="metric-run"
                  date={when ? new Date(when) : undefined}
                  time={when.split("T")[1] || "09:00"}
                  onDateChange={(d) => d && setWhen(`${ymd(d)}T${when.split("T")[1] || "09:00"}`)}
                  onTimeChange={(t) => setWhen(`${when.split("T")[0] || ymd(new Date())}T${t}`)}
                />
              </Field>
              <Field label="Timezone">
                <Sel value={tz} onChange={setTz} options={TIMEZONES} />
              </Field>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            {runMode === "Run now"
              ? "The run starts as soon as you add the metric."
              : when
                ? `Runs once on ${when.split("T")[0]} at ${when.split("T")[1]} · ${tz}.`
                : "Pick a date and time for the one-off run."}
          </p>
        </Section>
      </div>
    </div>
  );
}

/* ── Later steps (scaffold) ──────────────────────────────────────────────── */

function ScaffoldStep({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-8 text-center">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        This step is coming next. We built <span className="text-foreground">Define</span> first.
      </p>
    </div>
  );
}

/* ── Field primitives ────────────────────────────────────────────────────── */

function Field({ label, hint, onActive, children }: { label: string; hint?: string; onActive?: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5" onFocusCapture={onActive} onMouseDown={onActive}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="-mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
      {children}
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

function Collapsible({ title }: { title: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-sm font-medium text-foreground"
      >
        {title}
        <ChevronDown size={15} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="flex flex-col gap-4 border-t border-border p-3.5">
          <Field label="Model">
            <Sel value="gpt-4o-mini" onChange={() => {}} options={["gpt-4o-mini", "gpt-4o", "claude-haiku-4-5"]} />
          </Field>
          <Field label="Temperature" hint="Lower is more deterministic. 0 recommended for scoring.">
            <input className={FIELD} defaultValue="0" inputMode="decimal" />
          </Field>
        </div>
      )}
    </div>
  );
}
