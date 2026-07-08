"use client";

import * as React from "react";
import { Bot, GitBranch } from "lucide-react";

import { SearchSelect, type SearchOption } from "@/components/ui/search-select";
import { AGENT_DETAILS } from "@/lib/campaign-data";

/* Agent + Version pickers — both use the shared shadcn Combobox (SearchSelect). */

export function AgentSelect({
  agentId,
  onChange,
}: {
  agentId: string;
  onChange: (id: string) => void;
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
      icon={<Bot size={14} />}
      placeholder="Select agent"
      searchPlaceholder="Search agents…"
      emptyText="No agents found."
      monoSub
    />
  );
}

export function VersionSelect({
  agentId,
  versionName,
  onChange,
}: {
  agentId: string;
  versionName: string;
  onChange: (name: string) => void;
}) {
  const agent = AGENT_DETAILS.find((a) => a.id === agentId);
  const versions = agent?.versions ?? [];
  const options: SearchOption[] = versions.map((v) => ({
    value: v.name,
    label: v.name,
    sub: v.tag,
    dot: v.name === "Live",
  }));
  return (
    <SearchSelect
      value={versionName}
      onChange={onChange}
      options={options}
      icon={<GitBranch size={14} />}
      placeholder={agent ? "Select version" : "Pick agent first"}
      searchPlaceholder="Search versions…"
      emptyText="No versions found."
      disabled={!agent}
    />
  );
}
