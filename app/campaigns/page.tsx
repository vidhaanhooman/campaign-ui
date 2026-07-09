"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Archive,
  ChevronDown,
  Copy,
  Eye,
  Filter,
  MoreHorizontal,
  PauseCircle,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/stats/ui";
import { CreateCampaignDialog } from "@/components/create-campaign-dialog";
import { UpdateCampaignDrawer } from "@/components/campaigns/update-campaign-drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SAMPLE_CAMPAIGN,
  SAMPLE_REALTIME_CAMPAIGN,
} from "@/lib/campaign-update";
import {
  DateRangePicker,
  type StatsRange,
} from "@/components/stats/date-range-picker";
import {
  FilterDropdown,
  type FilterSection,
  type FilterValues,
  type QuickFilter,
} from "@/components/filter-dropdown";
import {
  ArrowLeftRight,
  Bot,
  Braces,
  ClipboardList,
  Flag,
  Gauge,
  Hash,
  ListChecks,
  Lock,
  Megaphone,
  MessageSquare,
  Phone,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  Repeat2,
  Timer,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  name: string;
  id: string;
  agent: string;
  agentId: string;
  createdAt: string;
  tasks: number;
  slotsUsed: number;
  slotsTotal: number;
  status: "Completed" | "Running" | "Paused";
};

const ROWS: Row[] = [
  {
    name: "Test Campaign",
    id: "LvcogLExOF2MQqaA02fo",
    agent: "Debt Collection Pitch Agent",
    agentId: "nIIXJdxyZRmfrWZxQMhd",
    createdAt: "18-06-2026 03:43 PM",
    tasks: 49,
    slotsUsed: 0,
    slotsTotal: 4,
    status: "Completed",
  },
  {
    name: "New DND",
    id: "kKGIrWiXHhHHvJvjx9HN",
    agent: "Website Agent Outbound",
    agentId: "hoomanlabs_out_website_agent_en",
    createdAt: "12-06-2026 10:30 PM",
    tasks: 2,
    slotsUsed: 0,
    slotsTotal: 4,
    status: "Completed",
  },
  {
    name: "Pre-dnd test",
    id: "7pBYOSkQqutgDsnq3P1B",
    agent: "Website Agent Outbound",
    agentId: "hoomanlabs_out_website_agent_en",
    createdAt: "12-06-2026 10:05 PM",
    tasks: 1,
    slotsUsed: 0,
    slotsTotal: 4,
    status: "Completed",
  },
  {
    name: "Test",
    id: "V0QOXRRWkH8MOUoDgRDR",
    agent: "Website Agent Outbound",
    agentId: "hoomanlabs_out_website_agent_en",
    createdAt: "26-05-2026 02:38 PM",
    tasks: 1,
    slotsUsed: 0,
    slotsTotal: 4,
    status: "Completed",
  },
  {
    name: "test",
    id: "oiNL6IpAFNiQCrxQEBJU",
    agent: "carreers-390--IPredictor12",
    agentId: "QpRjY66hqJxuvgpBe22B",
    createdAt: "18-05-2026 11:07 PM",
    tasks: 3,
    slotsUsed: 0,
    slotsTotal: 4,
    status: "Completed",
  },
];

function GatedFlyout({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
      <Lock size={13} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

const CAMPAIGN_FILTER_SCHEMA: FilterSection[] = [
  {
    items: [
      {
        id: "type",
        label: "Type",
        icon: <Phone size={15} />,
        type: "multi-select",
        options: [
          { value: "call",      label: "Call" },
          { value: "chat",      label: "Chat" },
          { value: "web",       label: "Web" },
          { value: "broadcast", label: "Broadcast" },
        ],
      },
      {
        id: "direction",
        label: "Direction",
        icon: <ArrowLeftRight size={15} />,
        type: "multi-select",
        options: [
          { value: "inbound",  label: "Inbound" },
          { value: "outbound", label: "Outbound" },
        ],
      },
      {
        id: "agent",
        label: "Agent",
        icon: <Bot size={15} />,
        type: "multi-select",
        searchable: true,
        wide: true,
        footer: true,
        placeholder: "Search agents…",
        options: [
          { value: "agt_debt_pitch",    label: "Debt Collection Pitch Agent",     sublabel: "agt_debt_pitch",    tag: "Conversation" },
          { value: "agt_debt_outbound", label: "Debt Collection Outbound Agent",  sublabel: "agt_debt_outbound", tag: "Broadcast" },
          { value: "agt_careers360",    label: "Careers_360 - Tech college predictor", sublabel: "agt_careers360", tag: "Conversation" },
          { value: "agt_premium",       label: "premium",                         sublabel: "agt_premium",       tag: "Conversation" },
          { value: "agt_standard",      label: "standard",                        sublabel: "agt_standard",      tag: "Broadcast" },
          { value: "agt_palmonas",      label: "palmonas hoomanlabs",             sublabel: "agt_palmonas",      tag: "Broadcast" },
          { value: "agt_vidhan_test",   label: "Vidhan Test",                     sublabel: "agt_vidhan_test",   tag: "Conversation" },
        ],
      },
      {
        id: "caller",
        label: "Caller",
        icon: <PhoneOutgoing size={15} />,
        type: "text",
        placeholder: "e.g. +91 98…",
      },
      {
        id: "callee",
        label: "Callee",
        icon: <PhoneIncoming size={15} />,
        type: "text",
        placeholder: "e.g. +91 98…",
      },
      {
        id: "providerCallId",
        label: "Provider call ID",
        icon: <Hash size={15} />,
        type: "text",
        placeholder: "contains…",
      },
      {
        id: "campaign",
        label: "Campaign",
        icon: <Megaphone size={15} />,
        type: "text",
        placeholder: "contains…",
      },
      {
        id: "task",
        label: "Task",
        icon: <ListChecks size={15} />,
        type: "text",
        placeholder: "contains…",
      },
    ],
  },
  {
    title: "Outcome & status",
    items: [
      {
        id: "outcome",
        label: "Outcome",
        icon: <Flag size={15} />,
        type: "multi-select",
        searchable: true,
        placeholder: "Search outcomes…",
        options: [
          { value: "connected",         label: "connected",         dot: "bg-primary",     count: 13 },
          { value: "resolved",          label: "resolved",          dot: "bg-primary",     count:  1 },
          { value: "not_interested",    label: "not_interested",    dot: "bg-destructive", count:  2 },
          { value: "meeting_booked",    label: "meeting_booked",    dot: "bg-chart-2",     count:  3 },
          { value: "no_response",       label: "no_response",       dot: "bg-chart-1",     count:  4 },
          { value: "unknown",           label: "unknown",           dot: "bg-muted-foreground", count: 4 },
          { value: "callback_requested",label: "callback_requested",dot: "bg-chart-2" },
        ],
      },
      {
        id: "endReason",
        label: "End reason",
        icon: <PhoneOff size={15} />,
        type: "multi-select",
        options: [
          { value: "voicemail",     label: "Voicemail" },
          { value: "no_answer",     label: "No answer" },
          { value: "hangup_caller", label: "Hangup by caller" },
          { value: "hangup_callee", label: "Hangup by callee" },
          { value: "timeout",       label: "Timeout" },
          { value: "error",         label: "Error" },
        ],
      },
    ],
  },
  {
    title: "Metrics",
    items: [
      {
        id: "duration",
        label: "Call duration",
        icon: <Timer size={15} />,
        type: "range",
        min: 0, max: 600, step: 5, unit: "s",
      },
      {
        id: "turns",
        label: "Turns",
        icon: <MessageSquare size={15} />,
        type: "range",
        min: 0, max: 50, step: 1,
      },
      {
        id: "turnLatency",
        label: "Turn latency",
        icon: <Gauge size={15} />,
        type: "range",
        min: 0, max: 5000, step: 50, unit: "ms",
      },
      {
        id: "attempt",
        label: "Attempt",
        icon: <Repeat2 size={15} />,
        type: "pill",
        maxExact: 4,
      },
    ],
  },
  {
    title: "Dynamic fields",
    items: [
      {
        id: "postCall",
        label: "Post-call analysis",
        icon: <ClipboardList size={15} />,
        type: "custom",
        width: 400,
        render: () => <GatedFlyout message="Select an agent to load these fields." />,
      },
      {
        id: "context",
        label: "Context variables",
        icon: <Braces size={15} />,
        type: "custom",
        width: 400,
        render: () => <GatedFlyout message="Select an agent to load context variables." />,
      },
    ],
  },
];

const CAMPAIGN_QUICK_FILTERS: QuickFilter[] = [
  {
    id: "qf:connected",
    label: "Connected outbound",
    icon: <Zap size={15} />,
    values: { direction: ["outbound"], outcome: ["connected"] },
  },
  {
    id: "qf:voicemail",
    label: "Went to voicemail",
    icon: <Zap size={15} />,
    values: { endReason: ["voicemail"] },
  },
  {
    id: "qf:long-calls",
    label: "Long calls (3m+)",
    icon: <Zap size={15} />,
    values: { duration: { kind: "range", min: 180, max: null } },
  },
];

export default function CampaignsPage() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"batch" | "realtime">("batch");
  const [statsOpen, setStatsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [updateOpen, setUpdateOpen] = useState(false);
  const [range, setRange] = useState<StatsRange | undefined>(undefined);
  const router = useRouter();

  // Realtime campaigns edit durations + API overrides; batch edits dates.
  const updateCurrent =
    tab === "realtime" ? SAMPLE_REALTIME_CAMPAIGN : SAMPLE_CAMPAIGN;
  const viewStats = () =>
    router.push(tab === "realtime" ? "/realtime-stats" : "/stats");

  /* ── Snapshot values (wire to live data later) ─────────────────── */
  const pendingFirst = 0;
  const pendingRetry = 0;
  const scheduledFirst = 0;
  const scheduledRetry = 0;
  const slotsUsed = 0;
  const slotsTotal = 4;

  const pending = pendingFirst + pendingRetry;
  const scheduled = scheduledFirst + scheduledRetry;
  const running = slotsUsed;
  const backlog = pending + scheduled;
  const slotsFree = slotsTotal - slotsUsed;

  const status =
    running > 0
      ? { label: "Running", dot: "bg-emerald-400" }
      : backlog > 0
        ? { label: "Backlogged", dot: "bg-amber-400" }
        : { label: "Idle", dot: "bg-muted-foreground/60" };

  return (
    <AppShell activeNav="Campaigns">
      <div className="px-8 py-6 space-y-6">
          <PageHeading title="Campaigns">
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent">
              <RefreshCw size={13} /> Refresh
            </button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent">
              <PauseCircle size={13} /> Pause all
            </button>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={13} /> Create campaign
            </button>
          </PageHeading>

          {/* Compact status line + expandable KPI cards */}
          <div className="rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setStatsOpen((v) => !v)}
              className="flex w-full items-center gap-3 px-5 py-3 text-sm"
            >
              <span
                className={cn("h-2 w-2 shrink-0 rounded-full", status.dot)}
                aria-hidden
              />
              <span className="font-medium text-foreground">{status.label}</span>
              <span className="text-muted-foreground">·</span>
              <span className="tabular-nums text-muted-foreground">
                <span className="text-foreground">{backlog}</span> in queue
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="tabular-nums text-muted-foreground">
                <span className="text-foreground">
                  {slotsFree}/{slotsTotal}
                </span>{" "}
                slots free
              </span>
              <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                updated just now
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform",
                    statsOpen && "rotate-180",
                  )}
                />
              </span>
            </button>

            {statsOpen && (
              <div className="grid grid-cols-1 gap-4 border-t border-border px-5 py-5 md:grid-cols-2">
                {/* Backlog card */}
                <div className="rounded-xl border border-border bg-card px-6 py-5">
                  <div className="text-sm text-muted-foreground">Backlog</div>
                  <div className="mt-2 text-3xl font-semibold leading-tight tabular-nums text-foreground">
                    {backlog}
                  </div>
                  <div className="mt-4 space-y-2">
                    <BacklogRow
                      label="Pending · first call"
                      value={pendingFirst}
                    />
                    <BacklogRow label="Pending · retry" value={pendingRetry} />
                    <BacklogRow
                      label="Scheduled · first call"
                      value={scheduledFirst}
                    />
                    <BacklogRow
                      label="Scheduled · retry"
                      value={scheduledRetry}
                    />
                  </div>
                </div>

                {/* Slot utilization card */}
                <div className="rounded-xl border border-border bg-card px-6 py-5">
                  <div className="text-sm text-muted-foreground">
                    Slot utilization
                  </div>
                  <div className="mt-3 flex items-center gap-5">
                    <SlotRing used={slotsUsed} total={slotsTotal} />
                    <div>
                      <div className="text-3xl font-semibold leading-tight tabular-nums text-foreground">
                        {slotsUsed}
                        <span className="text-muted-foreground">
                          /{slotsTotal}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {slotsFree} free · capacity {slotsTotal}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* tabs + search */}
          <div className="flex items-center gap-3">
            {/* Segmented control */}
            <div className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-input/30 p-1">
              {(["batch", "realtime"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium capitalize transition-colors",
                    tab === t
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Search input */}
              <div className="flex h-8 w-80 items-center gap-2 rounded-lg border border-border bg-card px-2.5">
                <Search size={13} className="shrink-0 text-muted-foreground" />
                <input
                  placeholder="Search by campaign ID…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <FilterDropdown
                schema={CAMPAIGN_FILTER_SCHEMA}
                value={filters}
                onChange={setFilters}
                quickFilters={CAMPAIGN_QUICK_FILTERS}
              />
              <DateRangePicker
                value={range}
                onChange={setRange}
                defaultPreset="30d"
              />
            </div>
          </div>

          {/* table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <colgroup>
                <col />
                <col />
                <col className="w-[15%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2.5 pl-6 pr-3 text-left text-xs font-medium text-muted-foreground">Campaign</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Agent</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Created at</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Tasks</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Slots</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="py-2.5 pl-3 pr-6" />
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-secondary/40"
                  >
                    <td className="py-3 pl-6 pr-3">
                      <div className="text-sm font-medium text-foreground">{r.name}</div>
                      <button className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground">
                        <Copy size={11} /> {r.id}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-foreground">{r.agent}</div>
                      <button className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground">
                        <Copy size={11} /> {r.agentId}
                      </button>
                    </td>
                    <td className="px-3 py-3 font-mono text-sm tabular-nums text-muted-foreground">{r.createdAt}</td>
                    <td className="px-3 py-3 font-mono text-sm tabular-nums text-foreground">{r.tasks}</td>
                    <td className="px-3 py-3 font-mono text-sm tabular-nums text-foreground">
                      {r.slotsUsed} / {r.slotsTotal}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={viewStats}
                          aria-label="View stats"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Eye size={14} />
                        </button>
                        <RowActions
                          onViewStats={viewStats}
                          onUpdate={() => setUpdateOpen(true)}
                          onArchive={() =>
                            toast(`Archived “${r.name}”`)
                          }
                          onResume={() =>
                            toast(`Resumed “${r.name}”`)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      <CreateCampaignDialog open={open} onOpenChange={setOpen} />
      <UpdateCampaignDrawer
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        current={updateCurrent}
        mode={tab}
        campaignStatus="running"
        onSubmit={() => toast("Campaign updated")}
      />
    </AppShell>
  );
}

/** Row action menu — design-system dropdown (popover surface + tokenized rows). */
function RowActions({
  onViewStats,
  onUpdate,
  onArchive,
  onResume,
}: {
  onViewStats: () => void;
  onUpdate: () => void;
  onArchive: () => void;
  onResume: () => void;
}) {
  const [open, setOpen] = useState(false);
  const items = [
    { icon: <Eye size={15} />, label: "View Stats", onClick: onViewStats },
    { icon: <Pencil size={15} />, label: "Update Campaign", onClick: onUpdate },
    { icon: <Archive size={15} />, label: "Archive Campaign", onClick: onArchive },
    { icon: <Play size={15} />, label: "Resume Campaign", onClick: onResume },
  ];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            aria-label="Row actions"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <MoreHorizontal size={14} />
          </button>
        }
      />
      <PopoverContent align="end" sideOffset={4} className="w-52 p-1">
        {items.map((it) => (
          <button
            key={it.label}
            type="button"
            onClick={() => {
              it.onClick();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <span className="shrink-0">{it.icon}</span>
            {it.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function BacklogRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function SlotRing({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? used / total : 0;
  const R = 26;
  const C = 2 * Math.PI * R;
  const dash = C * pct;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
      <circle
        cx="32"
        cy="32"
        r={R}
        fill="none"
        stroke="var(--secondary)"
        strokeWidth="6"
      />
      <circle
        cx="32"
        cy="32"
        r={R}
        fill="none"
        stroke="var(--chart-1)"
        strokeWidth="6"
        strokeDasharray={`${dash} ${C - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}
