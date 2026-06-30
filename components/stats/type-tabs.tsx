"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { label: "Batch", href: "/stats" },
  { label: "Realtime", href: "/realtime-stats" },
];

export function StatsTypeTabs() {
  const pathname = usePathname();
  return (
    <div className="inline-flex h-8 items-center gap-0.5 rounded-md border border-border bg-secondary/30 p-0.5">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "inline-flex h-7 items-center rounded-[5px] px-3 text-xs transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
