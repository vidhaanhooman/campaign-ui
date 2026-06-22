"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, GitBranch, Search } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AGENT_DETAILS } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

const SURFACE_BG = { backgroundColor: "var(--surface)" } as const;
const CARD = "rounded-lg border border-border-strong shadow-xl shadow-black/40";

export function VersionPicker({
  agentId,
  versionName,
  onChange,
  className,
}: {
  agentId: string;
  versionName: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const agent = AGENT_DETAILS.find((a) => a.id === agentId);
  const versions = agent?.versions ?? [];

  const filtered = useMemo(() => {
    if (!query.trim()) return versions;
    const q = query.toLowerCase();
    return versions.filter(
      (v) =>
        v.name.toLowerCase().includes(q) || v.tag.toLowerCase().includes(q),
    );
  }, [versions, query]);

  const enabled = Boolean(agent);

  return (
    <Popover open={open} onOpenChange={(v) => enabled && setOpen(v)}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={!enabled}
            title={enabled ? undefined : "Pick an agent first."}
            className={cn(
              "w-full h-9 flex items-center gap-2 rounded-md border border-border-strong bg-surface-2 px-3 text-left text-sm transition-colors outline-none focus:border-white disabled:cursor-not-allowed disabled:text-text-muted/50",
              enabled && "hover:border-text-muted/40",
              className,
            )}
          />
        }
      >
        {!enabled ? (
          <span className="flex-1 text-text-muted">Pick agent first</span>
        ) : (
          <>
            {versionName === "Live" && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            )}
            <span className="flex-1 min-w-0 truncate font-medium text-text">
              {versionName}
            </span>
          </>
        )}
        <ChevronDown size={14} className="shrink-0 text-text-muted" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        style={SURFACE_BG}
        className={cn(CARD, "w-[300px] overflow-hidden p-0")}
      >
        <div className="flex flex-col">
          <div className="px-4 h-11 flex items-center gap-2 border-b border-border">
            <GitBranch size={13} className="text-text-muted" />
            <span className="text-sm font-medium text-text">Version</span>
            <span className="ml-auto font-mono text-[11px] text-text-muted">
              {filtered.length}
            </span>
          </div>
          <div className="p-2 border-b border-border">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border-strong bg-transparent px-2.5">
              <Search size={13} className="shrink-0 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search versions…"
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              />
            </div>
          </div>
          <div className="scroll-thin max-h-[260px] overflow-y-auto px-2 py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-text-muted">
                No versions match &ldquo;{query}&rdquo;
              </div>
            ) : (
              filtered.map((v) => {
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
                      "w-full flex items-center gap-3 rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                      selected
                        ? "bg-surface-2 text-text"
                        : "text-text-dim hover:bg-surface-2/60 hover:text-text",
                    )}
                  >
                    <Checkbox checked={selected} />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        {v.name === "Live" && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        )}
                        <span
                          className={cn(
                            "truncate text-sm leading-tight",
                            selected
                              ? "font-medium text-text"
                              : "text-text-dim",
                          )}
                        >
                          {v.name}
                        </span>
                      </span>
                      {v.tag && (
                        <span className="mt-0.5 block truncate text-[11px] leading-tight text-text-muted">
                          {v.tag}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
        checked ? "border-white bg-white text-black" : "border-border-strong",
      )}
    >
      {checked && (
        <Check size={11} strokeWidth={3} />
      )}
    </span>
  );
}
