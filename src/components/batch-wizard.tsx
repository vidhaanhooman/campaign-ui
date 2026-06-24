"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ClipboardList,
  FileSpreadsheet,
  FlaskConical,
  Megaphone,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Timer,
  Upload,
  X,
  Zap,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { AgentPicker } from "@/components/agent-picker";
import { VersionPicker } from "@/components/version-picker";
import { NumberPoolPicker } from "@/components/number-pool-picker";
import { OutcomePicker } from "@/components/outcome-picker";
import { ErrorSummary } from "@/components/error-summary";
import { DatePicker } from "@/components/date-time-picker";
import { NumberStepper } from "@/components/number-stepper";
import { PriorityField } from "@/components/priority-field";
import { TimePicker } from "@/components/time-picker";

import {
  AGENT_DETAILS,
  DEFAULT_OUTCOMES,
  NUMBERS,
  OUTCOMES,
  TIMEZONES,
  priorityLabel,
  type Unit,
} from "@/lib/campaign-data";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Identity", blurb: "Name, agent and numbers", icon: ClipboardList },
  { id: 2, title: "Audience", blurb: "Upload CSV", icon: FileSpreadsheet },
  {
    id: 3,
    title: "Schedule & retries",
    blurb: "Timing and follow-up",
    icon: Timer,
  },
  { id: 4, title: "Review", blurb: "Confirm and start", icon: Settings2 },
] as const;

type CsvRow = { phone: string; name: string; order: string };
const SAMPLE_ROWS: CsvRow[] = [
  { phone: "+919848295833", name: "Tom", order: "#5521" },
  { phone: "+919418290453", name: "John", order: "#5522" },
  { phone: "+919392532890", name: "Harry", order: "#5523" },
  { phone: "+917028593850", name: "Smith", order: "#5524" },
  { phone: "+919876543210", name: "Aarav", order: "#5525" },
];

export function BatchWizard({
  onBack,
  onClose,
  defaultStep = 1,
}: {
  onBack: () => void;
  onClose: () => void;
  defaultStep?: number;
}) {
  const [step, setStep] = useState(defaultStep);

  // identity
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agentVersion, setAgentVersion] = useState("Live");
  const agentName =
    AGENT_DETAILS.find((a) => a.id === agentId)?.name ?? "";
  const [abOn, setAbOn] = useState(false);
  const [abArms, setAbArms] = useState<
    { agentId: string; versionName: string; pct: number }[]
  >([
    { agentId: "", versionName: "Live", pct: 50 },
    { agentId: "", versionName: "Live", pct: 50 },
  ]);
  const abTotal = abArms.reduce((s, a) => s + (Number(a.pct) || 0), 0);
  const abValid =
    !abOn ||
    (abTotal === 100 && abArms.every((a) => a.agentId && a.versionName));

  // pool
  const [pool, setPool] = useState<string[]>([NUMBERS[0]]);
  const [poolQuery, setPoolQuery] = useState("");
  const filteredNumbers = useMemo(() => {
    if (!poolQuery.trim()) return NUMBERS;
    const q = poolQuery.replace(/\s/g, "").toLowerCase();
    return NUMBERS.filter((n) => n.toLowerCase().includes(q));
  }, [poolQuery]);
  const togglePool = (n: string) =>
    setPool((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  // audience
  const [uploaded, setUploaded] = useState(false);
  const [csvName, setCsvName] = useState("");

  // schedule
  const [startMode, setStartMode] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState("2026-06-21T08:30");
  const [chStart, setChStart] = useState("10:00");
  const [chEnd, setChEnd] = useState("21:00");
  const [tz, setTz] = useState("Asia/Kolkata");
  const [stopAt, setStopAt] = useState("2026-07-17T15:41");

  // retries
  const [retries, setRetries] = useState(2);
  const [intSameVal, setIntSameVal] = useState(6);
  const [intSameUnit, setIntSameUnit] = useState<Unit>("hr");
  // Extras only — DEFAULT_OUTCOMES are always on and shown above the dropdown.
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const allOutcomes = [...DEFAULT_OUTCOMES, ...outcomes];
  const [retryMode, setRetryMode] = useState<"all" | "perAttempt">("all");
  const [perAttemptIntervals, setPerAttemptIntervals] = useState<
    { val: number; unit: Unit }[]
  >([]);
  const getAttemptGap = (i: number) =>
    perAttemptIntervals[i] ?? { val: intSameVal, unit: intSameUnit };
  const setAttemptGap = (
    i: number,
    patch: Partial<{ val: number; unit: Unit }>,
  ) =>
    setPerAttemptIntervals((p) => {
      const next = [...p];
      while (next.length <= i)
        next.push({ val: intSameVal, unit: intSameUnit });
      next[i] = { ...next[i], ...patch };
      return next;
    });
  const intervalGaps = Math.max(0, retries - 1);

  // advanced
  const [from, setFrom] = useState(NUMBERS[0]);
  const [priority, setPriority] = useState(5);
  const [prioMode, setPrioMode] = useState<"all" | "perAttempt">("all");
  const [perAttemptPrio, setPerAttemptPrio] = useState<number[]>([]);
  const getAttemptPrio = (i: number) => perAttemptPrio[i] ?? priority;
  const setAttemptPrio = (i: number, v: number) =>
    setPerAttemptPrio((p) => {
      const next = [...p];
      while (next.length <= i) next.push(priority);
      next[i] = v;
      return next;
    });
  const [slots, setSlots] = useState(12);
  const [bursting, setBursting] = useState(false);
  const WORKSPACE_TOTAL = 200;

  const current = STEPS.find((s) => s.id === step)!;

  const [showErrors, setShowErrors] = useState(false);

  const step1Errors = useMemo(() => {
    const e: { name?: string; agent?: string; pool?: string } = {};
    if (!name.trim()) e.name = "Give the campaign a name.";
    if (abOn) {
      if (!abValid) {
        if (abTotal !== 100) e.agent = "Variant splits must total 100%.";
        else e.agent = "Every variant needs an agent.";
      }
    } else if (!agentId) {
      e.agent = "Pick an agent.";
    }
    if (pool.length === 0) e.pool = "Select at least one number.";
    return e;
  }, [name, abOn, abValid, abTotal, agentId, pool.length]);

  const step2Errors = useMemo(() => {
    const e: { csv?: string } = {};
    if (!uploaded) e.csv = "Upload a CSV to continue.";
    return e;
  }, [uploaded]);

  const stepErrors = useMemo(() => {
    const s: Record<number, boolean> = {};
    s[1] = Object.keys(step1Errors).length > 0;
    s[2] = Object.keys(step2Errors).length > 0;
    return s;
  }, [step1Errors, step2Errors]);

  const canContinue = useMemo(() => {
    if (step === 1) return !stepErrors[1];
    if (step === 2) return !stepErrors[2];
    return true;
  }, [step, stepErrors]);

  // Auto-clear errors as the user fixes them
  useEffect(() => {
    if (showErrors && canContinue) setShowErrors(false);
  }, [showErrors, canContinue]);

  return (
    <div className="flex flex-col h-full">
      {/* TOP BAR — title row, then a centered step row below */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-8 py-4">
          <h1 className="text-lg font-semibold tracking-tight text-text">
            Create batch campaign
          </h1>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <X size={14} />
          </button>
        </div>
        <nav className="flex items-center justify-center gap-1 px-8 pb-3">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const done = s.id < step;
            const hasError = showErrors && stepErrors[s.id];
            return (
              <div key={s.id} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setShowErrors(false);
                    setStep(s.id);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors",
                    active && "bg-surface-2 text-text",
                    !active &&
                      "text-text-dim hover:bg-surface-2/60 hover:text-text",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums",
                      hasError && "bg-red-400 text-black font-semibold",
                      !hasError && active && "bg-white text-black font-semibold",
                      !hasError && done && !active && "bg-surface text-text-muted",
                      !hasError && !active && !done && "bg-surface-2 text-text-muted",
                    )}
                  >
                    {hasError ? "!" : done ? <Check size={10} strokeWidth={3} /> : s.id}
                  </span>
                  <span className="font-medium">{s.title}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className="h-px w-4 bg-border" />
                )}
              </div>
            );
          })}
        </nav>
      </header>

      {/* CONTENT */}
      <div className="flex flex-col min-h-0 flex-1">

        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 max-w-3xl w-full mx-auto">
            {/* === STEP 1 — Identity === */}
            {step === 1 && (
              <div className="space-y-6">
                {showErrors && Object.keys(step1Errors).length > 0 && (
                  <ErrorSummary
                    errors={Object.values(step1Errors).filter(Boolean) as string[]}
                  />
                )}
                <FieldGroup label="Campaign name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Q3 win-back outbound"
                    className={cn(
                      "h-9 w-full rounded-md border bg-surface-2 px-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-white",
                      showErrors && step1Errors.name
                        ? "border-red-400"
                        : "border-border-strong",
                    )}
                  />
                </FieldGroup>
                {/* A/B test toggle — sits above the agent section */}
                <div className="flex items-start gap-3 rounded-md border border-border-strong bg-surface-2 px-3 py-3">
                  <Switch
                    checked={abOn}
                    onCheckedChange={(v) => {
                      setAbOn(Boolean(v));
                      if (v && agentId) {
                        setAbArms((arms) => {
                          const next = [...arms];
                          next[0] = {
                            agentId,
                            versionName: agentVersion,
                            pct: 50,
                          };
                          return next;
                        });
                      }
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-text">
                      <FlaskConical size={13} className="text-text-muted" />
                      A/B test
                    </div>
                    <div className="text-xs text-text-muted leading-relaxed mt-1">
                      Tests different agents or versions side by side to find what performs best.
                    </div>
                  </div>
                </div>

                {!abOn ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_180px] gap-2">
                      <FieldGroup label="Agent">
                        <AgentPicker
                          agentId={agentId}
                          onChange={(id) => {
                            setAgentId(id);
                            setAgentVersion("Live");
                          }}
                        />
                      </FieldGroup>
                      <FieldGroup label="Version">
                        <VersionPicker
                          agentId={agentId}
                          versionName={agentVersion}
                          onChange={setAgentVersion}
                        />
                      </FieldGroup>
                    </div>
                    <div className="text-xs text-text-muted leading-relaxed">
                      <span className="font-medium text-text">Live</span> always
                      uses whichever version is currently in production.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="text-sm font-medium text-text">Variants</div>
                    {abArms.map((arm, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-md bg-surface-2 text-xs font-mono text-text-muted shrink-0">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <AgentPicker
                            agentId={arm.agentId}
                            onChange={(id) =>
                              setAbArms((p) =>
                                p.map((x, j) =>
                                  j === i
                                    ? { ...x, agentId: id, versionName: "Live" }
                                    : x,
                                ),
                              )
                            }
                          />
                        </div>
                        <div className="w-[150px] shrink-0">
                          <VersionPicker
                            agentId={arm.agentId}
                            versionName={arm.versionName}
                            onChange={(v) =>
                              setAbArms((p) =>
                                p.map((x, j) =>
                                  j === i ? { ...x, versionName: v } : x,
                                ),
                              )
                            }
                          />
                        </div>
                        <NumberStepper
                          value={arm.pct}
                          onChange={(v) =>
                            setAbArms((p) =>
                              p.map((x, j) =>
                                j === i ? { ...x, pct: v } : x,
                              ),
                            )
                          }
                          min={0}
                          max={100}
                          suffix="%"
                          className="w-24 shrink-0"
                        />
                        <button
                          disabled={abArms.length <= 2}
                          title={
                            abArms.length <= 2
                              ? "An A/B test needs at least two variants."
                              : "Remove variant"
                          }
                          onClick={() =>
                            setAbArms((p) => p.filter((_, j) => j !== i))
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:text-text-muted/50 disabled:hover:bg-transparent"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() =>
                          setAbArms((p) => [
                            ...p,
                            { agentId: "", versionName: "Live", pct: 0 },
                          ])
                        }
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-dim hover:text-text"
                      >
                        <Plus size={13} /> Add variant
                      </button>
                      <span
                        className={cn(
                          "text-xs font-mono tabular-nums",
                          abTotal === 100 ? "text-text-muted" : "text-text",
                        )}
                      >
                        {abTotal}% assigned
                        {abTotal !== 100 && (
                          <span className="text-text-muted">
                            {" "}
                            · must equal 100%
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Calling Number — popover-style multi-select */}
                <FieldGroup
                  label="Calling numbers"
                  hint={
                    pool.length > 1
                      ? `${pool.length} numbers · rotated across the ${retries} attempts.`
                      : "More numbers rotate across attempts and improve pickup rates."
                  }
                >
                  <NumberPoolPicker
                    pool={pool}
                    onToggle={togglePool}
                    onClear={() => setPool([])}
                  />
                </FieldGroup>
              </div>
            )}

            {/* === STEP 2 — Audience === */}
            {step === 2 && (
              <div className="space-y-6">
                {showErrors && Object.keys(step2Errors).length > 0 && (
                  <ErrorSummary
                    errors={Object.values(step2Errors).filter(Boolean) as string[]}
                  />
                )}
                <p className="text-sm text-text-muted leading-relaxed">
                  phone must include the country code (+91…). Any other column
                  becomes a ${"{name}"} or ${"{order}"} the agent can use
                  mid-call.
                </p>

                {!uploaded ? (
                  <div className="space-y-5">
                    {/* Dropzone — above the example so the primary action is first */}
                    <button
                      type="button"
                      onClick={() => {
                        setUploaded(true);
                        setCsvName("win-back-q3.csv");
                        toast.success("CSV parsed · 4,812 rows");
                      }}
                      className={cn(
                        "w-full flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-surface-2 px-6 py-12 text-center transition-colors hover:bg-surface",
                        showErrors && step2Errors.csv
                          ? "border-red-400"
                          : "border-border-strong",
                      )}
                    >
                      <CsvLogo />
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-text">
                          <Upload size={13} className="text-text-muted" />
                          Drop CSV or click to upload
                        </div>
                        <div className="text-xs text-text-muted">
                          <span className="font-mono">.csv</span> files only. Up
                          to 5,000 rows.
                        </div>
                      </div>
                    </button>

                    {/* Sample CSV preview — Sheets-style chrome, dark theme */}
                    <div
                      className="rounded-md border border-border-strong overflow-hidden"
                      style={{ backgroundColor: "var(--surface)" }}
                    >
                      {/* App chrome */}
                      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                        <FileSpreadsheet size={13} className="text-text-muted" />
                        <span className="text-sm text-text font-medium">
                          sample-audience.csv
                        </span>
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                          · expected format
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const header = "phone,name,order\n";
                            const rows = SAMPLE_ROWS.map(
                              (r) => `${r.phone},${r.name},${r.order}`,
                            ).join("\n");
                            const blob = new Blob([header + rows], {
                              type: "text/csv",
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "sample-audience.csv";
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success("sample-audience.csv downloaded");
                          }}
                          className="ml-auto text-[11px] text-text-dim hover:text-text"
                        >
                          Download sample
                        </button>
                      </div>

                      {/* Fake menu bar */}
                      <div className="flex items-center gap-4 border-b border-border px-3 py-1 text-[11px] text-text-dim">
                        <span>File</span>
                        <span>Edit</span>
                        <span>View</span>
                        <span>Insert</span>
                        <span>Format</span>
                        <span>Data</span>
                      </div>

                      {/* Formula bar */}
                      <div
                        className="flex items-center gap-3 border-b border-border px-2 py-1.5"
                        style={{ backgroundColor: "var(--bg)" }}
                      >
                        <div className="flex h-6 w-12 items-center justify-center rounded border border-border-strong bg-surface-2 text-[11px] font-mono text-text">
                          A1
                        </div>
                        <span className="italic text-text-muted text-[12px] font-mono">
                          fx
                        </span>
                        <div className="flex-1 h-6 rounded border border-border-strong bg-surface-2 px-2 flex items-center text-[11px] font-mono text-text">
                          phone
                        </div>
                      </div>

                      {/* Spreadsheet grid */}
                      <div className="font-mono text-[12px] text-text">
                        {/* Column letters */}
                        <div
                          className="grid grid-cols-[32px_1.4fr_1fr_1fr] border-b border-border-strong text-[11px] text-text-muted"
                          style={{ backgroundColor: "var(--bg)" }}
                        >
                          <div className="border-r border-border-strong px-2 py-1 text-center">
                            &nbsp;
                          </div>
                          <div className="border-r border-border-strong px-2 py-1 text-center">
                            A
                          </div>
                          <div className="border-r border-border-strong px-2 py-1 text-center">
                            B
                          </div>
                          <div className="px-2 py-1 text-center">C</div>
                        </div>
                        {/* Schema header row 1 */}
                        <div className="grid grid-cols-[32px_1.4fr_1fr_1fr] border-b border-border">
                          <div
                            className="border-r border-border-strong px-2 py-1.5 text-center text-[11px] text-text-muted"
                            style={{ backgroundColor: "var(--bg)" }}
                          >
                            1
                          </div>
                          <div className="border-r border-border px-3 py-1.5 font-semibold text-emerald-400">
                            phone
                          </div>
                          <div className="border-r border-border px-3 py-1.5 font-semibold text-blue-400">
                            name
                          </div>
                          <div className="px-3 py-1.5 font-semibold text-blue-400">
                            order
                          </div>
                        </div>
                        {/* Data rows */}
                        {SAMPLE_ROWS.slice(0, 3).map((r, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-[32px_1.4fr_1fr_1fr] border-b border-border last:border-b-0"
                          >
                            <div
                              className="border-r border-border-strong px-2 py-1.5 text-center text-[11px] text-text-muted"
                              style={{ backgroundColor: "var(--bg)" }}
                            >
                              {i + 2}
                            </div>
                            <div className="border-r border-border px-3 py-1.5">
                              {r.phone}
                            </div>
                            <div className="border-r border-border px-3 py-1.5">
                              {r.name}
                            </div>
                            <div className="px-3 py-1.5">{r.order}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-md border border-border-strong bg-surface-2 px-3 py-2.5">
                      <div className="flex size-8 items-center justify-center rounded-md bg-surface">
                        <FileSpreadsheet size={13} className="text-text" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text truncate">
                            {csvName}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border-strong bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                            <Check size={10} strokeWidth={3} /> Uploaded
                          </span>
                        </div>
                        <div className="text-xs text-text-muted">
                          4,812 rows · phone + 2 context columns
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => {
                            setUploaded(false);
                            setCsvName("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2.5 py-1.5 text-xs text-text-dim transition-colors hover:border-text-muted/40 hover:text-text"
                        >
                          <RotateCcw size={12} /> Replace file
                        </button>
                      </div>
                    </div>

                    {/* preview */}
                    <div className="rounded-md border border-border-strong bg-surface-2 overflow-hidden">
                      <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-border bg-surface px-3 py-2 text-[11px] font-semibold text-text-muted">
                        <div className="font-mono">phone</div>
                        <div className="font-mono">name</div>
                        <div className="font-mono">order</div>
                      </div>
                      {SAMPLE_ROWS.map((r, i) => (
                        <div
                          key={i}
                          className={cn(
                            "grid grid-cols-[1.4fr_1fr_1fr] px-3 py-2 text-xs font-mono text-text",
                            i < SAMPLE_ROWS.length - 1 &&
                              "border-b border-border",
                          )}
                        >
                          <div>{r.phone}</div>
                          <div>{r.name}</div>
                          <div>{r.order}</div>
                        </div>
                      ))}
                      <div className="bg-surface/70 px-3 py-1.5 text-[11px] text-text-muted">
                        Showing 5 of 4,812 rows
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === STEP 3 — Schedule & retries === */}
            {step === 3 && (
              <div className="space-y-6">

                <FieldGroup
                  label="Campaign start"
                  hint="When the campaign begins placing calls."
                >
                  <div className="flex flex-col items-start gap-3">
                    <div className="inline-flex items-center rounded-md border border-border-strong bg-surface-2 p-0.5">
                      {(
                        [
                          { v: "now", label: "Start now" },
                          { v: "schedule", label: "Schedule" },
                        ] as const
                      ).map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          onClick={() => setStartMode(o.v)}
                          className={cn(
                            "h-7 rounded-md px-3 text-xs transition-colors",
                            startMode === o.v
                              ? "bg-white text-black shadow-sm"
                              : "text-text-dim hover:text-text",
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    {startMode === "schedule" && (
                      <div className="flex items-stretch gap-2">
                        <DatePicker
                          value={scheduledAt}
                          onChange={setScheduledAt}
                          className="w-44"
                        />
                        <TimePicker
                          label="Time"
                          value={scheduledAt.split("T")[1] || "00:00"}
                          onChange={(t) =>
                            setScheduledAt(
                              `${scheduledAt.split("T")[0]}T${t}`,
                            )
                          }
                          className="w-40"
                        />
                      </div>
                    )}
                  </div>
                </FieldGroup>

                <FieldGroup
                  label="Campaign expiry"
                  hint="No new calls are placed after this time."
                >
                  <div className="flex items-stretch gap-2">
                    <DatePicker
                      value={stopAt}
                      onChange={setStopAt}
                      className="w-44"
                    />
                    <TimePicker
                      label="Time"
                      value={stopAt.split("T")[1] || "00:00"}
                      onChange={(t) =>
                        setStopAt(`${stopAt.split("T")[0]}T${t}`)
                      }
                      className="w-40"
                    />
                  </div>
                </FieldGroup>

                <FieldGroup
                  label="Calling hours"
                  hint="Calls are only placed within this range."
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <TimePicker
                      value={chStart}
                      onChange={setChStart}
                      label="Start"
                      className="w-36"
                    />
                    <TimePicker
                      value={chEnd}
                      onChange={setChEnd}
                      label="End"
                      className="w-36"
                    />
                    <Select value={tz} onValueChange={(v) => v && setTz(v)}>
                      <SelectTrigger className="h-[52px] w-56">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FieldGroup>

                <FieldGroup
                  label="Total attempts"
                  hint="Including the first call."
                >
                  <NumberStepper
                    value={retries}
                    onChange={(v) => setRetries(Math.max(1, v))}
                    min={1}
                    className="w-24"
                  />
                </FieldGroup>

                {retries > 1 && (
                  <FieldGroup
                    label="Retry interval"
                    hint={
                      retryMode === "all"
                        ? `Waits ${intSameVal} ${intSameUnit === "min" ? "minutes" : "hours"} before every retry.`
                        : `How long to wait before each retry attempt.`
                    }
                  >
                    <div className="inline-flex items-center rounded-md border border-border-strong bg-surface-2 p-0.5 mb-3">
                      {(
                        [
                          { v: "all", label: "All attempts" },
                          { v: "perAttempt", label: "Per attempt" },
                        ] as const
                      ).map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          onClick={() => setRetryMode(o.v)}
                          className={cn(
                            "h-7 rounded-md px-3 text-xs transition-colors",
                            retryMode === o.v
                              ? "bg-white text-black shadow-sm"
                              : "text-text-dim hover:text-text",
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>

                    {retryMode === "all" ? (
                      <div className="flex items-center gap-2">
                        <NumberStepper
                          value={intSameVal}
                          onChange={setIntSameVal}
                          min={0}
                          className="w-24"
                        />
                        <Select
                          value={intSameUnit}
                          onValueChange={(v) => v && setIntSameUnit(v as Unit)}
                        >
                          <SelectTrigger className="w-28 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="min">minutes</SelectItem>
                            <SelectItem value="hr">hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Array.from({ length: intervalGaps }).map((_, i) => {
                          const cur = getAttemptGap(i);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-16 shrink-0 text-sm text-text-muted">Retry {i + 1}</span>
                              <NumberStepper
                                value={cur.val}
                                onChange={(v) => setAttemptGap(i, { val: v })}
                                min={0}
                                className="w-24"
                              />
                              <Select
                                value={cur.unit}
                                onValueChange={(v) =>
                                  v && setAttemptGap(i, { unit: v as Unit })
                                }
                              >
                                <SelectTrigger className="w-28 h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="min">minutes</SelectItem>
                                  <SelectItem value="hr">hours</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </FieldGroup>
                )}

                {retries > 1 && (
                  <FieldGroup
                    label="Retry outcomes"
                    hint="Default outcomes always trigger a retry. Others can be added below."
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mr-1">
                          Default
                        </span>
                        {["not_connected", "busy_callback"].map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2 py-0.5 text-xs font-mono text-text"
                            title={`Always retried: ${DEFAULT_OUTCOMES.join(", ")}`}
                          >
                            <Lock size={10} className="text-text-muted" />
                            {d}
                          </span>
                        ))}
                      </div>
                      <OutcomePicker
                        outcomes={outcomes}
                        onToggle={(o) =>
                          setOutcomes((p) =>
                            p.includes(o)
                              ? p.filter((x) => x !== o)
                              : [...p, o],
                          )
                        }
                        onClear={() => setOutcomes([])}
                      />
                    </div>
                  </FieldGroup>
                )}

                <div className="border-t border-border pt-5 space-y-5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Advanced
                  </div>
                  {/* Priority — presets, with numbers under Advanced */}
                  <PriorityField
                    priority={priority}
                    setPriority={setPriority}
                    retries={retries}
                    prioMode={prioMode}
                    setPrioMode={setPrioMode}
                    getAttemptPrio={getAttemptPrio}
                    setAttemptPrio={setAttemptPrio}
                  />

                  {/* Slots limit */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-text">
                      Slots limit
                    </div>
                    <NumberStepper
                      value={slots}
                      onChange={(v) =>
                        setSlots(Math.min(WORKSPACE_TOTAL, Math.max(0, v)))
                      }
                      min={0}
                      max={WORKSPACE_TOTAL}
                      className="w-24"
                    />
                    <div className="text-xs text-text-muted leading-relaxed">
                      Workspace has{" "}
                      <span className="text-text font-medium tabular-nums">
                        {WORKSPACE_TOTAL}
                      </span>{" "}
                      slots.
                    </div>
                  </div>

                  {/* Use idle workspace slots */}
                  <div className="flex items-start gap-3 rounded-md border border-border-strong bg-surface-2 px-3 py-3">
                    <Switch
                      checked={bursting}
                      onCheckedChange={(v) => setBursting(Boolean(v))}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-text">
                        <Zap size={13} className="text-text-muted" />
                        Use idle workspace slots
                      </div>
                      <div className="text-xs text-text-muted leading-relaxed mt-1">
                        Unused slots from other campaigns are borrowed to finish this batch faster, and returned immediately when another campaign needs them.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === STEP 4 — Review === */}
            {step === 4 && (
              <div className="space-y-7">
                <ReviewSection
                  title="Identity"
                  rows={[
                    [
                      "Campaign name",
                      name ? (
                        <span className="font-medium">{name}</span>
                      ) : (
                        <span className="italic text-text-muted">
                          Untitled
                        </span>
                      ),
                    ],
                    ...(abOn
                      ? ([
                          [
                            "Variants",
                            <div key="ab" className="flex flex-col gap-1.5">
                              {abArms.map((a, i) => {
                                const ag = AGENT_DETAILS.find(
                                  (d) => d.id === a.agentId,
                                );
                                return (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-surface-2 font-mono text-[10px] text-text-muted">
                                      {String.fromCharCode(65 + i)}
                                    </span>
                                    {ag ? (
                                      <span className="text-text">
                                        {ag.name}
                                      </span>
                                    ) : (
                                      <span className="italic text-text-muted">
                                        Not picked
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-dim">
                                      {a.versionName === "Live" && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                      )}
                                      {a.versionName}
                                    </span>
                                    <span className="ml-auto font-mono text-[11px] tabular-nums text-text-muted">
                                      {a.pct}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>,
                          ],
                        ] as ReviewRow[])
                      : ([
                          [
                            "Agent",
                            agentName || (
                              <span className="italic text-text-muted">
                                Not picked
                              </span>
                            ),
                          ],
                          [
                            "Version",
                            <span
                              key="v"
                              className="inline-flex items-center gap-1.5"
                            >
                              {agentVersion === "Live" && (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              )}
                              <span className="font-mono">{agentVersion}</span>
                            </span>,
                          ],
                        ] as ReviewRow[])),
                  ]}
                />

                <ReviewSection
                  title="Audience"
                  rows={[
                    [
                      "Source file",
                      uploaded ? (
                        <span className="font-mono">{csvName}</span>
                      ) : (
                        <span className="italic text-text-muted">No CSV uploaded</span>
                      ),
                    ],
                    [
                      "Rows",
                      uploaded ? (
                        <span className="font-mono tabular-nums">4,812</span>
                      ) : (
                        "—"
                      ),
                    ],
                    ["Columns", <span key="c" className="font-mono">phone, name, order</span>],
                  ]}
                />

                <ReviewSection
                  title="Calling numbers"
                  rows={[
                    [
                      "Pool size",
                      <span key="p" className="font-mono tabular-nums">
                        {pool.length}
                      </span>,
                    ],
                    [
                      "Numbers",
                      <div key="n" className="flex flex-wrap gap-1.5">
                        {pool.length === 0 ? (
                          <span className="italic text-text-muted">
                            None selected
                          </span>
                        ) : (
                          pool.map((n) => (
                            <span
                              key={n}
                              className="rounded-md border border-border-strong bg-surface px-2 py-0.5 text-[11px] font-mono"
                            >
                              {n}
                            </span>
                          ))
                        )}
                      </div>,
                    ],
                  ]}
                />

                <ReviewSection
                  title="Schedule"
                  rows={[
                    [
                      "Campaign start",
                      startMode === "now" ? (
                        "Immediately"
                      ) : (
                        <span className="font-mono tabular-nums">
                          {scheduledAt.replace("T", " ")}
                        </span>
                      ),
                    ],
                    [
                      "Campaign expiry",
                      <span key="s" className="font-mono tabular-nums">
                        {stopAt.replace("T", " ")}
                      </span>,
                    ],
                    [
                      "Calling hours",
                      <span key="h" className="font-mono tabular-nums">
                        {chStart}–{chEnd}{" "}
                        <span className="text-text-muted">{tz}</span>
                      </span>,
                    ],
                  ]}
                />

                <ReviewSection
                  title="Retries"
                  rows={[
                    [
                      "Total attempts",
                      <span key="ta" className="font-mono tabular-nums">
                        {retries}
                      </span>,
                    ],
                    [
                      "Retry interval",
                      <span key="ri" className="font-mono tabular-nums">
                        {intSameVal}
                        {intSameUnit}
                      </span>,
                    ],
                    [
                      "Retry only when",
                      <div key="o" className="flex flex-wrap gap-1">
                        {allOutcomes.length === 0 ? (
                          <span className="italic text-text-muted">None</span>
                        ) : (
                          allOutcomes.map((o) => (
                            <span
                              key={o}
                              className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-dim"
                            >
                              {o}
                            </span>
                          ))
                        )}
                      </div>,
                    ],
                  ]}
                />

                <ReviewSection
                  title="Advanced"
                  rows={[
                    [
                      "Priority",
                      <span key="p">{priorityLabel(priority)}</span>,
                    ],
                    [
                      "Slots limit",
                      <span key="s" className="font-mono tabular-nums">
                        {slots}
                      </span>,
                    ],
                    [
                      "Use idle slots",
                      <span
                        key="b"
                        className={
                          bursting ? "text-text" : "text-text-muted"
                        }
                      >
                        {bursting ? "On" : "Off"}
                      </span>,
                    ],
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div
          className="flex items-center justify-between border-t border-border px-8 py-3"
        >
          <button
            onClick={step === 1 ? onBack : () => setStep(step - 1)}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-text-dim hover:text-text"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-text-dim hover:text-text"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!canContinue) {
                  setShowErrors(true);
                  return;
                }
                setShowErrors(false);
                if (step < STEPS.length) setStep(step + 1);
                else {
                  toast.success("Batch campaign started");
                  onClose();
                }
              }}
              className={cn(
                "rounded-md bg-white px-4 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/90",
              )}
            >
              {step === STEPS.length ? "Start campaign" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-text">{label}</div>
      {children}
      {hint && (
        <div className="text-xs text-text-muted leading-relaxed">{hint}</div>
      )}
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
      {msg}
    </div>
  );
}

type ReviewRow = [string, React.ReactNode] | null;

function ReviewSection({
  title,
  rows,
}: {
  title: string;
  rows: ReviewRow[];
}) {
  const visible = rows.filter(Boolean) as Exclude<ReviewRow, null>[];
  return (
    <div>
      <div className="text-[11px] font-semibold text-text-muted mb-2">
        {title}
      </div>
      <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
        {visible.map(([label, value], i) => (
          <div
            key={i}
            className="grid grid-cols-[180px_1fr] text-xs"
          >
            <div
              className="border-r border-border px-3 py-2 text-text-muted"
              style={{ backgroundColor: "var(--bg)" }}
            >
              {label}
            </div>
            <div className="px-3 py-2 text-text">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BatchSummary({
  name,
  agentName,
  agentVersion,
  pool,
  uploaded,
  csvName,
  startMode,
  scheduledAt,
  chStart,
  chEnd,
  tz,
  stopAt,
  retries,
  intSameVal,
  intSameUnit,
  outcomes,
  abOn,
  abArms,
}: {
  name: string;
  agentName: string;
  agentVersion: string;
  pool: string[];
  uploaded: boolean;
  csvName: string;
  startMode: "now" | "schedule";
  scheduledAt: string;
  chStart: string;
  chEnd: string;
  tz: string;
  stopAt: string;
  retries: number;
  intSameVal: number;
  intSameUnit: Unit;
  outcomes: string[];
  abOn: boolean;
  abArms: { agentId: string; versionName: string; pct: number }[];
}) {
  const filledAgents = abOn
    ? abArms
        .filter((a) => a.agentId)
        .map(
          (a) =>
            `${AGENT_DETAILS.find((x) => x.id === a.agentId)?.name ?? a.agentId} · ${a.versionName} (${a.pct}%)`,
        )
    : agentName
      ? [`${agentName} · ${agentVersion}`]
      : [];

  return (
    <div className="rounded-lg border border-border-strong bg-surface-2 overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-0.5">
          Live summary
        </div>
        <div className="text-sm font-semibold text-text truncate">
          {name || "Untitled campaign"}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <Row label="Agent">
          {filledAgents.length === 0 ? (
            <span className="text-text-muted italic">Not picked</span>
          ) : (
            filledAgents.map((a, i) => (
              <div key={i} className="truncate">
                {a}
              </div>
            ))
          )}
        </Row>

        <Row label="Calling numbers">
          {pool.length === 0 ? (
            <span className="text-text-muted italic">None selected</span>
          ) : (
            <span className="font-mono tabular-nums">
              {pool.length} {pool.length === 1 ? "number" : "numbers"}
            </span>
          )}
        </Row>

        <Row label="Audience">
          {!uploaded ? (
            <span className="text-text-muted italic">No CSV uploaded</span>
          ) : (
            <>
              <div className="font-mono truncate">{csvName}</div>
              <div className="text-text-muted text-[11px]">
                4,812 rows · phone + 2 context columns
              </div>
            </>
          )}
        </Row>

        <Row label="Start">
          {startMode === "now" ? (
            "Immediately"
          ) : (
            <span className="font-mono tabular-nums">
              {scheduledAt.replace("T", " ")}
            </span>
          )}
        </Row>

        <Row label="Calling hours">
          <span className="tabular-nums">
            {chStart}–{chEnd}
          </span>
          <span className="text-text-muted ml-1.5">{tz}</span>
        </Row>

        <Row label="Stops calling">
          <span className="font-mono tabular-nums">
            {stopAt.replace("T", " ")}
          </span>
        </Row>

        <Row label="Retries">
          <span className="tabular-nums">{retries}</span> attempts ·{" "}
          <span className="tabular-nums">
            {intSameVal}
            {intSameUnit}
          </span>{" "}
          gap
        </Row>

        <Row label="Retry when">
          {outcomes.length === 0 ? (
            <span className="text-text-muted italic">No outcomes</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {outcomes.map((o) => (
                <span
                  key={o}
                  className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-text-dim"
                >
                  {o}
                </span>
              ))}
            </div>
          )}
        </Row>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
        {label}
      </div>
      <div className="text-xs text-text leading-snug">{children}</div>
    </div>
  );
}

function AgentSelect({
  agentId,
  onChange,
}: {
  agentId: string;
  onChange: (id: string) => void;
}) {
  return (
    <Select value={agentId} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="h-9 w-full">
        <SelectValue placeholder="Select agent" />
      </SelectTrigger>
      <SelectContent>
        {AGENT_DETAILS.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            <span className="flex items-center gap-2">
              <span className="font-medium">{a.name}</span>
              <span className="text-text-muted text-[10px] uppercase tracking-wider">
                · {a.mode}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function VersionSelect({
  agentId,
  versionName,
  onChange,
}: {
  agentId: string;
  versionName: string;
  onChange: (v: string) => void;
}) {
  const agent = AGENT_DETAILS.find((a) => a.id === agentId);
  const versions = agent?.versions ?? [];
  return (
    <Select value={versionName} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="h-9 w-full" disabled={!agent}>
        <SelectValue placeholder={agent ? "Pick a version" : "Pick agent first"} />
      </SelectTrigger>
      <SelectContent>
        {versions.map((v) => (
          <SelectItem key={v.name} value={v.name}>
            <span className="flex items-center gap-2">
              {v.name === "Live" && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
              <span className="font-medium">{v.name}</span>
              {v.tag && (
                <span className="text-text-muted text-xs">· {v.tag}</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* Brand-style mini logos so users recognize what kind of file we expect */

function CsvLogo() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2 py-1"
      title="Generic CSV"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M20 2H7a2 2 0 00-2 2v24a2 2 0 002 2h18a2 2 0 002-2V9l-7-7z"
          fill="#3A3A37"
          stroke="#5E5E58"
        />
        <path d="M20 2v7h7l-7-7z" fill="#2A2A27" />
        <text
          x="16"
          y="24"
          fontFamily="Arial Black, sans-serif"
          fontSize="7"
          fill="#EDEDED"
          textAnchor="middle"
          fontWeight="900"
        >
          CSV
        </text>
      </svg>
      <span className="text-[10px] font-medium text-text-dim">CSV</span>
    </span>
  );
}
