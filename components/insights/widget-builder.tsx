"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Plus, Trash2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { FilterMenu, FilterPanel } from "./filter-menu";
import { SegmentedToggle } from "./segmented-toggle";
import {
  FILTER_FIELDS,
  METRICS,
  SPAN_FOR_TYPE,
  VIZ,
  defaultVizFor,
  vizForMetric,
  type MetricDef,
} from "@/lib/insights/registry";
import type { FilterClause, Widget, WidgetType } from "@/lib/insights/types";

/** Sequential id without Math.random/Date (both unavailable in some envs). */
let counter = 0;
function nextId() {
  counter += 1;
  return `w_user_${counter}`;
}

export function WidgetBuilder({
  open,
  onOpenChange,
  onAdd,
  onUpdate,
  editing,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (w: Widget) => void;
  /** Present in edit mode — commits the changes to the existing widget. */
  onUpdate?: (id: string, patch: Partial<Widget>) => void;
  /** When set, the modal pre-fills from this widget (implies edit mode). */
  editing?: Widget | null;
  /** Explicit mode override — use "edit" to show viz options even without an editing widget. */
  mode?: "add" | "edit";
}) {
  // Edit mode either has a widget to hydrate from, or the caller explicitly asked for it.
  const isEditing = mode ? mode === "edit" : !!editing;
  const [title, setTitle] = React.useState("");
  const [titleTouched, setTitleTouched] = React.useState(false);
  const [viz, setViz] = React.useState<WidgetType>("number");
  const [metricIds, setMetricIds] = React.useState<string[]>([]);
  const [groupBy, setGroupBy] = React.useState<string>("none");
  const [granularity, setGranularity] = React.useState<string>("hour");
  const [metricFilters, setMetricFilters] = React.useState<
    Record<string, FilterClause[]>
  >({});
  const [useCustomRange, setUseCustomRange] = React.useState(false);
  const [rangeGranularity, setRangeGranularity] = React.useState<string>("hour");
  // Per-visualization options.
  const [prefix, setPrefix] = React.useState<string>("");
  const [suffix, setSuffix] = React.useState<string>("");
  const [showLegend, setShowLegend] = React.useState(true);
  const [curveType, setCurveType] = React.useState<"monotone" | "linear" | "step">("monotone");
  const [stacked, setStacked] = React.useState(false);
  const [donut, setDonut] = React.useState(true);
  const [showTotals, setShowTotals] = React.useState(false);
  const [showErrors, setShowErrors] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  // The metric id whose filter panel is currently open (side column of modal).
  const [filterTargetId, setFilterTargetId] = React.useState<string | null>(null);
  const filterOpen = filterTargetId !== null;

  // Group by is always visible; disabled for Number/Pie (they don't group by user choice).
  const groupable = viz !== "number" && viz !== "pie";
  const multiMetric = viz === "line" || viz === "bar" || viz === "table";

  // Rows may temporarily hold empty ids (an added-but-unpicked slot).
  // Always render at least the primary row, even before any pick.
  const rowMetrics: (MetricDef | null)[] = (metricIds.length ? metricIds : [""]).map(
    (id) => METRICS.find((m) => m.id === id) ?? null,
  );
  const filledMetrics = rowMetrics.filter((m): m is MetricDef => !!m);
  const firstMetric = filledMetrics[0] ?? null;
  const allowedViz = firstMetric ? vizForMetric(firstMetric) : VIZ.map((v) => v.type);
  const titleMissing = title.trim().length === 0;
  const metricMissing = filledMetrics.length === 0;
  const complete = !titleMissing && !metricMissing;

  const reset = () => {
    setTitle("");
    setTitleTouched(false);
    setViz("number");
    setMetricIds([]);
    setGroupBy("none");
    setGranularity("hour");
    setMetricFilters({});
    setUseCustomRange(false);
    setRangeGranularity("hour");
    setPrefix("");
    setSuffix("");
    setShowLegend(true);
    setCurveType("monotone");
    setStacked(false);
    setDonut(true);
    setShowTotals(false);
    setShowErrors(false);
    setFilterTargetId(null);
  };

  // Hydrate state from `editing` when the modal opens in edit mode.
  React.useEffect(() => {
    if (!open || !editing) return;
    setTitle(editing.title);
    setTitleTouched(true);
    setViz(editing.type);
    setMetricIds(editing.metricIds);
    setGroupBy(editing.config.groupBy ?? "none");
    setGranularity(editing.config.granularity ?? "hour");
    setMetricFilters(editing.config.metricFilters ?? {});
    setPrefix(editing.config.prefix ?? "");
    setSuffix(editing.config.suffix ?? "");
    setShowLegend(editing.config.showLegend ?? true);
    setCurveType(editing.config.curveType ?? "monotone");
    setStacked(editing.config.stacked ?? false);
    setDonut(editing.config.donut ?? true);
    setShowTotals(editing.config.showTotals ?? false);
  }, [open, editing]);

  const addFilterTo = (id: string, c: FilterClause) =>
    setMetricFilters((mf) => ({ ...mf, [id]: [...(mf[id] ?? []), c] }));
  const removeFilterFrom = (id: string, i: number) =>
    setMetricFilters((mf) => ({
      ...mf,
      [id]: (mf[id] ?? []).filter((_, idx) => idx !== i),
    }));
  const close = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  // Primary slot (index 0) also drives viz/title defaults for single-metric widgets.
  const setPrimary = (m: MetricDef | null) => {
    setMetricAt(0, m);
    if (!m) return;
    if (!multiMetric) {
      const dv = defaultVizFor(m);
      setViz(dv);
      if (!titleTouched) setTitle(defaultTitle(m.label, dv));
    } else if (!titleTouched) {
      setTitle(defaultTitle(m.label, viz));
    }
  };
  // Extra metric slot — an empty row the user then picks into.
  const addEmptyMetric = () => setMetricIds((ids) => [...ids, ""]);
  // Set the metric at a given index (used by an extra row's own Combobox).
  const setMetricAt = (idx: number, m: MetricDef | null) => {
    setMetricIds((ids) => {
      const next = [...ids];
      next[idx] = m?.id ?? "";
      return next;
    });
  };
  const removeMetricAt = (idx: number) => {
    const id = metricIds[idx];
    setMetricIds((ids) => ids.filter((_, i) => i !== idx));
    if (id) {
      setMetricFilters((mf) => {
        const { [id]: _drop, ...rest } = mf;
        return rest;
      });
    }
  };

  const pickViz = (t: string) => {
    const type = t as WidgetType;
    const nowMulti = type === "line" || type === "bar" || type === "table";
    if (!nowMulti && metricIds.length > 1) setMetricIds((ids) => ids.slice(0, 1));
    setViz(type);
    if (firstMetric && !titleTouched) setTitle(defaultTitle(firstMetric.label, type));
  };

  const submit = () => {
    if (!complete) {
      setShowErrors(true);
      return;
    }
    // Drop any empty slots the user added but never picked into.
    const pickedIds = metricIds.filter(Boolean);
    // Keep only per-metric filters that still map to a picked metric.
    const entries = pickedIds
      .map((id) => [id, metricFilters[id] ?? []] as const)
      .filter(([, fs]) => fs.length > 0);
    const prunedFilters = entries.length ? Object.fromEntries(entries) : null;
    const config = {
      ...(groupable && groupBy && groupBy !== "none" ? { groupBy } : {}),
      ...(groupable && groupBy === "time" ? { granularity } : {}),
      ...(prunedFilters ? { metricFilters: prunedFilters } : {}),
      // Per-viz options — only persist the ones that apply to this viz type.
      ...(viz === "number" && prefix ? { prefix } : {}),
      ...(viz === "number" && suffix ? { suffix } : {}),
      ...(viz === "line" ? { showLegend, curveType } : {}),
      ...(viz === "bar" ? { stacked } : {}),
      ...(viz === "pie" ? { donut } : {}),
      ...(viz === "table" ? { showTotals } : {}),
    };
    if (isEditing && editing && onUpdate) {
      onUpdate(editing.id, {
        type: viz,
        metricIds: pickedIds,
        title: title.trim(),
        span: SPAN_FOR_TYPE(viz),
        config,
      });
    } else {
      onAdd({
        id: nextId(),
        type: viz,
        metricIds: pickedIds,
        title: title.trim(),
        owner: "you",
        span: SPAN_FOR_TYPE(viz),
        config,
      });
    }
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        ref={modalRef}
        className={cn(
          "!flex h-[680px] !max-h-[calc(100vh-4rem)] flex-row gap-4 !bg-transparent !p-0 !ring-0 !shadow-none transition-[max-width] duration-200",
          filterOpen ? "!max-w-[976px]" : "!max-w-[640px]",
        )}
      >
        {/* Main column — form + footer, its own container */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit widget" : "Add widget"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Tweak the metric, visualization, or per-chart options."
              : "Track a metric on your dashboard."}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="scroll-thin flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-1 pr-1">
          {/* 1 · Title */}
          <Field data-invalid={showErrors && titleMissing ? "true" : undefined}>
            <FieldLabel htmlFor="widget-title">Title</FieldLabel>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleTouched(true);
              }}
              placeholder="Untitled widget"
              aria-invalid={showErrors && titleMissing}
            />
            {showErrors && titleMissing && (
              <FieldError>Give the widget a title.</FieldError>
            )}
          </Field>

          {/* 2 · Visualization */}
          <Field>
            <FieldLabel>Visualization</FieldLabel>
            <SegmentedToggle
              className="w-full [&>button]:flex-1"
              value={viz}
              onChange={pickViz}
              options={VIZ.map((v) => ({
                value: v.type,
                label: v.label,
                icon: v.icon,
                disabled: !allowedViz.includes(v.type),
              }))}
            />
          </Field>

          {/* 3 · Group by — always visible; disabled for Number/Pie.
              When Time is picked, Granularity sits inline (half + half). */}
          <Field>
            <FieldLabel>Group by</FieldLabel>
            <div className="flex items-center gap-3">
              <Select
                value={groupBy}
                onValueChange={(v) => v && setGroupBy(v)}
                disabled={!groupable}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="outcome">Outcome</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="callInfo.endReason">End reason</SelectItem>
                </SelectContent>
              </Select>
              {groupable && groupBy === "time" && (
                <div className="flex flex-1 items-center gap-2">
                  <span className="shrink-0 text-sm text-muted-foreground">
                    Granularity
                  </span>
                  <Select
                    value={granularity}
                    onValueChange={(v) => v && setGranularity(v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minute">Minute</SelectItem>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Field>

          {/* 4 · Metric(s) — flat rows; single "Metrics" label above the group */}
          {rowMetrics.map((m, idx) => {
            const isPrimary = idx === 0;
            const rowKey = m ? m.id : `slot-${idx}`;
            return (
              <MetricRow
                key={rowKey}
                label={isPrimary ? (multiMetric ? "Metrics" : "Metric") : undefined}
                invalid={isPrimary && showErrors && metricMissing}
                selected={m}
                onSelect={(picked) =>
                  isPrimary ? setPrimary(picked) : setMetricAt(idx, picked)
                }
                onRemoveMetric={!isPrimary ? () => removeMetricAt(idx) : undefined}
                filters={m ? metricFilters[m.id] : undefined}
                onOpenFilter={m ? () => setFilterTargetId(m.id) : undefined}
                onRemoveFilter={m ? (i) => removeFilterFrom(m.id, i) : undefined}
              />
            );
          })}

          {!multiMetric && firstMetric && (
            <FieldDescription className="-mt-3">
              {firstMetric.description}
            </FieldDescription>
          )}

          {/* + Add metric — full-width action below the metric group */}
          {multiMetric && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed text-muted-foreground hover:text-foreground"
              onClick={addEmptyMetric}
            >
              <Plus /> Add metric
            </Button>
          )}

          {showErrors && metricMissing && (
            <FieldError>Pick a metric to measure.</FieldError>
          )}

          {/* Visualization options — Edit mode only; per-viz section, adapts to the selected chart */}
          {isEditing && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="mb-3 text-sm font-medium text-foreground">
              Visualization options
            </div>
            {viz === "number" && (
              <div className="flex items-center gap-3">
                <Field className="flex-1">
                  <FieldLabel htmlFor="viz-prefix">Prefix</FieldLabel>
                  <Input
                    id="viz-prefix"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="$"
                  />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor="viz-suffix">Suffix</FieldLabel>
                  <Input
                    id="viz-suffix"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="ms"
                  />
                </Field>
              </div>
            )}
            {viz === "line" && (
              <div className="flex flex-col gap-4">
                <Field orientation="horizontal">
                  <Switch
                    id="viz-legend"
                    checked={showLegend}
                    onCheckedChange={setShowLegend}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="viz-legend">Show legend</FieldLabel>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Curve</FieldLabel>
                  <Select
                    value={curveType}
                    onValueChange={(v) => v && setCurveType(v as typeof curveType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monotone">Smooth (monotone)</SelectItem>
                      <SelectItem value="linear">Straight (linear)</SelectItem>
                      <SelectItem value="step">Stepped</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            )}
            {viz === "bar" && (
              <Field orientation="horizontal">
                <Switch
                  id="viz-stacked"
                  checked={stacked}
                  onCheckedChange={setStacked}
                />
                <FieldContent>
                  <FieldLabel htmlFor="viz-stacked">Stacked bars</FieldLabel>
                  <FieldDescription>
                    Combine multi-metric bars into one stack per category.
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
            {viz === "pie" && (
              <Field orientation="horizontal">
                <Switch
                  id="viz-donut"
                  checked={donut}
                  onCheckedChange={setDonut}
                />
                <FieldContent>
                  <FieldLabel htmlFor="viz-donut">Donut (center hole)</FieldLabel>
                  <FieldDescription>
                    Off renders a solid pie.
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
            {viz === "table" && (
              <Field orientation="horizontal">
                <Switch
                  id="viz-totals"
                  checked={showTotals}
                  onCheckedChange={setShowTotals}
                />
                <FieldContent>
                  <FieldLabel htmlFor="viz-totals">Show totals row</FieldLabel>
                </FieldContent>
              </Field>
            )}
          </div>
          )}
        </FieldGroup>

        {/* 5 · Range — pinned outside the scroll area, above the footer */}
        <div className="flex flex-col gap-3 pt-2">
          <Field orientation="horizontal">
            <Switch
              id="widget-range"
              checked={useCustomRange}
              onCheckedChange={setUseCustomRange}
            />
            <FieldContent>
              <FieldLabel htmlFor="widget-range">
                Use a custom time range
              </FieldLabel>
              <FieldDescription>
                {useCustomRange
                  ? "On — set a custom range for this widget."
                  : "Off — follows the dashboard's range."}
              </FieldDescription>
            </FieldContent>
          </Field>

          {useCustomRange && (
            <div className="flex items-center gap-3 pl-11">
              <div className="flex flex-1 items-center gap-2">
                <span className="shrink-0 text-sm text-muted-foreground">
                  Granularity
                </span>
                <Select
                  value={rangeGranularity}
                  onValueChange={(v) => v && setRangeGranularity(v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minute">Minute</SelectItem>
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            {isEditing ? "Update widget" : "Add widget"}
          </Button>
        </DialogFooter>
        </div>

        {/* Filter panel — side column that opens next to the form */}
        {filterOpen && filterTargetId && (
          <FilterPanel
            onAdd={(c) => {
              addFilterTo(filterTargetId, c);
              setFilterTargetId(null);
            }}
            onClose={() => setFilterTargetId(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * One metric block: label, picker (Combobox), optional filter chips, and the
 * "+ Add metric" / "+ Add filter" row. Repeats for every metric on the widget.
 */
/**
 * One metric slot — Combobox + optional filter chips + right-aligned "Add
 * filter". The "Metrics" label is only rendered when a `label` is provided
 * (so only the primary row prints it).
 */
function MetricRow({
  label,
  labelAction,
  invalid,
  selected,
  onSelect,
  onRemoveMetric,
  filters,
  onOpenFilter,
  onRemoveFilter,
}: {
  label?: string;
  /** Right-aligned control rendered next to the label (e.g. "+ Add metric"). */
  labelAction?: React.ReactNode;
  invalid?: boolean;
  selected: MetricDef | null;
  onSelect: (m: MetricDef | null) => void;
  onRemoveMetric?: () => void;
  filters?: FilterClause[];
  /** Opens the filter picker as the modal's side column, targeting this metric. */
  onOpenFilter?: () => void;
  onRemoveFilter?: (i: number) => void;
}) {
  return (
    <Field data-invalid={invalid ? "true" : undefined}>
      {(label || labelAction) && (
        <div className="flex items-center gap-2">
          {label && <FieldLabel className="mb-0 flex-1">{label}</FieldLabel>}
          {!label && <span className="flex-1" />}
          {labelAction}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Combobox
            items={METRICS}
            value={selected}
            onValueChange={(m) => onSelect(m as MetricDef | null)}
            itemToStringLabel={(m: MetricDef) => m?.label ?? ""}
          >
            <ComboboxInput
              placeholder={selected?.label ?? "New Metric"}
              aria-invalid={invalid}
            />
            <ComboboxContent>
              <ComboboxEmpty>No metrics found.</ComboboxEmpty>
              <ComboboxList>
                {(m: MetricDef) => (
                  <ComboboxItem key={m.id} value={m} className="items-start py-2">
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {m.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {m.description}
                      </span>
                    </span>
                    {m.sql && (
                      <span className="ml-2 mt-0.5 rounded bg-purple-500/15 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-purple-300">
                        SQL
                      </span>
                    )}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <FilterMenu disabled={!onOpenFilter} onClick={onOpenFilter} />
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-foreground"
            >
              <span className="text-muted-foreground">
                {FILTER_FIELDS.find((x) => x.field === f.field)?.label ?? f.field}:
              </span>
              {f.value}
              {onRemoveFilter && (
                <button
                  type="button"
                  aria-label="Remove filter"
                  onClick={() => onRemoveFilter(i)}
                  className="ml-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1">
        {onRemoveMetric && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemoveMetric}
          >
            <Trash2 /> Delete
          </Button>
        )}
      </div>
    </Field>
  );
}

function defaultTitle(label: string, viz: WidgetType) {
  if (viz === "number") return label;
  if (viz === "pie") return `${label} breakdown`;
  if (viz === "bar") return `${label} by agent`;
  if (viz === "table") return "Agent wise data";
  return `${label} over time`;
}
