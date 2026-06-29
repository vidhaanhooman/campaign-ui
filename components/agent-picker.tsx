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
        checked ? "border-white bg-primary text-primary-foreground" : "border-input",
      )}
    >
      {checked && (
        <Check size={11} strokeWidth={3} />
      )}
    </span>
  );
}

const SURFACE_BG = { backgroundColor: "var(--popover)" } as const;
const CARD = "rounded-lg border border-input shadow-xl shadow-black/40";

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
              "w-full h-8 flex items-center gap-2.5 rounded-lg border border-input bg-transparent dark:bg-secondary px-3 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              className,
            )}
          />
        }
      >
        {agent ? (
          <>
            <Bot size={13} className="shrink-0 text-muted-foreground" />
            <span className="flex-1 min-w-0 truncate font-medium text-foreground">
              {agent.name}
            </span>
          </>
        ) : (
          <span className="flex-1 text-muted-foreground">Select agent</span>
        )}
        <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        style={SURFACE_BG}
        className={cn(CARD, "w-(--anchor-width) max-w-[calc(100vw-2rem)] overflow-hidden p-0")}
      >
        <div className="flex flex-col">
          <div className="px-4 h-11 flex items-center gap-2 border-b border-border">
            <Bot size={13} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Agent</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {filtered.length}
            </span>
          </div>
          <div className="p-2 border-b border-border">
            <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-2.5">
              <Search size={13} className="shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="scroll-thin max-h-[260px] overflow-y-auto px-2 py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-8 text-center text-xs text-muted-foreground">
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
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    <Checkbox checked={selected} />
                    <span className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "block truncate text-sm leading-tight",
                          selected ? "font-medium text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {a.name}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-xs leading-tight text-muted-foreground">
                        {a.id}
                      </span>
                    </span>
                    <span className="inline-flex h-5 shrink-0 items-center rounded-md border border-input bg-card px-2 text-[10px] text-muted-foreground">
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
