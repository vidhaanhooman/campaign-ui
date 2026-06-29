"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { CaretDownIcon } from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* Default-style trigger (matches every other input) that opens the time wheel. */
const TIME_TRIGGER_CLASS =
  "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent dark:bg-secondary py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export function TimeField({
  value,
  onChange,
  placeholder = "Time",
  className,
}: {
  value: string; // "HH:mm" 24h
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button type="button" className={cn(TIME_TRIGGER_CLASS, className)}>
            <span
              className={cn(
                "flex-1 min-w-0 truncate text-left",
                value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {value ? to12hLabel(value) : placeholder}
            </span>
            <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent align="start" className="w-[228px] overflow-hidden p-0">
        <TimeWheel value={value || "10:00"} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}

function to12hLabel(v: string) {
  const [h, m] = v.split(":").map(Number);
  const am = h < 12;
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}

type Meridiem = "AM" | "PM";

function to12h(v: string) {
  const [h, m] = v.split(":").map(Number);
  const am = h < 12;
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}

const TIME_SELECT_OPTIONS: string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
})();

/** Default Select-based time dropdown (30-min steps, 12h labels). */
export function TimeSelect({
  value,
  onChange,
  placeholder = "Time",
  className,
}: {
  value: string; // "HH:mm" 24h
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const options =
    value && !TIME_SELECT_OPTIONS.includes(value)
      ? [...TIME_SELECT_OPTIONS, value].sort((a, b) => a.localeCompare(b))
      : TIME_SELECT_OPTIONS;
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {(val: string | null) => (val ? to12h(val) : placeholder)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {to12h(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const SURFACE_BG = { backgroundColor: "var(--card)" } as const;
const CARD =
  "rounded-lg border border-input shadow-xl shadow-black/40";

const ITEM_H = 32;
const COL_H = 192;
const PAD = (COL_H - ITEM_H) / 2;

export function TimePicker({
  value,
  onChange,
  label,
  className,
}: {
  value: string; // "HH:mm" 24h
  onChange: (v: string) => void;
  label?: string;
  className?: string;
}) {
  const [h24Str = "0", mStr = "0"] = value.split(":");
  const h24 = Number(h24Str);
  const m = Number(mStr);
  const meridiem: Meridiem = h24 >= 12 ? "PM" : "AM";
  const hour12 = h24 % 12 || 12;
  const display = `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex h-[52px] items-center gap-3 rounded-md border border-input bg-secondary px-3 text-left transition-colors hover:border-muted-foreground/40 focus:border-white outline-none",
              className,
            )}
          />
        }
      >
        <div className="min-w-0 flex-1">
          {label && (
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
          )}
          <div className="mt-0.5 font-mono text-sm leading-tight tabular-nums">
            <span className="font-medium text-foreground">{display}</span>
            <span className="ml-1.5 text-muted-foreground">{meridiem}</span>
          </div>
        </div>
        <Clock size={13} className="shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        style={SURFACE_BG}
        className={cn(CARD, "w-[228px] overflow-hidden p-0")}
      >
        <TimeWheel value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}

/** The scroll-wheel time selector, usable inline (e.g. inside another popover). */
export function TimeWheel({
  value,
  onChange,
}: {
  value: string; // "HH:mm" 24h
  onChange: (v: string) => void;
}) {
  const [h24Str = "0", mStr = "0"] = value.split(":");
  const h24 = Number(h24Str);
  const m = Number(mStr);
  const meridiem: Meridiem = h24 >= 12 ? "PM" : "AM";
  const hour12 = h24 % 12 || 12;

  const update = (h: number, mins: number, mer: Meridiem) => {
    let next = h % 12;
    if (mer === "PM") next += 12;
    onChange(
      `${String(next).padStart(2, "0")}:${String(mins).padStart(2, "0")}`,
    );
  };

  return (
    <div className="relative" style={{ height: COL_H }}>
      {/* center selection band — sits BEHIND items so values show through */}
      <div
        className="pointer-events-none absolute left-2 right-2 top-1/2 -translate-y-1/2 z-0 rounded-md bg-secondary border border-input"
        style={{ height: ITEM_H }}
      />

      <div className="relative z-10 grid h-full grid-cols-3">
        <Column
          items={Array.from({ length: 12 }, (_, i) => i + 1)}
          value={hour12}
          onSelect={(v) => update(v, m, meridiem)}
          renderLabel={(v) => String(v).padStart(2, "0")}
        />
        <Column
          items={Array.from({ length: 60 }, (_, i) => i)}
          value={m}
          onSelect={(v) => update(hour12, v, meridiem)}
          renderLabel={(v) => String(v).padStart(2, "0")}
        />
        <Column<Meridiem>
          items={["AM", "PM"]}
          value={meridiem}
          onSelect={(v) => update(hour12, m, v)}
          renderLabel={(v) => v}
        />
      </div>

      {/* top fade — covers off-center items at the edges */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20"
        style={{
          height: PAD,
          background:
            "linear-gradient(to bottom, var(--card) 30%, transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
        style={{
          height: PAD,
          background:
            "linear-gradient(to top, var(--card) 30%, transparent)",
        }}
      />
    </div>
  );
}

function Column<T extends string | number>({
  items,
  value,
  onSelect,
  renderLabel,
}: {
  items: readonly T[];
  value: T;
  onSelect: (v: T) => void;
  renderLabel: (v: T) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const snapTimerRef = useRef<number | null>(null);

  // Center the selected item when value changes (open / external change)
  useEffect(() => {
    if (!ref.current) return;
    const idx = items.indexOf(value);
    if (idx < 0) return;
    const target = idx;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const item = el.querySelector<HTMLElement>(`[data-idx="${target}"]`);
        if (!item) return;
        el.scrollTop =
          item.offsetTop - el.clientHeight / 2 + item.offsetHeight / 2;
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [value, items]);

  // After the user finishes scrolling, snap value to whatever's centered.
  const handleScroll = () => {
    if (snapTimerRef.current) window.clearTimeout(snapTimerRef.current);
    snapTimerRef.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const center = el.scrollTop + el.clientHeight / 2;
      const idx = Math.round((center - PAD - ITEM_H / 2) / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      if (items[clamped] !== value) onSelect(items[clamped]);
    }, 120);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="scroll-hidden overflow-y-auto"
      style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      <div style={{ height: PAD }} />
      {items.map((item, i) => {
        const selected = item === value;
        return (
          <button
            key={i}
            data-idx={i}
            type="button"
            onClick={() => onSelect(item)}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
            className={cn(
              "flex w-full items-center justify-center font-mono tabular-nums transition-all",
              selected
                ? "text-sm font-medium text-foreground"
                : "text-sm text-muted-foreground/40 hover:text-foreground",
            )}
          >
            {renderLabel(item)}
          </button>
        );
      })}
      <div style={{ height: PAD }} />
    </div>
  );
}
