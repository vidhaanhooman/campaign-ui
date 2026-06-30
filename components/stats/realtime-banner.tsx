"use client";

import { Infinity as InfinityIcon } from "lucide-react";

import { RT_BANNER } from "@/lib/stats-data";

export function RealtimeBanner() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3">
      <InfinityIcon size={16} className="shrink-0 text-emerald-400" />
      <span className="text-xs text-muted-foreground">{RT_BANNER}</span>
    </div>
  );
}
