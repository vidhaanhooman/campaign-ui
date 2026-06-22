"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RealtimeWizard } from "@/components/create-campaign-dialog";
import { BatchWizard } from "@/components/batch-wizard";
import { AgentVersionPicker } from "@/components/agent-version-picker";
import { NumberStepper } from "@/components/number-stepper";
import { TimePicker } from "@/components/time-picker";
import { cn } from "@/lib/utils";

type View = "realtime" | "batch" | "components";

const RT_STEPS = [
  { id: 1, label: "Identity" },
  { id: 2, label: "Schedule & retries" },
  { id: 3, label: "API contract" },
  { id: 4, label: "Review" },
];

const BATCH_STEPS = [
  { id: 1, label: "Identity" },
  { id: 2, label: "Audience" },
  { id: 3, label: "Schedule & retries" },
  { id: 4, label: "Review" },
];

export default function DevPage() {
  const [view, setView] = useState<View>("realtime");
  const [rtStep, setRtStep] = useState(1);
  const [batchStep, setBatchStep] = useState(1);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      {/* top bar */}
      <header className="flex items-center gap-4 border-b border-border px-6 py-3" style={{ backgroundColor: "var(--surface)" }}>
        <Link
          href="/campaigns"
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
        >
          <ArrowLeft size={14} />
        </Link>
        <span className="text-sm font-semibold text-text">Dev playground</span>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
          bypass — every screen
        </span>

        <div className="ml-auto inline-flex items-center rounded-md border border-border-strong bg-surface-2 p-0.5">
          {(
            [
              { v: "realtime", label: "Realtime" },
              { v: "batch", label: "Batch" },
              { v: "components", label: "Components" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              onClick={() => setView(o.v)}
              className={cn(
                "h-7 rounded-md px-3 text-xs transition-colors",
                view === o.v
                  ? "bg-white text-black shadow-sm"
                  : "text-text-dim hover:text-text",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </header>

      {/* step jumper */}
      {view !== "components" && (
        <div className="flex items-center gap-2 border-b border-border px-6 py-2.5" style={{ backgroundColor: "var(--surface)" }}>
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
            Jump to step
          </span>
          {(view === "realtime" ? RT_STEPS : BATCH_STEPS).map((s) => {
            const active =
              (view === "realtime" ? rtStep : batchStep) === s.id;
            return (
              <button
                key={s.id}
                onClick={() =>
                  view === "realtime" ? setRtStep(s.id) : setBatchStep(s.id)
                }
                className={cn(
                  "rounded-md px-3 py-1 text-xs transition-colors",
                  active
                    ? "bg-surface-2 text-text border border-border-strong"
                    : "text-text-dim hover:text-text hover:bg-surface-2/60",
                )}
              >
                {s.id}. {s.label}
              </button>
            );
          })}
        </div>
      )}

      {/* main area */}
      <main className="flex-1 p-6 overflow-auto">
        {view === "realtime" && (
          <div
            className="mx-auto border border-border-strong rounded-lg overflow-hidden shadow-xl shadow-black/40"
            style={{ backgroundColor: "var(--surface)", width: "1080px", height: "780px" }}
          >
            <RealtimeWizard
              key={`rt-${rtStep}`}
              defaultStep={rtStep}
              onBack={() => setRtStep(Math.max(1, rtStep - 1))}
              onClose={() => {}}
            />
          </div>
        )}

        {view === "batch" && (
          <div
            className="mx-auto border border-border-strong rounded-lg overflow-hidden shadow-xl shadow-black/40"
            style={{ backgroundColor: "var(--surface)", width: "1080px", height: "780px" }}
          >
            <BatchWizard
              key={`batch-${batchStep}`}
              defaultStep={batchStep}
              onBack={() => setBatchStep(Math.max(1, batchStep - 1))}
              onClose={() => {}}
            />
          </div>
        )}

        {view === "components" && <ComponentGallery />}
      </main>
    </div>
  );
}

function ComponentGallery() {
  const [agentId, setAgentId] = useState("agt_debt_pitch");
  const [version, setVersion] = useState("Latest");
  const [num, setNum] = useState(50);
  const [pct, setPct] = useState(75);
  const [t1, setT1] = useState("10:00");
  const [t2, setT2] = useState("21:30");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Section title="Agent & Version Picker">
        <AgentVersionPicker
          agentId={agentId}
          versionName={version}
          onApply={({ agentId: id, versionName }) => {
            setAgentId(id);
            setVersion(versionName);
          }}
        />
        <p className="text-xs text-text-muted mt-2">
          Selected: <span className="font-mono">{agentId}</span> ·{" "}
          <span className="font-mono">{version}</span>
        </p>
      </Section>

      <Section title="Number Stepper">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-text-muted mb-2">No suffix</div>
            <NumberStepper value={num} onChange={setNum} className="w-32" />
          </div>
          <div>
            <div className="text-xs text-text-muted mb-2">With % suffix</div>
            <NumberStepper
              value={pct}
              onChange={setPct}
              suffix="%"
              min={0}
              max={100}
              className="w-32"
            />
          </div>
          <div>
            <div className="text-xs text-text-muted mb-2">Compact</div>
            <NumberStepper value={num} onChange={setNum} className="w-20" />
          </div>
        </div>
      </Section>

      <Section title="Time Picker">
        <div className="flex items-center gap-3">
          <TimePicker value={t1} onChange={setT1} label="Start" className="w-36" />
          <TimePicker value={t2} onChange={setT2} label="End" className="w-36" />
        </div>
      </Section>

      <Section title="Colors">
        <div className="grid grid-cols-4 gap-2 text-[11px]">
          <Swatch token="bg" value="#0a0a0a" />
          <Swatch token="surface" value="#141414" />
          <Swatch token="surface-2" value="#1c1c1c" />
          <Swatch token="border-strong" value="#2a2a2a" />
          <Swatch token="text" value="#ededed" textFor />
          <Swatch token="text-dim" value="#b8b8b3" textFor />
          <Swatch token="text-muted" value="#8a8a85" textFor />
          <Swatch token="white (primary btn)" value="#ffffff" textFor />
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-md bg-white px-4 py-1.5 text-xs font-medium text-black hover:bg-white/90">
            Primary
          </button>
          <button className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-text-dim hover:text-text">
            Secondary
          </button>
          <button className="rounded-md px-2 py-1.5 text-xs text-text-dim hover:text-text">
            Ghost
          </button>
          <button
            disabled
            className="rounded-md bg-white px-4 py-1.5 text-xs font-medium text-black opacity-50 cursor-not-allowed"
          >
            Disabled
          </button>
        </div>
      </Section>

      <Section title="Status pills">
        <div className="flex flex-wrap items-center gap-2">
          <Pill color="bg-emerald-400" label="Completed" />
          <Pill color="bg-blue-400" label="Running" />
          <Pill color="bg-amber-400" label="Paused" />
          <Pill color="bg-red-400" label="Failed" />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-3">
        {title}
      </div>
      <div className="rounded-lg border border-border-strong bg-surface p-5">
        {children}
      </div>
    </section>
  );
}

function Swatch({
  token,
  value,
  textFor,
}: {
  token: string;
  value: string;
  textFor?: boolean;
}) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div
        className="h-12 flex items-center justify-center font-mono text-xs"
        style={{
          backgroundColor: textFor ? "var(--surface)" : value,
          color: textFor ? value : undefined,
        }}
      >
        {textFor ? "Aa" : ""}
      </div>
      <div className="px-2 py-1.5 bg-surface-2">
        <div className="font-mono text-text">{token}</div>
        <div className="font-mono text-text-muted">{value}</div>
      </div>
    </div>
  );
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-2 px-2 py-0.5 text-[11px] text-text-dim">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", color)} />
      {label}
    </span>
  );
}
