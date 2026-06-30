"use client";

import * as React from "react";
import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Small `i` icon that reveals an explanation on hover/focus.
 * Wired up to use the page's TooltipProvider.
 */
export function InfoHint({
  children,
  className,
  side = "top",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="More info"
            className={cn(
              "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none",
              className,
            )}
          >
            <Info size={11} />
          </button>
        }
      />
      <TooltipContent side={side} className="max-w-[220px] text-xs leading-snug">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
