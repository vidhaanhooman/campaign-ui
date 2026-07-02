import {
  BarChart3,
  Clock,
  Coins,
  DollarSign,
  Gauge,
  Hash,
  MessageSquare,
  PhoneCall,
  PhoneMissed,
  PhoneOutgoing,
  PieChart,
  Percent,
  Repeat,
  Ruler,
  Table as TableIcon,
  TrendingUp,
  Users,
  Voicemail,
  type LucideIcon,
} from "lucide-react";
import { AGENTS, OUTCOMES } from "./mock-data";
import type { GroupField, Metric, WidgetType } from "./types";

/** A selectable metric with the extra presentation the picker needs. */
export interface MetricDef extends Metric {
  category: string;
  description: string;
  unit: string;
  icon: LucideIcon;
  /** Marks user-defined SQL metrics (renders a "SQL" badge in the picker). */
  sql?: boolean;
}

/**
 * The metrics the data engine can actually resolve today. Grouped by category
 * so the picker can present them in scannable sections.
 */
export const METRICS: MetricDef[] = [
  // ── Volume ──────────────────────────────────────────────────────────
  {
    id: "calls",
    label: "Calls attempted",
    owner: "system",
    format: "count",
    source: { kind: "system", key: "calls" },
    category: "Volume",
    description: "Total outbound + inbound calls dialed in the selected window.",
    unit: "count",
    icon: PhoneOutgoing,
  },
  {
    id: "connected",
    label: "Calls connected",
    owner: "system",
    format: "count",
    source: { kind: "system", key: "connected" },
    category: "Volume",
    description: "Calls where the callee picked up and audio was exchanged.",
    unit: "count",
    icon: PhoneCall,
  },
  {
    id: "convs",
    label: "Conversation count",
    owner: "system",
    format: "count",
    source: { kind: "system", key: "connected" },
    category: "Volume",
    description: "Distinct conversations that reached at least one exchange.",
    unit: "count",
    icon: MessageSquare,
  },
  {
    id: "voicemail_count",
    label: "Voicemail call count",
    owner: "system",
    format: "count",
    source: { kind: "system", key: "voicemail_count" },
    category: "Volume",
    description: "Attempts that reached voicemail without a human on the line.",
    unit: "count",
    icon: Voicemail,
  },
  {
    id: "init_failed",
    label: "Call initiation failed count",
    owner: "system",
    format: "count",
    source: { kind: "system", key: "init_failed" },
    category: "Volume",
    description: "Dials that never established a leg (bad number, provider error).",
    unit: "count",
    icon: PhoneMissed,
  },
  {
    id: "unique_callers",
    label: "Unique callers (inbound)",
    owner: "system",
    format: "count",
    source: { kind: "system", key: "unique_callers" },
    category: "Volume",
    description: "Distinct originating phone numbers in the window.",
    unit: "count",
    icon: Users,
    sql: true,
  },
  {
    id: "repeat_callers",
    label: "Repeat callers L72 hours",
    owner: "system",
    format: "count",
    source: { kind: "system", key: "repeat_callers" },
    category: "Volume",
    description: "Callers who dialed more than once in the last 72 hours.",
    unit: "count",
    icon: Repeat,
    sql: true,
  },
  {
    id: "turns",
    label: "Turns",
    owner: "system",
    format: "count",
    source: { kind: "system", key: "turns" },
    category: "Volume",
    description: "Total user/agent turns exchanged across conversations.",
    unit: "count",
    icon: Hash,
    sql: true,
  },

  // ── Quality ─────────────────────────────────────────────────────────
  {
    id: "pickup",
    label: "Pickup rate",
    owner: "system",
    format: "percent",
    source: { kind: "derived", expr: "connected/calls" },
    category: "Quality",
    description: "Share of attempted calls that connected (connected ÷ calls).",
    unit: "%",
    icon: Percent,
  },
  {
    id: "call_failure_rate",
    label: "Call failure rate",
    owner: "system",
    format: "percent",
    source: { kind: "system", key: "call_failure_rate" },
    category: "Quality",
    description: "Share of attempts that did not connect.",
    unit: "%",
    icon: PhoneMissed,
  },
  {
    id: "avgdur",
    label: "Call duration (avg)",
    owner: "system",
    format: "duration",
    source: { kind: "system", key: "avgdur" },
    category: "Quality",
    description: "Mean conversation length across connected calls.",
    unit: "m:ss",
    icon: Clock,
    sql: true,
  },
  {
    id: "avg_response_length",
    label: "Avg response length",
    owner: "system",
    format: "count",
    source: { kind: "system", key: "avg_response_length" },
    category: "Quality",
    description: "Mean characters per assistant response.",
    unit: "chars",
    icon: Ruler,
    sql: true,
  },
  {
    id: "avg_turn_latency",
    label: "Avg turn latency",
    owner: "system",
    format: "duration",
    source: { kind: "system", key: "avg_turn_latency" },
    category: "Quality",
    description: "Mean time between user input and assistant reply.",
    unit: "ms",
    icon: Gauge,
  },

  // ── Cost ────────────────────────────────────────────────────────────
  {
    id: "stt_cost",
    label: "STT cost",
    owner: "system",
    format: "currency",
    source: { kind: "system", key: "stt_cost" },
    category: "Cost",
    description: "Speech-to-text spend on transcribed audio.",
    unit: "$",
    icon: Coins,
  },
  {
    id: "llm_cost",
    label: "LLM cost",
    owner: "system",
    format: "currency",
    source: { kind: "system", key: "llm_cost" },
    category: "Cost",
    description: "Model spend for prompts + completions in the window.",
    unit: "$",
    icon: DollarSign,
  },
];

export const METRIC_CATEGORIES = ["Volume", "Quality", "Cost"] as const;

export const VIZ: { type: WidgetType; label: string; icon: LucideIcon }[] = [
  { type: "number", label: "Number", icon: Hash },
  { type: "line", label: "Line", icon: TrendingUp },
  { type: "bar", label: "Bar", icon: BarChart3 },
  { type: "pie", label: "Pie", icon: PieChart },
  { type: "table", label: "Table", icon: TableIcon },
];

/** Which visualizations make sense for a metric's shape. */
export function vizForMetric(m: MetricDef): WidgetType[] {
  // A single scalar → number or a trend/bar/table; a rate still trends over time.
  if (m.format === "count") return ["number", "line", "bar", "pie", "table"];
  return ["number", "line", "bar", "table"];
}

/** The best default viz for a freshly-picked metric. */
export function defaultVizFor(m: MetricDef): WidgetType {
  return m.format === "count" ? "line" : "number";
}

export const SPAN_FOR_TYPE = (type: WidgetType): 1 | 2 =>
  type === "line" || type === "table" ? 2 : 1;

/** Fields a widget's data can be filtered by, with their allowed values. */
export const FILTER_FIELDS: {
  field: GroupField;
  label: string;
  values: string[];
}[] = [
  { field: "outcome", label: "Outcome", values: [...OUTCOMES] },
  { field: "agent", label: "Agent", values: [...AGENTS] },
];
