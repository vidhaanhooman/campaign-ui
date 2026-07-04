"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  Bot,
  ChevronRight,
  CircleArrowUp,
  FileText as ReportIcon,
  FlaskConical,
  Globe,
  Headphones,
  Library,
  LineChart,
  ListChecks,
  MessageSquare,
  Phone,
  Plus,
  Radio,
  Settings,
  ShieldAlert,
  SpellCheck,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ── Notifications feed — shown from the sidebar bell popover ────────── */
const UPDATES: {
  date: string;
  title: string;
  body?: string;
  tag: "New" | "Improved";
}[] = [
  {
    date: "Jul 3",
    title: "Realtime campaign updates",
    body: "Edit task-start/expiry, retry policy, and API overrides on a running realtime campaign without recreating it.",
    tag: "New",
  },
  {
    date: "Jun 28",
    title: "Per-attempt retry priority",
    body: "Assign a different priority to each retry attempt so escalations dial ahead of first attempts.",
    tag: "Improved",
  },
  {
    date: "Jun 21",
    title: "CSV column auto-mapping",
    body: "Batch uploads now detect phone / name / order columns automatically.",
    tag: "Improved",
  },
];

type NavItem = {
  label: string;
  icon: LucideIcon;
  badge?: string;
  href?: string;
};

const SIDEBAR: { group: string; items: NavItem[] }[] = [
  {
    group: "BUILD",
    items: [
      { label: "Overview", icon: Globe, href: "/landing" },
      { label: "Agents", icon: Bot },
      { label: "Test Agents", icon: Headphones },
      { label: "Simulation", icon: FlaskConical },
      { label: "QA", icon: ShieldAlert },
    ],
  },
  {
    group: "TOOLING",
    items: [
      { label: "Tools", icon: Wrench },
      { label: "Library", icon: Library },
      { label: "Pronunciation", icon: SpellCheck },
      { label: "Numbers", icon: Phone },
      { label: "DND", icon: Bell, badge: "Beta" },
    ],
  },
  {
    group: "CALL",
    items: [
      { label: "Campaigns", icon: Radio, href: "/campaigns" },
      { label: "Conversation Logs", icon: MessageSquare },
      { label: "Execution Logs", icon: ListChecks },
    ],
  },
  {
    group: "MONITOR",
    items: [
      { label: "Alerts", icon: Bell },
      { label: "Reports", icon: ReportIcon },
      { label: "Insights", icon: LineChart, href: "/insights" },
    ],
  },
];

/** Groups that start collapsed — user can expand as needed. */
const COLLAPSED_BY_DEFAULT = new Set(["TOOLING", "MONITOR"]);

/**
 * App chrome shared across pages: the HoomanLabs sidebar + a scrollable main
 * content area. `activeNav` highlights the matching sidebar item.
 */
type SidebarCtx = { collapsed: boolean; toggle: () => void };
const SidebarContext = React.createContext<SidebarCtx>({
  collapsed: false,
  toggle: () => {},
});

/** Toggle the sidebar from anywhere inside AppShell. */
export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function AppShell({
  activeNav = "Campaigns",
  children,
}: {
  activeNav?: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const sidebar = React.useMemo<SidebarCtx>(
    () => ({ collapsed, toggle: () => setCollapsed((c) => !c) }),
    [collapsed],
  );
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const sec of SIDEBAR) {
      const hasActive = sec.items.some((it) => it.label === activeNav);
      if (hasActive || !COLLAPSED_BY_DEFAULT.has(sec.group)) {
        initial.add(sec.group);
      }
    }
    return initial;
  });

  const toggleGroup = (group: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* sidebar */}
      <aside
        className={cn(
          "flex shrink-0 flex-col overflow-hidden border-r border-white/[0.04] bg-background text-foreground transition-[width] duration-200",
          collapsed ? "w-0 border-r-0" : "w-[248px]",
        )}
      >
        {/* Account / workspace switcher */}
        <div className="p-3">
          <button className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2 text-left transition-colors hover:bg-secondary/60">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-sidebar-foreground">
              <CircleArrowUp size={16} strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-sidebar-foreground">
                HoomanLabs
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Scale plan
              </span>
            </span>
            <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
          </button>
        </div>

        {/* Primary nav */}
        <nav className="scroll-hidden flex-1 overflow-y-auto px-2 pb-2">
          {SIDEBAR.map((sec, si) => {
            const isOpen = openGroups.has(sec.group);
            return (
              <div
                key={sec.group}
                className={cn(
                  si === 0 ? "" : "mt-3 border-t border-white/[0.04] pt-3",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(sec.group)}
                  className="flex w-full items-center gap-1.5 rounded-md px-3 pb-1.5 pt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-sidebar-foreground"
                >
                  <ChevronRight
                    size={11}
                    className={cn(
                      "shrink-0 transition-transform",
                      isOpen && "rotate-90",
                    )}
                  />
                  <span className="flex-1 text-left">{sec.group}</span>
                </button>
                {isOpen && (
                  <ul className="space-y-0.5">
                    {sec.items.map((it) => {
                      const Icon = it.icon;
                      const active = it.label === activeNav;
                      const cls = cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                      );
                      const inner = (
                        <>
                          <Icon size={16} strokeWidth={1.75} className="shrink-0" />
                          <span className="flex-1 truncate text-left">
                            {it.label}
                          </span>
                          {it.badge && (
                            <span className="rounded-md bg-chart-2/20 px-1.5 py-0 text-[10px] text-chart-2">
                              {it.badge}
                            </span>
                          )}
                        </>
                      );
                      return (
                        <li key={it.label}>
                          {it.href ? (
                            <Link href={it.href} className={cls}>
                              {inner}
                            </Link>
                          ) : (
                            <button className={cls}>{inner}</button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}

        </nav>

        {/* Pinned footer — balance + settings */}
        <div className="border-t border-white/[0.04] p-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Wallet size={13} /> Balance
              </span>
              <span className="font-mono text-xs tabular-nums text-sidebar-foreground">
                $1,248.50
              </span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              ~4 days left at current burn
            </div>
            <button className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus size={13} /> Add credits
            </button>
          </div>
          <button className="mt-1.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60">
            <Settings size={16} strokeWidth={1.75} className="shrink-0" />
            <span className="flex-1 truncate text-left">Settings</span>
          </button>
        </div>
      </aside>

      {/* main */}
      <SidebarContext.Provider value={sidebar}>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="scroll-thin flex-1 overflow-y-auto">{children}</div>
        </div>
      </SidebarContext.Provider>
    </div>
  );
}

/** Bell button that opens a compact "What's new" popover. Exported so pages can drop it into their PageHeader action slot. */
export function NotificationsButton() {
  const [open, setOpen] = React.useState(false);
  const [seenAt, setSeenAt] = React.useState<string | null>(null);
  // Anything published after seenAt counts as unread. Persisted across mounts.
  React.useEffect(() => {
    setSeenAt(localStorage.getItem("hl_notif_seen"));
  }, []);
  const unread = seenAt == null ? UPDATES.length : 0;

  const markSeen = () => {
    const now = new Date().toISOString();
    localStorage.setItem("hl_notif_seen", now);
    setSeenAt(now);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && unread > 0) markSeen();
      }}
    >
      <PopoverTrigger
        render={
          <button
            aria-label="Notifications"
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-sidebar-foreground transition-colors hover:bg-secondary/60"
          >
            <Bell size={15} strokeWidth={1.75} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            )}
          </button>
        }
      />
      <PopoverContent align="start" sideOffset={8} className="w-[360px] overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3">
          <span className="text-sm font-medium text-foreground">What&rsquo;s new</span>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Changelog <ArrowUpRight size={12} />
          </a>
        </div>
        <ul className="scroll-thin max-h-[420px] overflow-y-auto p-1">
          {UPDATES.map((u) => (
            <li
              key={u.title}
              className="flex flex-col gap-1.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-baseline gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {u.title}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                    u.tag === "New"
                      ? "border-emerald-400/30 text-emerald-400"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {u.tag}
                </span>
              </div>
              {u.body && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {u.body}
                </p>
              )}
              <span className="font-mono text-[10px] text-muted-foreground">
                {u.date}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
