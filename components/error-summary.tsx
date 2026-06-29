"use client";

import { AlertTriangle } from "lucide-react";

export function ErrorSummary({
  title,
  errors,
}: {
  title?: string;
  errors: string[];
}) {
  if (errors.length === 0) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-red-400/40 bg-red-400/[0.08] px-4 py-3"
    >
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-red-400">
        <AlertTriangle size={14} strokeWidth={2.5} />
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-sm font-medium text-red-400">
          {title ?? `Fix ${errors.length} ${errors.length === 1 ? "issue" : "issues"} to continue`}
        </div>
        <ul className="space-y-0.5">
          {errors.map((e, i) => (
            <li
              key={i}
              className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5"
            >
              <span className="text-red-400 mt-0.5">·</span>
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
