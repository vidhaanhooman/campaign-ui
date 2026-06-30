"use client";

import * as React from "react";
import {
  Bell,
  BookOpen,
  Bot,
  ChevronsUpDown,
  FileText,
  FlaskConical,
  FileText as ReportIcon,
  Globe,
  Headphones,
  Library,
  ListChecks,
  MessageSquare,
  PanelLeftClose,
  Phone,
  Radio,
  ShieldAlert,
  SpellCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const SIDEBAR: { group: string; items: NavItem[] }[] = [
  {
    group: "BUILD",
    items: [
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
    ],
  },
  {
    group: "CALL",
    items: [{ label: "Campaigns", icon: Radio }],
  },
  {
    group: "LOGS",
    items: [
      { label: "Conversation Logs", icon: MessageSquare },
      { label: "Execution Logs", icon: ListChecks },
    ],
  },
  {
    group: "MONITOR",
    items: [
      { label: "Alerts", icon: Bell },
      { label: "Reports", icon: ReportIcon },
      { label: "Docs", icon: BookOpen },
    ],
  },
];

/**
 * App chrome shared across pages: the HoomanLabs sidebar + a scrollable main
 * content area. `activeNav` highlights the matching sidebar item.
 */
export function AppShell({
  activeNav = "Campaigns",
  children,
}: {
  activeNav?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* sidebar */}
      <aside
        className="flex w-[228px] shrink-0 flex-col border-r border-border"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-[#3a1c25] text-xs font-medium text-[#f5b8c5]">
            HO
          </div>
          <span className="flex-1 text-sm font-medium text-foreground">
            HoomanLabs
          </span>
          <ChevronsUpDown size={13} className="text-muted-foreground" />
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
            <PanelLeftClose size={13} />
          </button>
        </div>
        <nav className="scroll-thin flex-1 space-y-4 overflow-y-auto px-2 py-3">
          {SIDEBAR.map((sec) => (
            <div key={sec.group}>
              <div className="px-3 pt-1.5 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {sec.group}
              </div>
              <ul className="space-y-0.5">
                {sec.items.map((it) => {
                  const Icon = it.icon;
                  const active = it.label === activeNav;
                  return (
                    <li key={it.label}>
                      <button
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                        )}
                      >
                        <Icon size={15} className="shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate text-left">
                          {it.label}
                        </span>
                        {it.badge && (
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="scroll-thin flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
