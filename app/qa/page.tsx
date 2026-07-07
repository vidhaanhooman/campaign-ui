"use client";

/**
 * QA — batch-based call analysis. Upload a batch of calls (CSV + audio), apply
 * metrics, and read the scored analysis. This is the home: the list of batches
 * with a zero-state for first use. Upload wizard + batch-detail come next.
 */

import * as React from "react";
import {
  ArrowUpRight,
  ClipboardCheck,
  FileAudio,
  MoreVertical,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell, NotificationsButton } from "@/components/app-shell";
import { PageHeader } from "@/components/stats/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type BatchStatus = "uploaded" | "analyzing" | "analyzed";

type Batch = {
  id: string;
  name: string;
  source: string; // e.g. "debt_collection_q3.csv"
  calls: number;
  audioMatched: number;
  status: BatchStatus;
  metrics: number;
  score: number | null; // 0–100 headline, null until analyzed
  updated: string;
};

const BATCHES: Batch[] = [
  { id: "b1", name: "Q3 Win-back — outbound", source: "q3_winback.csv", calls: 482, audioMatched: 480, status: "analyzed", metrics: 5, score: 82, updated: "2h ago" },
  { id: "b2", name: "Real Estate — inbound sample", source: "re_inbound.csv", calls: 120, audioMatched: 120, status: "analyzing", metrics: 3, score: null, updated: "just now" },
  { id: "b3", name: "Debt collection — compliance", source: "collections_may.csv", calls: 96, audioMatched: 91, status: "uploaded", metrics: 0, score: null, updated: "1d ago" },
];

const STATUS: Record<BatchStatus, { label: string; cls: string; dot: string }> = {
  uploaded: { label: "Uploaded", cls: "text-muted-foreground", dot: "bg-muted-foreground/60" },
  analyzing: { label: "Analyzing", cls: "text-sky-400", dot: "bg-sky-400 motion-safe:animate-pulse" },
  analyzed: { label: "Analyzed", cls: "text-emerald-400", dot: "bg-emerald-400" },
};

export default function QAPage() {
  const [mode, setMode] = React.useState<"data" | "empty">("data");
  const batches = mode === "data" ? BATCHES : [];

  return (
    <AppShell activeNav="QA">
      <PageHeader
        icon={<ClipboardCheck size={16} />}
        label="QA"
        sublabel="Upload call batches, apply metrics, review the analysis."
        action={
          <div className="flex items-center gap-2">
            <PreviewToggle mode={mode} onChange={setMode} />
            <a
              href="#"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Metrics <ArrowUpRight size={13} />
            </a>
            <NotificationsButton />
            <button
              onClick={() => toast("Opening upload — CSV + audio")}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Upload size={14} /> Upload batch
            </button>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-5xl px-8 py-8">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3">
            <span className="text-sm font-medium text-foreground">Batches</span>
            <span className="text-xs text-muted-foreground">
              {batches.length} {batches.length === 1 ? "batch" : "batches"}
            </span>
          </div>

          {batches.length === 0 ? (
            <EmptyState
              icon={<FileAudio size={18} />}
              title="No QA batches yet"
              description="Upload a CSV of call data with the matching audio to create your first batch, then apply metrics to score it."
              action={
                <button
                  onClick={() => toast("Opening upload — CSV + audio")}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Upload size={14} /> Upload batch
                </button>
              }
            />
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.04] text-left">
                  {["Batch", "Calls", "Status", "Metrics", "Score", ""].map((h, i) => (
                    <th
                      key={h || i}
                      className={cn(
                        "px-5 py-2.5 text-xs font-medium text-muted-foreground",
                        i > 0 && i < 5 && "text-right",
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <BatchRow key={b.id} batch={b} />
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function BatchRow({ batch: b }: { batch: Batch }) {
  const st = STATUS[b.status];
  return (
    <tr
      onClick={() => toast(`Open batch: ${b.name}`)}
      className="cursor-pointer border-b border-white/[0.04] transition-colors last:border-0 hover:bg-secondary/40"
    >
      <td className="px-5 py-3.5">
        <div className="font-medium text-foreground">{b.name}</div>
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
          {b.source} · {b.updated}
        </div>
      </td>
      <td className="px-5 py-3.5 text-right">
        <span className="font-mono tabular-nums text-foreground">{b.calls}</span>
        {b.audioMatched < b.calls && (
          <span className="ml-1.5 text-[11px] text-amber-400">
            {b.calls - b.audioMatched} no audio
          </span>
        )}
      </td>
      <td className="px-5 py-3.5 text-right">
        <span className={cn("inline-flex items-center gap-1.5 text-xs", st.cls)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
          {st.label}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right font-mono tabular-nums text-muted-foreground">
        {b.metrics || "—"}
      </td>
      <td className="px-5 py-3.5 text-right">
        {b.score == null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-14 overflow-hidden rounded-full ring-1 ring-inset ring-white/[0.06]">
              <span
                className={cn(
                  "block h-full rounded-full",
                  b.score >= 80 ? "bg-emerald-400" : b.score >= 60 ? "bg-amber-400" : "bg-rose-400",
                )}
                style={{ width: `${b.score}%` }}
              />
            </span>
            <span className="w-8 text-right font-mono tabular-nums text-foreground">
              {b.score}
            </span>
          </span>
        )}
      </td>
      <td className="px-3 py-3.5 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast("Batch menu");
          }}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <MoreVertical size={15} />
        </button>
      </td>
    </tr>
  );
}

/* Demo-only toggle to preview the empty state. */
function PreviewToggle({
  mode,
  onChange,
}: {
  mode: "data" | "empty";
  onChange: (m: "data" | "empty") => void;
}) {
  return (
    <div className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card p-1">
      {(
        [
          ["data", "With data"],
          ["empty", "Empty"],
        ] as const
      ).map(([m, label]) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "inline-flex h-6 items-center rounded-md px-2.5 text-xs font-medium transition-colors",
            mode === m
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
