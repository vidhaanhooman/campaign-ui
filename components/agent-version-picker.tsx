"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Check, ChevronDown, Search } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AGENT_DETAILS } from "@/lib/campaign-data";
import { cn } from "@/lib/utils";

const CARD =
  "rounded-lg border bg-card shadow-xl shadow-black/40";
const SURFACE_BG = { backgroundColor: "var(--card)" } as const;

export function AgentVersionPicker({
  agentId,
  versionName,
  onApply,
}: {
  agentId: string;
  versionName: string;
  onApply: (next: { agentId: string; versionName: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftAgent, setDraftAgent] = useState(agentId);
  const [draftVersion, setDraftVersion] = useState(versionName);
  const [query, setQuery] = useState("");

  const agent = AGENT_DETAILS.find((a) => a.id === agentId);
  const draftAgentDetail = AGENT_DETAILS.find((a) => a.id === draftAgent);
  const availableVersions = draftAgentDetail?.versions ?? [];

  useEffect(() => {
    if (!draftAgentDetail) return;
    const has = draftAgentDetail.versions.some((v) => v.name === draftVersion);
    if (!has) setDraftVersion(draftAgentDetail.versions[0]?.name ?? "Live");
  }, [draftAgent, draftAgentDetail, draftVersion]);

  const filteredAgents = useMemo(() => {
    if (!query) return AGENT_DETAILS;
    const q = query.toLowerCase();
    return AGENT_DETAILS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
    );
  }, [query]);

  const reset = () => {
    setDraftAgent("");
    setDraftVersion("Live");
    setQuery("");
  };

  const versionCount = `${draftVersion && draftAgentDetail ? 1 : 0}/${
    draftAgentDetail?.versions.length ?? 9
  }`;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        if (v) {
          setDraftAgent(agentId);
          setDraftVersion(versionName);
          setQuery("");
        }
        setOpen(v);
      }}
    >
      {/* TRIGGER — uses styleguide input recipe */}
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-8 w-full items-center gap-2.5 rounded-lg border border-input bg-transparent dark:bg-secondary px-3 text-left text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        {agent ? (
          <>
            <Bot size={13} className="shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium text-foreground">{agent.name}</span>
              <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                · {versionName}
              </span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-muted-foreground">
            Select agent and version
          </span>
        )}
        <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      {/* POPOVER */}
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        style={SURFACE_BG}
        className={cn(CARD, "p-0 w-[720px] max-w-[94vw] overflow-hidden border-[color:var(--border)]")}
      >
        <div className="grid h-[400px] grid-cols-[1fr_280px] grid-rows-[auto_1fr_auto]">
          {/* HEADERS */}
          <div className="flex h-12 items-center gap-2 border-b border-r border-border px-4 text-sm font-medium text-foreground">
            <Bot size={13} className="text-muted-foreground" />
            Agent
          </div>
          <div className="flex h-12 items-center border-b border-border px-4">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Versions
            </span>
            <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
              {versionCount}
            </span>
          </div>

          {/* AGENT BODY */}
          <div className="flex min-h-0 flex-col overflow-hidden border-r border-border">
            <div className="p-2">
              {/* Search input recipe */}
              <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-secondary px-2.5">
                <Search size={13} className="shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agents…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {filteredAgents.length === 0 ? (
                <div className="px-3 py-10 text-center text-xs text-muted-foreground">
                  No agents match &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredAgents.map((a) => {
                  const checked = draftAgent === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setDraftAgent(a.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                        checked
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                      )}
                    >
                      <Checkbox checked={checked} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-sm leading-tight",
                            checked ? "font-medium text-foreground" : "text-muted-foreground",
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

          {/* VERSIONS BODY */}
          <div className="flex min-h-0 flex-col overflow-hidden">
            {!draftAgentDetail ? (
              <div className="flex flex-1 items-center justify-center px-5 text-center text-xs leading-relaxed text-muted-foreground">
                Pick an agent to see its versions.
              </div>
            ) : (
              <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-2 py-2">
                {availableVersions.map((v) => {
                  const checked = draftVersion === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setDraftVersion(v.name)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                        checked
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                      )}
                    >
                      <Checkbox checked={checked} />
                      <span className="flex-1 truncate pr-2">
                        <span
                          className={cn(
                            "font-medium",
                            checked ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {v.name}
                        </span>
                        {v.tag && (
                          <span className="ml-1.5 text-muted-foreground">
                            · {v.tag}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FOOTERS */}
          <div
            className="flex items-center justify-end gap-2 border-t border-r border-border px-3"
            style={{ height: 52 }}
          >
            {/* Secondary button recipe */}
            <button
              onClick={reset}
              className="rounded-md border border-input px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
            {/* Primary button recipe */}
            <button
              disabled={!draftAgent || !draftVersion}
              onClick={() => {
                onApply({ agentId: draftAgent, versionName: draftVersion });
                setOpen(false);
              }}
              className={cn(
                "rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors",
                !draftAgent || !draftVersion
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-primary/90",
              )}
            >
              Apply
            </button>
          </div>
          <div
            className="flex items-center border-t border-border px-4 text-xs text-muted-foreground"
            style={{ height: 52 }}
          >
            Pick Live to always use the version in production.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* Checkbox — verbatim styleguide recipe */
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
        checked ? "border-white bg-primary text-primary-foreground" : "border-input",
      )}
    >
      {checked && <Check size={11} strokeWidth={3} />}
    </span>
  );
}
