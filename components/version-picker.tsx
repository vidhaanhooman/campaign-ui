"use client";

import { GitBranch } from "lucide-react";

import { SearchSelect, type SearchOption } from "@/components/ui/search-select";
import { AGENT_DETAILS } from "@/lib/campaign-data";

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
      icon={<GitBranch size={13} />}
      placeholder={agent ? "Select version" : "Pick agent first"}
      searchPlaceholder="Search versions…"
      emptyText="No versions found."
      disabled={!agent}
      className={className}
    />
  );
}
