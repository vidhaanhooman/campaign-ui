"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { UpdateCampaignDrawer } from "@/components/campaigns/update-campaign-drawer";
import {
  SAMPLE_CAMPAIGN,
  SAMPLE_REALTIME_CAMPAIGN,
  type CampaignEditState,
} from "@/lib/campaign-update";
import { cn } from "@/lib/utils";

type Mode = "batch" | "realtime";

export default function UpdateCampaignPreviewPage() {
  const [mode, setMode] = React.useState<Mode>("batch");
  const [current, setCurrent] = React.useState<CampaignEditState>(SAMPLE_CAMPAIGN);
  const [open, setOpen] = React.useState(false);
  const [lastSubmit, setLastSubmit] = React.useState<string | null>(null);

  // Switch the sample when the mode changes.
  const pickMode = (m: Mode) => {
    setMode(m);
    setCurrent(m === "realtime" ? SAMPLE_REALTIME_CAMPAIGN : SAMPLE_CAMPAIGN);
    setLastSubmit(null);
  };

  return (
    <AppShell activeNav="Campaigns">
      <div className="px-8 py-6">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Pencil size={12} /> Update campaign · UX preview
            </div>
            <h1 className="text-lg font-medium tracking-tight text-foreground">
              {current.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick which fields to update, edit only those, and review a live
              &ldquo;Changes&rdquo; diff before saving.
            </p>
          </div>

          {/* Batch / Realtime toggle */}
          <div className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card p-1">
            {(["batch", "realtime"] as const).map((m) => (
              <button
                key={m}
                onClick={() => pickMode(m)}
                className={cn(
                  "inline-flex h-6 items-center rounded-lg px-2.5 text-xs font-medium capitalize transition-colors",
                  mode === m
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Current configuration
            </h2>
            <Button onClick={() => setOpen(true)}>
              <Pencil /> Edit
            </Button>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Row label="Name">{current.name}</Row>
            <Row label="Agent">
              {current.agentId} · {current.agentVersion}
            </Row>
            {mode === "realtime" ? (
              <>
                <Row label="Task start">
                  {current.taskStartVal}
                  {current.taskStartUnit}
                </Row>
                <Row label="Task expiry">
                  {current.taskExpiryVal}
                  {current.taskExpiryUnit}
                </Row>
                <Row label="Retry interval">
                  {current.retryIntervalVal}
                  {current.retryIntervalUnit}
                </Row>
                <Row label="API can override">
                  {current.apiOverrides.join(", ") || "—"}
                </Row>
              </>
            ) : (
              <>
                <Row label="Start after">{current.startAfter}</Row>
                <Row label="End after">{current.endAfter}</Row>
              </>
            )}
            <Row label="Calling hours">
              {current.channelStart} – {current.channelEnd} · {current.timezone}
            </Row>
            <Row label="Slots">{current.slots}</Row>
            <Row label="Priority">{current.priority}</Row>
            <Row label="Retries">{current.retries}</Row>
            <Row label="Retry outcomes">
              {current.retryOutcomes.join(", ") || "—"}
            </Row>
            <Row label="Calling numbers">
              {current.callingNumbers.join(", ")}
            </Row>
          </dl>

          {lastSubmit && (
            <div className="mt-4 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
              Last update: {lastSubmit}
            </div>
          )}
        </div>
      </div>

      <UpdateCampaignDrawer
        open={open}
        onOpenChange={setOpen}
        current={current}
        mode={mode}
        campaignStatus="running"
        onSubmit={(next) => {
          setCurrent(next);
          setLastSubmit(new Date().toISOString());
        }}
      />
    </AppShell>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono text-xs tabular-nums text-foreground">{children}</dd>
    </>
  );
}
