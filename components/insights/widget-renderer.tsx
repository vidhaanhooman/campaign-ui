"use client";

import { Maximize2, Minimize2, MoreHorizontal, SlidersHorizontal, X } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as React from "react";

import {
  useAgentTable,
  useGrouped,
  useMultiScalar,
  useMultiSeries,
  useScalar,
} from "@/lib/insights/hooks";
import { formatValue } from "@/lib/insights/resolver";
import { METRICS, type MetricDef } from "@/lib/insights/registry";
import type { TimeRange, Widget } from "@/lib/insights/types";
import { cn } from "@/lib/utils";
import { Bars, Donut, INSIGHT_RAMP, MultiLineChart } from "./charts";
import { Skeleton } from "./skeleton";

interface EditProps {
  onRemove?: () => void;
  onResize?: () => void;
  onEdit?: () => void;
  span: 1 | 2;
}

function metricsOf(widget: Widget): MetricDef[] {
  return widget.metricIds
    .map((id) => METRICS.find((m) => m.id === id))
    .filter((m): m is MetricDef => !!m);
}

/** A metric's own filter clauses. */
function filtersFor(widget: Widget, id: string) {
  return widget.config.metricFilters?.[id] ?? [];
}

/** Metric + its filters, for the multi-metric resolvers. */
function specsOf(widget: Widget) {
  return metricsOf(widget).map((m) => ({
    metric: m,
    where: filtersFor(widget, m.id),
  }));
}

/** Card chrome with hover edit-in-place controls (resize / remove). */
function Shell({
  title,
  children,
  onRemove,
  onResize,
  onEdit,
  span,
}: { title: string; children: React.ReactNode } & EditProps) {
  return (
    <section className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-[#333333]/30">
      <header className="flex items-center gap-2 px-5 pt-4 pb-3">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {onResize && (
            <button
              type="button"
              aria-label={span === 2 ? "Shrink" : "Widen"}
              onClick={onResize}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {span === 2 ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              aria-label="Remove widget"
              onClick={onRemove}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
          {onEdit && <MoreMenu onEdit={onEdit} />}
        </div>
      </header>
      <div className="flex-1 px-5 pb-5">{children}</div>
    </section>
  );
}

export function WidgetRenderer({
  widget,
  range,
  refreshKey,
  onRemove,
  onResize,
  onEdit,
}: {
  widget: Widget;
  range: TimeRange;
  refreshKey: number;
  onRemove?: () => void;
  onResize?: () => void;
  onEdit?: () => void;
}) {
  const metrics = metricsOf(widget);
  if (!metrics.length) return null;
  const edit: EditProps = { onRemove, onResize, onEdit, span: widget.span };
  const multi = metrics.length > 1;

  if (widget.type === "number")
    return <NumberWidget widget={widget} range={range} refreshKey={refreshKey} edit={edit} />;
  if (widget.type === "line")
    return <LineWidget widget={widget} range={range} refreshKey={refreshKey} edit={edit} />;
  if (widget.type === "pie")
    return <GroupWidget widget={widget} range={range} refreshKey={refreshKey} edit={edit} />;
  if (widget.type === "bar")
    return multi ? (
      <MultiBarWidget widget={widget} range={range} refreshKey={refreshKey} edit={edit} />
    ) : (
      <GroupWidget widget={widget} range={range} refreshKey={refreshKey} edit={edit} />
    );
  // table
  return multi ? (
    <MultiTableWidget widget={widget} range={range} refreshKey={refreshKey} edit={edit} />
  ) : (
    <TableWidget widget={widget} range={range} refreshKey={refreshKey} edit={edit} />
  );
}

type WidgetProps = {
  widget: Widget;
  range: TimeRange;
  refreshKey: number;
  edit: EditProps;
};

function NumberWidget({ widget, range, refreshKey, edit }: WidgetProps) {
  const metric = metricsOf(widget)[0];
  const { data, loading } = useScalar(metric, range, refreshKey, filtersFor(widget, metric.id));
  const prefix = widget.config.prefix ?? "";
  const suffix = widget.config.suffix ?? "";
  return (
    <Shell title={widget.title} {...edit}>
      {loading ? (
        <Skeleton className="h-9 w-24" />
      ) : (
        <div className="font-mono text-3xl leading-none tabular-nums text-foreground">
          {prefix}
          {formatValue(data.value, metric.format)}
          {suffix}
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">{metric.label}</div>
    </Shell>
  );
}

function LineWidget({ widget, range, refreshKey, edit }: WidgetProps) {
  const metrics = metricsOf(widget);
  const { data, loading } = useMultiSeries(specsOf(widget), range, refreshKey);
  const series = metrics.map((m, i) => ({
    key: m.id,
    label: m.label,
    color: INSIGHT_RAMP[i % 5],
  }));
  return (
    <Shell title={widget.title} {...edit}>
      {loading ? (
        <Skeleton className="h-[220px] w-full" />
      ) : (
        <MultiLineChart
          data={data as unknown as Record<string, string | number>[]}
          series={series}
          height={220}
        />
      )}
    </Shell>
  );
}

function MultiBarWidget({ widget, range, refreshKey, edit }: WidgetProps) {
  const { data, loading } = useMultiScalar(specsOf(widget), range, refreshKey);
  return (
    <Shell title={widget.title} {...edit}>
      {loading ? <Skeleton className="h-[200px] w-full" /> : <Bars data={data} />}
    </Shell>
  );
}

function GroupWidget({ widget, range, refreshKey, edit }: WidgetProps) {
  const field = widget.config.groupBy ?? "outcome";
  const metricId = widget.metricIds[0];
  const { data, loading } = useGrouped(field, range, refreshKey, filtersFor(widget, metricId));
  return (
    <Shell title={widget.title} {...edit}>
      {loading ? (
        <Skeleton className={cn("w-full", widget.type === "pie" ? "h-44" : "h-[200px]")} />
      ) : widget.type === "pie" ? (
        <Donut data={data} unit="calls" />
      ) : (
        <Bars data={data} />
      )}
    </Shell>
  );
}

function MultiTableWidget({ widget, range, refreshKey, edit }: WidgetProps) {
  const metrics = metricsOf(widget);
  const { data, loading } = useMultiScalar(specsOf(widget), range, refreshKey);
  return (
    <Shell title={widget.title} {...edit}>
      {loading ? (
        <div className="space-y-2">
          {metrics.map((m) => (
            <Skeleton key={m.id} className="h-7 w-full" />
          ))}
        </div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-white/10 bg-[#333333]/30">
              <th className="py-2.5 pl-1 text-left text-xs font-medium text-muted-foreground">
                Metric
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-white/10 last:border-0">
                <td className="py-2.5 pl-1 text-xs text-muted-foreground">{row.name}</td>
                <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-foreground">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Shell>
  );
}

function TableWidget({ widget, range, refreshKey, edit }: WidgetProps) {
  const agents = useAgentTable(range, refreshKey);
  return (
    <Shell title={widget.title} {...edit}>
      {agents.loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-white/10 bg-[#333333]/30">
              {["Agent", "Calls", "Connected", "Pickup Rate (%)", "Avg Duration (s)"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "py-2.5 text-xs font-medium text-muted-foreground",
                      i === 0 ? "pl-1 text-left" : "px-3 text-right",
                    )}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {agents.data.map((r, i) => (
              <tr key={i} className="border-b border-white/10 last:border-0">
                <td className="py-2.5 pl-1 text-xs text-muted-foreground">{r.agent}</td>
                {(["calls", "connected", "pickup", "avgdur"] as const).map((k) => (
                  <td
                    key={k}
                    className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-foreground"
                  >
                    {r[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Shell>
  );
}

/** ⋯ menu with an "Edit…" item. Sized/styled to match the other Shell buttons. */
function MoreMenu({ onEdit }: { onEdit: () => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="More actions"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MoreHorizontal size={15} />
          </button>
        }
      />
      <PopoverContent align="end" sideOffset={6} className="w-44 p-1">
        <button
          type="button"
          onClick={() => {
            onEdit();
            setOpen(false);
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-secondary [&>svg]:text-muted-foreground"
        >
          <SlidersHorizontal size={14} />
          Edit…
        </button>
      </PopoverContent>
    </Popover>
  );
}
