"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FlaskConical,
  Gauge,
  ImageOff,
  KeyRound,
  Phone,
  PhoneCall,
  Plus,
  Radio,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell, NotificationsButton, UsageChip } from "@/components/app-shell";
import { PageHeader } from "@/components/stats/ui";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   Placeholder scaffold data — everything here is something a calling
   platform actually has. Swap for real feeds when wiring the API.
   ═══════════════════════════════════════════════════════════════════════ */

const PROFILE = {
  fullName: "Vidhan Dubey",
  email: "vidhan@hoomanlabs.com",
  memberSince: "2026-06-08",
  signInMethod: "Google" as const,
};

const ACCOUNT = {
  user: PROFILE.fullName.split(" ")[0],
  workspace: "HoomanLabs",
  workspaceId: "ws_9Kd21mALq7",
  accountId: "acc_4820ffce11",
  plan: "Scale",
  region: "ap-south-1",
  apiKey: "sk_live_8f2c4a1e9b7d6350af11",
};

const BALANCE = {
  amount: 1248.5,
  burnPerDay: 306.0, // → ~4 days runway
  mtdSpend: 612.4,
  mtdBudget: 2000,
};

const LIVE = {
  state: "Running" as "Running" | "Idle",
  callsInProgress: 14,
  slotsUsed: 14,
  slotsTotal: 30,
  queueDepth: 86,
  dialRatePerMin: 22,
};

// Campaigns currently placing calls — powers the "Dialing now" list.
const DIALING: {
  name: string;
  agent: string;
  type: "Batch" | "Realtime";
  calls: number;
  done: number;
  total: number;
}[] = [
  {
    name: "Q3 win-back outbound",
    agent: "Debt Collection Pitch Agent",
    type: "Batch",
    calls: 9,
    done: 3120,
    total: 5000,
  },
  {
    name: "Realtime lead qualifier",
    agent: "Careers_360 — Tech college predictor",
    type: "Realtime",
    calls: 5,
    done: 210,
    total: 210,
  },
];

// Calls per hour today — powers the activity chart.
const ACTIVITY: { h: string; placed: number; connected: number }[] = [
  { h: "8a", placed: 38, connected: 20 },
  { h: "9a", placed: 92, connected: 55 },
  { h: "10a", placed: 140, connected: 88 },
  { h: "11a", placed: 165, connected: 104 },
  { h: "12p", placed: 120, connected: 71 },
  { h: "1p", placed: 98, connected: 60 },
  { h: "2p", placed: 150, connected: 95 },
  { h: "3p", placed: 172, connected: 110 },
  { h: "4p", placed: 133, connected: 79 },
  { h: "5p", placed: 88, connected: 49 },
  { h: "6p", placed: 44, connected: 23 },
];

type UsageItem = {
  icon: React.ReactNode;
  label: string;
  used: number;
  limit: number;
  unit?: string;
};

// Metered consumption — resets each billing cycle.
const USAGE_CYCLE: UsageItem[] = [
  { icon: <Clock size={14} />, label: "Voice minutes", used: 24800, limit: 50000, unit: "min" },
  { icon: <PhoneCall size={14} />, label: "Calls placed", used: 12400, limit: 25000 },
];

// Provisioned resources — current allocation against the plan cap.
const USAGE_RESOURCES: UsageItem[] = [
  { icon: <Gauge size={14} />, label: "Concurrent slots", used: 43, limit: 50 },
  { icon: <Phone size={14} />, label: "Calling numbers", used: 12, limit: 25 },
  { icon: <Users size={14} />, label: "Team seats", used: 3, limit: 10 },
  { icon: <Bot size={14} />, label: "Agents", used: 9, limit: 20 },
];

// New-user activation checklist (empty state).
// 3-step activation flow: Create agent → Get number → Go live.
const SETUP_STEPS: { title: string }[] = [
  { title: "Create an Agent" },
  { title: "Connect a calling number" },
  { title: "Go live with Campaigns" },
];

const TEMPLATES: {
  title: string;
  body: string;
  tags: string[];
}[] = [
  {
    title: "Debt collector",
    body: "Firm but polite agent for collections.",
    tags: ["Outbound", "Sales"],
  },
  {
    title: "Lead qualifier",
    body: "Screens inbound leads quickly.",
    tags: ["Inbound", "Qualify"],
  },
];

type Delta = { pct: number; dir: "up" | "down"; good: boolean };
const TODAY: { label: string; value: string; delta?: Delta }[] = [
  { label: "Calls placed", value: "1,240", delta: { pct: 8, dir: "up", good: true } },
  { label: "Connect rate", value: "62%", delta: { pct: 2, dir: "down", good: false } },
  { label: "Avg duration", value: "2:14" },
  { label: "Spend today", value: "$306", delta: { pct: 12, dir: "up", good: false } },
];

const RECENT: {
  name: string;
  agent: string;
  type: "Batch" | "Realtime";
  status: "Running" | "Paused" | "Completed";
  done: number;
  total: number;
}[] = [
  { name: "Q3 win-back outbound", agent: "Debt Collection Pitch Agent", type: "Batch", status: "Running", done: 3120, total: 5000 },
  { name: "Realtime lead qualifier", agent: "Careers_360 — Tech college predictor", type: "Realtime", status: "Running", done: 210, total: 210 },
  { name: "New DND", agent: "Website Agent Outbound", type: "Batch", status: "Paused", done: 2, total: 40 },
  { name: "Renewal reminders", agent: "Debt Collection Outbound Agent", type: "Batch", status: "Completed", done: 980, total: 980 },
];

const QUICK_ACTIONS = [
  { icon: Radio, label: "Create campaign" },
  { icon: Phone, label: "Add number" },
  { icon: Bot, label: "Test agent" },
  { icon: UserPlus, label: "Invite teammate" },
];

const STATUS_DOT: Record<string, string> = {
  Running: "bg-emerald-400",
  Paused: "bg-amber-400",
  Completed: "bg-muted-foreground",
};

/* ── Motion helpers ──────────────────────────────────────────────────── */

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Count from 0 → target with an ease-out on mount (instant if reduced-motion). */
function useCountUp(target: number, ms = 750) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setVal(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / ms);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}

/** Animated integer/decimal readout. */
function Count({ n, decimals = 0 }: { n: number; decimals?: number }) {
  const v = useCountUp(n);
  return (
    <>
      {decimals
        ? v.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : Math.round(v).toLocaleString()}
    </>
  );
}

/** true once mounted — for one-shot entrance transitions. */
function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setM(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return m;
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  // Preview toggle — real app derives this from "has the workspace done anything yet".
  const [mode, setMode] = React.useState<"data" | "new">("data");
  const runwayDays = Math.floor(BALANCE.amount / BALANCE.burnPerDay);
  const lowBalance = runwayDays <= 3;

  // Alert feed — leads with balance risk, then operational issues.
  const alerts = [
    ...(lowBalance
      ? [
          {
            id: "bal",
            text: `Balance runs out in ~${runwayDays} day${runwayDays === 1 ? "" : "s"} at the current burn.`,
            cta: "Add credits",
          },
        ]
      : []),
    {
      id: "dnd",
      text: "“New DND” paused — calling-number pool exhausted.",
      cta: "Review",
    },
  ];

  return (
    <AppShell activeNav="Overview">
      <PageHeader
        icon={<Radio size={16} />}
        label="Home"
        sublabel={
          <span className="inline-flex items-center gap-1.5">
            {ACCOUNT.workspace}
            <span className="font-mono text-muted-foreground/80">
              · {ACCOUNT.workspaceId}
            </span>
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <PreviewToggle mode={mode} onChange={setMode} />
            <UsageChip />
            <NotificationsButton />
            {mode === "data" && (
              <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Plus size={14} /> Create campaign
              </button>
            )}
          </div>
        }
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-8 py-8">
        {mode === "new" ? (
          <EmptyHome />
        ) : (
          <>
            {/* Operational alerts — highest priority, first thing seen */}
            <AlertStrip alerts={alerts} />

            <Greeting />

            {/* Feature banner — like ElevenLabs' Speech Engine promo */}
            <FeatureBanner />

            {/* Workspace + Developer identity — reference data */}
            <AccountStrip />

            {/* Live operations (wide) + Balance (right rail) */}
            <section className="grid gap-6 lg:grid-cols-3">
              <LiveOps />
              <BalanceSummary />
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

/* ── Preview toggle (demo only) ──────────────────────────────────────── */

function PreviewToggle({
  mode,
  onChange,
}: {
  mode: "data" | "new";
  onChange: (m: "data" | "new") => void;
}) {
  return (
    <div className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card p-1">
      {(
        [
          ["data", "With data"],
          ["new", "New user"],
        ] as const
      ).map(([m, label]) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "inline-flex h-6 items-center rounded-md px-2.5 text-xs font-medium transition-colors",
            mode === m
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ── Alerts ──────────────────────────────────────────────────────────── */

function AlertStrip({
  alerts,
}: {
  alerts: { id: string; text: string; cta: string }[];
}) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
  const visible = alerts.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {visible.map((a) => (
        <div
          key={a.id}
          className="flex items-center gap-3 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3.5 py-2.5"
        >
          <AlertTriangle size={15} className="shrink-0 text-amber-400" />
          <span className="min-w-0 flex-1 text-sm text-foreground">{a.text}</span>
          <button className="shrink-0 text-xs font-medium text-amber-400 transition-opacity hover:opacity-80">
            {a.cta}
          </button>
          <button
            onClick={() => setDismissed((p) => new Set(p).add(a.id))}
            aria-label="Dismiss"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Live operations ─────────────────────────────────────────────────── */

function LiveOps() {
  const running = LIVE.state === "Running";
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:col-span-2">
      {/* One-line status headline */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="inline-flex min-w-0 items-baseline gap-2 truncate text-sm text-foreground">
          <span className="relative flex h-2 w-2 shrink-0 translate-y-0.5">
            {running && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                running ? "bg-emerald-400" : "bg-muted-foreground",
              )}
            />
          </span>
          <span className="font-medium">
            {running ? "Running" : "Idle"}
          </span>
          <span className="text-muted-foreground">
            · {DIALING.length} campaign{DIALING.length === 1 ? "" : "s"} dialing
            · <Count n={LIVE.callsInProgress} /> calls in progress
          </span>
        </h2>
        <a
          href="/stats"
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Live stats <ArrowUpRight size={13} />
        </a>
      </div>

      {/* Dialing now — the actual story: what's running */}
      <ul className="flex flex-col">
        {DIALING.map((c, i) => {
          const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
          return (
            <li
              key={c.name}
              className={cn(
                "flex items-center gap-4 py-3",
                i < DIALING.length - 1 && "border-b border-white/[0.04]",
              )}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm text-foreground">
                    {c.name}
                  </span>
                  <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {c.type}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bot size={11} className="shrink-0" />
                  <span className="truncate">{c.agent}</span>
                </div>
              </div>
              <div className="hidden w-32 shrink-0 sm:block">
                <div className="h-1.5 w-full overflow-hidden rounded-full ring-1 ring-inset ring-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-foreground/70"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="w-16 shrink-0 text-right">
                <span className="font-mono text-sm tabular-nums text-foreground">
                  {c.calls}
                </span>
                <span className="ml-1 text-[10px] text-muted-foreground">
                  now
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-xl leading-none tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

/* ── Balance & runway ────────────────────────────────────────────────── */

function BalanceRunway({ runwayDays, low }: { runwayDays: number; low: boolean }) {
  const usedPct = Math.min(
    100,
    Math.round((BALANCE.mtdSpend / BALANCE.mtdBudget) * 100),
  );
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border bg-card p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        low ? "border-amber-400/30" : "border-border",
      )}
    >
      {/* Faint glow behind the hero figure */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-2xl"
        style={{
          background: low
            ? "radial-gradient(circle, rgba(251,191,36,0.10), transparent 70%)"
            : "radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />

      <span className="relative inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Wallet size={14} /> Balance
      </span>

      <div className="relative mt-2 text-4xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
        $<Count n={BALANCE.amount} decimals={2} />
      </div>
      <div
        className={cn(
          "mt-1.5 text-xs",
          low ? "text-amber-400" : "text-muted-foreground",
        )}
      >
        ~{runwayDays} days left · ${BALANCE.burnPerDay.toLocaleString()}/day burn
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>This month</span>
          <span className="font-mono tabular-nums text-foreground">
            ${BALANCE.mtdSpend.toLocaleString()} / ${BALANCE.mtdBudget.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full ring-1 ring-inset ring-white/[0.06]">
          <div
            className="h-full rounded-full bg-foreground/70"
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </div>

      <button className="mt-5 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
        <Plus size={14} /> Add credits
      </button>
    </div>
  );
}

/* ── Recent campaigns ────────────────────────────────────────────────── */

function RecentCampaigns() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <h2 className="text-sm font-medium text-foreground">Recent campaigns</h2>
        <a
          href="/campaigns"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          All campaigns <ArrowUpRight size={13} />
        </a>
      </div>
      <div>
        {RECENT.map((c, i) => {
          const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
          return (
            <a
              key={c.name}
              href="/campaigns"
              className={cn(
                "flex items-center gap-4 px-5 py-3 transition-colors hover:bg-secondary/40",
                i < RECENT.length - 1 && "border-b border-white/[0.04]",
              )}
            >
              <span
                className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[c.status])}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm text-foreground">
                    {c.name}
                  </span>
                  <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {c.type}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bot size={11} className="shrink-0" />
                  <span className="truncate">{c.agent}</span>
                  <span className="shrink-0">· {c.status}</span>
                </div>
              </div>
              <div className="hidden w-32 shrink-0 sm:block">
                <div className="h-1.5 w-full overflow-hidden rounded-full ring-1 ring-inset ring-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-foreground/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="w-24 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {c.done.toLocaleString()}/{c.total.toLocaleString()}
              </div>
              <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ── Quick actions ───────────────────────────────────────────────────── */

function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-medium text-foreground">Quick actions</h2>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground"
          >
            <a.icon size={15} className="shrink-0" />
            <span className="truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Account / developer strip ───────────────────────────────────────── */

function AccountStrip() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <WorkspaceCard />
      <DeveloperCard />
    </section>
  );
}

/** Left card — workspace identity + IDs the ops team copies. */
function WorkspaceCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-foreground">
            <Building2 size={15} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">Workspace</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Identity &amp; region for this environment.
            </div>
          </div>
        </div>
        <button className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
          Manage <ArrowUpRight size={13} />
        </button>
      </div>
      <dl className="flex flex-col divide-y divide-white/[0.04]">
        <AcctLine label="Name" value={ACCOUNT.workspace} />
        <AcctLine label="Region" value={ACCOUNT.region} mono />
        <AcctLine label="Workspace ID">
          <CopyChip value={ACCOUNT.workspaceId} label="Workspace ID" />
        </AcctLine>
        <AcctLine label="Account ID">
          <CopyChip value={ACCOUNT.accountId} label="Account ID" />
        </AcctLine>
      </dl>
    </div>
  );
}

/** Right card — plan badge + revealable API key for developers. */
function DeveloperCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-foreground">
            <KeyRound size={15} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">Developer</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Plan, API keys, and integration links.
            </div>
          </div>
        </div>
        <a
          href="#"
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Docs <ArrowUpRight size={13} />
        </a>
      </div>
      <div className="flex flex-1 flex-col gap-5 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Plan</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-black/25 px-2 py-0.5 text-xs font-medium text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--chart-1)]" />
            {ACCOUNT.plan}
          </span>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Secret API key</span>
            <a
              href="#"
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Rotate
            </a>
          </div>
          <ApiKeyField />
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Never expose this key in client-side code. Rotate immediately if
            leaked.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Label / value row — supports `mono` monospace and children override. */
function AcctLine({
  label,
  value,
  mono = false,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 truncate text-right text-sm text-foreground",
          mono && "font-mono",
        )}
      >
        {children ?? value}
      </dd>
    </div>
  );
}


/** Copyable code token — monospace value in an inset chip with inline copy. */
function CopyChip({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    toast(`Copied ${label}`);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${label}`}
      className="group inline-flex items-center gap-2 rounded-md border border-border bg-black/25 px-2 py-1 font-mono text-xs text-foreground transition-colors hover:border-white/25"
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check size={12} className="shrink-0 text-emerald-400" />
      ) : (
        <Copy
          size={12}
          className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        />
      )}
    </button>
  );
}

function ApiKeyField() {
  const [shown, setShown] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const masked = ACCOUNT.apiKey.slice(0, 8) + "•".repeat(16);
  const onCopy = () => {
    navigator.clipboard?.writeText(ACCOUNT.apiKey);
    setCopied(true);
    toast("Copied API key");
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-black/25 px-2.5 py-1.5">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
        {shown ? ACCOUNT.apiKey : masked}
      </code>
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide API key" : "Reveal API key"}
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      >
        {shown ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy API key"
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      </button>
    </div>
  );
}

/* ── bits ────────────────────────────────────────────────────────────── */

function BandLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function DeltaChip({ d }: { d: Delta }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        d.good ? "text-emerald-400" : "text-muted-foreground",
      )}
    >
      {d.dir === "up" ? "▲" : "▼"} {d.pct}%
    </span>
  );
}

/* ── Activity chart (interesting bit) ────────────────────────────────── */

function ActivityToday() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(0);
  const [hover, setHover] = React.useState<number | null>(null);
  const mounted = useMounted();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const H = 104;
  const padTop = 12;
  const n = ACTIVITY.length;
  const max = Math.max(...ACTIVITY.map((a) => a.placed)) || 1;
  const placedTotal = ACTIVITY.reduce((s, a) => s + a.placed, 0);
  const connTotal = ACTIVITY.reduce((s, a) => s + a.connected, 0);
  const rate = placedTotal ? Math.round((connTotal / placedTotal) * 100) : 0;

  const x = (i: number) => (n > 1 ? (i / (n - 1)) * w : 0);
  const y = (v: number) => padTop + (1 - v / max) * (H - padTop);

  const line = (key: "placed" | "connected") =>
    ACTIVITY.map(
      (a, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(a[key]).toFixed(1)}`,
    ).join(" ");
  const area = `${line("placed")} L ${x(n - 1).toFixed(1)},${H} L 0,${H} Z`;

  const onMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(frac * (n - 1)));
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Calls today</h3>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {placedTotal.toLocaleString()} placed · {rate}% connected
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/35" /> Placed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" /> Connected
          </span>
        </div>
      </div>

      <div
        ref={ref}
        className="relative mt-4"
        style={{ height: H }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {w > 0 && (
          <svg width={w} height={H} className="block overflow-visible">
            <defs>
              <linearGradient id="act-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <path
              d={area}
              fill="url(#act-fill)"
              className="transition-opacity duration-700 motion-reduce:transition-none"
              style={{ opacity: mounted ? 1 : 0 }}
            />
            <path
              d={line("placed")}
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              className="[transition:stroke-dashoffset_900ms_ease-out] motion-reduce:transition-none"
              style={{ strokeDasharray: 1, strokeDashoffset: mounted ? 0 : 1 }}
            />
            <path
              d={line("connected")}
              fill="none"
              stroke="#fff"
              strokeWidth={1.75}
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              className="[transition:stroke-dashoffset_900ms_ease-out_120ms] motion-reduce:transition-none"
              style={{ strokeDasharray: 1, strokeDashoffset: mounted ? 0 : 1 }}
            />
            {hover != null && (
              <>
                <line
                  x1={x(hover)}
                  y1={0}
                  x2={x(hover)}
                  y2={H}
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx={x(hover)} cy={y(ACTIVITY[hover].placed)} r={2.5} fill="rgba(255,255,255,0.5)" />
                <circle cx={x(hover)} cy={y(ACTIVITY[hover].connected)} r={3} fill="#fff" />
              </>
            )}
          </svg>
        )}
        {hover != null && w > 0 && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-black/85 px-2 py-1 text-[10px] shadow-md"
            style={{ left: Math.max(30, Math.min(w - 30, x(hover))) }}
          >
            <div className="font-mono text-foreground">{ACTIVITY[hover].h}</div>
            <div className="text-muted-foreground">
              {ACTIVITY[hover].placed} placed · {ACTIVITY[hover].connected} conn
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{ACTIVITY[0].h}</span>
        <span>{ACTIVITY[Math.floor(ACTIVITY.length / 2)].h}</span>
        <span>{ACTIVITY[ACTIVITY.length - 1].h}</span>
      </div>
    </div>
  );
}

/* ── Empty / onboarding state (new user) ─────────────────────────────── */

function EmptyHome() {
  const initial = ACCOUNT.user[0]?.toUpperCase() ?? "?";
  // Informational only — steps are read, not clicked. One action for the
  // whole card ("Create your first agent") opens the real config flow.
  const startAgent = () => {
    toast("Opening agent builder");
  };

  const useTemplate = (name: string) => {
    toast(`Opening agent builder with "${name}" template`);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Centered greeting */}
      <div className="flex flex-col items-center text-center">
        <span
          className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-xs font-medium text-foreground"
          aria-hidden
        >
          {initial}
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Welcome to {ACCOUNT.workspace}, {ACCOUNT.user}
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Three steps and your first agent starts dialing.
        </p>
      </div>

      {/* Read-only setup card: static step list + one primary action */}
      <div className="rounded-xl border border-border bg-card">
        <ol className="flex flex-col">
          {SETUP_STEPS.map((s, i) => (
            <li
              key={s.title}
              className={cn(
                "flex items-start gap-4 px-6 py-5",
                i < SETUP_STEPS.length - 1 && "border-b border-white/[0.04]",
              )}
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-muted-foreground"
                aria-hidden
              >
                {i + 1}
              </span>
              <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
                {s.title}
              </p>
            </li>
          ))}
        </ol>
        <div className="flex items-center justify-end gap-3 border-t border-white/[0.04] px-6 py-4">
          <button
            onClick={startAgent}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create your first agent →
          </button>
        </div>
      </div>

      {/* Templates — jump straight into the agent builder with a preset */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Or start from a template
          </span>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            See all 12 templates →
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <TemplateCard
              key={t.title}
              {...t}
              onUse={() => useTemplate(t.title)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function TemplateCard({
  title,
  body,
  tags,
  onUse,
}: {
  title: string;
  body: string;
  tags: string[];
  onUse: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-white/25">
      {/* Illustration placeholder */}
      <div
        aria-hidden
        className="flex h-32 items-center justify-center border-b border-white/[0.04] bg-white/[0.03] transition-colors group-hover:bg-white/[0.05]"
      >
        <ImageOff size={20} className="text-muted-foreground/60" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <p className="mt-1 text-xs text-muted-foreground">{body}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border border-border bg-transparent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={onUse}
          className="mt-1 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground transition-colors hover:bg-white/[0.04]"
        >
          Use template
        </button>
      </div>
    </div>
  );
}

/* ── Plan usage ──────────────────────────────────────────────────────── */

function compact(n: number) {
  return n >= 1000
    ? `${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`
    : String(n);
}

function UsagePanel() {
  const all = [...USAGE_CYCLE, ...USAGE_RESOURCES];
  const nearCount = all.filter(
    (u) => Math.round((u.used / u.limit) * 100) >= 85,
  ).length;

  return (
    <section>
      <BandLabel>Usage</BandLabel>
      <a
        href="/usage"
        className="group flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-xl border border-border bg-card px-6 py-3.5 transition-colors hover:border-white/15"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm">
            <span className="font-medium text-foreground">Scale plan</span>
            <span className="text-muted-foreground"> · resets Aug 1</span>
          </span>
          {nearCount > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-amber-400/25 bg-amber-400/[0.06] px-2 py-0.5 text-[11px] font-medium text-amber-400">
              <AlertTriangle size={11} />
              {nearCount} near limit
            </span>
          )}
        </div>

        {/* Inline mini-meters so the row hints at what's inside */}
        <div className="flex items-center gap-3">
          {all.map((u) => (
            <MiniMeter key={u.label} {...u} />
          ))}
          <span className="mx-1 h-4 w-px shrink-0 bg-white/[0.06]" />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
            View details
            <ArrowUpRight size={13} />
          </span>
        </div>
      </a>
    </section>
  );
}

/** Tiny inline usage meter — icon + a very short bar + tooltip on hover. */
function MiniMeter({ icon, label, used, limit, unit }: UsageItem) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const near = pct >= 85;
  const suffix = unit ? ` ${unit}` : "";
  return (
    <span
      className="group relative inline-flex items-center gap-1.5"
      title={`${label} · ${compact(used)}${suffix} / ${compact(limit)}${suffix} (${pct}%)`}
    >
      <span
        className={cn(
          "shrink-0",
          near ? "text-amber-400" : "text-muted-foreground/70",
        )}
      >
        {icon}
      </span>
      <span
        className="h-1.5 w-14 overflow-hidden rounded-full ring-1 ring-inset ring-white/[0.06]"
        aria-hidden
      >
        <span
          className={cn(
            "block h-full rounded-full",
            near ? "bg-amber-400" : "bg-foreground/60",
          )}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums",
          near ? "text-amber-400" : "text-muted-foreground",
        )}
      >
        {pct}%
      </span>
    </span>
  );
}

function UsageGroup({ title, rows }: { title: string; rows: UsageItem[] }) {
  return (
    <div>
      <div className="mb-3.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-col gap-4">
        {rows.map((r) => (
          <UsageRow key={r.label} {...r} />
        ))}
      </div>
    </div>
  );
}

function UsageRow({ icon, label, used, limit, unit }: UsageItem) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const near = pct >= 85;
  const left = Math.max(0, limit - used);
  const suffix = unit ? ` ${unit}` : "";
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-sm text-foreground">
          <span className="shrink-0 text-muted-foreground/70">{icon}</span>
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 font-mono text-xs tabular-nums">
          <span className={near ? "text-amber-400" : "text-foreground"}>
            {compact(used)}
            {suffix}
          </span>
          <span className="text-muted-foreground">
            {" "}
            / {compact(limit)}
            {suffix}
          </span>
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full ring-1 ring-inset ring-white/[0.06]">
          <div
            className={cn(
              "h-full rounded-full",
              near ? "bg-amber-400" : "bg-foreground/70",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={cn(
            "w-8 shrink-0 text-right text-[11px] tabular-nums",
            near ? "text-amber-400" : "text-muted-foreground",
          )}
        >
          {pct}%
        </span>
      </div>
      {near && (
        <div className="mt-1.5 flex items-center justify-between text-[11px]">
          <span className="text-amber-400">
            {compact(left)}
            {suffix} left
          </span>
          <button className="inline-flex items-center gap-0.5 font-medium text-amber-400 transition-opacity hover:opacity-80">
            Upgrade <ArrowUpRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Greeting ────────────────────────────────────────────────────────── */

function useTimeOfDay(): "morning" | "afternoon" | "evening" {
  const [t, setT] = React.useState<"morning" | "afternoon" | "evening">(
    "morning",
  );
  React.useEffect(() => {
    const h = new Date().getHours();
    setT(h < 12 ? "morning" : h < 18 ? "afternoon" : "evening");
  }, []);
  return t;
}

function Greeting() {
  const tod = useTimeOfDay();
  const initials = PROFILE.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-4">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-foreground"
        aria-hidden
      >
        {initials}
      </span>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Good {tod}, {ACCOUNT.user}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Here&rsquo;s what&rsquo;s happening across {ACCOUNT.workspace} today.
        </p>
      </div>
    </div>
  );
}


/* ── Feature banner — Speech Engine-style promo ──────────────────────── */

function FeatureBanner() {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-border bg-card p-5">
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-border"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), rgba(255,255,255,0) 70%)",
        }}
      >
        <Radio size={22} className="text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">
          Update running campaigns without recreating them
        </div>
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Edit agent, task-start/expiry, retry policy, and API overrides on live
          batch and realtime campaigns.
        </div>
      </div>
      <a
        href="/campaigns-update-preview"
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/60"
      >
        Try it <ArrowUpRight size={13} />
      </a>
    </div>
  );
}

/* ── Recent activity — hero line chart (last month) ──────────────────── */

// 30 daily data points — placeholder for real API activity.
const DAILY_ACTIVITY = Array.from({ length: 30 }, (_, i) => {
  const base = 380 + Math.sin(i / 3) * 90 + Math.cos(i / 5) * 60;
  const noise = ((i * 37) % 13) * 6;
  return Math.max(120, Math.round(base + noise));
});

function RecentActivity() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [w, setW] = React.useState(0);
  const [hover, setHover] = React.useState<number | null>(null);
  const mounted = useMounted();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const H = 160;
  const padTop = 12;
  const padBottom = 20;
  const n = DAILY_ACTIVITY.length;
  const max = Math.max(...DAILY_ACTIVITY) || 1;
  const total = DAILY_ACTIVITY.reduce((s, a) => s + a, 0);

  const x = (i: number) => (n > 1 ? (i / (n - 1)) * w : 0);
  const y = (v: number) =>
    padTop + (1 - v / max) * (H - padTop - padBottom);

  const path = DAILY_ACTIVITY.map(
    (v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`,
  ).join(" ");
  const area = `${path} L ${x(n - 1).toFixed(1)},${H - padBottom} L 0,${H - padBottom} Z`;

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (n - 1));
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-medium text-foreground">Recent activity</h2>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {total.toLocaleString()} calls · last {n} days
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div
          ref={ref}
          className="relative"
          style={{ height: H }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const frac = Math.max(
              0,
              Math.min(1, (e.clientX - rect.left) / rect.width),
            );
            setHover(Math.round(frac * (n - 1)));
          }}
          onMouseLeave={() => setHover(null)}
        >
          {w > 0 && (
            <svg width={w} height={H} className="block overflow-visible">
              <defs>
                <linearGradient id="rec-act" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              <path
                d={area}
                fill="url(#rec-act)"
                className="transition-opacity duration-700 motion-reduce:transition-none"
                style={{ opacity: mounted ? 1 : 0 }}
              />
              <path
                d={path}
                fill="none"
                stroke="#fff"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                className="[transition:stroke-dashoffset_900ms_ease-out] motion-reduce:transition-none"
                style={{ strokeDasharray: 1, strokeDashoffset: mounted ? 0 : 1 }}
              />
              {hover != null && (
                <>
                  <line
                    x1={x(hover)}
                    y1={0}
                    x2={x(hover)}
                    y2={H - padBottom}
                    stroke="rgba(255,255,255,0.14)"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={x(hover)}
                    cy={y(DAILY_ACTIVITY[hover])}
                    r={3}
                    fill="#fff"
                  />
                </>
              )}
            </svg>
          )}
          {hover != null && w > 0 && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-black/85 px-2 py-1 text-[10px] shadow-md"
              style={{ left: Math.max(40, Math.min(w - 40, x(hover))) }}
            >
              <div className="font-mono text-foreground">
                {DAILY_ACTIVITY[hover].toLocaleString()} calls
              </div>
              <div className="text-muted-foreground">
                {fmt(
                  new Date(
                    startDate.getTime() + hover * 24 * 60 * 60 * 1000,
                  ),
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{fmt(startDate)}</span>
          <span>{fmt(now)}</span>
        </div>
      </div>
    </section>
  );
}

/* ── Balance summary (Total / Remaining format) ──────────────────────── */

function BalanceSummary() {
  const runwayDays = Math.floor(BALANCE.amount / BALANCE.burnPerDay);
  const low = runwayDays <= 3;
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Wallet size={14} /> Balance
      </span>
      <div className="mt-2 text-3xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
        ${BALANCE.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </div>
      <div
        className={cn(
          "mt-1.5 text-xs",
          low ? "text-amber-400" : "text-muted-foreground",
        )}
      >
        ~{runwayDays} days left · ${BALANCE.burnPerDay.toLocaleString()}/day burn
      </div>
      <button className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 mt-5">
        <Plus size={15} /> Add credits
      </button>
    </div>
  );
}

/* ── System status ───────────────────────────────────────────────────── */

const SERVICES: { name: string; state: "ok" | "degraded" }[] = [
  { name: "Voice API", state: "ok" },
  { name: "Telephony", state: "ok" },
  { name: "Dialer", state: "ok" },
  { name: "Webhooks", state: "ok" },
];

function SystemStatus() {
  const allOk = SERVICES.every((s) => s.state === "ok");
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">System status</h2>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View full status <ArrowUpRight size={13} />
        </a>
      </div>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-3.5 py-3",
          allOk
            ? "border-emerald-400/25 bg-emerald-400/[0.05]"
            : "border-amber-400/25 bg-amber-400/[0.05]",
        )}
      >
        <Check
          size={15}
          className={allOk ? "text-emerald-400" : "text-amber-400"}
        />
        <span className="text-sm text-foreground">
          {allOk ? "All systems operational" : "Some services degraded"}
        </span>
      </div>
      <ul className="mt-4 flex flex-col divide-y divide-white/[0.04]">
        {SERVICES.map((s) => (
          <li
            key={s.name}
            className="flex items-center justify-between py-2 text-sm"
          >
            <span className="text-foreground">{s.name}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                s.state === "ok" ? "text-emerald-400" : "text-amber-400",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  s.state === "ok" ? "bg-emerald-400" : "bg-amber-400",
                )}
              />
              {s.state === "ok" ? "Operational" : "Degraded"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
