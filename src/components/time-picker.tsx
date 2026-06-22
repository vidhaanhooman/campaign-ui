"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Meridiem = "AM" | "PM";

const SURFACE_BG = { backgroundColor: "var(--surface)" } as const;
const CARD =
  "rounded-lg border border-border-strong shadow-xl shadow-black/40";

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
              "flex h-[52px] items-center gap-3 rounded-md border border-border-strong bg-surface-2 px-3 text-left transition-colors hover:border-text-muted/40 focus:border-white outline-none",
              className,
            )}
          />
        }
      >
        <div className="min-w-0 flex-1">
          {label && (
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {label}
            </div>
          )}
          <div className="mt-0.5 font-mono text-sm leading-tight tabular-nums">
            <span className="font-medium text-text">{display}</span>
            <span className="ml-1.5 text-text-muted">{meridiem}</span>
          </div>
        </div>
        <Clock size={13} className="shrink-0 text-text-muted" />
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
        className="pointer-events-none absolute left-2 right-2 top-1/2 -translate-y-1/2 z-0 rounded-md bg-surface-2 border border-border-strong"
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
            "linear-gradient(to bottom, var(--surface) 30%, transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
        style={{
          height: PAD,
          background:
            "linear-gradient(to top, var(--surface) 30%, transparent)",
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
                ? "text-[15px] font-bold text-text"
                : "text-[13px] text-text-muted/40 hover:text-text",
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
