"use client";

/**
 * Human QA — batches of conversations sent for human review. The home is a
 * table of review batches (who created it, size, pass/fail tally, status),
 * plus a CSV upload to start a new batch.
 */

import * as React from "react";
import {
  ChevronsUpDown,
  Loader2,
  MoreVertical,
  Upload,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/stats/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { UploadCsvDialog } from "@/components/human-qa/upload-csv-dialog";
import { BatchRunDialog } from "@/components/human-qa/batch-run-dialog";
import { cn } from "@/lib/utils";

type ReviewStatus = "completed" | "pending";

type ReviewBatch = {
  id: string;
  createdBy: string;
  conversations: number;
  pass: number | null;
  fail: number | null;
  status: ReviewStatus;
  createdAt: string; // display string
  ts: number; // sort key
};

const BATCHES: ReviewBatch[] = [
  { id: "r1", createdBy: "api", conversations: 2, pass: 2, fail: 0, status: "completed", createdAt: "02 Jul 2026, 18:20", ts: 1751467200 },
  { id: "r2", createdBy: "api", conversations: 2, pass: null, fail: null, status: "pending", createdAt: "02 Jul 2026, 18:12", ts: 1751466720 },
];

type SortKey = "createdBy" | "conversations" | "status" | "ts";

export default function HumanQAPage() {
  const [sort, setSort] = React.useState<{ key: SortKey; dir: 1 | -1 }>({ key: "ts", dir: -1 });
  const [upload, setUpload] = React.useState(false);
  const [batchRun, setBatchRun] = React.useState(false);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));

  const rows = React.useMemo(() => {
    const arr = [...BATCHES];
    arr.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return cmp * sort.dir;
    });
    return arr;
  }, [sort]);

  return (
    <AppShell activeNav="Human QA">
      <UploadCsvDialog open={upload} onOpenChange={setUpload} />
      <BatchRunDialog open={batchRun} onOpenChange={setBatchRun} />
      <div className="mx-auto w-full max-w-6xl px-8 py-8">
        <PageHeading
          title="Human QA"
          desc="Send batches of conversations for human review and track their outcomes."
          className="mb-6"
        >
          <button
            onClick={() => setUpload(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Upload size={14} /> Upload CSV
          </button>
        </PageHeading>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="text-sm font-medium text-foreground">Review batches</span>
            <span className="text-xs text-muted-foreground">
              {rows.length} {rows.length === 1 ? "batch" : "batches"}
            </span>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={<UserCheck size={18} />}
              title="No review batches yet"
              description="Upload a CSV of conversations to send them for human review."
            />
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <Th sortKey="createdBy" sort={sort} onSort={toggleSort}>Created by</Th>
                  <Th sortKey="conversations" sort={sort} onSort={toggleSort}>Conversations</Th>
                  <Th>Pass / Fail</Th>
                  <Th sortKey="status" sort={sort} onSort={toggleSort}>Status</Th>
                  <Th sortKey="ts" sort={sort} onSort={toggleSort}>Created at</Th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <BatchRow key={b.id} batch={b} onBatchRun={() => setBatchRun(true)} />
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Th({
  children,
  sortKey,
  sort,
  onSort,
}: {
  children: React.ReactNode;
  sortKey?: SortKey;
  sort?: { key: SortKey; dir: 1 | -1 };
  onSort?: (k: SortKey) => void;
}) {
  const active = sortKey && sort?.key === sortKey;
  return (
    <th className="px-5 py-2.5 text-xs font-medium text-muted-foreground">
      {sortKey ? (
        <button
          onClick={() => onSort?.(sortKey)}
          className={cn("inline-flex items-center gap-1 transition-colors hover:text-foreground", active && "text-foreground")}
        >
          {children}
          <ChevronsUpDown size={12} className={cn(active ? "text-foreground" : "text-muted-foreground/50")} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

function BatchRow({ batch: b, onBatchRun }: { batch: ReviewBatch; onBatchRun: () => void }) {
  return (
    <tr
      onClick={() => toast(`Open review batch ${b.id}`)}
      className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-secondary/40"
    >
      <td className="px-5 py-3.5 text-foreground">{b.createdBy}</td>
      <td className="px-5 py-3.5 font-mono tabular-nums text-foreground">{b.conversations}</td>
      <td className="px-5 py-3.5">
        {b.pass == null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="font-mono tabular-nums">
            <span className="text-emerald-400">{b.pass}</span>
            <span className="text-muted-foreground"> / {b.fail}</span>
          </span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <StatusPill status={b.status} />
      </td>
      <td className="px-5 py-3.5 text-muted-foreground">{b.createdAt}</td>
      <td className="px-3 py-3.5 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBatchRun();
          }}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <MoreVertical size={15} />
        </button>
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: ReviewStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <Loader2 size={13} className="animate-spin text-muted-foreground" />
      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
        Pending
      </span>
    </span>
  );
}
