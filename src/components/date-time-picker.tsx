"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SURFACE_BG = { backgroundColor: "var(--surface)" } as const;
const CARD = "rounded-lg border border-border-strong shadow-xl shadow-black/40";

/**
 * Custom date+time picker with a quick-range rail, month calendar, and a
 * time input. Value/onChange use "YYYY-MM-DDTHH:mm" (input[datetime-local]).
 */
export function DateTimePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string>(value);
  const parsed = parseValue(draft);

  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);
  const [quick, setQuick] = useState<string | null>(null);

  const setDate = (y: number, m: number, d: number) => {
    setDraft(serialize({ ...parsed, year: y, month: m, day: d }));
    setQuick(null);
  };
  const setTime = (h: number, mi: number) => {
    setDraft(serialize({ ...parsed, hour: h, minute: mi }));
    setQuick(null);
  };

  const applyQuick = (key: string) => {
    const now = new Date();
    let dt = new Date(now);
    switch (key) {
      case "now":
        break;
      case "in1h":
        dt.setHours(dt.getHours() + 1);
        break;
      case "tomorrow":
        dt.setDate(dt.getDate() + 1);
        dt.setHours(9, 0, 0, 0);
        break;
      case "nextMon":
        dt.setDate(dt.getDate() + ((1 + 7 - dt.getDay()) % 7 || 7));
        dt.setHours(9, 0, 0, 0);
        break;
      case "in7d":
        dt.setDate(dt.getDate() + 7);
        break;
      case "in30d":
        dt.setDate(dt.getDate() + 30);
        break;
      case "endOfDay":
        dt.setHours(23, 59, 0, 0);
        break;
    }
    setDraft(
      serialize({
        year: dt.getFullYear(),
        month: dt.getMonth(),
        day: dt.getDate(),
        hour: dt.getHours(),
        minute: dt.getMinutes(),
      }),
    );
    setViewYear(dt.getFullYear());
    setViewMonth(dt.getMonth());
    setQuick(key);
  };

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };
  const clear = () => {
    setQuick(null);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        if (v) {
          setDraft(value);
          const p = parseValue(value);
          setViewYear(p.year);
          setViewMonth(p.month);
          setQuick(null);
        }
        setOpen(v);
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "w-full h-9 flex items-center gap-2.5 rounded-md border border-border-strong bg-surface-2 px-3 text-left text-sm transition-colors hover:border-text-muted/40 focus:border-white outline-none",
              className,
            )}
          />
        }
      >
        <Calendar size={13} className="shrink-0 text-text-muted" />
        <span className="flex-1 min-w-0 truncate font-mono text-text tabular-nums">
          {formatDisplay(parseValue(value))}
        </span>
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
        className={cn(CARD, "w-[600px] max-w-[calc(100vw-2rem)] overflow-hidden p-0")}
      >
        <div className="grid grid-cols-[160px_1fr]">
          {/* Quick range rail */}
          <div className="border-r border-border p-2">
            <div className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Quick pick
            </div>
            {QUICK_RANGES.map((q) => {
              const active = quick === q.key;
              return (
                <button
                  key={q.key}
                  type="button"
                  onClick={() => applyQuick(q.key)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                    active
                      ? "bg-surface-2 text-text"
                      : "text-text-dim hover:bg-surface-2/60 hover:text-text",
                  )}
                >
                  <span>{q.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar + time */}
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
              <CalendarGrid
                year={viewYear}
                month={viewMonth}
                selected={
                  parsed.year === viewYear && parsed.month === viewMonth
                    ? parsed.day
                    : null
                }
                onSelect={(y, m, d) => {
                  setViewYear(y);
                  setViewMonth(m);
                  setDate(y, m, d);
                }}
              />
            </div>

            {/* Time input */}
            <div className="px-3 pb-3 border-t border-border pt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Time
              </div>
              <TimeInput
                hour24={parsed.hour}
                minute={parsed.minute}
                onChange={setTime}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-3 py-2.5">
              <button
                type="button"
                onClick={clear}
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
        </div>
      </PopoverContent>
    </Popover>
  );
}

const QUICK_RANGES = [
  { key: "now", label: "Now" },
  { key: "in1h", label: "In 1 hour" },
  { key: "endOfDay", label: "End of day" },
  { key: "tomorrow", label: "Tomorrow 9 AM" },
  { key: "nextMon", label: "Next Monday" },
  { key: "in7d", label: "In 7 days" },
  { key: "in30d", label: "In 30 days" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Monday-first
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function CalendarGrid({
  year,
  month,
  selected,
  onSelect,
}: {
  year: number;
  month: number;
  selected: number | null;
  onSelect: (y: number, m: number, d: number) => void;
}) {
  const cells = useMemo(() => {
    // Monday-first: shift Sunday(0) to position 6
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const arr: { y: number; m: number; d: number; dim: boolean }[] = [];

    // Leading days from prev month
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      arr.push({ y: prevYear, m: prevMonth, d, dim: true });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({ y: year, m: month, d, dim: false });
    }
    // Trailing days to fill grid
    while (arr.length % 7 !== 0 || arr.length < 42) {
      const idx = arr.length - firstDay - daysInMonth + 1;
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      arr.push({ y: nextYear, m: nextMonth, d: idx, dim: true });
      if (arr.length >= 42) break;
    }
    return arr;
  }, [year, month]);

  const today = new Date();
  return (
    <div className="grid grid-cols-7 gap-0.5">
      {cells.map((c, i) => {
        const isToday =
          c.y === today.getFullYear() &&
          c.m === today.getMonth() &&
          c.d === today.getDate();
        const isSelected = !c.dim && c.d === selected;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(c.y, c.m, c.d)}
            className={cn(
              "h-9 rounded-md text-sm transition-colors tabular-nums",
              isSelected
                ? "border border-text-muted text-text font-medium bg-surface-2"
                : isToday
                  ? "text-text font-medium hover:bg-surface-2"
                  : c.dim
                    ? "text-text-muted/40 hover:bg-surface-2/60 hover:text-text-muted"
                    : "text-text-dim hover:bg-surface-2 hover:text-text",
            )}
          >
            {c.d}
          </button>
        );
      })}
    </div>
  );
}

function TimeInput({
  hour24,
  minute,
  onChange,
}: {
  hour24: number;
  minute: number;
  onChange: (h: number, m: number) => void;
}) {
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const update = (h12: number, mi: number, mer: "AM" | "PM") => {
    let h = h12 % 12;
    if (mer === "PM") h += 12;
    onChange(h, mi);
  };

  return (
    <div className="flex h-10 items-center rounded-md border border-border-strong bg-surface-2 overflow-hidden">
      <Clock size={13} className="ml-3 mr-2 shrink-0 text-text-muted" />
      <input
        type="number"
        min={1}
        max={12}
        value={hour12}
        onChange={(e) => {
          const v = Math.min(12, Math.max(1, Number(e.target.value) || 1));
          update(v, minute, meridiem);
        }}
        className="w-10 bg-transparent text-center font-mono text-sm text-text outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-text-muted">:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={String(minute).padStart(2, "0")}
        onChange={(e) => {
          const v = Math.min(59, Math.max(0, Number(e.target.value) || 0));
          update(hour12, v, meridiem);
        }}
        className="w-10 bg-transparent text-center font-mono text-sm text-text outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="ml-auto flex h-full border-l border-border">
        {(["AM", "PM"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => update(hour12, minute, m)}
            className={cn(
              "h-full w-12 text-xs font-mono transition-colors",
              meridiem === m
                ? "bg-white text-black font-semibold"
                : "text-text-muted hover:text-text hover:bg-surface",
            )}
          >
            {m}
          </button>
        ))}
      </div>
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
function parseValue(v: string): Parsed {
  const [d, t] = v.split("T");
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
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}
function formatDisplay(p: Parsed): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const h12 = p.hour % 12 || 12;
  const mer = p.hour >= 12 ? "PM" : "AM";
  return `${pad(p.day)}/${pad(p.month + 1)}/${p.year}, ${pad(h12)}:${pad(p.minute)} ${mer}`;
}
