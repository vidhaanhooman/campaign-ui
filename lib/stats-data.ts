// Mock analytics for the campaign stats page.

export const STAT_CAMPAIGN = {
  name: "Debt Collection — Q3 win-back",
  agentName: "Debt Collection Outbound Agent",
  agentId: "agt_debt_outbound",
  range: "Last 30 days",
};

export const STAT_CAMPAIGN_RT = {
  name: "Order confirmation — realtime",
  agentName: "Order Confirmation Agent",
  agentId: "agt_order_confirm",
  range: "Last 24 hours",
};

/* ───────── Realtime-specific content ───────── */

export const RT_BANNER =
  "No completion — leads stream in continuously. Funnel rates are windowed; terminal counts are cumulative.";

export type RtWindowKey = "24h" | "7d" | "lifetime";

/** Realtime ops strip — live operational signals. */
export const RT_OPS = [
  { label: "Active now", value: "14", suffix: "/ 30", sub: "calls vs pool capacity", tone: "neutral" as const },
  { label: "Net backlog flow", value: "−3", suffix: "/hr", sub: "in 22/hr · dial 25/hr", tone: "good" as const },
  { label: "Backlog depth", value: "86", suffix: "", sub: "oldest waiting 7m", tone: "neutral" as const },
  { label: "Time to first dial", value: "1m 30s", suffix: "", sub: "p50 · p90 6m 12s", tone: "neutral" as const },
];

/** Raw funnel counts per window. */
export const RT_FUNNEL_RAW: Record<RtWindowKey, {
  leads: number; dials: number; delivered: number; picked: number;
  human: number; engaged: number; reached: number; converted: number;
}> = {
  "24h":      { leads: 540,   dials: 1180,  delivered: 970,   picked: 505,   human: 366,  engaged: 212,  reached: 300,  converted: 66 },
  "7d":       { leads: 3900,  dials: 8400,  delivered: 6900,  picked: 3600,  human: 2600, engaged: 1510, reached: 2100, converted: 470 },
  "lifetime": { leads: 18420, dials: 39200, delivered: 32100, picked: 16800, human: 12100, engaged: 7050, reached: 9900, converted: 2180 },
};

/** Build the FUNNEL-shape stage array from raw counts. */
export function buildFunnel(d: (typeof RT_FUNNEL_RAW)[RtWindowKey]) {
  const pct = (a: number, b: number) => `${Math.round((a / b) * 100)}%`;
  const mult = (a: number, b: number) => `${(a / b).toFixed(1)}×`;
  return [
    { stage: "Leads",          kind: "lead" as const, count: d.leads,     rel: "100%",                    note: "intake" },
    { stage: "Dials",          kind: "call" as const, count: d.dials,     rel: mult(d.dials, d.leads),    note: "incl. retries" },
    { stage: "Delivered",      kind: "call" as const, count: d.delivered, rel: pct(d.delivered, d.dials), note: "of dials · rang" },
    { stage: "Picked up",      kind: "call" as const, count: d.picked,    rel: pct(d.picked, d.delivered), note: "of delivered" },
    { stage: "Human answered", kind: "call" as const, count: d.human,     rel: pct(d.human, d.picked),     note: "of picked" },
    { stage: "Engaged",        kind: "call" as const, count: d.engaged,   rel: pct(d.engaged, d.human),    note: "of human · >30s" },
    { stage: "Unique reached", kind: "lead" as const, count: d.reached,   rel: pct(d.reached, d.leads),    note: "of leads" },
    { stage: "Converted",      kind: "lead" as const, count: d.converted, rel: pct(d.converted, d.reached), note: `of reached · ${pct(d.converted, d.leads)} of leads` },
  ];
}

/** Realtime lifecycle states — in-flight live, terminal cumulative. */
export const RT_LIFECYCLE = {
  hint: "in-flight live · terminal cumulative",
  states: [
    { state: "queued · first attempt", count: 58,   tone: "muted" as const,  bucket: "in-flight" as const },
    { state: "queued · retry",         count: 28,   tone: "active" as const, bucket: "in-flight" as const },
    { state: "paused",                 count: 0,    tone: "warn" as const,   bucket: "in-flight" as const },
    { state: "running",                count: 14,   tone: "good" as const,   bucket: "in-flight" as const },
    { state: "completed · connected",  count: 9900, tone: "good" as const,   bucket: "terminal" as const },
    { state: "completed · exhausted",  count: 2840, tone: "warn" as const,   bucket: "terminal" as const },
    { state: "archived",               count: 640,  tone: "bad" as const,    bucket: "terminal" as const },
  ],
};

/** Headline KPIs shown at the top of the stats page. */
export const HEADLINE = [
  {
    label: "Connect rate",
    value: "62.0%",
    sub: "of 12,840 dialed",
    delta: "+1.4%",
    up: true,
    spark: [54, 56, 55, 58, 57, 60, 59, 61, 60, 62, 61, 63, 62, 62],
  },
  {
    label: "Conversion rate",
    value: "12.2%",
    sub: "leads → converted",
    delta: "+0.6%",
    up: true,
    spark: [10.4, 10.6, 11.0, 10.9, 11.3, 11.5, 11.1, 11.6, 11.9, 11.7, 12.0, 12.1, 12.0, 12.2],
  },
  {
    label: "Avg talk time",
    value: "2:22",
    sub: "minutes per call",
    delta: "−4s",
    up: false,
    spark: [148, 150, 147, 149, 146, 145, 144, 143, 146, 142, 144, 141, 143, 142],
  },
  {
    label: "Cost / call",
    value: "$0.24",
    sub: "blended",
    delta: "−1.2%",
    up: true,
    spark: [0.27, 0.27, 0.26, 0.26, 0.26, 0.25, 0.26, 0.25, 0.25, 0.24, 0.25, 0.24, 0.24, 0.24],
  },
] as const;

export const CALLING = {
  totalCalls: 12840,
  connected: 7964,
  connectRate: 0.62,
  avgTalkSec: 142,
  conversions: 1183,
  conversionRate: 0.0921, // of dialed
  costPerCall: 0.24,
  /** Daily dialed vs connected, last 14 days. */
  daily: [
    { day: "1", calls: 760, connected: 470 },
    { day: "2", calls: 820, connected: 505 },
    { day: "3", calls: 690, connected: 410 },
    { day: "4", calls: 910, connected: 590 },
    { day: "5", calls: 1010, connected: 640 },
    { day: "6", calls: 870, connected: 520 },
    { day: "7", calls: 640, connected: 360 },
    { day: "8", calls: 980, connected: 612 },
    { day: "9", calls: 1080, connected: 700 },
    { day: "10", calls: 940, connected: 565 },
    { day: "11", calls: 1120, connected: 742 },
    { day: "12", calls: 1005, connected: 631 },
    { day: "13", calls: 880, connected: 520 },
    { day: "14", calls: 1150, connected: 699 },
  ],
};

/** Attempt-wise dials, connected, connect rate. */
export const ATTEMPTS = [
  { attempt: 1, dials: 5000, connected: 2100, connectRate: 0.42 },
  { attempt: 2, dials: 3100, connected: 1085, connectRate: 0.35 },
  { attempt: 3, dials: 2140, connected: 599, connectRate: 0.28 },
  { attempt: 4, dials: 1000, connected: 190, connectRate: 0.19 },
];

/** Dial disposition — sums to 100%. */
export const DISPOSITION = [
  { label: "human answered", pct: 0.3, tone: "good" as const },
  { label: "voicemail / AMD", pct: 0.11, tone: "warn" as const },
  { label: "no answer (rang)", pct: 0.38, tone: "neutral" as const },
  { label: "busy", pct: 0.06, tone: "neutral" as const },
  { label: "failed / invalid / DND", pct: 0.12, tone: "bad" as const },
  { label: "other", pct: 0.03, tone: "muted" as const },
];

export const OUTCOME_BREAKDOWN = [
  { label: "Completed", value: 5210, tone: "good" as const },
  { label: "No answer", value: 2870, tone: "neutral" as const },
  { label: "Voicemail", value: 1740, tone: "neutral" as const },
  { label: "Busy", value: 980, tone: "neutral" as const },
  { label: "Failed", value: 1040, tone: "bad" as const },
  { label: "DNC / opt-out", value: 1000, tone: "warn" as const },
];

/** Conversion funnel — mixed lead/call stages; `rel` is relative to its own denominator. */
export const FUNNEL = [
  { stage: "Leads", kind: "lead" as const, count: 5000, rel: "100%", note: "intake" },
  { stage: "Dials", kind: "call" as const, count: 11240, rel: "2.2×", note: "incl. retries" },
  { stage: "Delivered", kind: "call" as const, count: 9180, rel: "82%", note: "of dials · rang" },
  { stage: "Picked up", kind: "call" as const, count: 4710, rel: "51%", note: "of delivered" },
  { stage: "Human answered", kind: "call" as const, count: 3420, rel: "73%", note: "of picked" },
  { stage: "Engaged", kind: "call" as const, count: 1980, rel: "58%", note: "of human · >30s" },
  { stage: "Unique reached", kind: "lead" as const, count: 2760, rel: "55%", note: "of leads" },
  { stage: "Converted", kind: "lead" as const, count: 612, rel: "22%", note: "of reached · 12% of leads" },
];

/** Lead → converted (612 / 5,000). */
export const FUNNEL_OVERALL = { label: "Leads → converted", value: "12.2%" };

/** Lifecycle states grouped into 2 meta-buckets (In-flight vs Terminal). */
export const LIFECYCLE_BUCKETS = [
  {
    key: "in-flight",
    label: "In-flight",
    members: ["queued · first attempt", "queued · retry", "paused", "running"],
  },
  {
    key: "terminal",
    label: "Terminal",
    members: ["completed · connected", "completed · exhausted", "archived"],
  },
] as const;

/**
 * Detailed lifecycle states. `tone` is the semantic colour:
 *   muted   — passive/queued
 *   active  — currently progressing
 *   warn    — needs attention / paused / exhausted
 *   good    — success
 *   bad     — archived / abandoned
 */
export const LIFECYCLE = {
  states: [
    { state: "queued · first attempt", count: 700, tone: "muted" as const, bucket: "in-flight" as const },
    { state: "queued · retry", count: 400, tone: "active" as const, bucket: "in-flight" as const },
    { state: "paused", count: 80, tone: "warn" as const, bucket: "in-flight" as const },
    { state: "running", count: 420, tone: "good" as const, bucket: "in-flight" as const },
    { state: "completed · connected", count: 2150, tone: "good" as const, bucket: "terminal" as const },
    { state: "completed · exhausted", count: 980, tone: "warn" as const, bucket: "terminal" as const },
    { state: "archived", count: 270, tone: "bad" as const, bucket: "terminal" as const },
  ],
};

/** Call performance — human-answered calls only. */
export const CALL_PERF_KPIS = [
  { label: "Median duration", value: "1:24", sub: "avg 2:02 · skewed", tone: "neutral" as const },
  { label: "Early hangup <10s", value: "18%", sub: "opener signal", tone: "warn" as const },
  { label: "Ended by caller", value: "36%", sub: "vs agent 64%", tone: "neutral" as const },
  { label: "Human transfer", value: "7%", sub: "escalated to live agent", tone: "warn" as const },
  { label: "Latency p50", value: "820ms", sub: "p90 1.6s · p95 2.2s", tone: "neutral" as const },
  { label: "Avg turns", value: "7.4", sub: "to outcome: 4.1", tone: "neutral" as const },
] as const;

/** Outcome distribution — human-answered calls. */
export const CALL_OUTCOMES = [
  { label: "goal achieved · converted", pct: 0.18, tone: "good" as const },
  { label: "interested · callback set", pct: 0.14, tone: "good" as const },
  { label: "not interested", pct: 0.29, tone: "neutral" as const },
  { label: "wrong / not the person", pct: 0.09, tone: "neutral" as const },
  { label: "transferred to human", pct: 0.07, tone: "warn" as const },
  { label: "dropped early", pct: 0.18, tone: "bad" as const },
  { label: "silent", pct: 0.05, tone: "bad" as const },
] as const;

/** Human transfer — why the agent escalated. */
export const HUMAN_TRANSFER_REASONS = [
  { label: "out of scope · no tool", pct: 0.41, tone: "warn" as const },
  { label: "caller explicitly asked", pct: 0.33, tone: "active" as const },
  { label: "low model confidence", pct: 0.18, tone: "neutral" as const },
  { label: "negative sentiment", pct: 0.08, tone: "bad" as const },
] as const;
export const HUMAN_TRANSFER_NOTE = "7% of human-answered calls · transfer success 92%";

export type VersionStat = {
  version: string;
  tag: string;
  live?: boolean;
  calls: number;            // Calls count
  callsConnected: number;   // Calls connected
  tasksCreated: number;     // Tasks created
  uniqueReached: number;
  connectRate: number;      // Pick-up rate
  humanAnswerRate: number;
  avgTalkSec: number;       // Avg duration
  engagementRate: number;
  conversionRate: number;
  transferRate: number;     // Transfer rate
  csat: number;             // 0–5
  costPerCall: number;
  costPerConversion: number;
  dialingSec: number;
};

export const VERSION_STATS: VersionStat[] = [
  { version: "Live", tag: "Prod", live: true, calls: 5200, callsConnected: 3328, tasksCreated: 5400, uniqueReached: 3120, connectRate: 0.64, humanAnswerRate: 0.74, avgTalkSec: 138, engagementRate: 0.6,  conversionRate: 0.101, transferRate: 0.06, csat: 4.5, costPerCall: 0.24, costPerConversion: 2.38, dialingSec: 17 },
  { version: "v4",   tag: "Prod",                                  calls: 3100, callsConnected: 1891, tasksCreated: 3210, uniqueReached: 1820, connectRate: 0.61, humanAnswerRate: 0.71, avgTalkSec: 145, engagementRate: 0.57, conversionRate: 0.094, transferRate: 0.08, csat: 4.2, costPerCall: 0.25, costPerConversion: 2.66, dialingSec: 19 },
  { version: "v3",   tag: "Tone-softened",                         calls: 2300, callsConnected: 1357, tasksCreated: 2380, uniqueReached: 1340, connectRate: 0.59, humanAnswerRate: 0.68, avgTalkSec: 151, engagementRate: 0.55, conversionRate: 0.088, transferRate: 0.10, csat: 4.0, costPerCall: 0.27, costPerConversion: 3.07, dialingSec: 20 },
  { version: "v2",   tag: "Hindi pickup",                          calls: 1500, callsConnected: 990,  tasksCreated: 1540, uniqueReached: 900,  connectRate: 0.66, humanAnswerRate: 0.78, avgTalkSec: 129, engagementRate: 0.62, conversionRate: 0.083, transferRate: 0.05, csat: 4.4, costPerCall: 0.22, costPerConversion: 2.65, dialingSec: 16 },
  { version: "v1",   tag: "GA",                                    calls: 740,  callsConnected: 407,  tasksCreated: 760,  uniqueReached: 420,  connectRate: 0.55, humanAnswerRate: 0.65, avgTalkSec: 160, engagementRate: 0.5,  conversionRate: 0.071, transferRate: 0.12, csat: 3.8, costPerCall: 0.29, costPerConversion: 4.08, dialingSec: 22 },
];

// ── formatters ──────────────────────────────────────────────
export const fmtInt = (n: number) => n.toLocaleString("en-US");
export const fmtPct = (n: number, dp = 1) => `${(n * 100).toFixed(dp)}%`;
export const fmtDur = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
export const fmtMoney = (n: number) => `$${n.toFixed(2)}`;

export const TONE: Record<string, string> = {
  good: "bg-emerald-400",
  active: "bg-sky-400",
  warn: "bg-amber-400",
  bad: "bg-red-400",
  neutral: "bg-muted-foreground",
  muted: "bg-muted-foreground/40",
};
