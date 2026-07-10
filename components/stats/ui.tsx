import * as React from "react";
import { ChevronDown, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useSidebar } from "@/components/app-shell";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * RangeTabs — a segmented time-range control (24h / 7d / 30d / 90d) for
 * dashboard headers. Controlled; scopes whatever data the page feeds off it.
 */
export function RangeTabs({
  value,
  onChange,
  options = ["24h", "7d", "30d", "90d"],
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <div className="inline-flex h-8 items-center gap-1 rounded-xl border border-border bg-input/30 p-1">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export type NewMenuItem = {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
};

/**
 * NewMenu — the reusable primary "+ New ▾" header action. Opens a popover of
 * create options. Pass one item to render a plain button instead of a menu.
 */
export function NewMenu({
  items,
  label = "New",
}: {
  items: NewMenuItem[];
  label?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus size={13} /> {label}
            <ChevronDown size={13} className="opacity-70" />
          </button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-[240px] p-1">
        {items.map((it) => {
          const inner = (
            <>
              {it.icon && (
                <span className="mt-0.5 shrink-0 text-muted-foreground">{it.icon}</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-foreground">{it.label}</span>
                {it.description && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {it.description}
                  </span>
                )}
              </span>
            </>
          );
          const cls =
            "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-secondary";
          return it.href ? (
            <a key={it.label} href={it.href} className={cls}>
              {inner}
            </a>
          ) : (
            <button key={it.label} onClick={it.onClick} className={cls}>
              {inner}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

/** Section panel — the card surface used across the stats page. */
export function Panel({
  title,
  subtitle,
  icon,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card",
        className,
      )}
    >
      <header className="flex items-start gap-3 px-5 pb-4 pt-4">
        {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </header>
      <div className={cn("flex-1 px-5 pb-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** KPI tile — big number with label + optional delta. */
export function StatTile({
  label,
  value,
  sub,
  delta,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  delta?: { value: string; up?: boolean };
}) {
  return (
    <div className="flex flex-col gap-1 px-1 py-2">
      <span className="text-xs text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-lg leading-none tabular-nums text-foreground">
        {value}
      </span>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {delta && (
          <span
            className={cn(
              "font-mono tabular-nums",
              delta.up ? "text-emerald-400" : "text-red-400",
            )}
          >
            {delta.up ? "▲" : "▼"} {delta.value}
          </span>
        )}
        {sub}
      </div>
    </div>
  );
}

/** KPI card — dashboard-style tile: label, delta chip, big number, trend + description. */
export function KpiCard({
  label,
  value,
  delta,
  trend,
  description,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; up?: boolean };
  trend?: string;
  description?: string;
  className?: string;
}) {
  const TrendIcon = delta?.up === false ? TrendingDown : TrendingUp;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border border-border bg-card px-6 py-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {delta && (
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-transparent px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
            <TrendIcon size={11} />
            {delta.value}
          </span>
        )}
      </div>
      <div className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-foreground tabular-nums">
        {value}
      </div>
      {(trend || description) && (
        <div className="mt-3 flex flex-col gap-1">
          {trend && (
            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              {trend}
              <TrendIcon size={14} />
            </div>
          )}
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      )}
    </div>
  );
}

/** Chart card — title + date subtitle up top, chart body, trend + description footer. */
export function ChartCard({
  title,
  subtitle,
  icon,
  footerTrend,
  footerDescription,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footerTrend?: string;
  footerDescription?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 px-6 pt-5 pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className={cn("flex-1", bodyClassName)}>{children}</div>
      {(footerTrend || footerDescription) && (
        <footer className="flex flex-col gap-1 px-6 pt-4 pb-5">
          {footerTrend && (
            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              {footerTrend}
              <TrendingUp size={14} />
            </div>
          )}
          {footerDescription && (
            <div className="text-xs text-muted-foreground">{footerDescription}</div>
          )}
        </footer>
      )}
    </section>
  );
}

/** Page header — sidebar-toggle icon · divider · title (+ optional subline), with hairline underline. */
export function PageHeader({
  icon,
  label,
  sublabel,
  action,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const { toggle } = useSidebar();
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border px-6 py-3",
        className,
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle sidebar"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
      >
        {icon}
      </button>
      <span className="h-4 w-px shrink-0 bg-sidebar-border/30" aria-hidden />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">
          {label}
        </span>
        {sublabel && (
          <span className="truncate text-xs text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Page heading — the page's own header, rendered at the top of the content
 * (OpenAI-style; there is no global top bar). A prominent title on the left
 * with an optional description below, and page-scoped actions on the right.
 */
export function PageHeading({
  title,
  desc,
  children,
  className,
}: {
  title: React.ReactNode;
  /** Optional description shown under the title. */
  desc?: React.ReactNode;
  /** Page-scoped actions, right-aligned. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {children && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

/** Horizontal value bar over a muted track. */
export function MiniBar({
  pct,
  className,
  barClassName,
}: {
  pct: number; // 0..1
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-card", className)}>
      <div
        className={cn("h-full rounded-full bg-foreground/70", barClassName)}
        style={{ width: `${Math.max(2, Math.min(100, pct * 100))}%` }}
      />
    </div>
  );
}
