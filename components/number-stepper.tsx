"use client";

import { useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  suffix,
  className,
  inputClassName,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  inputClassName?: string;
}) {
  const draggingRef = useRef(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const startScrub = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startVal = Number(value) || 0;
    draggingRef.current = false;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 2) draggingRef.current = true;
      const next = Math.round(startVal + dx / 2) * step;
      onChange(clamp(next));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setTimeout(() => {
        draggingRef.current = false;
      }, 0);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div
      className={cn(
        "group relative flex h-8 items-stretch overflow-hidden rounded-lg border border-input bg-transparent dark:bg-secondary transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      <input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(0);
          onChange(clamp(Number(raw)));
        }}
        min={min}
        max={max === Infinity ? undefined : max}
        step={step}
        className={cn(
          "w-full min-w-0 bg-transparent px-3 text-left font-mono text-sm text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          inputClassName,
        )}
      />
      {suffix && (
        <span className="pointer-events-none flex items-center pr-2 text-xs font-mono text-muted-foreground">
          {suffix}
        </span>
      )}
      <div
        onPointerDown={startScrub}
        title="Drag to adjust"
        className="flex cursor-ew-resize select-none flex-col border-l border-input/70 bg-card/40"
        style={{ width: 22 }}
      >
        <button
          type="button"
          tabIndex={-1}
          disabled={atMax}
          onClick={(e) => {
            if (draggingRef.current) {
              e.preventDefault();
              return;
            }
            onChange(clamp(value + step));
          }}
          className={cn(
            "flex h-1/2 w-full items-center justify-center transition-colors",
            atMax
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-card",
          )}
        >
          <ChevronUp size={11} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          disabled={atMin}
          onClick={(e) => {
            if (draggingRef.current) {
              e.preventDefault();
              return;
            }
            onChange(clamp(value - step));
          }}
          className={cn(
            "flex h-1/2 w-full items-center justify-center border-t border-input/70 transition-colors",
            atMin
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-card",
          )}
        >
          <ChevronDown size={11} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
