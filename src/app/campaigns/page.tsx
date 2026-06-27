"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  ChevronsUpDown,
  Copy,
  Eye,
  FileText,
  FlaskConical,
  Globe,
  Headphones,
  Info,
  Library,
  ListChecks,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  PauseCircle,
  Phone,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  SpellCheck,
  Wrench,
  Calendar,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const SIDEBAR = [
  { group: "BUILD", items: [
    { label: "Overview", icon: Globe },
    { label: "Agents", icon: Bot },
    { label: "Test Agents", icon: Headphones },
    { label: "Simulation", icon: FlaskConical },
    { label: "QA", icon: ShieldAlert },
    { label: "Tools", icon: Wrench },
    { label: "Library", icon: Library },
    { label: "Pronunciation", icon: SpellCheck },
    { label: "Numbers", icon: Phone },
    { label: "DND", icon: Bell, badge: "Beta" },
  ]},
  { group: "CALL", items: [
    { label: "Campaigns", icon: Radio, active: true },
  ]},
  { group: "LOGS", items: [
    { label: "Conversation Logs", icon: MessageSquare },
    { label: "Execution Logs", icon: ListChecks },
  ]},
  { group: "MONITOR", items: [
    { label: "Alerts", icon: Bell },
    { label: "Reports", icon: FileText },
    { label: "Docs", icon: BookOpen },
  ]},
];

export default function CampaignsPage() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"batch" | "realtime">("batch");

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* sidebar */}
      <aside className="w-[228px] shrink-0 border-r border-border flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <div className="flex size-8 items-center justify-center rounded-md bg-[#3a1c25] text-[#f5b8c5] text-xs font-medium">
            HO
          </div>
          <span className="text-sm font-medium flex-1 text-text">HoomanLabs</span>
          <ChevronsUpDown size={13} className="text-text-muted" />
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text">
            <PanelLeftClose size={13} />
          </button>
        </div>
        <nav className="scroll-thin flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {SIDEBAR.map((sec) => (
            <div key={sec.group}>
              <div className="px-3 pt-1.5 pb-1 text-[10px] font-medium uppercase tracking-wider text-text-muted">
                {sec.group}
              </div>
              <ul className="space-y-0.5">
                {sec.items.map((it) => {
                  const Icon = it.icon;
                  const active = "active" in it && it.active;
                  return (
                    <li key={it.label}>
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors",
                          active
                            ? "bg-surface-2 text-text"
                            : "text-text-dim hover:bg-surface-2/60 hover:text-text",
                        )}
                      >
                        <Icon size={15} className="shrink-0 text-text-muted" />
                        <span className="flex-1 truncate text-left">{it.label}</span>
                        {"badge" in it && it.badge && (
                          <span className="rounded bg-blue-400/15 px-1.5 py-0 text-[10px] text-blue-400">
                            {it.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-border">
          <h1 className="text-lg font-medium tracking-tight text-text">Campaigns</h1>
          <div className="flex items-center gap-2">
            <button className="flex h-9 items-center gap-1.5 rounded-md border border-border-strong px-3 text-xs text-text-dim hover:text-text">
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="flex h-9 items-center gap-1.5 rounded-md border border-border-strong px-3 text-xs text-text-dim hover:text-text">
              <PauseCircle size={14} /> Pause all
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-md bg-white px-4 text-xs font-medium text-black hover:bg-white/90"
            >
              <Plus size={14} /> Create campaign
            </button>
          </div>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* unified stat strip */}
          <div className="rounded-lg border border-border-strong bg-surface px-8 py-6 shadow-xl shadow-black/40">
            <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1.4fr] items-center gap-8">
              <StatLabel label="Pending" />
              <StatPair
                cols={[
                  { sub: "First Call", value: "0" },
                  { sub: "Retry", value: "0" },
                ]}
              />
              <div className="h-12 w-px bg-border" />
              <div className="flex items-center gap-8">
                <StatLabel label="Scheduled" />
                <StatPair
                  cols={[
                    { sub: "First Call", value: "0" },
                    { sub: "Retry", value: "0" },
                  ]}
                />
              </div>
              <div className="h-12 w-px bg-border" />
              <RunningCallsCard />
            </div>
          </div>

          {/* tabs + search */}
          <div className="flex items-center gap-3">
            {/* Segmented control */}
            <div className="inline-flex items-center rounded-md border border-border-strong bg-surface-2 p-0.5">
              {(["batch", "realtime"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "h-7 rounded-md px-4 text-xs transition-colors capitalize",
                    tab === t
                      ? "bg-white text-black shadow-sm"
                      : "text-text-dim hover:text-text",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Search input */}
              <div className="flex h-9 w-80 items-center gap-2 rounded-md border border-border-strong bg-surface-2 px-2.5">
                <Search size={13} className="shrink-0 text-text-muted" />
                <input
                  placeholder="Search by campaign ID…"
                  className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                />
              </div>
              <button className="flex h-9 items-center gap-1.5 rounded-md border border-border-strong px-3 text-xs text-text-dim hover:text-text">
                <Filter size={14} /> Filter
              </button>
              <button className="flex h-9 items-center gap-1.5 rounded-md border border-border-strong px-3 text-xs text-text-dim hover:text-text">
                <Calendar size={14} /> Date
              </button>
            </div>
          </div>

          {/* table */}
          <div className="rounded-lg border border-border-strong bg-surface overflow-hidden shadow-xl shadow-black/40">
            <div className="grid grid-cols-[1.6fr_1.6fr_1fr_0.55fr_0.55fr_0.8fr_0.35fr] px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-text-muted border-b border-border">
              <div>Campaign</div>
              <div>Agent</div>
              <div>Created At</div>
              <div>Tasks</div>
              <div>Slots</div>
              <div>Status</div>
              <div />
            </div>
            {ROWS.map((r, i) => (
              <div
                key={r.id}
                className={cn(
                  "grid grid-cols-[1.6fr_1.6fr_1fr_0.55fr_0.55fr_0.8fr_0.35fr] items-center px-6 py-4 text-sm",
                  i < ROWS.length - 1 && "border-b border-border",
                )}
              >
                <div>
                  <div className="font-medium text-text">{r.name}</div>
                  <button className="mt-1 flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text">
                    <Copy size={11} /> {r.id}
                  </button>
                </div>
                <div>
                  <div className="font-medium text-text">{r.agent}</div>
                  <button className="mt-1 flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text">
                    <Copy size={11} /> {r.agentId}
                  </button>
                </div>
                <div className="text-text-muted text-xs font-mono tabular-nums">{r.createdAt}</div>
                <div className="text-text text-sm font-mono tabular-nums">{r.tasks}</div>
                <div className="font-mono text-xs text-text tabular-nums">
                  {r.slotsUsed} / {r.slotsTotal}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-2 px-2 py-0.5 text-xs text-text-dim">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {r.status}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text">
                    <Eye size={14} />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateCampaignDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function StatLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-text">
      {label}
      <Info size={13} className="text-text-muted" />
    </div>
  );
}

function StatPair({ cols }: { cols: { sub: string; value: string }[] }) {
  return (
    <div className="flex items-center gap-8">
      {cols.map((c) => (
        <div key={c.sub}>
          <div className="text-xs text-text-muted mb-1">{c.sub}</div>
          <div className="text-lg font-medium leading-none text-text tabular-nums">
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function RunningCallsCard() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-medium text-text">Running Calls</span>
        <span className="text-xs font-mono text-text-muted tabular-nums">
          0/4 slots used
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full w-0 bg-text" />
      </div>
    </div>
  );
}
