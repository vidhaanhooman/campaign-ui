"use client";

/**
 * Upload CSV — a 2-step drawer (Upload · Review) hosted in the same right-drawer
 * shell as Create Campaign / Add Metric. Uploads a CSV of conversations to send
 * for human review, mirroring the Create Campaign batch upload UX.
 */

import * as React from "react";
import {
  Check,
  ChevronLeft,
  FileSpreadsheet,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Upload" },
  { id: 2, title: "Review" },
] as const;

type CsvRow = { conversation_id: string; transcript: string; agent: string };
const SAMPLE_ROWS: CsvRow[] = [
  { conversation_id: "conv_8f2a91", transcript: "Hi, I'm calling about my outstanding…", agent: "Debt Collection" },
  { conversation_id: "conv_7b1c02", transcript: "Thanks for calling, how can I help…", agent: "Real Estate" },
  { conversation_id: "conv_5a9d44", transcript: "Your appointment is confirmed for…", agent: "Support" },
];

const MOCK = { name: "human-qa-batch.csv", rows: 128, cols: 3 };

export function UploadCsvDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const close = () => onOpenChange(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="drawer"
        showCloseButton={false}
        style={{ backgroundColor: "var(--card)" }}
        className="!max-w-[960px] flex flex-col overflow-hidden border-l border-border p-0 shadow-2xl"
      >
        <DialogTitle className="sr-only">Upload CSV</DialogTitle>
        <UploadWizard onClose={close} />
      </DialogContent>
    </Dialog>
  );
}

function UploadWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = React.useState(1);
  const [maxStep, setMaxStep] = React.useState(1);
  const [csvName, setCsvName] = React.useState("");
  const uploaded = csvName !== "";

  const goto = (id: number) => {
    if (id <= maxStep) setStep(id);
  };
  const advance = () => {
    if (step === 1 && !uploaded) {
      toast.error("Upload a CSV to continue.");
      return;
    }
    if (step < STEPS.length) {
      const next = step + 1;
      setStep(next);
      setMaxStep((m) => Math.max(m, next));
    } else {
      toast.success("Review batch created");
      onClose();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* header — title + stepper */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-8 py-4">
          <h1 className="text-lg font-medium tracking-tight text-foreground">Upload CSV</h1>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
        <nav className="flex items-center justify-center gap-1 px-8 pb-3">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const done = s.id < step;
            const reachable = s.id <= maxStep;
            return (
              <div key={s.id} className="flex items-center gap-1">
                <button
                  onClick={() => goto(s.id)}
                  disabled={!reachable}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors",
                    active
                      ? "bg-card text-foreground"
                      : reachable
                        ? "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        : "cursor-default text-muted-foreground/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums",
                      active ? "bg-primary font-medium text-primary-foreground" : "bg-card text-muted-foreground",
                    )}
                  >
                    {done ? <Check size={10} strokeWidth={3} /> : s.id}
                  </span>
                  <span className="font-medium">{s.title}</span>
                </button>
                {i < STEPS.length - 1 && <span className="h-px w-4 bg-sidebar-border/15" />}
              </div>
            );
          })}
        </nav>
      </header>

      {/* content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {step === 1 ? (
          <UploadStep csvName={csvName} onUpload={() => setCsvName(MOCK.name)} onReset={() => setCsvName("")} />
        ) : (
          <ReviewStep csvName={csvName} />
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-border px-8 py-3">
        <button
          onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft size={14} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={advance}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {step === STEPS.length ? "Create batch" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step 1 · Upload ─────────────────────────────────────────────────────── */

function UploadStep({ csvName, onUpload, onReset }: { csvName: string; onUpload: () => void; onReset: () => void }) {
  const uploaded = csvName !== "";

  const downloadSample = () => {
    const header = "conversation_id,transcript,agent\n";
    const rows = SAMPLE_ROWS.map((r) => `${r.conversation_id},"${r.transcript}",${r.agent}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-human-qa.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("sample-human-qa.csv downloaded");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-6">
      <div className="mb-6">
        <h2 className="text-base font-medium text-foreground">Upload conversations</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Upload a CSV of conversations to send for human review. Each row is one conversation.
        </p>
      </div>

      {!uploaded ? (
        <div className="flex flex-col gap-5">
          {/* Dropzone */}
          <button
            type="button"
            onClick={() => {
              onUpload();
              toast.success(`CSV parsed · ${MOCK.rows} rows`);
            }}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-popover px-6 py-12 text-center transition-colors hover:border-input"
          >
            <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
              <FileSpreadsheet size={20} />
            </span>
            <span className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Upload size={13} className="text-muted-foreground" />
                Drop CSV or click to upload
              </span>
              <span className="text-xs text-muted-foreground">
                <span className="font-mono">.csv</span> files only. Up to 5,000 rows.
              </span>
            </span>
          </button>

          {/* Expected format */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <FileSpreadsheet size={13} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">sample-human-qa.csv</span>
              <span className="text-[11px] text-muted-foreground">· expected format</span>
              <button onClick={downloadSample} className="ml-auto text-xs text-muted-foreground transition-colors hover:text-foreground">
                Download sample
              </button>
            </div>
            <div className="grid grid-cols-[1fr_2fr_1fr] border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="font-mono">conversation_id</span>
              <span className="font-mono">transcript</span>
              <span className="font-mono">agent</span>
            </div>
            {SAMPLE_ROWS.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_1fr] gap-2 border-b border-border px-4 py-2 text-xs last:border-0">
                <span className="truncate font-mono text-foreground">{r.conversation_id}</span>
                <span className="truncate text-muted-foreground">{r.transcript}</span>
                <span className="truncate text-foreground">{r.agent}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Uploaded file card */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileSpreadsheet size={13} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">{csvName}</span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                  <Check size={10} strokeWidth={3} /> Uploaded
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {MOCK.rows} rows · {MOCK.cols} columns
              </div>
            </div>
            <button
              onClick={onReset}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <RotateCcw size={12} /> Replace file
            </button>
          </div>

          {/* Preview */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[1fr_2fr_1fr] border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="font-mono">conversation_id</span>
              <span className="font-mono">transcript</span>
              <span className="font-mono">agent</span>
            </div>
            {SAMPLE_ROWS.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_1fr] gap-2 border-b border-border px-4 py-2 text-xs last:border-0">
                <span className="truncate font-mono text-foreground">{r.conversation_id}</span>
                <span className="truncate text-muted-foreground">{r.transcript}</span>
                <span className="truncate text-foreground">{r.agent}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 2 · Review ─────────────────────────────────────────────────────── */

function ReviewStep({ csvName }: { csvName: string }) {
  const rows: [string, React.ReactNode][] = [
    ["Source file", <span key="f" className="font-medium">{csvName || "—"}</span>],
    ["Conversations", `${MOCK.rows}`],
    ["Columns", "conversation_id · transcript · agent"],
    ["Review", "Human — sent to reviewers on create"],
  ];
  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-6">
      <div className="mb-4 text-xs font-medium text-muted-foreground">Review</div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {rows.map(([label, value], i) => (
          <div key={i} className={cn("grid grid-cols-[180px_1fr] text-sm", i < rows.length - 1 && "border-b border-border")}>
            <div className="border-r border-border bg-card px-3 py-2.5 text-muted-foreground">{label}</div>
            <div className="px-3 py-2.5 text-foreground">{value}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Creating the batch queues these conversations for human review.
      </p>
    </div>
  );
}
