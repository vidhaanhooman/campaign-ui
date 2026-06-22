export const WORKSPACE_TOTAL = 200;
export const WORKSPACE_FREE = 50;

export const NUMBERS = [
  "+918035315340",
  "+918035315341",
  "+918035315342",
  "+918035315343",
  "+918047492200",
  "+918047492201",
  "+918047492202",
  "+912248903311",
  "+912248903312",
  "+912248903313",
  "+912261177800",
  "+912261177801",
  "+912261177802",
  "+919870042100",
  "+919870042101",
  "+919870042102",
  "+919870042103",
  "+918048104900",
  "+918048104901",
  "+918048104902",
  "+918068441500",
  "+918068441501",
  "+918068441502",
  "+919667750200",
  "+919667750201",
  "+919667750202",
  "+919667750203",
  "+912247482300",
  "+912247482301",
  "+912247482302",
  "+919335400110",
  "+919335400111",
  "+919335400112",
  "+918045672700",
  "+918045672701",
  "+918045672702",
  "+912250003300",
  "+912250003301",
  "+912250003302",
  "+919212340000",
];

export const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
];

export const AGENTS = [
  "Allen — Admissions IVR",
  "Wakefit — Delivery confirm",
  "Giva — Win-back",
];

export const VERSIONS = ["Latest", "v3", "v2", "v1"];

export type AgentMode = "Conversation" | "Broadcast";

export type VersionDetail = {
  name: string;
  tag: string;
};

export type AgentDetail = {
  id: string;
  name: string;
  mode: AgentMode;
  versions: VersionDetail[];
};

const LATEST: VersionDetail = { name: "Live", tag: "Production · only one Live per agent" };

export const AGENT_DETAILS: AgentDetail[] = [
  {
    id: "agt_debt_pitch",
    name: "Debt Collection Pitch Agent",
    mode: "Conversation",
    versions: [
      LATEST,
      { name: "v9", tag: "Prod Q2" },
      { name: "v8", tag: "Objection-tuned" },
      { name: "v7", tag: "Rerank v2" },
      { name: "v6", tag: "Multilingual" },
      { name: "v5", tag: "Canary Q1" },
      { name: "v4", tag: "Beta" },
      { name: "v3", tag: "Rerank Q4 (Hindi pickup)" },
      { name: "v2", tag: "GA" },
      { name: "v1", tag: "GA" },
    ],
  },
  {
    id: "agt_debt_outbound",
    name: "Debt Collection Outbound Agent",
    mode: "Broadcast",
    versions: [
      LATEST,
      { name: "v4", tag: "Prod" },
      { name: "v3", tag: "Tone-softened" },
      { name: "v2", tag: "Hindi pickup" },
      { name: "v1", tag: "GA" },
    ],
  },
  {
    id: "agt_careers360",
    name: "Careers_360 — Tech college predictor",
    mode: "Conversation",
    versions: [
      LATEST,
      { name: "v6", tag: "Prod Q2" },
      { name: "v5", tag: "JEE-cutoff updates" },
      { name: "v4", tag: "Rerank v2" },
      { name: "v3", tag: "Tier-2 expansion" },
      { name: "v2", tag: "Beta" },
      { name: "v1", tag: "GA" },
    ],
  },
  {
    id: "agt_premium",
    name: "premium",
    mode: "Conversation",
    versions: [LATEST, { name: "v2", tag: "Prod" }, { name: "v1", tag: "GA" }],
  },
  {
    id: "agt_standard",
    name: "standard",
    mode: "Broadcast",
    versions: [
      LATEST,
      { name: "v3", tag: "Compliance update" },
      { name: "v2", tag: "Tone-softened" },
      { name: "v1", tag: "GA" },
    ],
  },
  {
    id: "agt_palmonas",
    name: "palmonas hoomanlabs",
    mode: "Broadcast",
    versions: [LATEST, { name: "v1", tag: "GA" }],
  },
  {
    id: "agt_allen_ivr",
    name: "Allen — Admissions IVR",
    mode: "Conversation",
    versions: [
      LATEST,
      { name: "v5", tag: "Prod" },
      { name: "v4", tag: "IVR refactor" },
      { name: "v3", tag: "Multilingual" },
      { name: "v2", tag: "Beta" },
      { name: "v1", tag: "GA" },
    ],
  },
  {
    id: "agt_wakefit_delivery",
    name: "Wakefit — Delivery confirm",
    mode: "Broadcast",
    versions: [
      LATEST,
      { name: "v3", tag: "Window-pick flow" },
      { name: "v2", tag: "Hindi pickup" },
      { name: "v1", tag: "GA" },
    ],
  },
  {
    id: "agt_giva_winback",
    name: "Giva — Win-back",
    mode: "Conversation",
    versions: [
      LATEST,
      { name: "v4", tag: "Discount tier" },
      { name: "v3", tag: "Persona-aware" },
      { name: "v2", tag: "Beta" },
      { name: "v1", tag: "GA" },
    ],
  },
];

export const VERSION_DETAILS = AGENT_DETAILS[0].versions;

export const OUTCOMES = [
  "busy",
  "no-answer",
  "voicemail",
  "no_response",
  "failed",
  "agent_transfer",
  "busy_callback",
];

// Every "not connected" outcome (the call never reached the contact) is a
// locked default — we always retry these. Shown as chips above the dropdown.
export const DEFAULT_OUTCOMES = [
  "no-answer",
  "busy",
  "failed",
  "no_response",
  "busy_callback",
];

export type OutcomeGroup = {
  label: string;
  description: string;
  outcomes: string[];
};

// Dropdown holds only the opt-in "connected" outcomes. Every "not connected"
// outcome is a default (always retried) and lives as a chip above the dropdown.
export const OUTCOME_GROUPS: OutcomeGroup[] = [
  {
    label: "Connected",
    description: "Call was answered but ended without you",
    outcomes: ["voicemail", "agent_transfer"],
  },
];

// Priority is an integer rank; higher = dialed sooner. Surfaced to users as
// semantic levels rather than raw numbers.
export const PRIORITY_MIN = 1;
export const PRIORITY_MAX = 10;

export const PRIORITY_LEVELS = [
  { label: "Low", value: 1 },
  { label: "Normal", value: 5 },
  { label: "High", value: 8 },
  { label: "Urgent", value: 10 },
] as const;

export function priorityLabel(value: number) {
  return PRIORITY_LEVELS.find((l) => l.value === value)?.label ?? `P${value}`;
}

// Status-dot color per outcome (styleguide §1 status colors).
export const OUTCOME_COLORS: Record<string, string> = {
  "no-answer": "bg-amber-400",
  busy: "bg-amber-400",
  busy_callback: "bg-amber-400",
  no_response: "bg-amber-400",
  failed: "bg-red-400",
  voicemail: "bg-blue-400",
  agent_transfer: "bg-emerald-400",
};

export const OVERRIDABLE = [
  { key: "from", label: "Calling number" },
  { key: "callingHours", label: "Calling hours" },
  { key: "timezone", label: "Timezone" },
  { key: "startAfter", label: "Task start" },
  { key: "endAfter", label: "Task expiry" },
  { key: "retries", label: "Retry policy" },
  { key: "priority", label: "Priority" },
  { key: "version", label: "Agent / version" },
] as const;

export type OverrideKey = (typeof OVERRIDABLE)[number]["key"];

export type CampaignType = "batch" | "realtime";

export type Unit = "min" | "hr";

export function toMs(val: number, unit: Unit) {
  return val * (unit === "min" ? 60_000 : 3_600_000);
}

export function addClockMinutes(hhmm: string, mins: number) {
  const [h, m] = hhmm.split(":").map(Number);
  let total = (h * 60 + m + mins) % 1440;
  total = (total + 1440) % 1440;
  let hh = Math.floor(total / 60);
  const mm = total % 60;
  const ap = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  return `${hh}:${String(mm).padStart(2, "0")} ${ap}`;
}
