"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Bot,
  CalendarClock,
  Check,
  Clock,
  Gauge,
  Globe,
  Phone,
  RotateCcw,
  SignalHigh,
  Type,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AgentSelect, VersionSelect } from "@/components/campaigns/agent-select";
import { NumberPoolPicker } from "@/components/number-pool-picker";
import { OutcomePicker } from "@/components/outcome-picker";
import { PriorityField } from "@/components/priority-field";
import { NumberStepper } from "@/components/number-stepper";
import { TimeField } from "@/components/time-picker";
import { DatePickerTime } from "@/components/date-picker-time";
import {
  diffCampaign,
  TIMEZONES,
  type CampaignEditState,
} from "@/lib/campaign-update";
import { cn } from "@/lib/utils";

/** "YYYY-MM-DD" from a Date, in local time. */
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

/* ═══════════════════════════════════════════════════════════════════════
   Updatable-field registry — pick which fields to change, then only those
   editors appear. Each maps to one or more keys on CampaignEditState.
   ═══════════════════════════════════════════════════════════════════════ */

type FieldKey =
  | "agent"
  | "callingNumber"
  | "callingHours"
  | "timezone"
  | "retry"
  | "priority"
  | "schedule"
  | "slots"
  | "name";

const FIELDS: {
  key: FieldKey;
  label: string;
  desc: string;
  icon: React.ReactNode;
  stateKeys: (keyof CampaignEditState)[];
}[] = [
  {
    key: "agent",
    label: "Agent",
    desc: "Select to change current agent or version",
    icon: <Bot size={14} />,
    stateKeys: ["agentId", "agentVersion"],
  },
  {
    key: "callingNumber",
    label: "Calling Number",
    desc: "Select to change current calling number",
    icon: <Phone size={14} />,
    stateKeys: ["callingNumbers"],
  },
  {
    key: "callingHours",
    label: "Calling Hours",
    desc: "Change the daily calling window",
    icon: <Clock size={14} />,
    stateKeys: ["channelStart", "channelEnd"],
  },
  {
    key: "timezone",
    label: "Timezone",
    desc: "Change the campaign timezone",
    icon: <Globe size={14} />,
    stateKeys: ["timezone"],
  },
  {
    key: "retry",
    label: "Retries & Outcomes",
    desc: "Change retry attempts and the outcomes that trigger them",
    icon: <RotateCcw size={14} />,
    stateKeys: ["retries", "retryOutcomes"],
  },
  {
    key: "priority",
    label: "Priority",
    desc: "Select to change current priority order",
    icon: <SignalHigh size={14} />,
    stateKeys: ["priority", "priorityMode", "attemptPriorities"],
  },
  {
    key: "schedule",
    label: "Start & End",
    desc: "Change when the campaign starts and ends",
    icon: <CalendarClock size={14} />,
    stateKeys: ["startAfter", "endAfter"],
  },
  {
    key: "slots",
    label: "Slots",
    desc: "Change the concurrent slot limit",
    icon: <Gauge size={14} />,
    stateKeys: ["slots", "useAllSlots"],
  },
  {
    key: "name",
    label: "Name",
    desc: "Rename the campaign",
    icon: <Type size={14} />,
    stateKeys: ["name"],
  },
];

/** Right-drawer: choose fields to update → edit only those → review + submit. */
export function UpdateCampaignDrawer({
  open,
  onOpenChange,
  current,
  onSubmit,
  campaignStatus = "running",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  current: CampaignEditState;
  onSubmit: (next: CampaignEditState) => void;
  campaignStatus?: "running" | "scheduled" | "paused";
}) {
  const [draft, setDraft] = React.useState<CampaignEditState>(current);
  const [selected, setSelected] = React.useState<Set<FieldKey>>(new Set());

  // Reset every time the drawer opens.
  React.useEffect(() => {
    if (open) {
      setDraft(current);
      setSelected(new Set());
    }
  }, [open, current]);

  const changes = diffCampaign(current, draft);
  const isDirty = changes.length > 0;

  const update = <K extends keyof CampaignEditState>(
    k: K,
    v: CampaignEditState[K],
  ) => setDraft((d) => ({ ...d, [k]: v }));

  /** Toggle a field on/off. Turning it off reverts its keys to `current`. */
  const toggleField = (f: (typeof FIELDS)[number]) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(f.key)) {
        next.delete(f.key);
        setDraft((d) => {
          const reverted = { ...d };
          for (const key of f.stateKeys) {
            (reverted[key] as CampaignEditState[typeof key]) = current[key];
          }
          return reverted;
        });
      } else {
        next.add(f.key);
      }
      return next;
    });

  const attemptClose = (v: boolean) => {
    if (v) {
      onOpenChange(true);
      return;
    }
    if (isDirty) {
      const count = changes.length;
      toast("Discard changes?", {
        position: "top-center",
        description: `${count} unsaved change${count === 1 ? "" : "s"} will be lost.`,
        action: { label: "Discard", onClick: () => onOpenChange(false) },
        cancel: { label: "Cancel", onClick: () => {} },
      });
      return;
    }
    onOpenChange(false);
  };

  const orderedSelected = FIELDS.filter((f) => selected.has(f.key));

  return (
    <Dialog open={open} onOpenChange={attemptClose}>
      <DialogContent
        variant="drawer"
        showCloseButton={false}
        style={{ backgroundColor: "var(--card)" }}
        className="!max-w-[960px] flex flex-col overflow-hidden border-l border-white/[0.04] p-0 shadow-2xl shadow-black/60"
      >
        <DialogHeader className="border-b border-white/[0.04] px-8 py-4">
          <DialogTitle className="text-base font-semibold">
            Update Campaign
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Make changes in campaign
          </DialogDescription>
        </DialogHeader>

        {/* Body — scrolls independently, content centered like the wizard */}
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
         <div className="mx-auto w-full max-w-2xl space-y-6 px-8 py-6">
          {/* Field chips — toggle which fields to update */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Fields</span>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(new Set());
                    setDraft(current);
                  }}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {selected.size} selected · Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FIELDS.map((f) => {
                const on = selected.has(f.key);
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => toggleField(f)}
                    aria-pressed={on}
                    className={cn(
                      "group flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      on
                        ? "border-foreground bg-primary font-medium text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-white/25 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 transition-colors",
                        on ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {on ? <Check size={14} strokeWidth={2.75} /> : f.icon}
                    </span>
                    {f.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {selected.size === 0
                ? "Choose one or more fields to change."
                : "Selected fields appear below to edit."}
            </p>
          </div>

          {/* One editor block per selected field, in registry order */}
          {orderedSelected.map((f) => (
            <FieldBlock
              key={f.key}
              label={f.label}
              onRemove={() => toggleField(f)}
            >
              {f.key === "agent" && (
                <div className="grid grid-cols-2 gap-3">
                  <AgentSelect
                    agentId={draft.agentId}
                    onChange={(id) => update("agentId", id)}
                  />
                  <VersionSelect
                    agentId={draft.agentId}
                    versionName={draft.agentVersion}
                    onChange={(name) => update("agentVersion", name)}
                  />
                </div>
              )}

              {f.key === "callingNumber" && (
                <NumberPoolPicker
                  pool={draft.callingNumbers}
                  onToggle={(n) =>
                    update(
                      "callingNumbers",
                      draft.callingNumbers.includes(n)
                        ? draft.callingNumbers.filter((x) => x !== n)
                        : [...draft.callingNumbers, n],
                    )
                  }
                  onClear={() => update("callingNumbers", [])}
                />
              )}

              {f.key === "retry" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Total attempts
                    </span>
                    <NumberStepper
                      value={draft.retries}
                      onChange={(v) => update("retries", Math.max(1, v))}
                      min={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Retry outcomes
                    </span>
                    <OutcomePicker
                      outcomes={draft.retryOutcomes}
                      onToggle={(o) =>
                        update(
                          "retryOutcomes",
                          draft.retryOutcomes.includes(o)
                            ? draft.retryOutcomes.filter((x) => x !== o)
                            : [...draft.retryOutcomes, o],
                        )
                      }
                      onClear={() => update("retryOutcomes", [])}
                    />
                  </div>
                </div>
              )}

              {f.key === "priority" && (
                <PriorityField
                  priority={draft.priority}
                  setPriority={(v) => update("priority", v)}
                  retries={draft.retries}
                  prioMode={draft.priorityMode}
                  setPrioMode={(m) => update("priorityMode", m)}
                  getAttemptPrio={(i) =>
                    draft.attemptPriorities[i] ?? draft.priority
                  }
                  setAttemptPrio={(i, v) => {
                    const next = [...draft.attemptPriorities];
                    while (next.length <= i) next.push(draft.priority);
                    next[i] = v;
                    update("attemptPriorities", next);
                  }}
                  hideLabel
                />
              )}

              {f.key === "callingHours" && (
                <div className="flex items-stretch gap-2">
                  <TimeField
                    value={draft.channelStart}
                    onChange={(v) => update("channelStart", v)}
                    placeholder="Start"
                    className="flex-1"
                  />
                  <TimeField
                    value={draft.channelEnd}
                    onChange={(v) => update("channelEnd", v)}
                    placeholder="End"
                    className="flex-1"
                  />
                </div>
              )}

              {f.key === "timezone" && (
                <Select
                  value={draft.timezone}
                  onValueChange={(v) => v && update("timezone", v)}
                >
                  <SelectTrigger className="h-9 w-full">
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
              )}

              {f.key === "schedule" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Start after
                    </span>
                    <DatePickerTime
                      idPrefix="upd-start"
                      date={
                        draft.startAfter ? new Date(draft.startAfter) : undefined
                      }
                      time={draft.startAfter.split("T")[1] || "00:00"}
                      onDateChange={(d) =>
                        d &&
                        update(
                          "startAfter",
                          `${ymd(d)}T${draft.startAfter.split("T")[1] || "00:00"}`,
                        )
                      }
                      onTimeChange={(t) =>
                        update(
                          "startAfter",
                          `${draft.startAfter.split("T")[0]}T${t}`,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      End after
                    </span>
                    <DatePickerTime
                      idPrefix="upd-end"
                      date={draft.endAfter ? new Date(draft.endAfter) : undefined}
                      time={draft.endAfter.split("T")[1] || "00:00"}
                      onDateChange={(d) =>
                        d &&
                        update(
                          "endAfter",
                          `${ymd(d)}T${draft.endAfter.split("T")[1] || "00:00"}`,
                        )
                      }
                      onTimeChange={(t) =>
                        update("endAfter", `${draft.endAfter.split("T")[0]}T${t}`)
                      }
                    />
                  </div>
                </div>
              )}

              {f.key === "slots" && (
                <div className="space-y-3">
                  <NumberStepper
                    value={draft.slots}
                    onChange={(v) => update("slots", v)}
                    min={0}
                    className="w-full"
                  />
                  <label className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-3">
                    <Switch
                      checked={draft.useAllSlots}
                      onCheckedChange={(v) => update("useAllSlots", Boolean(v))}
                      className="mt-0.5"
                    />
                    <span className="flex-1 text-sm text-foreground">
                      Use all workspace slots when no other campaigns are active
                    </span>
                  </label>
                </div>
              )}

              {f.key === "name" && (
                <Input
                  value={draft.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Campaign name"
                />
              )}

              {campaignStatus === "running" && f.key === "agent" && (
                <Warning>
                  Live traffic — new calls use this from the next batch.
                </Warning>
              )}
            </FieldBlock>
          ))}
         </div>
        </div>

        {/* Changes diff — only once there is something to show */}
        {isDirty && <ChangesSummary changes={changes} />}

        <DialogFooter className="!m-0 flex items-center justify-end gap-2 !rounded-none border-t border-white/[0.04] !bg-transparent px-6 !py-3">
          <Button variant="ghost" onClick={() => attemptClose(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isDirty}
            onClick={() => {
              onSubmit(draft);
              onOpenChange(false);
            }}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Per-field editor block ──────────────────────────────────────────── */

function FieldBlock({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X size={13} />
        </button>
      </div>
      {children}
    </section>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-amber-400">
      <span aria-hidden>⚠ </span>
      {children}
    </p>
  );
}

/* ── Changes diff ────────────────────────────────────────────────────── */

function ChangesSummary({
  changes,
}: {
  changes: ReturnType<typeof diffCampaign>;
}) {
  return (
    <div className="border-t border-white/[0.04] bg-card px-6 py-3">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Changes · {changes.length}
      </span>
      <ul className="scroll-thin mt-2 flex max-h-[120px] flex-col gap-1.5 overflow-y-auto text-xs">
        {changes.map((c) => (
          <li key={c.key} className="flex items-baseline gap-2">
            <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
            <span className="shrink-0 text-muted-foreground">{c.label}:</span>
            <span className="truncate text-muted-foreground/60 line-through">
              {c.before}
            </span>
            <span className="shrink-0 text-muted-foreground">→</span>
            <span className="truncate text-foreground">{c.after}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
