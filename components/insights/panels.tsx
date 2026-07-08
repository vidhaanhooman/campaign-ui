"use client";

import * as React from "react";
import { SearchX } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Bars, Donut, MultiLineChart, type LineSeriesDef } from "./charts";
import { PanelCard } from "./panel-card";

/* ── Loading skeleton ────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-card", className)} />;
}

/* ── Line panel ──────────────────────────────────────────────────────── */
export function LinePanel({
  title,
  data,
  series,
  loading,
  onEdit,
  className,
  enlargedContent,
}: {
  title: string;
  data: Record<string, string | number>[];
  series: LineSeriesDef[];
  loading?: boolean;
  onEdit?: () => void;
  className?: string;
  enlargedContent?: React.ReactNode;
}) {
  const [visible, setVisible] = React.useState<Set<string>>(
    () => new Set(series.map((s) => s.key)),
  );
  // Click a series to isolate it; click the isolated one again to restore all.
  function isolate(key: string) {
    setVisible((prev) =>
      prev.size === 1 && prev.has(key)
        ? new Set(series.map((s) => s.key))
        : new Set([key]),
    );
  }

  return (
    <PanelCard
      title={title}
      onEdit={onEdit}
      className={className}
      enlargedContent={enlargedContent}
    >
      {loading ? (
        <Skeleton className="h-[260px] w-full" />
      ) : (
        <>
          <MultiLineChart
            data={data}
            series={series.filter((s) => visible.has(s.key))}
          />
          <div className="mt-2 flex justify-center gap-2 text-xs">
            {series.map((s) => (
              <button
                key={s.key}
                onClick={() => isolate(s.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-opacity hover:bg-secondary",
                  visible.has(s.key) ? "text-muted-foreground" : "opacity-40",
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </PanelCard>
  );
}

/* ── Pie panel ───────────────────────────────────────────────────────── */
export function PiePanel({
  title,
  data,
  loading,
  onEdit,
  className,
}: {
  title: string;
  data: { name: string; value: number }[];
  loading?: boolean;
  onEdit?: () => void;
  className?: string;
}) {
  return (
    <PanelCard title={title} onEdit={onEdit} className={className}>
      {loading ? (
        <Skeleton className="mx-auto aspect-square h-[176px] w-[176px] rounded-full" />
      ) : (
        <Donut data={data} unit="calls" />
      )}
    </PanelCard>
  );
}

/* ── Table panel ─────────────────────────────────────────────────────── */
export interface Column {
  key: string;
  label: string;
  numeric?: boolean;
}

export function TablePanel({
  title,
  columns,
  rows,
  loading,
  onEdit,
  empty,
  className,
}: {
  title: string;
  columns: Column[];
  rows: Record<string, string | number>[];
  loading?: boolean;
  onEdit?: () => void;
  /** Empty-state override — e.g. filter/range-aware copy + a "reset" action. */
  empty?: {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };
  className?: string;
}) {
  const head = (
    <thead>
      <tr className="border-b border-border">
        {columns.map((c) => (
          <th
            key={c.key}
            className={cn(
              "py-2.5 text-xs font-medium text-muted-foreground first:pl-5 last:pr-5",
              c.numeric ? "px-3 text-right" : "px-3 text-left",
            )}
          >
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  const tableNode = loading ? (
    <div className="space-y-2 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-7 w-full" />
      ))}
    </div>
  ) : (
    <table className="w-full border-collapse text-sm">
      {head}
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="p-0">
              <EmptyState
                size="inset"
                icon={empty?.icon ?? <SearchX size={18} />}
                title={empty?.title ?? "No data to show"}
                description={
                  empty?.description ??
                  "Nothing matches the current filters or selected range."
                }
                action={empty?.action}
              />
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-border transition-colors last:border-0 hover:bg-secondary/40",
                i === 0 && "[&>td]:pt-3.5",
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "py-2.5 first:pl-5 last:pr-5",
                    c.numeric
                      ? "px-3 text-right font-mono text-sm tabular-nums text-foreground"
                      : "px-3 text-left text-sm text-muted-foreground",
                  )}
                >
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // Chart view for the enlarge toggle: first numeric column by the first column.
  const labelKey = columns[0].key;
  const valueCol = columns.find((c) => c.numeric);
  const chartNode = valueCol ? (
    <Bars
      height={360}
      data={rows.map((r) => ({
        name: String(r[labelKey]),
        value: Number(r[valueCol.key]) || 0,
      }))}
    />
  ) : null;

  return (
    <PanelCard
      title={title}
      onEdit={onEdit}
      className={cn("[&>div:last-child]:p-0", className)}
      enlargedViews={
        chartNode
          ? [
              { key: "table", label: "Table", node: tableNode },
              { key: "chart", label: "Chart", node: chartNode },
            ]
          : undefined
      }
    >
      {tableNode}
    </PanelCard>
  );
}
