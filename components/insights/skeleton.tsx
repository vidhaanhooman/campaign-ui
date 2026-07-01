import { cn } from "@/lib/utils";

/** Simple pulsing placeholder for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-secondary", className)} />;
}
