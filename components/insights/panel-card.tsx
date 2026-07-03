"use client";

import * as React from "react";
import {
  Bell,
  Download,
  Maximize2,
  MoreHorizontal,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChartToolbar } from "./chart-toolbar";
import { SegmentedToggle } from "./segmented-toggle";

export interface EnlargedView {
  key: string;
  label: string;
  node: React.ReactNode;
}

/**
 * Insights panel card — titled surface with hover actions (refresh / enlarge).
 * Refresh re-mounts the children so their data hooks re-run; enlarge opens the
 * content in a wider dialog with a filter toolbar and optional view toggle.
 */
export function PanelCard({
  title,
  children,
  className,
  onEdit,
  enlargedViews,
  enlargedContent,
  dialogClassName = "!max-w-3xl",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  onEdit?: () => void;
  /** Optional alternate views shown (with a toggle) in the enlarge dialog. */
  enlargedViews?: EnlargedView[];
  /** Full custom node rendered in the enlarge dialog (overrides children/views). */
  enlargedContent?: React.ReactNode;
  dialogClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  // Bumping this re-mounts the panel content, re-running its data hooks.
  const [nonce, setNonce] = React.useState(0);
  const [view, setView] = React.useState(enlargedViews?.[0]?.key ?? "");
  const activeView =
    enlargedViews?.find((v) => v.key === view) ?? enlargedViews?.[0];

  return (
    <>
      <section
        className={cn(
          "group flex flex-col overflow-hidden rounded-xl border border-border bg-[#333333]/30",
          className,
        )}
      >
        <header className="flex items-center gap-2 px-5 pt-4 pb-3">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <IconButton label="Refresh" onClick={() => setNonce((n) => n + 1)}>
              <RefreshCw size={13} />
            </IconButton>
            <IconButton label="Enlarge" onClick={() => setOpen(true)}>
              <Maximize2 size={13} />
            </IconButton>
            <MoreMenu
              onRefresh={() => setNonce((n) => n + 1)}
              onEdit={onEdit}
            />
          </div>
        </header>
        <div className="flex-1 px-5 pb-5">
          <React.Fragment key={nonce}>{children}</React.Fragment>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={enlargedContent ? "!max-w-5xl" : dialogClassName}>
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle>{title}</DialogTitle>
              {!enlargedContent && enlargedViews && enlargedViews.length > 1 && (
                <SegmentedToggle
                  value={activeView?.key ?? ""}
                  onChange={setView}
                  options={enlargedViews.map((v) => ({
                    value: v.key,
                    label: v.label,
                  }))}
                />
              )}
            </div>
          </DialogHeader>
          <ChartToolbar />
          <div className="max-h-[72vh] overflow-y-auto pt-1">
            {enlargedContent ?? (activeView ? activeView.node : children)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </button>
  );
}

function MoreMenu({
  onRefresh,
  onEdit,
}: {
  onRefresh: () => void;
  /** Only rendered when provided — insights panels without a real editor omit it. */
  onEdit?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="More actions"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MoreHorizontal size={15} />
          </button>
        }
      />
      <PopoverContent align="end" sideOffset={6} className="w-44 p-1">
        <MenuItem icon={<RefreshCw size={14} />} onClick={() => run(onRefresh)}>
          Refresh
        </MenuItem>
        <MenuItem
          icon={<SlidersHorizontal size={14} />}
          onClick={() => onEdit && run(onEdit)}
          disabled={!onEdit}
        >
          Edit…
        </MenuItem>
        <MenuItem icon={<Download size={14} />} disabled>
          Download image
        </MenuItem>
        <MenuItem icon={<Bell size={14} />} disabled>
          Create alarm
        </MenuItem>
      </PopoverContent>
    </Popover>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40 [&>svg]:text-muted-foreground"
    >
      {icon}
      {children}
    </button>
  );
}
