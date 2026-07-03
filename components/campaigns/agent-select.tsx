"use client";

import * as React from "react";
import { Bot, Check, ChevronDown, GitBranch, Search } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AGENT_DETAILS } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   Two separate pickers — Agent and Version — mirroring the reference.
   Both use the shared Popover primitive and DS tokens so they look
   identical to /stats selects.
   ═══════════════════════════════════════════════════════════════════════ */

/** Shared trigger that reads as a Select — used by both Agent and Version. */
function TriggerButton({
  icon,
  placeholder,
  primary,
  secondary,
  disabled,
  ...props
}: React.ComponentProps<"button"> & {
  icon: React.ReactNode;
  placeholder: string;
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex h-8 w-full items-center gap-1.5 rounded-lg border border-sidebar-border/30 bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-secondary",
      )}
      {...props}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
        {primary ? (
          <>
            <span className="truncate text-foreground">{primary}</span>
            {secondary && (
              <span className="truncate text-muted-foreground">· {secondary}</span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </span>
      <ChevronDown size={13} className="shrink-0 text-muted-foreground" />
    </button>
  );
}

/* ── Agent picker ────────────────────────────────────────────────────── */

export function AgentSelect({
  agentId,
  onChange,
}: {
  agentId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const agent = AGENT_DETAILS.find((a) => a.id === agentId);
  const filtered = AGENT_DETAILS.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <TriggerButton
            icon={<Bot size={14} />}
            placeholder="Select agent"
            primary={agent?.name}
          />
        }
      />
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[380px] overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex h-11 items-center gap-2 border-b border-sidebar-border/30 px-4">
          <Bot size={13} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Agent</span>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        {/* Search */}
        <div className="border-b border-sidebar-border/30 p-2">
          <div className="flex h-8 items-center gap-2 rounded-md border border-sidebar-border/30 bg-transparent px-2.5 dark:bg-secondary">
            <Search size={13} className="shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>
        {/* List */}
        <div className="scroll-thin max-h-[260px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No agents match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((a) => {
              const selected = a.id === agentId;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    onChange(a.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                    selected
                      ? "bg-secondary"
                      : "hover:bg-secondary/60",
                  )}
                >
                  <Checkbox checked={selected} />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm leading-tight",
                        selected
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {a.name}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] leading-tight text-muted-foreground">
                      {a.id}
                    </span>
                  </span>
                  <span className="inline-flex h-5 shrink-0 items-center rounded-md border border-sidebar-border/15 bg-secondary px-2 text-[10px] text-muted-foreground">
                    {a.mode}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Version picker ──────────────────────────────────────────────────── */

export function VersionSelect({
  agentId,
  versionName,
  onChange,
}: {
  agentId: string;
  versionName: string;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const agent = AGENT_DETAILS.find((a) => a.id === agentId);
  const versions = agent?.versions ?? [];
  const filtered = versions.filter((v) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.tag.toLowerCase().includes(q);
  });
  const noAgent = !agent;
  const active = versions.find((v) => v.name === versionName);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={noAgent}
        render={
          <TriggerButton
            icon={<GitBranch size={14} />}
            placeholder={noAgent ? "Pick agent first" : "Select version"}
            primary={
              !noAgent && active ? (
                <span className="inline-flex items-center gap-1.5">
                  {active.name === "Live" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                  {active.name}
                </span>
              ) : undefined
            }
            disabled={noAgent}
          />
        }
      />
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[320px] overflow-hidden p-0"
      >
        <div className="flex h-11 items-center gap-2 border-b border-sidebar-border/30 px-4">
          <GitBranch size={13} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Version</span>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <div className="border-b border-sidebar-border/30 p-2">
          <div className="flex h-8 items-center gap-2 rounded-md border border-sidebar-border/30 bg-transparent px-2.5 dark:bg-secondary">
            <Search size={13} className="shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search versions…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>
        <div className="scroll-thin max-h-[280px] overflow-y-auto p-1">
          {filtered.map((v) => {
            const selected = v.name === versionName;
            return (
              <button
                key={v.name}
                type="button"
                onClick={() => {
                  onChange(v.name);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                  selected ? "bg-secondary" : "hover:bg-secondary/60",
                )}
              >
                <Checkbox checked={selected} />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 truncate text-sm leading-tight",
                      selected
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {v.name === "Live" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                    {v.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] leading-tight text-muted-foreground">
                    {v.tag}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Local checkbox (mirrors the reference) ──────────────────────────── */

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
        checked
          ? "border-foreground bg-foreground text-background"
          : "border-sidebar-border/30",
      )}
    >
      {checked && <Check size={11} strokeWidth={3} />}
    </span>
  );
}
