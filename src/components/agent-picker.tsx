"use client";

import { useMemo, useState } from "react";
import { Bot, Check, ChevronDown, Search } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AGENT_DETAILS } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

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

const SURFACE_BG = { backgroundColor: "var(--surface)" } as const;
const CARD = "rounded-lg border border-border-strong shadow-xl shadow-black/40";

export function AgentPicker({
  agentId,
  onChange,
  className,
}: {
  agentId: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const agent = AGENT_DETAILS.find((a) => a.id === agentId);
  const filtered = useMemo(() => {
    if (!query.trim()) return AGENT_DETAILS;
    const q = query.toLowerCase();
    return AGENT_DETAILS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "w-full h-9 flex items-center gap-2.5 rounded-md border border-border-strong bg-surface-2 px-3 text-left text-sm transition-colors hover:border-text-muted/40 focus:border-white outline-none",
              className,
            )}
          />
        }
      >
        {agent ? (
          <>
            <Bot size={13} className="shrink-0 text-text-muted" />
            <span className="flex-1 min-w-0 truncate font-medium text-text">
              {agent.name}
            </span>
          </>
        ) : (
          <span className="flex-1 text-text-muted">Select agent</span>
        )}
        <ChevronDown size={14} className="shrink-0 text-text-muted" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        style={SURFACE_BG}
        className={cn(CARD, "w-[380px] overflow-hidden p-0")}
      >
        <div className="flex flex-col">
          <div className="px-4 h-11 flex items-center gap-2 border-b border-border">
            <Bot size={13} className="text-text-muted" />
            <span className="text-sm font-medium text-text">Agent</span>
            <span className="ml-auto font-mono text-xs text-text-muted">
              {filtered.length}
            </span>
          </div>
          <div className="p-2 border-b border-border">
            <div className="flex h-9 items-center gap-2 rounded-md border border-border-strong bg-transparent px-2.5">
              <Search size={13} className="shrink-0 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents…"
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              />
            </div>
          </div>
          <div className="scroll-thin max-h-[260px] overflow-y-auto px-2 py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-text-muted">
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
                      "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      selected
                        ? "bg-surface-2 text-text"
                        : "text-text-dim hover:bg-surface-2/60 hover:text-text",
                    )}
                  >
                    <Checkbox checked={selected} />
                    <span className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "block truncate text-sm leading-tight",
                          selected ? "font-medium text-text" : "text-text-dim",
                        )}
                      >
                        {a.name}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-xs leading-tight text-text-muted">
                        {a.id}
                      </span>
                    </span>
                    <span className="inline-flex h-5 shrink-0 items-center rounded-md border border-border-strong bg-surface px-2 text-[10px] text-text-muted">
                      {a.mode}
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
