"use client";

import { useMemo, useState } from "react";
import { Bot, Check, Filter, Search } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AgentDetail {
  id: string;
  name: string;
  mode: "Conversation" | "Broadcast";
}

const AGENT_DETAILS: AgentDetail[] = [
  { id: "agt_debt_pitch", name: "Debt Collection Pitch Agent", mode: "Conversation" },
  { id: "agt_debt_outbound", name: "Debt Collection Outbound Agent", mode: "Broadcast" },
  { id: "agt_careers360", name: "Careers_360 - Tech college predictor", mode: "Conversation" },
  { id: "agt_premium", name: "premium", mode: "Conversation" },
  { id: "agt_standard", name: "standard", mode: "Broadcast" },
  { id: "agt_palmonas", name: "palmonas hoomanlabs", mode: "Broadcast" },
];

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
        checked ? "border-foreground bg-foreground text-background" : "border-input",
      )}
    >
      {checked && <Check size={11} strokeWidth={3} />}
    </span>
  );
}

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
      (a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md border border-input bg-secondary px-2.5 text-xs text-foreground transition-colors hover:bg-secondary/80",
              className,
            )}
          >
            <Filter size={12} className="text-muted-foreground" />
            Filter
            {agent && (
              <span className="ml-0.5 max-w-[140px] truncate text-muted-foreground">
                · {agent.name}
              </span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[380px] overflow-hidden p-0"
      >
        <div className="flex flex-col">
          <div className="flex h-11 items-center gap-2 border-b border-border px-4">
            <Bot size={13} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Agent</span>
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">
              {filtered.length}
            </span>
          </div>
          <div className="border-b border-border p-2">
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
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      selected
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    <Checkbox checked={selected} />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm leading-tight",
                          selected ? "font-medium text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {a.name}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] leading-tight text-muted-foreground">
                        {a.id}
                      </span>
                    </span>
                    <span className="inline-flex h-5 shrink-0 items-center rounded-md border border-border bg-secondary px-2 text-[10px] text-muted-foreground">
                      {a.mode}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border p-2">
            <button
              type="button"
              disabled={!agentId}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="rounded-md border border-input px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              Clear
            </button>
            <span className="px-1 text-[11px] text-muted-foreground">
              {agentId ? "1 selected" : "None selected"}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
