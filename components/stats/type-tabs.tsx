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
    <div className="inline-flex h-8 items-center gap-1 rounded-xl border border-border bg-input/30 p-1">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
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
