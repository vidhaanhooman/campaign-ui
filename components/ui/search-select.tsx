"use client";

import * as React from "react";
import { X } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

/**
 * SearchSelect — the single, canonical "dropdown with search" for the whole
 * app, built on the shadcn Combobox. A Select-style trigger button opens a
 * popover with a search field + a filtered list. Options can carry a subtitle,
 * a right-aligned badge, and a leading status dot.
 */
export type SearchOption = {
  value: string;
  label: string;
  sub?: string;
  badge?: string;
  dot?: boolean;
  disabled?: boolean;
};

export function SearchSelect({
  value,
  onChange,
  options,
  icon,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  disabled,
  className,
  contentClassName,
  monoSub,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SearchOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  monoSub?: boolean;
}) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(o) => o && onChange((o as SearchOption).value)}
      itemToStringLabel={(o) => (o as SearchOption)?.label ?? ""}
      disabled={disabled}
    >
      <ComboboxTrigger
        disabled={disabled}
        className={cn(
          "flex h-8 w-full items-center gap-1.5 rounded-lg border border-border bg-transparent px-2.5 text-sm outline-none transition-colors dark:bg-input/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
          {selected ? (
            <>
              {selected.dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />}
              <span className="truncate text-foreground">{selected.label}</span>
            </>
          ) : (
            <span className="truncate text-muted-foreground">{placeholder}</span>
          )}
        </span>
      </ComboboxTrigger>
      <ComboboxContent className={cn("min-w-(--anchor-width)", contentClassName)}>
        <ComboboxInput placeholder={searchPlaceholder} showTrigger={false} />
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(o: SearchOption) => (
            <ComboboxItem key={o.value} value={o} disabled={o.disabled} className="items-start py-1.5">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-1.5 truncate text-sm text-foreground">
                  {o.dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />}
                  {o.label}
                </span>
                {o.sub && (
                  <span className={cn("truncate text-[11px] text-muted-foreground", monoSub && "font-mono")}>
                    {o.sub}
                  </span>
                )}
              </span>
              {o.badge && (
                <span className="ml-2 mt-0.5 inline-flex h-5 shrink-0 items-center rounded-md border border-border px-2 text-[10px] text-muted-foreground">
                  {o.badge}
                </span>
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/**
 * MultiSearchSelect — the canonical multi-select "dropdown with search", on the
 * shadcn Combobox in `multiple` mode. Trigger shows "N selected" + removable
 * chips + Clear; the popup is a searchable checkbox list.
 */
export function MultiSearchSelect({
  value,
  onChange,
  onClear,
  options,
  icon,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  maxChips = 3,
  monoChip,
  disabled,
  className,
  contentClassName,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  onClear?: () => void;
  options: SearchOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  maxChips?: number;
  monoChip?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}) {
  const selected = options.filter((o) => value.includes(o.value));
  const clear = onClear ?? (() => onChange([]));

  return (
    <Combobox
      multiple
      items={options}
      value={selected}
      onValueChange={(arr) => onChange((arr as SearchOption[]).map((o) => o.value))}
      itemToStringLabel={(o) => (o as SearchOption)?.label ?? ""}
      disabled={disabled}
    >
      <ComboboxTrigger
        disabled={disabled}
        className={cn(
          "flex min-h-8 w-full items-center gap-2 rounded-lg border border-border bg-transparent px-3 py-1.5 text-left text-sm outline-none transition-colors dark:bg-input/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        {value.length === 0 ? (
          <span className="flex flex-1 items-center gap-2 text-muted-foreground">
            {icon}
            {placeholder}
          </span>
        ) : (
          <>
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{value.length} selected</span>
              {selected.slice(0, maxChips).map((o) => (
                <span
                  key={o.value}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground shadow-sm",
                    monoChip && "font-mono",
                  )}
                >
                  {o.label}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onChange(value.filter((v) => v !== o.value)); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        e.preventDefault();
                        onChange(value.filter((v) => v !== o.value));
                      }
                    }}
                    className="cursor-pointer text-primary-foreground/60 hover:text-primary-foreground"
                  >
                    <X size={11} />
                  </span>
                </span>
              ))}
              {value.length > maxChips && (
                <span className="text-xs text-muted-foreground">+{value.length - maxChips} more</span>
              )}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); clear(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); clear(); }
              }}
              className="shrink-0 cursor-pointer px-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </span>
          </>
        )}
      </ComboboxTrigger>
      <ComboboxContent className={cn("min-w-(--anchor-width)", contentClassName)}>
        <ComboboxInput placeholder={searchPlaceholder} showTrigger={false} />
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(o: SearchOption) => (
            <ComboboxItem key={o.value} value={o} disabled={o.disabled} className="items-start py-1.5">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={cn("truncate text-sm text-foreground", monoChip && "font-mono")}>{o.label}</span>
                {o.sub && <span className="truncate text-[11px] text-muted-foreground">{o.sub}</span>}
              </span>
              {o.badge && (
                <span className="ml-2 mt-0.5 inline-flex h-5 shrink-0 items-center rounded-md border border-border px-2 text-[10px] text-muted-foreground">
                  {o.badge}
                </span>
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
