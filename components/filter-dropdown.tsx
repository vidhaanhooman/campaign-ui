"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronRight, Filter as FunnelIcon, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// -------- Public types --------
export type FilterValue = string[] | NumberRange | NumberPick | string | null;
export interface NumberRange { kind: "range"; min: number | null; max: number | null }
export interface NumberPick  { kind: "pick";  value: "any" | number | { ge: number } }
export type FilterValues = Record<string, FilterValue>;

interface BaseCategory {
  id: string; label: string; icon: ReactNode;
  disabled?: (v: FilterValues) => { reason: string } | false;
}
export interface MultiSelectCategory extends BaseCategory {
  type: "multi-select";
  options: { value: string; label: string; dot?: string; count?: number }[];
  searchable?: boolean; placeholder?: string;
}
export interface RangeCategory extends BaseCategory {
  type: "range"; min: number; max: number; step?: number; unit?: string;
}
export interface PillCategory extends BaseCategory { type: "pill"; maxExact?: number }
export interface TextCategory extends BaseCategory { type: "text"; placeholder?: string }
export interface CustomCategory extends BaseCategory {
  type: "custom";
  render: (ctx: { value: FilterValue | undefined; setValue: (v: FilterValue | null) => void; close: () => void }) => ReactNode;
  width?: number;
}
export type Category = MultiSelectCategory | RangeCategory | PillCategory | TextCategory | CustomCategory;
export interface FilterSection { title?: string; items: Category[] }
export interface QuickFilter { id: string; label: string; icon: ReactNode; values: FilterValues }

export interface FilterDropdownProps {
  schema: FilterSection[];
  value: FilterValues;
  onChange: (next: FilterValues) => void;
  quickFilters?: QuickFilter[];
  triggerLabel?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  width?: number;
  className?: string;
}

// -------- Style constants (campaign-b0 tokens) --------
const CARD    = "rounded-xl border border-border bg-[#090909]";
const CONTROL = "flex h-8 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function isActive(v: FilterValue | undefined): boolean {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "object" && "kind" in v) {
    if (v.kind === "range") return v.min != null || v.max != null;
    if (v.kind === "pick")  return v.value !== "any";
  }
  return false;
}

// -------- Main --------
export function FilterDropdown({
  schema, value, onChange, quickFilters,
  triggerLabel = "Filter", align = "end", side = "bottom", width = 320, className,
}: FilterDropdownProps) {
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ]           = useState("");

  const query = q.trim().toLowerCase();
  const visibleSections = useMemo(() => {
    if (!query) return schema;
    return schema
      .map(s => ({ ...s, items: s.items.filter(c => c.label.toLowerCase().includes(query)) }))
      .filter(s => s.items.length > 0);
  }, [schema, query]);

  const activeCount = useMemo(() => Object.values(value).filter(isActive).length, [value]);
  const allCats     = useMemo(() => schema.flatMap(s => s.items), [schema]);
  const activeCat   = active === "__quick__" ? null : (allCats.find(c => c.id === active) ?? null);
  const setOne = (id: string, v: FilterValue | null) => onChange({ ...value, [id]: v });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <button type="button" className={cn(CONTROL, "gap-1.5 px-3 text-xs font-medium",
                    activeCount > 0 && "border-foreground/30", className)}>
          <FunnelIcon size={14} className="text-muted-foreground" />
          {triggerLabel}
          {activeCount > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-md bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      } />

      <PopoverContent align={align} side={side} style={{ width }}
          className={cn(CARD, "flex max-h-[80vh] flex-col overflow-hidden p-0 shadow-xl")}>
        {/* Search */}
        <div className="border-b border-white/[0.04] p-2">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.06] bg-transparent px-2.5">
            <Search size={13} className="shrink-0 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search filters…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          </div>
        </div>

        {/* Active count strip */}
        {activeCount > 0 && (
          <div className="flex items-center gap-1.5 border-b border-white/[0.04] px-3 py-2 text-xs text-muted-foreground">
            <span><span className="font-medium text-foreground">{activeCount}</span> active</span>
            <span className="text-muted-foreground/60">·</span>
            <button type="button" onClick={() => onChange({})}
              className="text-muted-foreground hover:text-foreground">Clear all</button>
          </div>
        )}

        {/* Category list */}
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto py-1">
          {quickFilters && quickFilters.length > 0 && !query && (
            <>
              <Row label="Quick filters" icon={<FunnelIcon size={15} />}
                isActive={active === "__quick__"}
                onClick={() => setActive(active === "__quick__" ? null : "__quick__")} />
              {active === "__quick__" && (
                <div className="mx-1 my-1 flex flex-col rounded-lg border border-white/[0.06] p-1">
                  {quickFilters.map(qf => (
                    <button key={qf.id} type="button"
                      onClick={() => { onChange(qf.values); setOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-white/[0.04]">
                      <span className="shrink-0 text-muted-foreground">{qf.icon}</span>
                      <span className="flex-1 truncate">{qf.label}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="my-1 h-px bg-white/[0.04]" />
            </>
          )}

          {visibleSections.length === 0 && (
            <p className="px-3 py-3 text-center text-xs text-muted-foreground">No matching filters.</p>
          )}

          {visibleSections.map((section, si) => (
            <div key={si}>
              {si > 0 && <div className="my-1 h-px bg-white/[0.04]" />}
              {section.title && (
                <div className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">{section.title}</div>
              )}
              {section.items.map(cat => {
                const on             = isActive(value[cat.id]);
                const disabledResult = cat.disabled?.(value);
                const isDisabled     = !!disabledResult;
                const isOpen         = active === cat.id;
                return (
                  <div key={cat.id}>
                    <Row label={cat.label} icon={cat.icon} hasDot={on}
                      disabled={isDisabled}
                      disabledReason={disabledResult ? disabledResult.reason : undefined}
                      isActive={isOpen}
                      onClick={() => !isDisabled && setActive(isOpen ? null : cat.id)} />
                    {isOpen && (
                      <div className="mx-1 my-1 rounded-lg border border-white/[0.06] p-2">
                        <EditorForCategory cat={cat} value={value[cat.id]}
                          onChange={v => setOne(cat.id, v)} close={() => setActive(null)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// -------- Row --------
function Row({ label, icon, hasDot, disabled, disabledReason, isActive, onClick }: {
  label: string; icon: ReactNode; hasDot?: boolean;
  disabled?: boolean; disabledReason?: string;
  isActive?: boolean; onClick: () => void;
}) {
  return (
    <button type="button" disabled={disabled} title={disabledReason} onClick={onClick}
      className={cn(
        "mx-1 flex w-[calc(100%-8px)] items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
        disabled && "cursor-not-allowed text-muted-foreground/50",
        !disabled && isActive  && "bg-white/[0.06] text-foreground",
        !disabled && !isActive && "text-foreground hover:bg-white/[0.04]",
      )}>
      <span className={cn("shrink-0", disabled ? "text-muted-foreground/50" : "text-muted-foreground")}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {hasDot && !disabled && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: "var(--chart-1)" }} aria-label="Active" />
      )}
      <ChevronRight size={14}
        className={cn("shrink-0 transition-transform",
          disabled ? "text-muted-foreground/50" : "text-muted-foreground",
          isActive && "rotate-90")} />
    </button>
  );
}

// -------- Editors --------
function EditorForCategory({ cat, value, onChange, close }: {
  cat: Category; value: FilterValue | undefined;
  onChange: (v: FilterValue | null) => void; close: () => void;
}) {
  switch (cat.type) {
    case "multi-select":
      return <MultiSelectEditor cat={cat} value={(value as string[]) ?? []} onChange={onChange} />;
    case "range":
      return <RangeEditor cat={cat}
        value={(value as NumberRange) ?? { kind: "range", min: null, max: null }} onChange={onChange} />;
    case "pill":
      return <PillEditor cat={cat}
        value={(value as NumberPick) ?? { kind: "pick", value: "any" }} onChange={onChange} />;
    case "text":
      return <TextEditor cat={cat} value={(value as string) ?? ""} onChange={onChange} />;
    case "custom":
      return <>{cat.render({ value, setValue: onChange, close })}</>;
  }
}

function MultiSelectEditor({ cat, value, onChange }: {
  cat: MultiSelectCategory; value: string[]; onChange: (v: string[] | null) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list  = useMemo(() => cat.options.filter(o => o.label.toLowerCase().includes(query)), [cat.options, query]);
  const toggle = (v: string) => {
    const next = value.includes(v) ? value.filter(x => x !== v) : [...value, v];
    onChange(next.length ? next : null);
  };
  return (
    <div className="space-y-2">
      {(cat.searchable ?? cat.options.length > 6) && (
        <div className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.06] bg-transparent px-2.5">
          <Search size={13} className="shrink-0 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder={cat.placeholder ?? "Search…"}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
        </div>
      )}
      <ul className="scroll-thin max-h-56 overflow-y-auto pr-1">
        {list.map(o => {
          const on = value.includes(o.value);
          return (
            <li key={o.value}>
              <button type="button" onClick={() => toggle(o.value)}
                className={cn("flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors",
                  on ? "bg-white/[0.06]" : "hover:bg-white/[0.04]")}>
                <CheckBox checked={on} />
                {o.dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", o.dot)} />}
                <span className={cn("flex-1 truncate text-sm", on ? "text-foreground" : "text-foreground/90")}>
                  {o.label}
                </span>
                {o.count != null && (
                  <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{o.count}</span>
                )}
              </button>
            </li>
          );
        })}
        {list.length === 0 && (
          <li className="px-3 py-4 text-center text-xs text-muted-foreground">No matches.</li>
        )}
      </ul>
    </div>
  );
}

function RangeEditor({ cat, value, onChange }: {
  cat: RangeCategory; value: NumberRange; onChange: (v: NumberRange | null) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<"lo" | "hi" | null>(null);
  const step = cat.step ?? 1;
  const lo   = value.min ?? cat.min;
  const hi   = value.max ?? cat.max;
  const span = cat.max - cat.min || 1;
  const pct  = (v: number) => ((v - cat.min) / span) * 100;

  const emit = (nextLo: number, nextHi: number) => {
    const a = Math.min(Math.max(nextLo, cat.min), nextHi);
    const b = Math.max(Math.min(nextHi, cat.max), nextLo);
    const min = a <= cat.min ? null : Math.round(a);
    const max = b >= cat.max ? null : Math.round(b);
    if (min == null && max == null) onChange(null);
    else onChange({ kind: "range", min, max });
  };

  const valFromX = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return cat.min;
    const ratio = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    return Math.round((cat.min + ratio * span) / step) * step;
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const v = valFromX(e.clientX);
      if (drag === "lo") emit(v, hi); else emit(lo, v);
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup",   up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup",   up);
    };
  }, [drag, lo, hi]);

  return (
    <div className="space-y-3 p-1">
      <div ref={trackRef} className="relative mx-2 h-5 cursor-pointer select-none"
        onPointerDown={e => {
          const v = valFromX(e.clientX);
          const which = Math.abs(v - lo) <= Math.abs(v - hi) ? "lo" : "hi";
          if (which === "lo") emit(v, hi); else emit(lo, v);
          setDrag(which);
        }}>
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
        <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        {(["lo", "hi"] as const).map(which => {
          const v = which === "lo" ? lo : hi;
          return (
            <button key={which} type="button"
              aria-label={which === "lo" ? "Minimum" : "Maximum"}
              onPointerDown={e => {
                e.stopPropagation();
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                setDrag(which);
              }}
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-md shadow-black/40 hover:scale-110"
              style={{ left: `${pct(v)}%` }} />
          );
        })}
      </div>
      <div className="flex w-full items-center gap-2">
        <NumBox value={value.min} placeholder={String(cat.min)} unit={cat.unit}
          onChange={n => emit(n ?? cat.min, hi)} />
        <span className="shrink-0 text-muted-foreground">—</span>
        <NumBox value={value.max} placeholder={String(cat.max)} unit={cat.unit}
          onChange={n => emit(lo, n ?? cat.max)} />
      </div>
    </div>
  );
}

function NumBox({ value, placeholder, unit, onChange }: {
  value: number | null; placeholder: string; unit?: string;
  onChange: (n: number | null) => void;
}) {
  return (
    <div className="flex h-8 min-w-0 flex-1 items-center gap-1 rounded-lg border border-border bg-card px-2.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <input type="number" inputMode="numeric" value={value ?? ""} placeholder={placeholder}
        onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="min-w-0 flex-1 bg-transparent text-center font-mono text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground" />
      {unit && <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">{unit}</span>}
    </div>
  );
}

function PillEditor({ cat, value, onChange }: {
  cat: PillCategory; value: NumberPick; onChange: (v: NumberPick | null) => void;
}) {
  const maxExact  = cat.maxExact ?? 4;
  const plusValue = maxExact + 1;
  const pick = (v: NumberPick["value"]) => {
    if (v === "any") onChange(null);
    else onChange({ kind: "pick", value: v });
  };
  const pills = [
    { key: "any", label: "Any", v: "any" as const, on: value.value === "any" },
    ...Array.from({ length: maxExact }, (_, i) => i + 1).map(n => ({
      key: String(n), label: String(n), v: n, on: value.value === n,
    })),
    {
      key: "plus", label: `${plusValue}+`, v: { ge: plusValue } as const,
      on: typeof value.value === "object" && "ge" in value.value && value.value.ge === plusValue,
    },
  ];
  return (
    <div className="flex flex-wrap gap-1 p-1">
      {pills.map(p => (
        <button key={p.key} type="button" onClick={() => pick(p.v)} aria-pressed={p.on}
          className={cn("inline-flex h-8 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-medium transition-colors",
            p.on ? "bg-primary text-primary-foreground shadow-sm"
                 : "border border-border bg-card text-foreground hover:bg-white/[0.04]")}>
          {p.label}
        </button>
      ))}
    </div>
  );
}

function TextEditor({ cat, value, onChange }: {
  cat: TextCategory; value: string; onChange: (v: string | null) => void;
}) {
  return (
    <input autoFocus value={value} onChange={e => onChange(e.target.value || null)}
      placeholder={cat.placeholder ?? "contains…"}
      className="h-8 w-full rounded-lg border border-border bg-card px-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
        checked ? "border-foreground bg-foreground text-background" : "border-white/25")}>
      {checked && <Check size={11} strokeWidth={3} />}
    </span>
  );
}
