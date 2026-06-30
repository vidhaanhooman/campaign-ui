import * as React from "react";
import { cn } from "@/lib/utils";

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
      <header className="flex items-start gap-3 px-5 pt-4 pb-3">
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
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/40 px-4 py-3.5">
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
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full bg-foreground/70", barClassName)}
        style={{ width: `${Math.max(2, Math.min(100, pct * 100))}%` }}
      />
    </div>
  );
}
