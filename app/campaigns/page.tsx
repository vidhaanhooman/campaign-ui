"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Copy,
  Eye,
  Filter,
  MoreHorizontal,
  PanelLeft,
  PauseCircle,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/stats/ui";
import { CreateCampaignDialog } from "@/components/create-campaign-dialog";
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

export default function CampaignsPage() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"batch" | "realtime">("batch");
  const [statsOpen, setStatsOpen] = useState(false);

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
      <PageHeader
        icon={<PanelLeft size={16} />}
        label="Campaigns"
        action={
          <div className="flex items-center gap-2">
            <button className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border bg-[#333333]/30 px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent">
              <RefreshCw size={13} /> Refresh
            </button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border bg-[#333333]/30 px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent">
              <PauseCircle size={13} /> Pause all
            </button>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={13} /> Create campaign
            </button>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-6">
          {/* Compact status line + expandable KPI cards */}
          <div className="rounded-xl border border-border bg-[#333333]/30">
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
              <div className="grid grid-cols-1 gap-4 border-t border-white/[0.06] px-5 py-5 md:grid-cols-2">
                {/* Backlog card */}
                <div className="rounded-xl border border-border bg-[#333333]/30 px-6 py-5">
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
                <div className="rounded-xl border border-border bg-[#333333]/30 px-6 py-5">
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
            <div className="inline-flex h-8 items-center gap-1 rounded-xl border border-border bg-[#333333]/30 p-1">
              {(["batch", "realtime"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium capitalize transition-colors",
                    tab === t
                      ? "border border-border bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Search input */}
              <div className="flex h-8 w-80 items-center gap-2 rounded-xl border border-border bg-[#333333]/30 px-2.5">
                <Search size={13} className="shrink-0 text-muted-foreground" />
                <input
                  placeholder="Search by campaign ID…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button className="flex h-8 items-center gap-1.5 rounded-xl border border-border bg-[#333333]/30 px-3 text-xs text-muted-foreground hover:text-foreground">
                <Filter size={14} /> Filter
              </button>
              <button className="flex h-8 items-center gap-1.5 rounded-xl border border-border bg-[#333333]/30 px-3 text-xs text-muted-foreground hover:text-foreground">
                <Calendar size={14} /> Date
              </button>
            </div>
          </div>

          {/* table */}
          <div className="rounded-xl border border-border bg-[#333333]/30 overflow-hidden">
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
                <tr className="border-b border-white/[0.06]">
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
                    className="border-b border-white/[0.06] transition-colors last:border-0 hover:bg-secondary/40"
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
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-[#333333]/30 px-2 py-0.5 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <Eye size={14} />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      <CreateCampaignDialog open={open} onOpenChange={setOpen} />
    </AppShell>
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
