"use client";

import * as React from "react";
import {
  format,
  subDays,
  subHours,
  subMonths,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimeWheel } from "@/components/time-picker";
import { cn } from "@/lib/utils";

export type StatsRange = {
  from: Date;
  to: Date;
  /** Preset key that produced this range, if any. */
  preset?: string;
};

type Preset = {
  key: string;
  label: string;
  build: (now: Date) => { from: Date; to: Date };
};

/** "None" = no preset; user has a custom range. */
const PRESETS: Preset[] = [
  { key: "today",     label: "Today",         build: (n) => ({ from: startOfDay(n), to: endOfDay(n) }) },
  { key: "yesterday", label: "Yesterday",     build: (n) => { const d = subDays(n, 1); return { from: startOfDay(d), to: endOfDay(d) }; } },
  { key: "24h",       label: "Last 24 hours", build: (n) => ({ from: subHours(n, 24), to: n }) },
  { key: "7d",        label: "Last 7 days",   build: (n) => ({ from: startOfDay(subDays(n, 6)), to: endOfDay(n) }) },
  { key: "30d",       label: "Last 30 days",  build: (n) => ({ from: startOfDay(subDays(n, 29)), to: endOfDay(n) }) },
  { key: "thisMonth", label: "This month",    build: (n) => ({ from: startOfMonth(n), to: endOfDay(n) }) },
  { key: "lastMonth", label: "Last month",    build: (n) => { const d = subMonths(n, 1); return { from: startOfMonth(d), to: endOfMonth(d) }; } },
  { key: "3mo",       label: "Last 3 months", build: (n) => ({ from: startOfDay(subMonths(n, 3)), to: endOfDay(n) }) },
];

function toHHmm(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function to12hLabel(v: string) {
  const [h, m] = v.split(":").map(Number);
  const am = h < 12;
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}
function applyTime(date: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const next = new Date(date);
  next.setHours(h, m, 0, 0);
  return next;
}
function fmtRangeShort(r: StatsRange) {
  if (isSameDay(r.from, r.to)) return format(r.from, "MMM d, yyyy");
  const sameYear = r.from.getFullYear() === r.to.getFullYear();
  const fromFmt = sameYear ? "MMM d" : "MMM d, yyyy";
  return `${format(r.from, fromFmt)} – ${format(r.to, "MMM d, yyyy")}`;
}

export function DateRangePicker({
  value,
  onChange,
  defaultPreset = "30d",
  className,
}: {
  value?: StatsRange;
  onChange?: (r: StatsRange) => void;
  defaultPreset?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  // Anchor "now" once on first render so values don't drift while open.
  const now = React.useMemo(() => new Date(), []);

  const initial = React.useMemo<StatsRange>(() => {
    if (value) return value;
    const p = PRESETS.find((x) => x.key === defaultPreset) ?? PRESETS[4];
    return { ...p.build(now), preset: p.key };
  }, [value, defaultPreset, now]);

  const committed = value ?? initial;
  const [draft, setDraft] = React.useState<StatsRange>(committed);

  // Reset draft to committed every time the popover opens.
  React.useEffect(() => {
    if (open) setDraft(committed);
  }, [open, committed]);

  // "Date" until the parent actually has a selection; then preset name or range.
  const triggerLabel = value
    ? (PRESETS.find((p) => p.key === value.preset)?.label ?? fmtRangeShort(value))
    : "Date";

  const apply = () => {
    onChange?.(draft);
    setOpen(false);
  };

  const clear = () => {
    const p = PRESETS.find((x) => x.key === defaultPreset) ?? PRESETS[4];
    setDraft({ ...p.build(now), preset: p.key });
  };

  const pickPreset = (p: Preset) =>
    setDraft({ ...p.build(now), preset: p.key });
  const pickNone = () => setDraft({ ...draft, preset: undefined });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground transition-colors hover:bg-secondary/60 dark:bg-secondary dark:hover:bg-secondary/80",
              className,
            )}
          >
            <CalendarIcon size={13} className="text-muted-foreground" />
            <span className="whitespace-nowrap">{triggerLabel}</span>
            <ChevronDown size={13} className="text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-auto overflow-hidden p-0"
      >
        <div className="flex">
          {/* ── Quick range column ─────────────────────────────────── */}
          <div className="flex w-40 flex-col gap-0.5 border-r border-border p-3">
            <div className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Quick range
            </div>
            <PresetRow label="None" active={!draft.preset} onClick={pickNone} />
            {PRESETS.map((p) => (
              <PresetRow
                key={p.key}
                label={p.label}
                active={draft.preset === p.key}
                onClick={() => pickPreset(p)}
              />
            ))}
          </div>

          {/* ── Calendar + time + footer column ────────────────────── */}
          <div className="flex flex-col p-3">
            <RangeCalendar
              from={draft.from}
              to={draft.to}
              onChange={(from, to) => {
                const fromTime = toHHmm(draft.from);
                const toTime = toHHmm(draft.to);
                setDraft({
                  from: applyTime(from, fromTime),
                  to: applyTime(to, toTime),
                  preset: undefined,
                });
              }}
            />

            {/* Start / End time */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <TimeBlock
                label="Start time"
                value={toHHmm(draft.from)}
                onChange={(t) =>
                  setDraft({
                    ...draft,
                    from: applyTime(draft.from, t),
                    preset: undefined,
                  })
                }
              />
              <TimeBlock
                label="End time"
                value={toHHmm(draft.to)}
                onChange={(t) =>
                  setDraft({
                    ...draft,
                    to: applyTime(draft.to, t),
                    preset: undefined,
                  })
                }
              />
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-7 items-center rounded-md border border-border bg-transparent px-3 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={apply}
                className="inline-flex h-7 items-center rounded-md bg-foreground px-3 text-xs text-background hover:bg-foreground/90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Subcomponents ──────────────────────────────────────────────── */

function PresetRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
      )}
    >
      <span>{label}</span>
      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--chart-1)]" />
      )}
    </button>
  );
}

/* ── Custom range calendar — outlined selection, no solid fills ──── */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfDayLocal(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function RangeCalendar({
  from,
  to,
  onChange,
}: {
  from: Date;
  to: Date;
  onChange: (from: Date, to: Date) => void;
}) {
  const [viewYear, setViewYear] = React.useState(from.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(from.getMonth());
  // Tracks the start of an in-progress range while user clicks the second day.
  const [pendingStart, setPendingStart] = React.useState<Date | null>(null);
  const [hover, setHover] = React.useState<Date | null>(null);

  const today = React.useMemo(() => new Date(), []);

  const cells = React.useMemo(() => {
    const firstDay = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Mon-first
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevDays = new Date(viewYear, viewMonth, 0).getDate();
    const arr: { y: number; m: number; d: number; dim: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      arr.push({
        y: viewMonth === 0 ? viewYear - 1 : viewYear,
        m: viewMonth === 0 ? 11 : viewMonth - 1,
        d,
        dim: true,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({ y: viewYear, m: viewMonth, d, dim: false });
    }
    while (arr.length % 7 !== 0 || arr.length < 42) {
      const idx = arr.length - firstDay - daysInMonth + 1;
      arr.push({
        y: viewMonth === 11 ? viewYear + 1 : viewYear,
        m: viewMonth === 11 ? 0 : viewMonth + 1,
        d: idx,
        dim: true,
      });
      if (arr.length >= 42) break;
    }
    return arr;
  }, [viewYear, viewMonth]);

  const fromDay = startOfDayLocal(from);
  const toDay = startOfDayLocal(to);

  const previewStart = pendingStart ?? null;
  const previewEnd = pendingStart && hover ? hover : null;

  const handleClick = (d: Date) => {
    if (!pendingStart) {
      // start a new range
      setPendingStart(d);
      return;
    }
    // finish the range
    const a = startOfDayLocal(pendingStart);
    const b = startOfDayLocal(d);
    const [start, end] = a <= b ? [a, b] : [b, a];
    onChange(start, end);
    setPendingStart(null);
    setHover(null);
  };

  return (
    <div className="w-[400px]">
      {/* Month header */}
      <div className="mb-2 flex h-9 items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (viewMonth === 0) {
              setViewMonth(11);
              setViewYear((y) => y - 1);
            } else setViewMonth((m) => m - 1);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="text-sm font-medium tabular-nums text-foreground">
          {MONTHS[viewMonth]} {viewYear}
        </div>
        <button
          type="button"
          onClick={() => {
            if (viewMonth === 11) {
              setViewMonth(0);
              setViewYear((y) => y + 1);
            } else setViewMonth((m) => m + 1);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="mb-1 grid grid-cols-7">
        {DOW.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((c, i) => {
          const d = new Date(c.y, c.m, c.d);
          const isToday = sameDate(d, today);

          // committed range (from / to) — only used if no pending start
          const inRange =
            !pendingStart && d >= fromDay && d <= toDay;
          const isStart = !pendingStart && sameDate(d, fromDay);
          const isEnd = !pendingStart && sameDate(d, toDay);

          // pending hover preview
          let inPreview = false;
          let isPreviewStart = false;
          let isPreviewEnd = false;
          if (previewStart) {
            const a = startOfDayLocal(previewStart);
            const b = previewEnd ? startOfDayLocal(previewEnd) : a;
            const [s, e] = a <= b ? [a, b] : [b, a];
            inPreview = d >= s && d <= e;
            isPreviewStart = sameDate(d, s);
            isPreviewEnd = sameDate(d, e);
          }

          const isLeftEnd = isStart || isPreviewStart;
          const isRightEnd = isEnd || isPreviewEnd;
          const isEndpoint = isLeftEnd || isRightEnd;
          const isSingle = isLeftEnd && isRightEnd;
          const inSelection = inRange || inPreview;
          const middle = inSelection && !isEndpoint;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(d)}
              onMouseEnter={() => pendingStart && setHover(d)}
              className={cn(
                "relative flex h-9 w-full items-center justify-center text-sm tabular-nums transition-colors",
                // base text color
                c.dim
                  ? "text-muted-foreground/40"
                  : "text-foreground",
                // middle: subtle background fill (continuous band across the row)
                middle && "bg-secondary",
                // endpoint: solid white box with dark text — only the OUTER side rounds
                isEndpoint && "bg-foreground font-medium text-background",
                isEndpoint && isSingle && "rounded-md",
                isEndpoint && !isSingle && isLeftEnd && "rounded-l-md",
                isEndpoint && !isSingle && isRightEnd && "rounded-r-md",
                // today (when not part of selection): outlined box, no fill
                !isEndpoint &&
                  !middle &&
                  isToday &&
                  "rounded-md border border-foreground/60 font-medium text-foreground",
                // hover (when nothing pending & nothing selected on this day)
                !inSelection &&
                  !isToday &&
                  "hover:rounded-md hover:bg-secondary/60",
              )}
            >
              {c.d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Big card with uppercase label + 12-hour time display + clock icon trigger. */
function TimeBlock({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const display = to12hLabel(value);
  const [hhmm, ampm] = display.split(" ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex items-center justify-between gap-2 rounded-lg border border-input bg-secondary px-3 py-2 text-left transition-colors hover:bg-secondary/80"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <span className="mt-0.5 font-mono text-sm leading-tight tabular-nums text-foreground">
                {hhmm}{" "}
                <span className="text-muted-foreground">{ampm}</span>
              </span>
            </div>
            <Clock size={14} className="shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent align="start" className="w-[228px] overflow-hidden p-0">
        <TimeWheel value={value || "10:00"} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
