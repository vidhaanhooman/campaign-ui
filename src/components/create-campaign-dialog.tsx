"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Copy,
  FileSpreadsheet,
  FlaskConical,
  Info,
  Lock,
  Megaphone,
  ChevronLeft,
  Phone,
  Plus,
  PlugZap,
  Search,
  Settings2,
  Sparkles,
  Timer,
  X,
  Zap,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
  AGENT_DETAILS,
  DEFAULT_OUTCOMES,
  NUMBERS,
  OUTCOMES,
  OVERRIDABLE,
  TIMEZONES,
  WORKSPACE_TOTAL,
  priorityLabel,
  toMs,
  type OverrideKey,
  type Unit,
} from "@/lib/campaign-data";
import { cn } from "@/lib/utils";
import { AgentPicker } from "@/components/agent-picker";
import { VersionPicker } from "@/components/version-picker";
import { NumberPoolPicker } from "@/components/number-pool-picker";
import { OutcomePicker } from "@/components/outcome-picker";
import { ErrorSummary } from "@/components/error-summary";
import { NumberStepper } from "@/components/number-stepper";
import { PriorityField } from "@/components/priority-field";
import { TimePicker } from "@/components/time-picker";
import { BatchWizard } from "@/components/batch-wizard";

type Phase = "pick" | "realtime" | "batch";

export function CreateCampaignDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [phase, setPhase] = useState<Phase>("pick");

  const handleOpenChange = (
    v: boolean,
    eventDetails?: { reason?: string },
  ) => {
    // Don't close on backdrop click or Escape — only via explicit Cancel / Create
    if (!v && (eventDetails?.reason === "outside-press" || eventDetails?.reason === "escape-key")) {
      return;
    }
    if (!v) setTimeout(() => setPhase("pick"), 200);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        variant="drawer"
        showCloseButton={false}
        style={{ backgroundColor: "var(--surface)" }}
        className="!max-w-[960px] p-0 overflow-hidden flex flex-col border-l border-border-strong shadow-2xl shadow-black/60"
      >
        <DialogTitle className="sr-only">Create campaign</DialogTitle>

        {phase === "pick" && (
          <TypePicker
            onPick={(t) => setPhase(t)}
            onClose={() => handleOpenChange(false)}
          />
        )}
        {phase === "realtime" && (
          <RealtimeWizard
            onBack={() => setPhase("pick")}
            onClose={() => handleOpenChange(false)}
          />
        )}
        {phase === "batch" && (
          <BatchWizard
            onBack={() => setPhase("pick")}
            onClose={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── TYPE PICKER ─────────────────────────── */

const PICKER_OPTIONS = [
  {
    type: "batch" as const,
    icon: FileSpreadsheet,
    title: "Batch",
    tagline: "Upload a CSV. Every row gets a call.",
    body: "The audience is defined upfront. The same agent and settings apply to every contact. Best for one-off outreach.",
    goodFor: ["Outbound drips", "Win-back lists", "Surveys"],
    needs: "A CSV with phone numbers",
  },
  {
    type: "realtime" as const,
    icon: Zap,
    title: "Realtime",
    tagline: "Tasks are sent in via API.",
    body: "The campaign holds the settings. Each task arrives with a phone number and context, and the campaign fills in every other field.",
    goodFor: ["Order placed", "Cart abandoned", "Lead reached out"],
    needs: "API integration",
  },
];

function TypePicker({
  onPick,
  onClose,
}: {
  onPick: (t: "batch" | "realtime") => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="absolute top-3.5 right-3.5 z-10">
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-10 py-10">
        <div className="w-full max-w-3xl">
          <div className="mb-9">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex size-7 items-center justify-center rounded-md bg-surface-2">
                <Megaphone size={13} className="text-text-muted" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                New campaign
              </span>
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-text">
              What kind of campaign?
            </h1>
            <p className="mt-1.5 text-sm text-text-muted max-w-xl">
              This cannot be changed later. The right option depends on how
              calls are triggered.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PICKER_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  onClick={() => onPick(opt.type)}
                  className="group relative flex flex-col gap-4 rounded-lg border border-border-strong bg-surface p-5 text-left shadow-xl shadow-black/40 transition-colors hover:border-text-muted/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-9 items-center justify-center rounded-md bg-surface-2">
                        <Icon size={15} className="text-text" />
                      </span>
                      <span className="text-[15px] font-semibold text-text">
                        {opt.title}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-text" />
                  </div>

                  <div className="text-sm font-medium leading-snug text-text">
                    {opt.tagline}
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {opt.body}
                  </p>

                  <div className="mt-auto space-y-3 pt-3 border-t border-border">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1.5">
                        Good for
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {opt.goodFor.map((g) => (
                          <span
                            key={g}
                            className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-text-dim"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-muted">
                        You&rsquo;ll need
                      </span>
                      <span className="font-medium text-text">{opt.needs}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-center text-xs text-text-muted">
            Not sure?{" "}
            <span className="text-text">
              Batch fits a manually uploaded list; Realtime fits
              software-triggered calls.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────── REALTIME WIZARD ─────────────────────────── */

const STEPS = [
  {
    id: 1,
    title: "Identity",
    blurb: "Name, agent and numbers",
    icon: ClipboardList,
  },
  {
    id: 2,
    title: "Schedule & retries",
    blurb: "Timing and follow-up",
    icon: Timer,
  },
  {
    id: 3,
    title: "API contract",
    blurb: "Task overrides",
    icon: PlugZap,
  },
  {
    id: 4,
    title: "Review",
    blurb: "Confirm and create",
    icon: Settings2,
  },
] as const;

export function RealtimeWizard({
  onBack,
  onClose,
  defaultStep = 1,
}: {
  onBack: () => void;
  onClose: () => void;
  defaultStep?: number;
}) {
  const [step, setStep] = useState(defaultStep);

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

  const [overrides, setOverrides] = useState<Set<OverrideKey>>(
    () => new Set(["from", "endAfter", "priority", "version"] as OverrideKey[]),
  );

  const [chStart, setChStart] = useState("10:00");
  const [chEnd, setChEnd] = useState("21:00");
  const [tz, setTz] = useState("Asia/Kolkata");
  const [startAfterVal, setStartAfterVal] = useState(0);
  const [startAfterUnit, setStartAfterUnit] = useState<Unit>("min");
  const [endAfterVal, setEndAfterVal] = useState(30);
  const [endAfterUnit, setEndAfterUnit] = useState<Unit>("min");

  const [retries, setRetries] = useState(2);
  const [intSameVal, setIntSameVal] = useState(6);
  const [intSameUnit, setIntSameUnit] = useState<Unit>("hr");
  // Extras only — defaults (DEFAULT_OUTCOMES) are always on and shown
  // above the dropdown as locked chips.
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

  const [from, setFrom] = useState(NUMBERS[0]);
  const [pool, setPool] = useState<string[]>([NUMBERS[0]]);
  const [poolQuery, setPoolQuery] = useState("");
  const [priority, setPriority] = useState(5);
  const [slots, setSlots] = useState(12);
  const [bursting, setBursting] = useState(false);
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

  const filteredNumbers = useMemo(() => {
    if (!poolQuery.trim()) return NUMBERS;
    const q = poolQuery.replace(/\s/g, "").toLowerCase();
    return NUMBERS.filter((n) => n.toLowerCase().includes(q));
  }, [poolQuery]);

  const togglePool = (n: string) =>
    setPool((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

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

  const stepErrors = useMemo(() => {
    const s: Record<number, boolean> = {};
    s[1] = Object.keys(step1Errors).length > 0;
    return s;
  }, [step1Errors]);

  const canContinue = useMemo(() => {
    if (step === 1) return !stepErrors[1];
    return true;
  }, [step, stepErrors]);

  // Auto-clear errors as the user fixes them
  useEffect(() => {
    if (showErrors && canContinue) setShowErrors(false);
  }, [showErrors, canContinue]);

  const toggleOverride = (k: OverrideKey) => {
    if (k === "version" && abOn) return; // locked under A/B
    setOverrides((p) => {
      const n = new Set(p);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  };

  // Agent / version can't be supplied per-call when traffic is split across
  // A/B arms — force the override off whenever A/B is enabled.
  useEffect(() => {
    if (!abOn) return;
    setOverrides((p) => {
      if (!p.has("version")) return p;
      const n = new Set(p);
      n.delete("version");
      return n;
    });
  }, [abOn]);

  const optionalLines = useMemo(() => {
    const L: [string, string][] = [];
    if (overrides.has("from")) L.push(["from", `"${from}"`]);
    if (overrides.has("callingHours")) {
      L.push(["start", `"${chStart.replace(":", "")}"`]);
      L.push(["end", `"${chEnd.replace(":", "")}"`]);
    }
    if (overrides.has("timezone")) L.push(["timezone", `"${tz}"`]);
    if (overrides.has("startAfter"))
      L.push(["startAfter", String(toMs(startAfterVal, startAfterUnit))]);
    if (overrides.has("endAfter"))
      L.push(["endAfter", String(toMs(endAfterVal, endAfterUnit))]);
    if (overrides.has("retries")) {
      L.push(["retries", String(retries)]);
      const gaps = Array.from({ length: Math.max(0, retries - 1) })
        .map(() => toMs(intSameVal, intSameUnit))
        .join(", ");
      L.push(["intervals", `[${gaps}]`]);
      L.push(["retryOutcomes", JSON.stringify(allOutcomes)]);
    }
    if (overrides.has("priority"))
      L.push(["priorities", `[${Array(retries).fill(priority).join(", ")}]`]);
    if (overrides.has("version")) L.push(["version", `"${agentVersion}"`]);
    return L;
  }, [
    overrides,
    from,
    chStart,
    chEnd,
    tz,
    startAfterVal,
    startAfterUnit,
    endAfterVal,
    endAfterUnit,
    retries,
    intSameVal,
    intSameUnit,
    outcomes,
    allOutcomes,
    priority,
    agentVersion,
  ]);

  const expirySentence = useMemo(() => {
    const u = endAfterUnit === "min" ? "minutes" : "hours";
    return `Tasks not dialed within ${endAfterVal} ${u} of arriving are dropped.`;
  }, [endAfterVal, endAfterUnit]);

  const curl = useMemo(() => {
    const obj: Record<string, unknown> = {
      campaign: "camp_8fa2",
      phone: "+919848295833",
      context: { name: "Tom" },
    };
    for (const [k, v] of optionalLines) {
      try {
        obj[k] = JSON.parse(v);
      } catch {
        obj[k] = v;
      }
    }
    return `curl -X POST https://api.hoomanlabs.com/v1/tasks \\
  -H "Authorization: Bearer $HOOMAN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(obj)}'`;
  }, [optionalLines]);

  const current = STEPS.find((s) => s.id === step)!;

  return (
    <div className="flex flex-col h-full">
      {/* TOP BAR — title row, then a centered step row below */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-8 py-4">
          <h1 className="text-lg font-semibold tracking-tight text-text">
            Create realtime campaign
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
                      active && "bg-white text-black font-semibold",
                      done && !active && "bg-surface text-text-muted",
                      !active && !done && "bg-surface-2 text-text-muted",
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
            {step === 1 && (
              <div className="space-y-5">
                {showErrors && Object.keys(step1Errors).length > 0 && (
                  <ErrorSummary
                    errors={Object.values(step1Errors).filter(Boolean) as string[]}
                  />
                )}
                <FieldGroup label="Campaign name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Order-confirmation outbound"
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
                    {abOn && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-text-dim">
                        <Info size={12} className="mt-0.5 shrink-0" />
                        <span>
                          With A/B on, agent &amp; version are fixed per variant
                          and can&rsquo;t be overridden per call from the API
                          payload.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent section — single picker or arms list */}
                <div className="space-y-2">
                  {!abOn ? (
                    <>
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
                        <span className="font-medium text-text">Live</span>{" "}
                        always uses whichever version is currently in
                        production.
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2.5">
                    <div className="text-sm font-medium text-text">Variants</div>
                    {abArms.map((arm, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2"
                      >
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
                </div>

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

            {step === 3 && (
              <div className="space-y-6">
                <p className="text-sm text-text-muted leading-relaxed">
                  Unlocked fields can be set per call through the API payload.
                  Locked fields always use the campaign&rsquo;s value.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {OVERRIDABLE.map((f) => {
                    const on = overrides.has(f.key);
                    const disabled = f.key === "version" && abOn;
                    return (
                      <button
                        key={f.key}
                        onClick={() => toggleOverride(f.key)}
                        disabled={disabled}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
                          disabled
                            ? "cursor-not-allowed border-border-strong/40 bg-surface-2/20 text-text-muted"
                            : on
                              ? "border-border-strong bg-surface-2 text-text"
                              : "border-border-strong/60 bg-surface-2/40 hover:bg-surface-2 text-text-dim",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                          {on && !disabled ? (
                            <Zap size={13} />
                          ) : (
                            <Lock size={13} />
                          )}
                          <span className="truncate">{f.label}</span>
                        </span>
                        <Switch
                          checked={on && !disabled}
                          disabled={disabled}
                          className="pointer-events-none"
                        />
                      </button>
                    );
                  })}
                </div>

                <PayloadCard
                  overrides={overrides}
                  optionalLines={optionalLines}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">

                <FieldGroup
                  label="Task start"
                  hint={
                    startAfterVal === 0
                      ? "Dial as soon as a slot frees up after the API trigger."
                      : `Wait ${startAfterVal}${startAfterUnit} after the API trigger before placing the call.`
                  }
                >
                  <div className="flex items-center gap-2">
                    <NumberStepper
                      value={startAfterVal}
                      onChange={setStartAfterVal}
                      min={0}
                      className="w-24"
                    />
                    <Select
                      value={startAfterUnit}
                      onValueChange={(v) => v && setStartAfterUnit(v as Unit)}
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
                </FieldGroup>

                <FieldGroup label="Task expiry" hint={expirySentence}>
                  <div className="flex items-center gap-2">
                    <NumberStepper
                      value={endAfterVal}
                      onChange={setEndAfterVal}
                      min={0}
                      className="w-24"
                    />
                    <Select
                      value={endAfterUnit}
                      onValueChange={(v) => v && setEndAfterUnit(v as Unit)}
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
                        Unused slots from other campaigns are borrowed to dial faster, and returned immediately when another campaign needs them.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-7">
                <RtReviewSection
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
                        ] as RtReviewRow[])
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
                        ] as RtReviewRow[])),
                  ]}
                />

                <RtReviewSection
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

                <RtReviewSection
                  title="Schedule"
                  rows={[
                    [
                      "Calling hours",
                      <span key="h" className="font-mono tabular-nums">
                        {chStart}–{chEnd}{" "}
                        <span className="text-text-muted">{tz}</span>
                      </span>,
                    ],
                    [
                      "Task start",
                      startAfterVal === 0 ? (
                        "Immediately"
                      ) : (
                        <span className="font-mono tabular-nums">
                          {startAfterVal}
                          {startAfterUnit} after API trigger
                        </span>
                      ),
                    ],
                    [
                      "Task expiry",
                      <span key="e" className="font-mono tabular-nums">
                        Drop after {endAfterVal}
                        {endAfterUnit}
                      </span>,
                    ],
                  ]}
                />

                <RtReviewSection
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

                <RtReviewSection
                  title="API contract"
                  rows={[
                    [
                      "API can override",
                      <div key="ov" className="flex flex-wrap gap-1.5">
                        {overrides.size === 0 ? (
                          <span className="italic text-text-muted">
                            All locked
                          </span>
                        ) : (
                          [...overrides].map((k) => (
                            <span
                              key={k}
                              className="inline-flex items-center gap-1 rounded-md border border-border-strong bg-surface px-2 py-0.5 text-[11px] text-text-dim"
                            >
                              <Zap size={11} />
                              {OVERRIDABLE.find((o) => o.key === k)?.label}
                            </span>
                          ))
                        )}
                      </div>,
                    ],
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
                  ]}
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] font-semibold text-text-muted">
                      Send the first task
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(curl);
                        toast.success("Copied to clipboard");
                      }}
                      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-dim hover:text-text"
                    >
                      <Copy size={13} /> Copy
                    </button>
                  </div>
                  <CurlBlock curl={curl} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-border px-8 py-3">
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
                  toast.success("Campaign created");
                  onClose();
                }
              }}
              className={cn(
                "rounded-md bg-white px-4 py-1.5 text-xs font-medium text-black transition-colors hover:bg-white/90",
              )}
            >
              {step === STEPS.length ? "Create campaign" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SHARED BITS ─────────────────────────── */

function CampaignSummary({
  name,
  agentName,
  agentVersion,
  pool,
  chStart,
  chEnd,
  tz,
  endAfterVal,
  endAfterUnit,
  retries,
  intSameVal,
  intSameUnit,
  outcomes,
  overrides,
  abOn,
  abArms,
}: {
  name: string;
  agentName: string;
  agentVersion: string;
  pool: string[];
  chStart: string;
  chEnd: string;
  tz: string;
  endAfterVal: number;
  endAfterUnit: Unit;
  retries: number;
  intSameVal: number;
  intSameUnit: Unit;
  outcomes: string[];
  overrides: Set<OverrideKey>;
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
        <SummaryRow label="Agent">
          {filledAgents.length === 0 ? (
            <span className="text-text-muted italic">Not picked</span>
          ) : (
            filledAgents.map((a, i) => (
              <div key={i} className="truncate">
                {a}
              </div>
            ))
          )}
        </SummaryRow>

        <SummaryRow label="Calling numbers">
          {pool.length === 0 ? (
            <span className="text-text-muted italic">None selected</span>
          ) : (
            <span className="font-mono tabular-nums">
              {pool.length} {pool.length === 1 ? "number" : "numbers"}
            </span>
          )}
        </SummaryRow>

        <SummaryRow label="Schedule">
          <span className="tabular-nums">
            {chStart}–{chEnd}
          </span>
          <span className="text-text-muted ml-1.5">{tz}</span>
        </SummaryRow>

        <SummaryRow label="Task expiry">
          Drop after{" "}
          <span className="tabular-nums">
            {endAfterVal}
            {endAfterUnit}
          </span>
        </SummaryRow>

        <SummaryRow label="Retries">
          <span className="tabular-nums">{retries}</span> attempts ·{" "}
          <span className="tabular-nums">
            {intSameVal}
            {intSameUnit}
          </span>{" "}
          gap
        </SummaryRow>

        <SummaryRow label="Retry when">
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
        </SummaryRow>

        <SummaryRow label="API overrides">
          {overrides.size === 0 ? (
            <span className="text-text-muted italic">All locked</span>
          ) : (
            <span className="tabular-nums">{overrides.size} unlocked</span>
          )}
        </SummaryRow>
      </div>
    </div>
  );
}

function SummaryRow({
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

function FieldError({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
      {msg}
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

function Hint({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-border-strong bg-surface-2 px-3 py-2.5">
      <div className="mt-0.5 text-text-muted">{icon}</div>
      <div>
        <div className="text-sm font-medium text-text">{title}</div>
        <div className="text-xs text-text-muted leading-relaxed mt-0.5">
          {body}
        </div>
      </div>
    </div>
  );
}

type RtReviewRow = [string, React.ReactNode] | null;

function RtReviewSection({
  title,
  rows,
}: {
  title: string;
  rows: RtReviewRow[];
}) {
  const visible = rows.filter(Boolean) as Exclude<RtReviewRow, null>[];
  return (
    <div>
      <div className="text-[11px] font-semibold text-text-muted mb-2">
        {title}
      </div>
      <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
        {visible.map(([label, value], i) => (
          <div key={i} className="grid grid-cols-[180px_1fr] text-xs">
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

function CurlBlock({ curl }: { curl: string }) {
  const lines = curl.split("\n");
  return (
    <pre className="rounded-md border border-border-strong bg-surface-2 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-text-dim overflow-x-auto">
      {lines.map((line, i) => (
        <div key={i}>{renderCurlLine(line)}</div>
      ))}
    </pre>
  );
}

function renderCurlLine(line: string): React.ReactNode {
  const tokens: React.ReactNode[] = [];
  const continuation = line.endsWith("\\") ? line.slice(0, -1) : line;
  const trailing = line.endsWith("\\") ? "\\" : "";
  const re =
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\$[A-Z_]+|https?:\/\/[^\s\\]+|-[A-Za-z]+|curl|POST|GET|PUT|DELETE|PATCH|\s+|.)/g;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(continuation)) !== null) {
    const t = m[0];
    if (/^\s+$/.test(t)) {
      tokens.push(t);
    } else if (t === "curl") {
      tokens.push(
        <span key={key++} className="text-blue-400">
          {t}
        </span>,
      );
    } else if (/^(POST|GET|PUT|DELETE|PATCH)$/.test(t)) {
      tokens.push(
        <span key={key++} className="text-emerald-400 font-semibold">
          {t}
        </span>,
      );
    } else if (/^-[A-Za-z]+$/.test(t)) {
      tokens.push(
        <span key={key++} className="text-text-muted">
          {t}
        </span>,
      );
    } else if (/^https?:\/\//.test(t)) {
      tokens.push(
        <span key={key++} className="text-amber-400 underline decoration-text-muted/40 underline-offset-2">
          {t}
        </span>,
      );
    } else if (/^\$[A-Z_]+$/.test(t)) {
      tokens.push(
        <span key={key++} className="text-blue-400">
          {t}
        </span>,
      );
    } else if (t.startsWith('"') && t.endsWith('"')) {
      tokens.push(
        <span key={key++} className="text-amber-400">
          {t}
        </span>,
      );
    } else if (t.startsWith("'") && t.endsWith("'")) {
      // single-quoted body — usually JSON. Highlight inside.
      const inner = t.slice(1, -1);
      tokens.push(
        <span key={key++}>
          <span className="text-text-muted">{"'"}</span>
          {renderJsonInline(inner)}
          <span className="text-text-muted">{"'"}</span>
        </span>,
      );
    } else {
      tokens.push(t);
    }
  }
  return (
    <>
      {tokens}
      {trailing && <span className="text-text-muted">{" \\"}</span>}
    </>
  );
}

function renderJsonInline(s: string): React.ReactNode {
  // Minimal JSON tokenizer: keys "x", strings "y", numbers, braces, commas.
  const out: React.ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "{" || c === "}" || c === "[" || c === "]") {
      out.push(
        <span key={k++} className="text-text-muted">
          {c}
        </span>,
      );
      i++;
    } else if (c === "," || c === ":") {
      out.push(
        <span key={k++} className="text-text-muted">
          {c}
        </span>,
      );
      i++;
    } else if (c === '"') {
      // string token — peek next non-whitespace to decide key vs value
      const end = s.indexOf('"', i + 1);
      const tok = s.slice(i, end + 1);
      let j = end + 1;
      while (j < s.length && /\s/.test(s[j])) j++;
      const isKey = s[j] === ":";
      out.push(
        <span
          key={k++}
          className={isKey ? "text-emerald-400" : "text-amber-400"}
        >
          {tok}
        </span>,
      );
      i = end + 1;
    } else if (/[0-9-]/.test(c)) {
      let j = i;
      while (j < s.length && /[\d.\-]/.test(s[j])) j++;
      out.push(
        <span key={k++} className="text-amber-400">
          {s.slice(i, j)}
        </span>,
      );
      i = j;
    } else {
      out.push(c);
      i++;
    }
  }
  return out;
}

function JsonKey({
  value,
  kind,
}: {
  value: string;
  kind: "required" | "override";
}) {
  return (
    <span className={kind === "required" ? "text-emerald-400" : "text-blue-400"}>
      {value}
    </span>
  );
}

const NUMBER_RE = /^-?\d+(\.\d+)?$/;

function JsonValue({ value }: { value: string }) {
  const v = value.trim();

  // string literal: "..."
  if (v.startsWith(`"`) && v.endsWith(`"`)) {
    return <span className="text-amber-400">{value}</span>;
  }
  // number
  if (NUMBER_RE.test(v)) {
    return <span className="text-amber-400">{value}</span>;
  }
  // array of numbers / strings: [a, b, c]
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).split(",").map((s) => s.trim());
    return (
      <>
        <span className="text-text-muted">[</span>
        {inner.map((part, i) => (
          <span key={i}>
            <JsonValue value={part} />
            {i < inner.length - 1 && <span className="text-text-muted">, </span>}
          </span>
        ))}
        <span className="text-text-muted">]</span>
      </>
    );
  }
  // object literal { ... } — render with key:value tokenisation
  if (v.startsWith("{") && v.endsWith("}")) {
    const inner = v.slice(1, -1).trim();
    // naive split: by commas at depth 0
    const parts = inner.split(",").map((s) => s.trim()).filter(Boolean);
    return (
      <>
        <span className="text-text-muted">{"{ "}</span>
        {parts.map((part, i) => {
          const m = part.match(/^([^:]+):\s*(.+)$/);
          if (!m) return <span key={i}>{part}</span>;
          const [, k, val] = m;
          return (
            <span key={i}>
              <span className="text-blue-400">{k.trim()}</span>
              <span className="text-text-muted">: </span>
              <JsonValue value={val.trim()} />
              {i < parts.length - 1 && (
                <span className="text-text-muted">, </span>
              )}
            </span>
          );
        })}
        <span className="text-text-muted">{" }"}</span>
      </>
    );
  }
  return <span className="text-text">{value}</span>;
}

function PayloadCard({
  overrides,
  optionalLines,
}: {
  overrides: Set<OverrideKey>;
  optionalLines: [string, string][];
}) {
  const required: [string, string][] = [
    [`"campaign"`, `"camp_8fa2"`],
    [`"phone"`, `"+919848295833"`],
    [`"context"`, `{ "name": "Tom" }`],
  ];
  const locked = OVERRIDABLE.filter((f) => !overrides.has(f.key));

  return (
    <div className="rounded-lg border border-border-strong bg-surface-2 p-4 space-y-4">
      <div>
        <div className="text-xs font-semibold text-text mb-1">Task API payload</div>
        <p className="text-xs text-text-muted leading-relaxed">
          Required fields are always sent. Unlocked fields can be supplied per
          call.
        </p>
      </div>
      <pre className="rounded-md border border-border-strong p-3 font-mono text-xs leading-[1.8] whitespace-pre-wrap text-text" style={{ backgroundColor: "var(--bg)" }}>
        <span className="text-text-muted">{"{"}</span>
        {required.map(([k, v], i) => (
          <div key={i} className="pl-4">
            <JsonKey value={k} kind="required" />
            <span className="text-text-muted">: </span>
            <JsonValue value={v} />
            <span className="text-text-muted">,</span>
            <span className="ml-2 text-text-muted/60">{`// required`}</span>
          </div>
        ))}
        {optionalLines.map(([k, v], i) => (
          <div key={i} className="pl-4">
            <JsonKey value={`"${k}"`} kind="override" />
            <span className="text-text-muted">: </span>
            <JsonValue value={v} />
            {i < optionalLines.length - 1 && (
              <span className="text-text-muted">,</span>
            )}
            <span className="ml-2 text-text-muted/60">{`// override`}</span>
          </div>
        ))}
        <span className="text-text-muted">{"}"}</span>
      </pre>
      {locked.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5 font-semibold">
            Locked · ignored if sent
          </div>
          <div className="flex flex-wrap gap-1.5">
            {locked.map((f) => (
              <span
                key={f.key}
                className="flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2 py-0.5 text-[11px] font-mono text-text-muted"
              >
                <Lock size={11} /> {f.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
