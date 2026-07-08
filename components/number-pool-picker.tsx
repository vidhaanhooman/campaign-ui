"use client";

import { Phone } from "lucide-react";

import { MultiSearchSelect, type SearchOption } from "@/components/ui/search-select";
import { NUMBERS } from "@/lib/campaign-data";

export function NumberPoolPicker({
  pool,
  onToggle,
  onClear,
  className,
}: {
  pool: string[];
  onToggle: (n: string) => void;
  onClear: () => void;
  className?: string;
}) {
  const options: SearchOption[] = NUMBERS.map((n) => ({ value: n, label: n }));

  // Combobox reports the full next selection; toggle each item that changed.
  const apply = (next: string[]) => {
    const cur = new Set(pool);
    const nxt = new Set(next);
    pool.forEach((n) => !nxt.has(n) && onToggle(n));
    next.forEach((n) => !cur.has(n) && onToggle(n));
  };

  return (
    <MultiSearchSelect
      value={pool}
      onChange={apply}
      onClear={onClear}
      options={options}
      icon={<Phone size={13} />}
      placeholder="Select calling numbers"
      searchPlaceholder="Search numbers…"
      emptyText="No numbers found."
      monoChip
      className={className}
    />
  );
}
