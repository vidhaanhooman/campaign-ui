"use client";

/**
 * ConversationReview — a full-height split overlay for reviewing a single
 * conversation: audio + transcript on the left, the metric verdict, a
 * human-feedback control, and analysis on the right. Includes a prev/next
 * pager (with arrow keys) so reviewers can page through a sample without
 * reopening. Shared by QA Dry Run and Human QA.
 */

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pause,
  Play,
  Volume2,
  X,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ReviewOutcome = "pass" | "fail" | "na";
export type ReviewTurn = { role: string; text: string };
export type ReviewItem = {
  id: string;
  durationSec: number;
  transcript: ReviewTurn[];
  verdict: { outcome: ReviewOutcome; reasoning: string; output: string };
  analysis: { outcome: string; summary: string };
};

export type Feedback = "agree" | "disagree" | "borderline" | "na";

const OUTCOME: Record<ReviewOutcome, { label: string; cls: string }> = {
  pass: { label: "PASS", cls: "bg-emerald-500/15 text-emerald-400" },
  fail: { label: "FAIL", cls: "bg-destructive/15 text-destructive" },
  na: { label: "NA", cls: "bg-secondary text-muted-foreground" },
};

const FEEDBACK_OPTS: { key: Feedback; label: string; active: string }[] = [
  { key: "agree", label: "Agree", active: "bg-emerald-500/15 text-emerald-400" },
  { key: "disagree", label: "Disagree", active: "bg-destructive/15 text-destructive" },
  { key: "borderline", label: "Borderline", active: "bg-chart-1/15 text-chart-1" },
  { key: "na", label: "N/A", active: "bg-secondary text-foreground" },
];

/** Verdicts the reviewer can pick when correcting a Disagree. */
const CORRECT_OPTS: { key: ReviewOutcome; label: string }[] = [
  { key: "pass", label: "Pass" },
  { key: "fail", label: "Fail" },
  { key: "na", label: "NA" },
];

/** "phone_number_collection" → "Phone number collection". */
function humanizeMetric(s?: string) {
  if (!s) return "Verdict";
  const t = s.replace(/[_-]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function ConversationReview({
  open,
  onOpenChange,
  items,
  index,
  onIndexChange,
  onFeedback,
  metric,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: ReviewItem[];
  index: number;
  onIndexChange: (i: number) => void;
  onFeedback?: (id: string, f: Feedback) => void;
  /** The metric being reviewed — same across every call in the session. */
  metric?: string;
}) {
  const [feedback, setFeedback] = React.useState<Record<string, Feedback>>({});
  // Correction captured only when the reviewer Disagrees.
  const [correction, setCorrection] = React.useState<
    Record<string, { outcome?: ReviewOutcome; note: string }>
  >({});
  const item = items[index];

  const prev = React.useCallback(() => onIndexChange(Math.max(0, index - 1)), [index, onIndexChange]);
  const next = React.useCallback(() => onIndexChange(Math.min(items.length - 1, index + 1)), [index, items.length, onIndexChange]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (!item) return null;

  const setFb = (f: Feedback) => {
    setFeedback((m) => ({ ...m, [item.id]: f }));
    onFeedback?.(item.id, f);
    // Agree / N/A need no correction — advance so reviewers can fly through.
    // Disagree / Borderline stay put to capture the "why".
    if ((f === "agree" || f === "na") && index < items.length - 1) {
      const to = index + 1;
      window.setTimeout(() => onIndexChange(to), 260);
    }
  };

  const fb = feedback[item.id];
  const corr = correction[item.id] ?? { note: "" };
  const setCorr = (patch: Partial<{ outcome: ReviewOutcome; note: string }>) =>
    setCorrection((m) => ({ ...m, [item.id]: { ...corr, ...patch } }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        variant="drawer"
        showCloseButton={false}
        style={{ backgroundColor: "var(--card)" }}
        className="!right-[960px] !max-w-[720px] flex flex-col overflow-hidden border-l border-border p-0 shadow-2xl"
      >
        <DialogTitle className="sr-only">Conversation review</DialogTitle>

        {/* header — pager + id + close */}
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={prev}
                disabled={index === 0}
                className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
                {index + 1}/{items.length}
              </span>
              <button
                onClick={next}
                disabled={index === items.length - 1}
                className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <span className="font-mono text-sm text-foreground">{item.id}</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        </header>

        {/* body — split */}
        <div className="flex min-h-0 flex-1">
          {/* left — audio + transcript */}
          <div className="min-w-0 flex-1 overflow-y-auto p-5">
            <AudioPlayer durationSec={item.durationSec} />
            <div className="mt-5">
              {item.transcript.map((t, i) => (
                <div key={i} className="grid grid-cols-[110px_1fr] gap-4 border-b border-border py-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
                    <span
                      className={cn(
                        "text-xs font-semibold tracking-wide",
                        t.role.toUpperCase() === "AGENT" ? "text-chart-2" : "text-accent-foreground",
                      )}
                    >
                      {t.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{t.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* right — verdict + feedback (one unit), then call analysis */}
          <aside className="w-[400px] shrink-0 space-y-4 overflow-y-auto border-l border-border bg-background/40 p-4">
            {/* Verdict + its feedback — the reviewer's primary task */}
            <div className="rounded-xl border border-border bg-card p-4">
              {/* metric name + verdict result, side by side */}
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium text-foreground">
                  {humanizeMetric(metric)}
                </span>
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
                    OUTCOME[item.verdict.outcome].cls,
                  )}
                >
                  {OUTCOME[item.verdict.outcome].label}
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {item.verdict.reasoning}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                Output <span className="font-mono text-foreground">{item.verdict.output}</span>
              </div>

              <div className="my-4 h-px bg-border" />

              {/* Compact feedback row */}
              <p className="text-xs font-medium text-muted-foreground">Was this verdict correct?</p>
              <div className="mt-2 grid grid-cols-4 gap-1 rounded-lg border border-border bg-input/30 p-1">
                {FEEDBACK_OPTS.map((o) => {
                  const on = fb === o.key;
                  return (
                    <button
                      key={o.key}
                      onClick={() => setFb(o.key)}
                      className={cn(
                        "h-8 rounded-md text-xs font-medium transition-colors",
                        on ? o.active : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>

              {/* Progressive: only ask for a correction when they Disagree */}
              {fb === "disagree" && (
                <div className="mt-3 space-y-2 rounded-lg border border-border bg-background/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    What&rsquo;s the correct verdict?
                  </p>
                  <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-input/30 p-1">
                    {CORRECT_OPTS.map((c) => {
                      const on = corr.outcome === c.key;
                      return (
                        <button
                          key={c.key}
                          onClick={() => setCorr({ outcome: c.key })}
                          className={cn(
                            "h-7 rounded-md text-xs font-medium transition-colors",
                            on
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={corr.note}
                    onChange={(e) => setCorr({ note: e.target.value })}
                    placeholder="What did the evaluator get wrong? (optional)"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring"
                  />
                </div>
              )}
            </div>

            {/* Call analysis — different scope (whole call), kept separate */}
            <AnalysisCard analysis={item.analysis} />
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AudioPlayer({ durationSec }: { durationSec: number }) {
  const [playing, setPlaying] = React.useState(false);
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
      <button
        onClick={() => setPlaying((p) => !p)}
        className="flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">0:00</span>
      <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="absolute left-0 top-0 h-full w-0 rounded-full bg-primary" />
        <span className="absolute -top-1 left-0 size-3 -translate-x-1/2 rounded-full border border-ring bg-white" />
      </div>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{mmss(durationSec)}</span>
      <button className="text-muted-foreground transition-colors hover:text-foreground"><Volume2 size={16} /></button>
      <button className="text-muted-foreground transition-colors hover:text-foreground"><Download size={16} /></button>
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: { outcome: string; summary: string } }) {
  const [expanded, setExpanded] = React.useState(false);
  const long = analysis.summary.length > 180;
  const shown = expanded || !long ? analysis.summary : analysis.summary.slice(0, 180) + "…";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">Analysis</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Outcome</span>
        <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground">{analysis.outcome}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Summary</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">{shown}</p>
      {long && (
        <button onClick={() => setExpanded((v) => !v)} className="mt-1 text-xs text-muted-foreground underline transition-colors hover:text-foreground">
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
