"use client";

import { Bot } from "lucide-react";

import { SearchSelect, type SearchOption } from "@/components/ui/search-select";
import { AGENT_DETAILS } from "@/lib/campaign-data";

export function AgentPicker({
  agentId,
  onChange,
  className,
}: {
  agentId: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const options: SearchOption[] = AGENT_DETAILS.map((a) => ({
    value: a.id,
    label: a.name,
    sub: a.id,
    badge: a.mode,
  }));
  return (
    <SearchSelect
      value={agentId}
      onChange={onChange}
      options={options}
      icon={<Bot size={13} />}
      placeholder="Select agent"
      searchPlaceholder="Search agents…"
      emptyText="No agents found."
      monoSub
      className={className}
    />
  );
}
