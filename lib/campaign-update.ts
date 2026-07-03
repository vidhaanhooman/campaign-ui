/**
 * Editable campaign fields — the shape the Update flow deals with.
 * Aligned with what Create Campaign collects; every field is optional in the
 * dirty-diff so users can update any subset without touching the rest.
 */

export interface CampaignEditState {
  /* Basics */
  name: string;
  agentId: string;
  agentVersion: string;

  /* Schedule */
  startAfter: string; // "YYYY-MM-DDTHH:mm"
  endAfter: string;
  channelStart: string; // "HH:mm"
  channelEnd: string;
  timezone: string;

  /* Slots */
  slots: number;
  useAllSlots: boolean;

  /* Retries & priority */
  retries: number;
  retryOutcomes: string[];
  priority: number;
  /** "all" = one level for every attempt; "perAttempt" = per-attempt ranks. */
  priorityMode: "all" | "perAttempt";
  /** Per-attempt priority ranks — used when priorityMode === "perAttempt". */
  attemptPriorities: number[];

  /* Recipients */
  callingNumbers: string[];
}

/** A sample "currently running" campaign — the drawer opens pre-filled with this. */
export const SAMPLE_CAMPAIGN: CampaignEditState = {
  name: "Q3 win-back outbound",
  agentId: "agt_debt_pitch",
  agentVersion: "Live",

  startAfter: "2026-09-12T09:00",
  endAfter: "2026-09-30T18:00",
  channelStart: "10:00",
  channelEnd: "21:00",
  timezone: "Asia/Kolkata",

  slots: 4,
  useAllSlots: false,

  retries: 2,
  retryOutcomes: ["no_answer", "busy"],
  priority: 5,
  priorityMode: "all",
  attemptPriorities: [5, 5, 5],

  callingNumbers: ["+91-80000-01", "+91-80000-02"],
};

export const TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "America/Los_Angeles",
  "Europe/London",
];

/**
 * "before → after" diff between two campaign states — one entry per changed
 * field, with a human-readable label + values.
 */
export interface Change {
  key: keyof CampaignEditState;
  label: string;
  before: string;
  after: string;
}

const LABELS: Record<keyof CampaignEditState, string> = {
  name: "Name",
  agentId: "Agent",
  agentVersion: "Agent version",
  startAfter: "Start after",
  endAfter: "End after",
  channelStart: "Calling hours (start)",
  channelEnd: "Calling hours (end)",
  timezone: "Timezone",
  slots: "Slots",
  useAllSlots: "Use all workspace slots",
  retries: "Retries",
  retryOutcomes: "Retry outcomes",
  priority: "Priority",
  priorityMode: "Priority mode",
  attemptPriorities: "Per-attempt priorities",
  callingNumbers: "Calling numbers",
};

function fmt(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "on" : "off";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "none";
  return String(v);
}

export function diffCampaign(
  a: CampaignEditState,
  b: CampaignEditState,
): Change[] {
  const out: Change[] = [];
  (Object.keys(LABELS) as (keyof CampaignEditState)[]).forEach((k) => {
    const av = a[k];
    const bv = b[k];
    const same =
      Array.isArray(av) && Array.isArray(bv)
        ? av.length === bv.length && av.every((x, i) => x === bv[i])
        : av === bv;
    if (!same) {
      out.push({
        key: k,
        label: LABELS[k],
        before: fmt(av),
        after: fmt(bv),
      });
    }
  });
  return out;
}
