"use client";

import { Flag } from "lucide-react";

import { MultiSearchSelect, type SearchOption } from "@/components/ui/search-select";
import { OUTCOME_GROUPS } from "@/lib/campaign-data";

export function OutcomePicker({
  outcomes,
  onToggle,
  onClear,
  className,
}: {
  outcomes: string[];
  onToggle: (o: string) => void;
  onClear: () => void;
  className?: string;
}) {
  const options: SearchOption[] = OUTCOME_GROUPS.flatMap((g) =>
    g.outcomes.map((o) => ({ value: o, label: o, badge: g.label })),
  );

  const apply = (next: string[]) => {
    const cur = new Set(outcomes);
    const nxt = new Set(next);
    outcomes.forEach((o) => !nxt.has(o) && onToggle(o));
    next.forEach((o) => !cur.has(o) && onToggle(o));
  };

  return (
    <MultiSearchSelect
      value={outcomes}
      onChange={apply}
      onClear={onClear}
      options={options}
      icon={<Flag size={13} />}
      placeholder="Add outcomes"
      searchPlaceholder="Search outcomes…"
      emptyText="No outcomes found."
      monoChip
      className={className}
    />
  );
}
