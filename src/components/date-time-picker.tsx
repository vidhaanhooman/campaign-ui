"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SURFACE_BG = { backgroundColor: "var(--surface)" } as const;
const CARD = "rounded-lg border border-border-strong shadow-xl shadow-black/40";

/**
 * Date-only picker. Value/onChange use the full "YYYY-MM-DDTHH:mm" string —
 * only the date is edited; the time is preserved. Trigger matches the dark
 * TimePicker (stacked label) so Date + Time fields sit uniformly.
 */
export function DatePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const p = parseValue(value);
  const [viewYear, setViewYear] = useState(p.year);
  const [viewMonth, setViewMonth] = useState(p.month);
  const fmt = `${String(p.day).padStart(2, "0")}/${String(p.month + 1).padStart(2, "0")}/${p.year}`;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        if (v) {
          const pp = parseValue(value);
          setViewYear(pp.year);
          setViewMonth(pp.month);
        }
        setOpen(v);
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex h-[52px] items-center gap-3 rounded-md border border-border-strong bg-surface-2 px-3 text-left transition-colors hover:border-text-muted/40 focus:border-white outline-none",
              className,
            )}
          />
        }
      >
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Date
          </div>
          <div className="mt-0.5 font-mono text-sm leading-tight tabular-nums text-text">
            {fmt}
          </div>
        </div>
        <Calendar size={13} className="shrink-0 text-text-muted" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={16}
        style={SURFACE_BG}
        className={cn(CARD, "w-[300px] overflow-hidden p-0")}
      >
        <div className="flex flex-col">
          <div className="flex h-11 items-center justify-between border-b border-border px-4">
            <button
              type="button"
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
              type="button"
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
            <div className="mb-1 grid grid-cols-7">
              {DOW.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-text-muted"
                >
                  {d}
                </div>
              ))}
            </div>
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selected={
                p.year === viewYear && p.month === viewMonth ? p.day : null
              }
              onSelect={(y, m, d) => {
                onChange(serialize({ ...p, year: y, month: m, day: d }));
                setOpen(false);
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const arr: { y: number; m: number; d: number; dim: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      arr.push({
        y: month === 0 ? year - 1 : year,
        m: month === 0 ? 11 : month - 1,
        d,
        dim: true,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({ y: year, m: month, d, dim: false });
    }
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
                ? "border border-text-muted bg-surface-2 font-medium text-text"
                : isToday
                  ? "font-medium text-text hover:bg-surface-2"
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
