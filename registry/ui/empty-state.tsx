import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Reusable empty state for tables, lists, and panels.
 *
 * Two common shapes:
 *  - **No data yet** (onboarding): teach the surface, offer the first action.
 *  - **No results** (a filter / date range excludes everything): say what was
 *    filtered and offer to clear it or widen the range.
 *
 * Sizing: `inset` for inside a card/table body, `block` for a standalone panel.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "inset",
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** One or two buttons/links. */
  action?: React.ReactNode;
  size?: "inset" | "block";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "inset" ? "px-6 py-14" : "px-6 py-20",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}

/** Secondary (element-style) button for empty-state actions. */
export function EmptyAction({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground"
    >
      {children}
    </button>
  );
}
