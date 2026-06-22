"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/time-picker";
import { cn } from "@/lib/utils";

const SURFACE_BG = { backgroundColor: "var(--surface)" } as const;
const CARD = "rounded-lg border border-border-strong shadow-xl shadow-black/40";

/**
 * Date + time range picker. Values are "YYYY-MM-DDTHH:mm". When
 * `startDisabled` is set the start is fixed ("Now") and only the end is
 * editable.
 */
export function DateRangePicker({
  startValue,
  endValue,
  onApply,
  startDisabled = false,
  className,
}: {
  startValue: string;
  endValue: string;
  onApply: (start: string, end: string) => void;
  startDisabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [startDraft, setStartDraft] = useState(startValue);
  const [endDraft, setEndDraft] = useState(endValue);
  const [selecting, setSelecting] = useState<"start" | "end">(
    startDisabled ? "end" : "start",
  );

  const ps = parseValue(startDraft);
  const pe = parseValue(endDraft);

  const [viewYear, setViewYear] = useState(pe.year);
  const [viewMonth, setViewMonth] = useState(pe.month);

  const reset = () => {
    setStartDraft(startValue);
    setEndDraft(endValue);
    setSelecting(startDisabled ? "end" : "start");
    const p = parseValue(startDisabled ? endValue : startValue);
    setViewYear(p.year);
    setViewMonth(p.month);
  };

  const setStartDate = (y: number, m: number, d: number) =>
    setStartDraft((v) => serialize({ ...parseValue(v), year: y, month: m, day: d }));
  const setEndDate = (y: number, m: number, d: number) =>
    setEndDraft((v) => serialize({ ...parseValue(v), year: y, month: m, day: d }));

  const onPickDay = (y: number, m: number, d: number) => {
    setViewYear(y);
    setViewMonth(m);
    const clicked = dayNum({ year: y, month: m, day: d });
    if (startDisabled) {
      setEndDate(y, m, d);
      return;
    }
    if (selecting === "start") {
      setStartDate(y, m, d);
      if (dayNum(pe) < clicked) setEndDate(y, m, d);
      setSelecting("end");
    } else if (clicked < dayNum(ps)) {
      setStartDate(y, m, d);
      setSelecting("end");
    } else {
      setEndDate(y, m, d);
      setSelecting("start");
    }
  };

  const apply = () => {
    onApply(startDraft, endDraft);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        if (v) reset();
        setOpen(v);
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "h-9 inline-flex items-center gap-2.5 rounded-md border border-border-strong bg-surface-2 px-3 text-left text-sm transition-colors hover:border-text-muted/40 focus:border-white outline-none",
              className,
            )}
          />
        }
      >
        <Calendar size={13} className="shrink-0 text-text-muted" />
        <span className="flex-1 min-w-0 truncate font-mono text-text tabular-nums">
          {startDisabled ? "Now" : fmtShort(parseValue(startValue))}
          <span className="mx-1.5 text-text-muted">–</span>
          {fmtShort(parseValue(endValue))}
        </span>
        <ChevronDown size={14} className="shrink-0 text-text-muted" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={16}
        collisionAvoidance={{
          side: "flip",
          align: "shift",
          fallbackAxisSide: "end",
        }}
        style={SURFACE_BG}
        className={cn(CARD, "w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden p-0")}
      >
        <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 h-11 border-b border-border">
              <button
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((y) => y - 1);
                  } else setViewMonth((m) => m - 1);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="text-sm font-medium text-text tabular-nums">
                {MONTHS[viewMonth]} {viewYear}
              </div>
              <button
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((y) => y + 1);
                  } else setViewMonth((m) => m + 1);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-7 mb-1">
                {DOW.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-semibold uppercase tracking-wider text-text-muted py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <RangeGrid
                year={viewYear}
                month={viewMonth}
                start={startDisabled ? null : ps}
                end={pe}
                onSelect={onPickDay}
              />
            </div>

            {/* Time fields */}
            <div className="grid grid-cols-2 gap-2 border-t border-border px-3 py-3">
              {startDisabled ? (
                <div
                  className="flex h-[52px] items-center rounded-md border border-border-strong bg-surface-2/40 px-3"
                  title="Starts immediately"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Start time
                    </div>
                    <div className="mt-0.5 font-mono text-sm text-text-muted">
                      Now
                    </div>
                  </div>
                </div>
              ) : (
                <TimePicker
                  label="Start time"
                  value={`${pad(ps.hour)}:${pad(ps.minute)}`}
                  onChange={(v) => {
                    const [h, mi] = v.split(":").map(Number);
                    setStartDraft(serialize({ ...ps, hour: h, minute: mi }));
                  }}
                />
              )}
              <TimePicker
                label="End time"
                value={`${pad(pe.hour)}:${pad(pe.minute)}`}
                onChange={(v) => {
                  const [h, mi] = v.split(":").map(Number);
                  setEndDraft(serialize({ ...pe, hour: h, minute: mi }));
                }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
              <button
                type="button"
                onClick={reset}
                className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-text-dim hover:text-text"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={apply}
                className="rounded-md bg-white px-4 py-1.5 text-xs font-medium text-black hover:bg-white/90"
              >
                Apply
              </button>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MON_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function RangeGrid({
  year,
  month,
  start,
  end,
  onSelect,
}: {
  year: number;
  month: number;
  start: Parsed | null;
  end: Parsed;
  onSelect: (y: number, m: number, d: number) => void;
}) {
  const cells = useMemo(() => {
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const arr: { y: number; m: number; d: number; dim: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      arr.push({
        y: month === 0 ? year - 1 : year,
        m: month === 0 ? 11 : month - 1,
        d: prevDays - i,
        dim: true,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) arr.push({ y: year, m: month, d, dim: false });
    while (arr.length % 7 !== 0 || arr.length < 42) {
      const idx = arr.length - firstDay - daysInMonth + 1;
      arr.push({
        y: month === 11 ? year + 1 : year,
        m: month === 11 ? 0 : month + 1,
        d: idx,
        dim: true,
      });
      if (arr.length >= 42) break;
    }
    return arr;
  }, [year, month]);

  const startN = start ? dayNum(start) : null;
  const endN = dayNum(end);
  const today = new Date();

  return (
    <div className="grid grid-cols-7">
      {cells.map((c, i) => {
        const col = i % 7;
        const n = dayNum({ year: c.y, month: c.m, day: c.d });
        const isStart = startN !== null && n === startN;
        const isEnd = n === endN;
        const edge = isStart || isEnd;
        const hasRange = startN !== null && startN !== endN;
        const inBand = startN !== null && n >= startN && n <= endN;
        const inRange = startN !== null && n > startN && n < endN;
        const isToday =
          c.y === today.getFullYear() &&
          c.m === today.getMonth() &&
          c.d === today.getDate();

        // Continuous grey band — rounds at the range ends and at each row edge.
        const bandRoundLeft = isStart || col === 0;
        const bandRoundRight = isEnd || col === 6;

        return (
          <div
            key={i}
            className={cn(
              hasRange && inBand && "bg-surface-2",
              hasRange && inBand && bandRoundLeft && "rounded-l-md",
              hasRange && inBand && bandRoundRight && "rounded-r-md",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(c.y, c.m, c.d)}
              className={cn(
                "h-9 w-full text-sm transition-colors tabular-nums",
                edge
                  ? cn(
                      "bg-white text-black font-medium",
                      !hasRange
                        ? "rounded-md"
                        : isStart
                          ? "rounded-l-md rounded-r-none"
                          : "rounded-r-md rounded-l-none",
                    )
                  : inRange
                    ? "text-text"
                    : isToday
                      ? "rounded-md border border-border-strong text-text hover:bg-surface-2"
                      : c.dim
                        ? "rounded-md text-text-muted/40 hover:bg-surface-2/60 hover:text-text-muted"
                        : "rounded-md text-text-dim hover:bg-surface-2 hover:text-text",
              )}
            >
              {c.d}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* — value helpers — */
type Parsed = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};
const pad = (n: number) => String(n).padStart(2, "0");
function dayNum(p: { year: number; month: number; day: number }) {
  return p.year * 10000 + p.month * 100 + p.day;
}
function parseValue(v: string): Parsed {
  const [d, t] = (v ?? "").split("T");
  const [y, mo, da] = (d ?? "2026-01-01").split("-").map(Number);
  const [h, mi] = (t ?? "00:00").split(":").map(Number);
  return {
    year: y || 2026,
    month: (mo || 1) - 1,
    day: da || 1,
    hour: h || 0,
    minute: mi || 0,
  };
}
function serialize(p: Parsed): string {
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}
function fmtShort(p: Parsed): string {
  const h12 = p.hour % 12 || 12;
  const mer = p.hour >= 12 ? "PM" : "AM";
  return `${p.day} ${MON_SHORT[p.month]}, ${h12}:${pad(p.minute)} ${mer}`;
}
