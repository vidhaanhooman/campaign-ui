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
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
      {/* sidebar */}
      <aside className="w-[228px] shrink-0 border-r border-sidebar-border/15 flex flex-col" style={{ backgroundColor: "var(--background)" }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-sidebar-border/30">
          <div className="flex size-8 items-center justify-center rounded-md bg-[#3a1c25] text-[#f5b8c5] text-xs font-medium">
            HO
          </div>
          <span className="text-sm font-medium flex-1 text-foreground">HoomanLabs</span>
          <ChevronsUpDown size={13} className="text-muted-foreground" />
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
            <PanelLeftClose size={13} />
          </button>
        </div>
        <nav className="scroll-thin flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {SIDEBAR.map((sec) => (
            <div key={sec.group}>
              <div className="px-3 pt-1.5 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                        )}
                      >
                        <Icon size={15} className="shrink-0 text-muted-foreground" />
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
        <header className="flex items-center justify-between px-8 py-4 border-b border-sidebar-border/30">
          <h1 className="text-lg font-medium tracking-tight text-foreground">Campaigns</h1>
          <div className="flex items-center gap-2">
            <button className="flex h-8 items-center gap-1.5 rounded-xl border border-sidebar-border/30 bg-secondary px-3 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="flex h-8 items-center gap-1.5 rounded-xl border border-sidebar-border/30 bg-secondary px-3 text-xs text-muted-foreground hover:text-foreground">
              <PauseCircle size={14} /> Pause all
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus size={14} /> Create campaign
            </button>
          </div>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* unified stat strip */}
          <div className="rounded-xl border border-sidebar-border/15 bg-card px-8 py-6">
            <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1.4fr] items-center gap-8">
              <StatLabel label="Pending" />
              <StatPair
                cols={[
                  { sub: "First Call", value: "0" },
                  { sub: "Retry", value: "0" },
                ]}
              />
              <div className="h-12 w-px bg-sidebar-border/15" />
              <div className="flex items-center gap-8">
                <StatLabel label="Scheduled" />
                <StatPair
                  cols={[
                    { sub: "First Call", value: "0" },
                    { sub: "Retry", value: "0" },
                  ]}
                />
              </div>
              <div className="h-12 w-px bg-sidebar-border/15" />
              <RunningCallsCard />
            </div>
          </div>

          {/* tabs + search */}
          <div className="flex items-center gap-3">
            {/* Segmented control */}
            <div className="inline-flex items-center rounded-xl border border-sidebar-border/30 bg-secondary p-0.5">
              {(["batch", "realtime"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "h-6 rounded-lg px-3 text-xs transition-colors capitalize",
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
              <div className="flex h-8 w-80 items-center gap-2 rounded-xl border border-sidebar-border/30 bg-secondary px-2.5">
                <Search size={13} className="shrink-0 text-muted-foreground" />
                <input
                  placeholder="Search by campaign ID…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button className="flex h-8 items-center gap-1.5 rounded-xl border border-sidebar-border/30 bg-secondary px-3 text-xs text-muted-foreground hover:text-foreground">
                <Filter size={14} /> Filter
              </button>
              <button className="flex h-8 items-center gap-1.5 rounded-xl border border-sidebar-border/30 bg-secondary px-3 text-xs text-muted-foreground hover:text-foreground">
                <Calendar size={14} /> Date
              </button>
            </div>
          </div>

          {/* table */}
          <div className="rounded-xl border border-sidebar-border/15 bg-card overflow-hidden">
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
                <tr className="border-b border-sidebar-border/30">
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
                    className="border-b border-sidebar-border/30 transition-colors last:border-0 hover:bg-secondary/40"
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
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-sidebar-border/30 bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <Eye size={14} />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
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
      </div>

      <CreateCampaignDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function StatLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
      {label}
      <Info size={13} className="text-muted-foreground" />
    </div>
  );
}

function StatPair({ cols }: { cols: { sub: string; value: string }[] }) {
  return (
    <div className="flex items-center gap-8">
      {cols.map((c) => (
        <div key={c.sub}>
          <div className="text-xs text-muted-foreground mb-1">{c.sub}</div>
          <div className="text-lg font-medium leading-none text-foreground tabular-nums">
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
        <span className="text-sm font-medium text-foreground">Running Calls</span>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          0/4 slots used
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full w-0 bg-foreground" />
      </div>
    </div>
  );
}
