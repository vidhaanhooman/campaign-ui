"use client";

import { Bot } from "lucide-react";

import { SearchSelect, type SearchOption } from "@/components/ui/search-select";

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

export function AgentPicker({
  agentId,
  onChange,
  className,
}: {
  agentId: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const options: SearchOption[] = [
    { value: "", label: "All agents" },
    ...AGENT_DETAILS.map((a) => ({ value: a.id, label: a.name, badge: a.mode })),
  ];
  return (
    <SearchSelect
      value={agentId}
      onChange={onChange}
      options={options}
      icon={<Bot size={13} />}
      placeholder="All agents"
      searchPlaceholder="Search agents…"
      emptyText="No agents found."
      className={className}
    />
  );
}
