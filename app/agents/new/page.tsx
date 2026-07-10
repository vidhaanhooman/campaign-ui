"use client";

/**
 * Agent flow builder — node canvas (React Flow v12), horizontal flow.
 *
 * A *config graph*: nodes hold settings, edges carry the transition condition
 * (an editable label), the whole thing serializes to `nodes[]`/`edges[]` (JSON)
 * for a backend to interpret. Clean cards with a category footer, per-node "+"
 * add affordance, on-edge condition chips, validation warnings, and a
 * right-click menu. Left → right layout.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  MarkerType,
  addEdge,
  useInternalNode,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useUpdateNodeInternals,
  type InternalNode,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  AlertTriangle,
  Ban,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Clock,
  Copy,
  CornerDownRight,
  RotateCcw,
  ListChecks,
  Maximize2,
  MessageSquare,
  MoreVertical,
  Network,
  Pencil,
  PhoneIncoming,
  Play,
  PlugZap,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { AppShell, useSidebar } from "@/components/app-shell";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/* ── Node model ──────────────────────────────────────────────────────── */

// Aligns to the backend contract (node.type): llm · fixed · logic · endpoint.
// "Start" is not a type — it's the node with id "start" (type llm or logic).
type NodeKind = "llm" | "fixed" | "logic" | "endpoint";

type NodeData = {
  name: string;
  desc?: string;
  invalid?: boolean;
  // Branch labels shown as right-edge ports; each is one output.
  // ≤1 → single bare output port; >1 → stacked labeled ports.
  exits?: string[];
  // Per-type config (serialized into the backend `data` shape on save).
  config?: Record<string, unknown>;
};

/* ── Condition tree (logic node) — matches backend `condition` shape ──────
   Each condition has yes/no branches; a branch is a target id (string), an
   unwired sentinel (= its own key), or a nested Condition (else-if). Each
   string branch is one output port with handle `${key}#yes|no`. */
type Condition = {
  key: string;
  property: string;
  operator: string;
  value: string;
  type: string;
  output?: string;
  yes: string | Condition;
  no: string | Condition;
};

let condKeySeq = 1;
function newCondition(): Condition {
  const key = `cond_${condKeySeq++}`;
  return { key, property: "", operator: "==", value: "", type: "string", yes: key, no: key, output: "" };
}

/** Leaf branches (yes/no that are strings) → one output port each. */
function conditionLeaves(c: Condition): { handle: string; label: string }[] {
  const out: { handle: string; label: string }[] = [];
  (["yes", "no"] as const).forEach((b) => {
    const v = c[b];
    if (typeof v === "string") {
      out.push({
        handle: `${c.key}#${b}`,
        label: `${c.property || "?"} ${c.operator} ${c.value || "?"} · ${b}`,
      });
    } else {
      out.push(...conditionLeaves(v));
    }
  });
  return out;
}

type Meta = {
  category: string;
  icon: LucideIcon;
  accent: string; // icon text color
  dot: string; // status dot bg
  port: string; // handle border tint
  tint: string; // soft accent gradient (rgba)
};

const META: Record<NodeKind, Meta> = {
  llm: { category: "LLM", icon: Sparkles, accent: "text-sky-400", dot: "bg-sky-400", port: "!bg-sky-400", tint: "rgba(56,189,248,0.10)" },
  fixed: { category: "Static", icon: MessageSquare, accent: "text-violet-400", dot: "bg-violet-400", port: "!bg-violet-400", tint: "rgba(167,139,250,0.10)" },
  logic: { category: "Condition", icon: Network, accent: "text-amber-400", dot: "bg-amber-400", port: "!bg-amber-400", tint: "rgba(251,191,36,0.10)" },
  endpoint: { category: "Endpoint", icon: PlugZap, accent: "text-emerald-400", dot: "bg-emerald-400", port: "!bg-emerald-400", tint: "rgba(52,211,153,0.10)" },
};

// Neutral dark knob with a hairline ring — reads as a connector, not a hole.
const PORT =
  "!h-[11px] !w-[11px] !rounded-full !bg-[#0b0b0b] !border !border-white/25 transition-all duration-150 hover:!border-white/50 hover:!scale-110";

/** Lets an in-node kebab open the Canvas-level context menu at a point. */
const OpenMenu = React.createContext<(nodeId: string, x: number, y: number) => void>(
  () => {},
);

/** Lets an in-node "+" open the Select-Node picker, connecting from that node. */
const OpenPicker = React.createContext<(fromId?: string, fromHandle?: string | null, client?: { x: number; y: number }) => void>(() => {});

/** Appends a new (empty) branch/transition — adds an output hole to the node. */
const AddExit = React.createContext<(nodeId: string) => void>(() => {});

/** Resolved outbound target for a node's handle + jump-to-node — powers the
 *  labeled transition rows (row = port, target name = click-to-navigate). */
type RowTarget = { id: string; name: string; loop: boolean };
type RowSource = { id: string; name: string; condition: string; loop: boolean };
type RowNavCtx = {
  targetOf: (nodeId: string, handle: string) => RowTarget | null;
  inboundOf: (nodeId: string) => RowSource[];
  jumpTo: (nodeId: string) => void;
  // Twilio-style: click a branch → open the drawer focused on that rule.
  editBranch: (nodeId: string, index: number) => void;
};
const RowNav = React.createContext<RowNavCtx>({
  targetOf: () => null,
  inboundOf: () => [],
  jumpTo: () => {},
  editBranch: () => {},
});

/** Validation — issues surfaced inline on nodes and in the issues panel. */
type Issue = { nodeId: string; branchIndex?: number; level: "error" | "warn"; message: string };
type NodeIssue = { level: "error" | "warn" | null; branches: Set<number> };
const NodeIssues = React.createContext<(nodeId: string) => NodeIssue>(() => ({ level: null, branches: new Set() }));

/** True when a node should recede — a node is selected and this isn't it or a
 *  direct neighbour. Selection-driven focus (a consequence, not a mode). */
const FocusDim = React.createContext<(nodeId: string) => boolean>(() => false);

/** The node currently hovered — used to highlight its in/out edges. */
const HoverNode = React.createContext<string | null>(null);

/** When false, backward (loop) edges collapse to jump chips instead of long lines. */
const ShowLoops = React.createContext<boolean>(false);

/**
 * Unified node — one compact card for EVERY type: header (dot + icon + title) →
 * summary → footer. Branch/transition structure is expressed as OUTPUT PORTS on
 * the right edge, each with a tiny label (multi-branch nodes) — not an in-node
 * list. Condition labels also live on the edges; branch editing is in the
 * inspector. Selecting never resizes the node.
 */
function makeNode(kind: NodeKind) {
  const m = META[kind];
  const Icon = m.icon;
  const canBranch = kind === "llm" || kind === "logic"; // these can fan out
  function FlowNode({ id, data, selected }: NodeProps<Node<NodeData>>) {
    const openMenu = React.useContext(OpenMenu);
    const openPicker = React.useContext(OpenPicker);
    const addExit = React.useContext(AddExit);
    const updateNodeInternals = useUpdateNodeInternals();
    const isStart = id === "start"; // the entry node — no incoming port

    const rowNav = React.useContext(RowNav);
    const dimmed = React.useContext(FocusDim)(id);
    const nodeIssue = React.useContext(NodeIssues)(id);
    const inbound = rowNav.inboundOf(id);
    const [inboundOpen, setInboundOpen] = React.useState(false);
    const showInbound = inboundOpen || selected; // auto-expand while selected
    // Each transition is a labeled row that IS its output port (t-i). Nodes with
    // no explicit exits (Static/Endpoint) still get one implicit "Next" row.
    const exits = data.exits ?? [];
    const rows: { label: string | null; handle: string }[] = exits.length
      ? exits.map((label, i) => ({ label, handle: `t-${i}` }))
      : [{ label: null, handle: "t-0" }];
    const multi = rows.length > 1;

    // Re-measure handles when the row/port set changes (else edges mis-draw).
    React.useEffect(() => {
      updateNodeInternals(id);
    }, [id, rows.length, updateNodeInternals]);

    return (
      <div className={cn("group relative transition-opacity duration-200", dimmed && "opacity-35")}>
        {/* ambient glow — appears on select (and error) */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-3 rounded-xl opacity-0 blur-xl transition-opacity duration-300",
            selected && "opacity-100",
          )}
          style={{
            background: data.invalid
              ? "radial-gradient(55% 55% at 50% 50%, rgba(244,63,94,0.16), transparent 70%)"
              : "radial-gradient(55% 55% at 50% 50%, rgba(167,139,250,0.18), transparent 70%)",
          }}
        />

        {/* floating role pill over the entry node */}
        {isStart && (
          <div className="absolute -top-8 left-1 rounded-full bg-violet-400/[0.14] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-violet-300/85">
            Trigger
          </div>
        )}

        <div
          className={cn(
            "rf-node-in relative w-[288px] rounded-xl border bg-card transition-colors duration-200",
            nodeIssue.level === "error"
              ? "border-rose-500/45"
              : selected
                ? "border-violet-400/50"
                : nodeIssue.level === "warn"
                  ? "border-amber-500/35"
                  : "border-border hover:border-white/[0.16]",
          )}
          style={{ backgroundColor: "var(--card)" }}
        >
          {/* header — icon · title/category · kebab (input port on the left) */}
          <div className="relative flex items-start gap-2.5 px-4 pb-2 pt-3.5">
            {!isStart && (
              <Handle
                type="target"
                position={Position.Left}
                className={cn(PORT, "!left-[-6px] !top-[26px]")}
              />
            )}
            <Icon size={17} className={cn(m.accent, "mt-px shrink-0")} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-medium leading-snug text-foreground">
                {data.name}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground/45">
                  {m.category}
                </span>
                {nodeIssue.level && (
                  <AlertTriangle size={11} className={nodeIssue.level === "error" ? "text-rose-400" : "text-amber-400"} />
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const r = e.currentTarget.getBoundingClientRect();
                openMenu(id, r.right, r.bottom);
              }}
              className="nodrag -mr-1 -mt-0.5 shrink-0 rounded-md p-0.5 text-muted-foreground/60 transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <MoreVertical size={15} />
            </button>
          </div>

          {/* inbound summary — who transitions INTO this node, on what condition.
              Collapsed by default; auto-expands while the node is selected. */}
          {!isStart && inbound.length > 0 && (
            <div className="px-4 pb-1">
              <button
                onClick={(e) => { e.stopPropagation(); setInboundOpen((o) => !o); }}
                className="nodrag inline-flex items-center gap-1 text-[10px] text-muted-foreground/55 transition-colors hover:text-foreground"
              >
                <ChevronRight size={10} className={cn("transition-transform", showInbound && "rotate-90")} />
                {inbound.length} in
              </button>
              {showInbound && (
                <div className="mt-1 flex flex-col gap-0.5 rounded-md border border-white/[0.05] bg-white/[0.02] p-1">
                  {inbound.map((src, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); rowNav.jumpTo(src.id); }}
                      title={`From ${src.name} · ${src.condition}`}
                      className="nodrag flex items-center gap-1.5 rounded px-1.5 py-1 text-left text-[10.5px] transition-colors hover:bg-white/[0.05]"
                    >
                      {src.loop && <RotateCcw size={9} className="shrink-0 text-violet-300/80" />}
                      <span className="shrink-0 text-muted-foreground/70">{src.name}</span>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground/45">{src.condition}</span>
                      <ChevronRight size={10} className="shrink-0 text-muted-foreground/40" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {data.desc && (
            <p className="line-clamp-2 px-4 pb-1 text-[12px] leading-relaxed text-muted-foreground/60">
              {data.desc}
            </p>
          )}

          {/* transition rows — each row IS an output port: condition · → target.
              The target name is a link: clicking it navigates (forward or loop). */}
          <div className="mt-1 border-t border-white/[0.05] py-1">
            {rows.map(({ label, handle }, i) => {
              const tgt = rowNav.targetOf(id, handle);
              return (
                <div key={handle} className="relative flex h-[30px] items-center gap-2 px-4">
                  {nodeIssue.branches.has(i) ? (
                    <AlertTriangle size={11} className="shrink-0 text-amber-400" />
                  ) : (
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full opacity-70", m.dot)} />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); rowNav.editBranch(id, i); }}
                    title="Edit this branch in the panel"
                    className="nodrag min-w-0 flex-1 truncate text-left text-[12px] text-foreground/85 transition-colors hover:text-foreground"
                  >
                    {label && label.length ? label : "Next"}
                  </button>
                  {tgt ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); rowNav.jumpTo(tgt.id); }}
                      title={`Go to ${tgt.name}`}
                      className="nodrag inline-flex max-w-[108px] shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground"
                    >
                      {tgt.loop && <RotateCcw size={10} className="shrink-0 text-violet-300/80" />}
                      <span className="truncate">{tgt.name}</span>
                      <ChevronRight size={11} className="shrink-0 opacity-60" />
                    </button>
                  ) : (
                    <span className="shrink-0 text-[10px] text-muted-foreground/35">unwired</span>
                  )}
                  <Handle
                    id={handle}
                    type="source"
                    position={Position.Right}
                    className={cn(PORT, "!right-[-6px]")}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* "+" add affordance — connect a new node (single-exit, non-branching nodes) */}
        {!multi && !canBranch && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const r = e.currentTarget.getBoundingClientRect();
              openPicker(id, rows[0].handle, { x: r.right + 6, y: r.top });
            }}
            title="Click to add a new node"
            className="nodrag absolute right-[-30px] top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 transition-all hover:border-foreground hover:text-foreground group-hover:opacity-100"
          >
            <Plus size={12} />
          </button>
        )}

        {/* "Add branch" — branch-capable nodes (LLM / Condition) can fan out to many outputs */}
        {canBranch && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addExit(id);
            }}
            title="Add a branch"
            className="nodrag absolute -bottom-3 left-1/2 flex h-6 -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card px-2 text-[10px] font-medium text-muted-foreground opacity-0 transition-all hover:border-foreground/40 hover:text-foreground group-hover:opacity-100"
          >
            <Plus size={11} /> Branch
          </button>
        )}
      </div>
    );
  }
  FlowNode.displayName = `Node_${kind}`;
  return FlowNode;
}

const nodeTypes = {
  llm: makeNode("llm"),
  fixed: makeNode("fixed"),
  logic: makeNode("logic"),
  endpoint: makeNode("endpoint"),
};

/* ── Node types — the 4 we support ───────────────────────────────────── */

const NODE_TYPES: { kind: NodeKind; label: string; desc: string; data: NodeData }[] = [
  { kind: "llm", label: "LLM", desc: "Understands the caller and decides where to go next", data: { name: "new_prompt", desc: "Understands the caller and decides where to go next." } },
  { kind: "fixed", label: "Static", desc: "Plays a fixed message, then moves on", data: { name: "new_static", desc: "Plays a fixed message, then moves on." } },
  { kind: "logic", label: "Condition", desc: "Branch the flow on conditions", data: { name: "new_condition", desc: "Route the call by condition.", exits: ["If true", "Else"] } },
  { kind: "endpoint", label: "Endpoint", desc: "Call an external endpoint", data: { name: "new_endpoint", desc: "Call an external endpoint.", invalid: true } },
];

/* ── Floating edge geometry ──────────────────────────────────────────────
   Conversation flows are cyclic — transitions go forward AND backward. A
   floating edge attaches to whichever node border faces the other node, so a
   back-edge leaves the source's left and enters the target's right instead of
   wrapping around. Ported from React Flow's floating-edges example. */

function nodeIntersection(a: InternalNode, b: InternalNode) {
  const { width: aw = 0, height: ah = 0 } = a.measured;
  const ap = a.internals.positionAbsolute;
  const bp = b.internals.positionAbsolute;
  const w = aw / 2;
  const h = ah / 2;
  const x2 = ap.x + w;
  const y2 = ap.y + h;
  const x1 = bp.x + (b.measured.width ?? 0) / 2;
  const y1 = bp.y + (b.measured.height ?? 0) / 2;
  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const k = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
  const xx3 = k * xx1;
  const yy3 = k * yy1;
  return { x: w * (xx3 + yy3) + x2, y: h * (-xx3 + yy3) + y2 };
}

function borderSide(node: InternalNode, p: { x: number; y: number }): Position {
  const n = node.internals.positionAbsolute;
  const w = node.measured.width ?? 0;
  const h = node.measured.height ?? 0;
  const px = Math.round(p.x);
  const py = Math.round(p.y);
  if (px <= Math.round(n.x) + 1) return Position.Left;
  if (px >= Math.round(n.x + w) - 1) return Position.Right;
  if (py <= Math.round(n.y) + 1) return Position.Top;
  return Position.Bottom;
}

function edgeParams(source: InternalNode, target: InternalNode) {
  const sp = nodeIntersection(source, target);
  const tp = nodeIntersection(target, source);
  return {
    sx: sp.x,
    sy: sp.y,
    tx: tp.x,
    ty: tp.y,
    sourcePos: borderSide(source, sp),
    targetPos: borderSide(target, tp),
  };
}

/** Absolute center of a specific handle (hole) so edges land hole-to-hole. */
function handlePoint(
  node: InternalNode,
  type: "source" | "target",
  handleId?: string | null,
): { x: number; y: number } {
  const p = node.internals.positionAbsolute;
  const bounds = node.internals.handleBounds?.[type];
  const h = (handleId ? bounds?.find((b) => b.id === handleId) : undefined) ?? bounds?.[0];
  if (!h) {
    // Fallback before handles are measured: side-center (right for out, left for in).
    const w = node.measured.width ?? 0;
    const ht = node.measured.height ?? 0;
    return type === "source"
      ? { x: p.x + w, y: p.y + ht / 2 }
      : { x: p.x, y: p.y + ht / 2 };
  }
  return { x: p.x + h.x + h.width / 2, y: p.y + h.y + h.height / 2 };
}

/* ── Floating edge with an editable condition label ──────────────────── */

function ConditionEdge({
  id,
  source,
  target,
  sourceHandleId,
  targetHandleId,
  markerEnd,
  data,
}: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const hovered = React.useContext(HoverNode);
  const showLoops = React.useContext(ShowLoops);
  const rowNav = React.useContext(RowNav);
  const { setCenter, getZoom, deleteElements } = useReactFlow();
  if (!sourceNode || !targetNode) return null;

  const branchIndex = (() => {
    const h = sourceHandleId ?? "t-0";
    return h.startsWith("t-") ? parseInt(h.slice(2), 10) : 0;
  })();

  const removeEdge = () => deleteElements({ edges: [{ id }] });

  const focusNode = (n: InternalNode) => {
    const w = n.measured.width ?? 0;
    const h = n.measured.height ?? 0;
    const p = n.internals.positionAbsolute;
    setCenter(p.x + w / 2, p.y + h / 2, { zoom: getZoom(), duration: 450 });
  };

  // Forward geometry: source's right (output) → target's left (input).
  const out = handlePoint(sourceNode, "source", sourceHandleId);
  const tin = handlePoint(targetNode, "target", targetHandleId);

  // A back-edge (target sits left of its source) reads as a loop.
  const isBack = tin.x < out.x - 4;

  // Every transition leaves the source's OUTPUT (right) hole and enters the
  // target's INPUT (left) hole.
  const sx = out.x, sy = out.y, tx = tin.x, ty = tin.y;

  let path: string, labelX: number, labelY: number;
  if (isBack) {
    // Backward edges route through a dedicated lane BELOW the nodes: out-right,
    // down into the lane, left across, up into the target's input. A per-edge
    // lane offset keeps multiple loops from stacking on top of each other.
    const R = 24;
    const jitter = ([...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 5) * 40;
    const laneY = Math.max(sy, ty) + 130 + jitter;
    path = `M${sx},${sy} L${sx + R},${sy} L${sx + R},${laneY} L${tx - R},${laneY} L${tx - R},${ty} L${tx},${ty}`;
    labelX = (sx + tx) / 2;
    labelY = laneY;
  } else {
    [path, labelX, labelY] = getSmoothStepPath({
      sourceX: sx,
      sourceY: sy,
      targetX: tx,
      targetY: ty,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      borderRadius: 12,
    });
  }

  // Label = the branch label from the source node's exits (fallback to edge data).
  const exits = (sourceNode.data as NodeData).exits;
  const idx = sourceHandleId?.startsWith("t-")
    ? parseInt(sourceHandleId.slice(2), 10)
    : null;
  const label = (idx != null ? exits?.[idx] : undefined) ?? (data as { label?: string })?.label;
  const sName = (sourceNode.data as NodeData).name;
  const tName = (targetNode.data as NodeData).name;
  const tool = (data as { tool?: string })?.tool;
  const desc = (data as { desc?: string })?.desc;

  // Hover focus: connected edges light up, the rest dim.
  const connected = hovered === source || hovered === target;
  const dim = hovered != null && !connected;

  const stroke = isBack
    ? connected
      ? "rgba(167,139,250,0.95)"
      : "rgba(167,139,250,0.5)"
    : connected
      ? "rgba(255,255,255,0.55)"
      : "rgba(255,255,255,0.10)";

  // B · jump chips — a backward edge collapses to a "↩ to X" tag at the source
  // and a small inbound tab at the target, instead of a long crossing line.
  if (isBack && !showLoops) {
    return (
      <>
        {/* faint ghost line — hints the backward link without full spaghetti */}
        <BaseEdge
          id={id}
          path={path}
          style={{
            stroke: "rgba(167,139,250,0.95)",
            strokeWidth: 1.5,
            strokeDasharray: "4 4",
            strokeLinecap: "round",
            opacity: dim ? 0.25 : connected ? 0.9 : 0.55,
            transition: "opacity 150ms",
          }}
        />
        <EdgeLabelRenderer>
        {/* source tag → jump to target (delete appears on hover) */}
        <div
          className="group nodrag nopan absolute inline-flex items-center gap-1"
          style={{
            transform: `translate(0,-50%) translate(${sx + 8}px,${sy}px)`,
            pointerEvents: "all",
            opacity: dim ? 0.35 : 1,
          }}
        >
          <button
            className="inline-flex items-center gap-1 rounded-full border border-violet-500/50 bg-violet-500/[0.14] px-2 py-0.5 text-[10px] font-medium text-violet-200 shadow-sm transition-colors hover:bg-violet-500/25"
            onClick={() => focusNode(targetNode)}
            title={`Loops back to ${tName}${label ? ` · ${label}` : ""}`}
          >
            <CornerDownRight size={10} className="shrink-0 rotate-180" />
            <span className="max-w-[120px] truncate">to {tName}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeEdge(); }}
            title="Delete connection"
            aria-label="Delete connection"
            className="hidden size-[18px] shrink-0 items-center justify-center rounded-full border border-violet-500/50 bg-violet-500/[0.14] text-violet-200 transition-colors hover:border-rose-500/60 hover:text-rose-400 group-hover:inline-flex"
          >
            <X size={11} />
          </button>
        </div>

        {/* target inbound tab → jump back to source */}
        <button
          className="nodrag nopan absolute flex h-5 w-4 items-center justify-center rounded-sm border border-violet-500/50 bg-violet-500/[0.14] text-violet-200 transition-colors hover:bg-violet-500/25"
          style={{
            transform: `translate(-100%,-50%) translate(${tx - 8}px,${ty}px)`,
            pointerEvents: "all",
            opacity: dim ? 0.35 : 1,
          }}
          onClick={() => focusNode(sourceNode)}
          title={`Return from ${sName}${label ? ` · ${label}` : ""}`}
        >
          <CornerDownRight size={9} className="rotate-180" />
        </button>
        </EdgeLabelRenderer>
      </>
    );
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        className={connected ? "rf-flow-anim" : undefined}
        style={{
          stroke,
          strokeWidth: connected ? 2 : 1.25,
          strokeDasharray: isBack ? "6 5" : connected ? "5 5" : "none",
          strokeLinecap: "round",
          opacity: dim ? 0.25 : 1,
          transition: "opacity 150ms, stroke 150ms, stroke-width 150ms",
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="group nodrag nopan absolute"
            style={{
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              opacity: dim ? 0.25 : 1,
            }}
          >
            <div className="inline-flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); rowNav.editBranch(source, branchIndex); }}
                title="Edit this transition in the panel"
                className={cn(
                  "inline-flex max-w-[160px] items-center gap-1.5 rounded-md border bg-card px-2 py-0.5 text-[10px] text-foreground shadow-sm transition-colors hover:border-foreground/40",
                  isBack ? "border-violet-500/40" : "border-border",
                )}
              >
                <span className="truncate">{label}</span>
                <Pencil size={9} className="shrink-0 text-muted-foreground" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeEdge(); }}
                title="Delete connection"
                aria-label="Delete connection"
                className="hidden size-[18px] shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:border-rose-500/50 hover:text-rose-400 group-hover:inline-flex"
              >
                <X size={11} />
              </button>
            </div>

            {/* Hover details — full transition (condition · tool · description · route) */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-[100] mb-2 w-max min-w-[160px] max-w-[260px] -translate-x-1/2 -translate-y-0.5 rounded-lg border border-border bg-popover px-3 py-2 text-left opacity-0 shadow-xl transition-all duration-150 group-hover:-translate-y-0 group-hover:opacity-100">
              <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground/60">
                Transition
              </div>
              <div className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-foreground">
                {label || "No condition set"}
              </div>
              {tool && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  <Zap size={9} className="text-amber-400" />
                  {tool}
                </div>
              )}
              {desc && (
                <div className="mt-1.5 whitespace-pre-wrap break-words text-[10px] leading-relaxed text-muted-foreground/80">
                  {desc}
                </div>
              )}
              <div className="mt-1.5 border-t border-border pt-1.5 text-[10px] text-muted-foreground/70">
                {sName} <span className="text-muted-foreground/40">→</span> {tName}
              </div>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes = { condition: ConditionEdge };

const EDGE_DEFAULTS = {
  type: "condition",
  markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(255,255,255,0.3)", width: 16, height: 16 },
};

/* ── First arrival — a bare Start node; the user picks a template or starts
   blank from the start overlay. Templates drop in an editable working flow. */

const START_NODE: Node<NodeData> = {
  id: "start",
  type: "llm",
  position: { x: 80, y: 260 },
  data: { name: "Greeting", desc: "Greets the caller and asks how to help.", config: { startType: "LLM" }, exits: ["ready"] },
};

const SEED_NODES: Node<NodeData>[] = [START_NODE];
const SEED_EDGES: Edge[] = [];

const e = (id: string, source: string, sh: string, target: string): Edge => ({
  id,
  source,
  sourceHandle: sh,
  target,
  ...EDGE_DEFAULTS,
});

type Template = {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  build: () => { nodes: Node<NodeData>[]; edges: Edge[] };
};

const TEMPLATES: Template[] = [
  {
    id: "support",
    name: "Support triage",
    desc: "Greet, detect intent, then route to booking or support.",
    icon: Network,
    build: () => ({
      nodes: [
        { ...START_NODE, position: { x: 40, y: 280 } },
        {
          id: "intent",
          type: "logic",
          position: { x: 360, y: 260 },
          data: {
            name: "Detect intent",
            desc: "Routes the call by what the caller wants.",
            exits: ["intent == booking", "intent == support", "Else"],
            config: {
              conditionRules: [
                { conds: [{ variable: "intent", operator: "==", type: "string", value: "booking" }] },
                { conds: [{ variable: "intent", operator: "==", type: "string", value: "support" }] },
              ],
            },
          },
        },
        { id: "booking", type: "llm", position: { x: 720, y: 120 }, data: { name: "Booking", desc: "Collects date, time and details.", exits: ["confirmed"] } },
        { id: "create", type: "endpoint", position: { x: 1060, y: 120 }, data: { name: "Create appointment", desc: "Calls the scheduling API.", exits: ["done"] } },
        { id: "support", type: "fixed", position: { x: 720, y: 300 }, data: { name: "Support message", desc: "Plays support hours and options.", exits: ["next"] } },
        { id: "reprompt", type: "fixed", position: { x: 720, y: 470 }, data: { name: "Reprompt", desc: "Asks the caller to rephrase.", exits: ["retry"] } },
      ],
      edges: [
        e("e1", "start", "t-0", "intent"),
        e("e2", "intent", "t-0", "booking"),
        e("e3", "intent", "t-1", "support"),
        e("e4", "intent", "t-2", "reprompt"),
        e("e5", "booking", "t-0", "create"),
      ],
    }),
  },
  {
    id: "booking",
    name: "Appointment booking",
    desc: "Greet, collect details, then create the appointment.",
    icon: Sparkles,
    build: () => ({
      nodes: [
        { ...START_NODE, position: { x: 80, y: 200 } },
        { id: "collect", type: "llm", position: { x: 420, y: 200 }, data: { name: "Collect details", desc: "Ask for date, time and name.", exits: ["ready"] } },
        { id: "create", type: "endpoint", position: { x: 760, y: 200 }, data: { name: "Create appointment", desc: "Calls the scheduling API.", exits: ["done"] } },
        { id: "confirm", type: "fixed", position: { x: 1100, y: 200 }, data: { name: "Confirm", desc: "Reads back the booking.", exits: ["end"] } },
      ],
      edges: [e("e1", "start", "t-0", "collect"), e("e2", "collect", "t-0", "create"), e("e3", "create", "t-0", "confirm")],
    }),
  },
  {
    id: "lead",
    name: "Lead qualification",
    desc: "Qualify the caller, then book a demo or nurture.",
    icon: MessageSquare,
    build: () => ({
      nodes: [
        { ...START_NODE, position: { x: 80, y: 240 } },
        {
          id: "qualify",
          type: "logic",
          position: { x: 420, y: 220 },
          data: {
            name: "Qualified?",
            desc: "Branch on whether the lead is a fit.",
            exits: ["budget == yes", "Else"],
            config: { conditionRules: [{ conds: [{ variable: "budget", operator: "==", type: "string", value: "yes" }] }] },
          },
        },
        { id: "demo", type: "llm", position: { x: 780, y: 120 }, data: { name: "Book a demo", desc: "Schedule a product demo.", exits: ["done"] } },
        { id: "nurture", type: "fixed", position: { x: 780, y: 320 }, data: { name: "Nurture message", desc: "Send follow-up resources.", exits: ["end"] } },
      ],
      edges: [e("e1", "start", "t-0", "qualify"), e("e2", "qualify", "t-0", "demo"), e("e3", "qualify", "t-1", "nurture")],
    }),
  },
];

let idSeq = 100;

/* ── Serialize → backend fNodes/fEdges shape (from AgentFlow.tsx contract) ─
   Links are projected from the edges: fixed/endpoint → single `child`;
   llm → keyed `children[]`; logic → a (flat, Phase-C-pending) condition. */

function targetFor(edges: Edge[], nodeId: string, handle?: string) {
  return (
    edges.find(
      (e) => e.source === nodeId && (handle ? e.sourceHandle === handle : true),
    )?.target ?? ""
  );
}

// Resolve each string branch to its wired target id (or unwired sentinel = key);
// recurse into nested conditions.
function resolveCondition(c: Condition, nodeId: string, edges: Edge[]): Condition {
  const branch = (b: "yes" | "no"): string | Condition => {
    const v = c[b];
    if (typeof v !== "string") return resolveCondition(v, nodeId, edges);
    return targetFor(edges, nodeId, `${c.key}#${b}`) || c.key;
  };
  return { ...c, yes: branch("yes"), no: branch("no") };
}

function serialize(nodes: Node<NodeData>[], edges: Edge[]) {
  const fNodes = nodes.map((n) => {
    const d = n.data;
    const cfg = d.config ?? {};
    const s = (k: string, dflt = "") => String(cfg[k] ?? dflt);
    const exits = d.exits ?? [];

    // The start node persists as its chosen type (llm | logic).
    const type =
      n.id === "start" ? (s("startType", "LLM") === "Condition" ? "logic" : "llm") : n.type;

    let data: Record<string, unknown>;
    if (type === "fixed") {
      data = { name: d.name, response: s("message"), child: targetFor(edges, n.id), type: "fixed" };
    } else if (type === "endpoint") {
      data = {
        name: d.name,
        child: targetFor(edges, n.id),
        type: "endpoint",
        endpoint: {
          address: s("url"),
          type: s("method", "POST"),
          timeout: Number(cfg.timeout ?? 15000),
          headers: "",
          body: s("body"),
          outputs: {},
          conditions: [],
        },
        headers: (cfg.headers as unknown[]) ?? [{ key: "Content-Type", value: "application/json" }],
        outputs: (cfg.responseVars as unknown[]) ?? [],
      };
    } else if (type === "logic") {
      // String transitions: each condition is a plain-language string.
      data = {
        name: d.name,
        type: "logic",
        conditions: exits.map((label, i) => ({
          key: `t-${i}`,
          condition: label,
          id: targetFor(edges, n.id, `t-${i}`),
        })),
      };
    } else {
      // llm
      data = {
        name: d.name,
        systemPrompt: s("prompt"),
        functions: [],
        children: exits.map((label, i) => ({
          key: `t-${i}`,
          id: targetFor(edges, n.id, `t-${i}`),
          transfer: {
            type: "description",
            description: label,
            messages: { start: { type: "fixed", message: "" } },
            parameters: [],
            transitionBackToStart: false,
          },
        })),
        type: "llm",
      };
    }

    return { id: n.id, type, position: n.position, data };
  });

  return { fNodes, fEdges: edges };
}

/* ── Right-click menu ────────────────────────────────────────────────── */

type Menu = { x: number; y: number; nodeId: string } | null;

function Canvas() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(SEED_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(SEED_EDGES);
  const [menu, setMenu] = React.useState<Menu>(null);
  // Connect-from-node menu: null = closed; { fromId, fromHandle, at } picks + connects.
  const [picker, setPicker] = React.useState<{ fromId?: string; fromHandle?: string | null; at?: { x: number; y: number } } | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);
  const [showLoops, setShowLoops] = React.useState(false);
  const [focusBranch, setFocusBranch] = React.useState<{ nodeId: string; index: number } | null>(null);
  const [issuesOpen, setIssuesOpen] = React.useState(false);
  const [startDismissed, setStartDismissed] = React.useState(false);
  const [agentName, setAgentName] = React.useState("Untitled agent");
  const [saveState, setSaveState] = React.useState<"saved" | "saving">("saved");
  const [showTips, setShowTips] = React.useState(false);
  const connectingFrom = React.useRef<{ nodeId: string; handleId: string | null } | null>(null);
  const wrap = React.useRef<HTMLDivElement>(null);
  const { fitView, setCenter, getZoom } = useReactFlow();

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  // Row navigation — resolves a node handle's outbound target (name + loop flag)
  // and pans to a node. Powers the labeled transition rows on each node.
  const nodeName = React.useMemo(
    () => new Map(nodes.map((n) => [n.id, (n.data as NodeData).name])),
    [nodes],
  );
  const nodeX = React.useMemo(() => new Map(nodes.map((n) => [n.id, n.position.x])), [nodes]);
  const nodeExits = React.useMemo(
    () => new Map(nodes.map((n) => [n.id, (n.data as NodeData).exits ?? []])),
    [nodes],
  );
  const [history, setHistory] = React.useState<string[]>([]);

  const centerOn = React.useCallback(
    (nodeId: string) => {
      const n = nodes.find((x) => x.id === nodeId);
      if (!n) return;
      const w = n.measured?.width ?? 288;
      const h = n.measured?.height ?? 160;
      setCenter(n.position.x + w / 2, n.position.y + h / 2, { zoom: getZoom(), duration: 450 });
    },
    [nodes, setCenter, getZoom],
  );

  const rowNav = React.useMemo<RowNavCtx>(
    () => ({
      targetOf: (nodeId, handle) => {
        const e = edges.find(
          (ed) => ed.source === nodeId && (ed.sourceHandle ?? "t-0") === handle,
        );
        if (!e) return null;
        const sx = nodeX.get(nodeId);
        const tx = nodeX.get(e.target);
        return {
          id: e.target,
          name: nodeName.get(e.target) ?? e.target,
          loop: sx != null && tx != null && tx < sx - 4,
        };
      },
      inboundOf: (nodeId) => {
        const tx = nodeX.get(nodeId);
        return edges
          .filter((e) => e.target === nodeId)
          .map((e) => {
            const handle = e.sourceHandle ?? "t-0";
            const idx = handle.startsWith("t-") ? parseInt(handle.slice(2), 10) : 0;
            const exits = nodeExits.get(e.source) ?? [];
            const sx = nodeX.get(e.source);
            return {
              id: e.source,
              name: nodeName.get(e.source) ?? e.source,
              condition: exits[idx] && exits[idx].length ? exits[idx] : "Next",
              loop: sx != null && tx != null && sx > tx + 4,
            };
          });
      },
      jumpTo: (nodeId) => {
        centerOn(nodeId);
        setSelectedId((prev) => {
          if (prev && prev !== nodeId) setHistory((h) => [...h, prev]);
          return nodeId;
        });
      },
      editBranch: (nodeId, index) => {
        setSelectedId(nodeId);
        setFocusBranch({ nodeId, index });
      },
    }),
    [edges, nodeName, nodeX, nodeExits, centerOn],
  );

  // Selection-driven focus: dim everything that isn't the selected node or one
  // of its direct neighbours (no toggle — it's just a consequence of selecting).
  const focusDim = React.useMemo<(id: string) => boolean>(() => {
    if (!selectedId) return () => false;
    const neigh = new Set<string>([selectedId]);
    edges.forEach((e) => {
      if (e.source === selectedId) neigh.add(e.target);
      if (e.target === selectedId) neigh.add(e.source);
    });
    return (id) => !neigh.has(id);
  }, [selectedId, edges]);

  const goBack = React.useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      centerOn(prev);
      setSelectedId(prev);
      return h.slice(0, -1);
    });
  }, [centerOn]);

  // Tidy up — Sugiyama-style layered layout so every path reads clearly with no
  // overlaps: (1) drop backward edges so the rest is a DAG, (2) longest-path
  // layering into columns, (3) barycenter ordering within columns to minimise
  // edge crossings, (4) wide, centered spacing.
  const tidyUp = React.useCallback(() => {
    const COL = 460, ROW = 340, X0 = 80, Y0 = 120;
    const ids = nodes.map((n) => n.id);
    const succ = new Map<string, string[]>(ids.map((id) => [id, []]));
    const pred = new Map<string, string[]>(ids.map((id) => [id, []]));
    edges.forEach((e) => {
      if (succ.has(e.source) && succ.has(e.target)) {
        succ.get(e.source)!.push(e.target);
        pred.get(e.target)!.push(e.source);
      }
    });

    // (1) Classify back edges via DFS (edge into a node on the recursion stack).
    const roots = ids.includes("start") ? ["start"] : ids.slice(0, 1);
    const state = new Map<string, number>(); // 0 seen-in-stack, 1 done
    const back = new Set<string>();
    const dfs = (u: string) => {
      state.set(u, 0);
      for (const v of succ.get(u) ?? []) {
        const st = state.get(v);
        if (st === 0) back.add(`${u} ${v}`);
        else if (st === undefined) dfs(v);
      }
      state.set(u, 1);
    };
    roots.forEach((r) => state.get(r) === undefined && dfs(r));
    ids.forEach((id) => state.get(id) === undefined && dfs(id));
    const dagEdges = edges.filter(
      (e) => succ.has(e.source) && succ.has(e.target) && !back.has(`${e.source} ${e.target}`),
    );

    // (2) Longest-path layering over the DAG.
    const layer = new Map<string, number>(ids.map((id) => [id, 0]));
    for (let i = 0; i < ids.length; i++) {
      let changed = false;
      for (const e of dagEdges) {
        const nl = layer.get(e.source)! + 1;
        if (nl > layer.get(e.target)!) { layer.set(e.target, nl); changed = true; }
      }
      if (!changed) break;
    }

    // (3) Order within each layer by barycenter of neighbours (a few sweeps).
    const cols: string[][] = [];
    ids.forEach((id) => (cols[layer.get(id)!] ??= []).push(id));
    const dagPred = new Map<string, string[]>(ids.map((id) => [id, []]));
    const dagSucc = new Map<string, string[]>(ids.map((id) => [id, []]));
    dagEdges.forEach((e) => { dagSucc.get(e.source)!.push(e.target); dagPred.get(e.target)!.push(e.source); });
    const order = new Map<string, number>();
    cols.forEach((col) => col.forEach((id, i) => order.set(id, i)));
    const bary = (id: string, side: Map<string, string[]>) => {
      const ns = side.get(id) ?? [];
      if (!ns.length) return order.get(id)!;
      return ns.reduce((a, n) => a + order.get(n)!, 0) / ns.length;
    };
    for (let sweep = 0; sweep < 5; sweep++) {
      const side = sweep % 2 === 0 ? dagPred : dagSucc;
      cols.forEach((col) => {
        col.sort((a, b) => bary(a, side) - bary(b, side));
        col.forEach((id, i) => order.set(id, i));
      });
    }

    // (4) Wide, vertically-centered placement.
    const tallest = Math.max(1, ...cols.map((c) => c?.length ?? 0));
    const pos = new Map<string, { x: number; y: number }>();
    cols.forEach((col, c) => {
      if (!col) return;
      const offset = (tallest - col.length) / 2;
      col.forEach((id, row) => pos.set(id, { x: X0 + c * COL, y: Y0 + (row + offset) * ROW }));
    });

    setNodes((ns) => ns.map((n) => ({ ...n, position: pos.get(n.id) ?? n.position })));
    setShowLoops(true); // draw the loop lines so the whole flow is visible
    setTimeout(() => fitView({ duration: 500, padding: 0.25 }), 60);
  }, [nodes, edges, setNodes, fitView]);

  // Count backward (loop) edges — target positioned left of its source.
  const loopCount = React.useMemo(() => {
    const pos = new Map(nodes.map((n) => [n.id, n.position.x]));
    return edges.reduce((acc, e) => {
      const sx = pos.get(e.source);
      const tx = pos.get(e.target);
      return acc + (sx != null && tx != null && tx < sx - 4 ? 1 : 0);
    }, 0);
  }, [nodes, edges]);

  // Validation — unwired branches, empty conditions, unreachable nodes.
  const validation = React.useMemo(() => {
    const issues: Issue[] = [];
    const succ = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
    edges.forEach((e) => succ.get(e.source)?.push(e.target));
    // reachability (directed, from Start)
    const reach = new Set<string>();
    const stack = nodes.some((n) => n.id === "start") ? ["start"] : [];
    while (stack.length) {
      const id = stack.pop()!;
      if (reach.has(id)) continue;
      reach.add(id);
      (succ.get(id) ?? []).forEach((t) => !reach.has(t) && stack.push(t));
    }
    const wired = new Set(edges.map((e) => `${e.source}::${e.sourceHandle ?? "t-0"}`));
    nodes.forEach((n) => {
      const d = n.data as NodeData;
      if (n.id !== "start" && !reach.has(n.id)) {
        issues.push({ nodeId: n.id, level: "error", message: "Unreachable from Start" });
      }
      // Endpoints may terminate; other node kinds should route their branches.
      if (n.type === "endpoint") return;
      const rows = (d.exits ?? []).length ? (d.exits as string[]) : [""];
      rows.forEach((label, i) => {
        const isElse = (label ?? "").trim().toLowerCase() === "else";
        if (!wired.has(`${n.id}::t-${i}`)) {
          issues.push({ nodeId: n.id, branchIndex: i, level: "warn", message: `Branch "${label || "(unnamed)"}" has no destination` });
        } else if (!isElse && !(label ?? "").trim()) {
          issues.push({ nodeId: n.id, branchIndex: i, level: "warn", message: "Branch has no condition" });
        }
      });
    });
    const byNode = new Map<string, NodeIssue>();
    issues.forEach((iss) => {
      const cur = byNode.get(iss.nodeId) ?? { level: null, branches: new Set<number>() };
      cur.level = cur.level === "error" || iss.level === "error" ? "error" : "warn";
      if (iss.branchIndex != null) cur.branches.add(iss.branchIndex);
      byNode.set(iss.nodeId, cur);
    });
    return { issues, byNode };
  }, [nodes, edges]);
  const issuesOf = React.useCallback(
    (nodeId: string) => validation.byNode.get(nodeId) ?? { level: null, branches: new Set<number>() },
    [validation],
  );
  const nodeNameOf = React.useCallback(
    (nodeId: string) => (nodes.find((n) => n.id === nodeId)?.data as NodeData | undefined)?.name ?? nodeId,
    [nodes],
  );

  // Collapse the app sidebar the moment the user touches the canvas — they can
  // reopen it manually if needed. Restore it when leaving the builder.
  const { setCollapsed } = useSidebar();
  React.useEffect(() => () => setCollapsed(false), [setCollapsed]);

  // Merge a patch into a node's data (title/desc/invalid or nested config).
  const updateData = React.useCallback(
    (id: string, patch: Partial<NodeData>) => {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === id ? { ...n, data: { ...(n.data as NodeData), ...patch } } : n,
        ),
      );
    },
    [setNodes],
  );
  const addExit = React.useCallback(
    (id: string) => {
      setNodes((ns) =>
        ns.map((n) => {
          if (n.id !== id) return n;
          const d = n.data as NodeData;
          // Condition nodes stay in sync with their rule builder: a new branch is
          // an Else-If clause, and exits are derived from the clauses (+ Else).
          if (n.type === "logic") {
            const clauses = (d.config?.conditionRules as CondClause[]) ?? [{ conds: [emptyRule()] }];
            const next = [...clauses, { conds: [emptyRule()] }];
            return {
              ...n,
              data: {
                ...d,
                config: { ...(d.config ?? {}), conditionRules: next },
                exits: [...next.map(clauseLabel), "Else"],
              },
            };
          }
          return { ...n, data: { ...d, exits: [...(d.exits ?? []), ""] } };
        }),
      );
    },
    [setNodes],
  );
  const updateConfig = React.useCallback(
    (id: string, key: string, value: unknown) => {
      setNodes((ns) =>
        ns.map((n) => {
          if (n.id !== id) return n;
          const d = n.data as NodeData;
          return { ...n, data: { ...d, config: { ...(d.config ?? {}), [key]: value } } };
        }),
      );
    },
    [setNodes],
  );

  const onConnect = React.useCallback((c: Connection) => {
    connectingFrom.current = null; // a real connection was made
    setEdges((eds) => {
      // One outgoing edge per hole: drop any existing edge from this same handle.
      const pruned = eds.filter(
        (e) => !(e.source === c.source && e.sourceHandle === c.sourceHandle),
      );
      return addEdge({ ...c, data: { label: "new" }, ...EDGE_DEFAULTS }, pruned);
    });
  }, [setEdges]);

  const spawn = (
    kind: NodeKind,
    data: NodeData,
    at: { x: number; y: number },
    from?: string,
    fromHandle?: string | null,
  ) => {
    const id = `${kind}-${idSeq++}`;
    setNodes((ns) => [...ns, { id, type: kind, position: at, data }]);
    if (from) {
      setEdges((es) => [
        // One edge per hole: drop any existing edge from this handle first.
        ...es.filter((e) => !(e.source === from && e.sourceHandle === (fromHandle ?? null))),
        { id: `e-${id}`, source: from, sourceHandle: fromHandle ?? undefined, target: id, data: { label: "new" }, ...EDGE_DEFAULTS },
      ]);
    }
    return id;
  };

  const openPicker = React.useCallback(
    (fromId?: string, fromHandle?: string | null, client?: { x: number; y: number }) => {
      const r = wrap.current?.getBoundingClientRect();
      const at = client
        ? { x: client.x - (r?.left ?? 0), y: client.y - (r?.top ?? 0) }
        : undefined;
      setPicker({ fromId, fromHandle, at });
    },
    [],
  );

  // Place the new node to the right of its source (or center-ish), connect it,
  // give it a smart type-based name, and select it so it's ready to configure.
  const pickNode = (kind: NodeKind, data: NodeData) => {
    const from = picker?.fromId;
    const src = from ? nodes.find((n) => n.id === from) : undefined;
    const at = src
      ? { x: src.position.x + 340, y: src.position.y + (Math.random() * 80 - 40) }
      : { x: 420 + Math.random() * 120, y: 320 + Math.random() * 80 };
    const typeLabel = { llm: "LLM", fixed: "Static", logic: "Condition", endpoint: "Endpoint" }[kind];
    const count = nodes.filter((n) => n.type === kind).length + 1;
    const id = spawn(kind, { ...data, name: `${typeLabel} ${count}` }, at, from, picker?.fromHandle);
    setSelectedId(id);
    setPicker(null);
  };

  // Drag off a port and drop on empty canvas → open the picker to add + connect.
  const onConnectStart = React.useCallback(
    (_: unknown, p: { nodeId: string | null; handleId: string | null }) => {
      connectingFrom.current = p.nodeId ? { nodeId: p.nodeId, handleId: p.handleId } : null;
    },
    [],
  );
  const onConnectEnd = React.useCallback(
    (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const onPane = target?.classList?.contains("react-flow__pane");
      const from = connectingFrom.current;
      const m = e as MouseEvent;
      if (onPane && from) openPicker(from.nodeId, from.handleId, { x: m.clientX, y: m.clientY });
      connectingFrom.current = null;
    },
    [openPicker],
  );

  const openMenu = React.useCallback(
    (nodeId: string, x: number, y: number) => {
      const r = wrap.current?.getBoundingClientRect();
      setMenu({ x: x - (r?.left ?? 0), y: y - (r?.top ?? 0), nodeId });
    },
    [],
  );

  const onNodeContextMenu = React.useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.preventDefault();
      openMenu(node.id, e.clientX, e.clientY);
    },
    [openMenu],
  );

  const del = (id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    setMenu(null);
  };
  const clearCanvas = () => {
    setNodes((ns) => ns.filter((n) => n.id === "start").map((n) => ({ ...n, data: { ...(n.data as NodeData), exits: [""] } })));
    setEdges([]);
    setSelectedId(null);
    setFocusBranch(null);
    setHistory([]);
    setMenu(null);
    setIssuesOpen(false);
    toast("Canvas cleared");
  };
  const applyTemplate = (t: Template, goal: string) => {
    const built = t.build();
    setNodes(built.nodes);
    setEdges(built.edges);
    if (goal.trim()) setAgentName(goal.trim().slice(0, 60));
    setStartDismissed(true);
    setSelectedId(null);
    setFocusBranch(null);
    setHistory([]);
  };
  const startBlank = (goal: string) => {
    if (goal.trim()) setAgentName(goal.trim().slice(0, 60));
    setStartDismissed(true);
  };

  // "Saved" indicator — flip to Saving on any change, settle back to Saved.
  const firstSave = React.useRef(true);
  React.useEffect(() => {
    if (firstSave.current) { firstSave.current = false; return; }
    setSaveState("saving");
    const h = setTimeout(() => setSaveState("saved"), 600);
    return () => clearTimeout(h);
  }, [nodes, edges]);

  // One-time gesture tips after the user leaves the start overlay.
  React.useEffect(() => {
    if (startDismissed && typeof window !== "undefined" && !localStorage.getItem("agentTipsSeen")) {
      setShowTips(true);
    }
  }, [startDismissed]);
  const dismissTips = () => {
    setShowTips(false);
    if (typeof window !== "undefined") localStorage.setItem("agentTipsSeen", "1");
  };

  const duplicate = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    spawn(n.type as NodeKind, { ...(n.data as NodeData) }, { x: n.position.x + 40, y: n.position.y + 60 });
    setMenu(null);
  };

  const publish = () => {
    const payload = serialize(nodes as Node<NodeData>[], edges);
    console.log("agent flow → fNodes/fEdges", payload);
    toast.success(`Saved — ${payload.fNodes.length} nodes, ${payload.fEdges.length} transitions`);
  };

  return (
    <OpenMenu.Provider value={openMenu}>
    <OpenPicker.Provider value={openPicker}>
    <AddExit.Provider value={addExit}>
    <RowNav.Provider value={rowNav}>
    <FocusDim.Provider value={focusDim}>
    <NodeIssues.Provider value={issuesOf}>
    <HoverNode.Provider value={hoveredNode ?? selectedId}>
    <ShowLoops.Provider value={showLoops}>
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/landing")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Agents
          </button>
          <span className="h-4 w-px bg-white/[0.08]" />
          <span className="text-sm font-medium text-foreground">{agentName}</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
            {saveState === "saving" ? (
              <><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" /> Saving…</>
            ) : (
              <><Check size={11} className="text-emerald-400" /> Saved</>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast("Opening test call…")}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/60"
          >
            Test
          </button>
          <button
            onClick={publish}
            className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Publish
          </button>
        </div>
      </header>

      {/* Canvas */}
      <div
        ref={wrap}
        className="relative min-h-0 flex-1"
        onPointerDown={() => setCollapsed(true)}
        onClick={() => setMenu(null)}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionLineStyle={{
            stroke: "rgba(167,139,250,0.6)",
            strokeWidth: 2,
            strokeDasharray: "5 5",
          }}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeContextMenu={onNodeContextMenu}
          onNodeClick={(_, n) => { setSelectedId(n.id); setFocusBranch(null); }}
          onNodeMouseEnter={(_, n) => setHoveredNode(n.id)}
          onNodeMouseLeave={() => setHoveredNode(null)}
          onPaneClick={() => { setSelectedId(null); setFocusBranch(null); }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1.3} color="rgba(255,255,255,0.18)" />
          <Controls
            showInteractive={false}
            className="!rounded-lg !border !border-border !bg-card/80 !shadow-lg backdrop-blur [&_button]:!border-border [&_button]:!bg-transparent [&_button]:!text-foreground [&_button:hover]:!bg-secondary"
          />
        </ReactFlow>

        {/* Top-left cluster — back (walk history) + tidy up */}
        <div className="absolute left-4 top-4 z-30 flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-lg backdrop-blur transition-colors hover:text-foreground"
              title="Back to where you jumped from"
            >
              <ChevronRight size={13} className="rotate-180" />
              Back
            </button>
          )}
          <button
            onClick={tidyUp}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-lg backdrop-blur transition-colors hover:text-foreground"
            title="Auto-arrange the flow"
          >
            <Network size={13} />
            Tidy up
          </button>
          <button
            onClick={clearCanvas}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-lg backdrop-blur transition-colors hover:border-rose-500/50 hover:text-rose-400"
            title="Remove all nodes except Start"
          >
            <Trash2 size={13} />
            Clear
          </button>
        </div>

        {/* Loop-layer toggle — reveal backward edges as lines (else they show as jump chips) */}
        {loopCount > 0 && (
          <button
            onClick={() => setShowLoops((v) => !v)}
            className={cn(
              "absolute right-4 top-4 z-30 inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium shadow-lg backdrop-blur transition-colors",
              showLoops
                ? "border-violet-500/50 bg-violet-500/[0.14] text-violet-200"
                : "border-border bg-card/90 text-muted-foreground hover:text-foreground",
            )}
            title="Toggle backward (loop) transitions"
          >
            <CornerDownRight size={13} className="rotate-180" />
            {showLoops ? "Hide loops" : "Show loops"}
            <span className={cn("rounded px-1 text-[10px]", showLoops ? "bg-violet-500/25" : "bg-white/[0.06]")}>
              {loopCount}
            </span>
          </button>
        )}

        {/* First arrival — template picker / start blank */}
        {!startDismissed && nodes.length <= 1 && edges.length === 0 && (
          <StartOverlay onPick={applyTemplate} onBlank={startBlank} />
        )}

        {/* Empty-flow onboarding hint (after dismissing the start overlay) */}
        {startDismissed && nodes.length <= 1 && edges.length === 0 && (
          <div className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2 text-center">
            <p className="text-sm font-medium text-foreground">Your flow is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">Add your first step from the bar below to begin.</p>
            <ChevronDown size={16} className="mx-auto mt-2 animate-bounce text-muted-foreground/60" />
          </div>
        )}

        {/* One-time gesture tips */}
        {showTips && (
          <div className="absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card/95 px-3.5 py-2 text-[11px] text-muted-foreground shadow-lg backdrop-blur">
            <span>Drag from a dot to connect · click a branch to edit · ⋯ for more</span>
            <button onClick={dismissTips} aria-label="Dismiss tips" className="text-muted-foreground/70 transition-colors hover:text-foreground">
              <X size={13} />
            </button>
          </div>
        )}

        {/* Persistent typed chip toolbar — hidden while the inspector is open */}
        {!selected && <NodeToolbar onPick={pickNode} />}

        {/* Anchored menu when adding from a node's "+" or a dropped port */}
        {picker?.at && (
          <NodeMenu at={picker.at} onPick={pickNode} onClose={() => setPicker(null)} />
        )}


        {selected && (
          <Inspector
            key={selected.id}
            node={selected as Node<NodeData>}
            focusIndex={focusBranch?.nodeId === selected.id ? focusBranch.index : null}
            onData={(patch) => updateData(selected.id, patch)}
            onConfig={(k, v) => updateConfig(selected.id, k, v)}
            onDelete={() => {
              del(selected.id);
              setSelectedId(null);
            }}
            onClose={() => setSelectedId(null)}
          />
        )}

        {/* Right-click context menu */}
        {menu && (
          <div
            className="absolute z-50 w-52 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-xl"
            style={{ left: menu.x, top: menu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem icon={<Trash2 size={14} />} shortcut="⌫" onClick={() => del(menu.nodeId)}>
              Delete
            </MenuItem>
            <MenuItem icon={<Copy size={14} />} shortcut="D" onClick={() => duplicate(menu.nodeId)}>
              Duplicate
            </MenuItem>
            <MenuItem icon={<Copy size={14} />} onClick={() => { toast("Copied configuration"); setMenu(null); }}>
              Copy configuration
            </MenuItem>
            <MenuItem icon={<ClipboardPaste size={14} />} onClick={() => { toast("Pasted configuration"); setMenu(null); }}>
              Paste configuration
            </MenuItem>
          </div>
        )}
      </div>
    </div>
    </ShowLoops.Provider>
    </HoverNode.Provider>
    </NodeIssues.Provider>
    </FocusDim.Provider>
    </RowNav.Provider>
    </AddExit.Provider>
    </OpenPicker.Provider>
    </OpenMenu.Provider>
  );
}

/* ── Node menu — small popover anchored at a node's "+" to add + connect ── */

function NodeMenu({
  at,
  onPick,
  onClose,
}: {
  at: { x: number; y: number };
  onPick: (kind: NodeKind, data: NodeData) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="rf-node-in absolute z-50 w-48 rounded-xl border border-border bg-popover p-1 shadow-2xl"
        style={{ left: at.x, top: at.y }}
        onClick={(e) => e.stopPropagation()}
      >
        {NODE_TYPES.map((it) => {
          const m = META[it.kind];
          const Icon = m.icon;
          return (
            <button
              key={it.kind}
              onClick={() => onPick(it.kind, it.data)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary/60"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-white/[0.08]"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <Icon size={13} className={m.accent} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-foreground">{it.label}</span>
                <span className="block truncate text-[10px] text-muted-foreground/70">{it.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ── Start overlay — first arrival: goal + template picker / start blank ─── */

function StartOverlay({
  onPick,
  onBlank,
}: {
  onPick: (t: Template, goal: string) => void;
  onBlank: (goal: string) => void;
}) {
  const [goal, setGoal] = React.useState("");
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/70 p-6 backdrop-blur-sm">
      <div className="rf-node-in w-[600px] max-w-full rounded-xl border border-border bg-popover p-6 shadow-2xl">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">What should this agent do?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start from a template you can edit, or build from scratch.
        </p>
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Book appointments for a dental clinic"
          className="mt-4 h-10 w-full rounded-lg border border-border bg-transparent dark:bg-input/30 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {TEMPLATES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onPick(t, goal)}
                className="flex items-start gap-3 rounded-xl border border-border bg-white/[0.02] p-3 text-left transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-white/[0.08]" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <Icon size={15} className="text-violet-300" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-foreground">{t.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground/75">{t.desc}</span>
                </span>
              </button>
            );
          })}
          <button
            onClick={() => onBlank(goal)}
            className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.12] p-3 text-left transition-colors hover:border-white/[0.24] hover:bg-white/[0.02]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-white/[0.08]">
              <Plus size={15} className="text-muted-foreground" />
            </span>
            <span className="text-[13px] font-medium text-foreground">Start from scratch</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Node toolbar — persistent typed chip row at the bottom of the canvas ── */

function NodeToolbar({
  onPick,
}: {
  onPick: (kind: NodeKind, data: NodeData) => void;
}) {
  return (
    <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur">
      <span className="pl-1.5 pr-0.5 text-muted-foreground/70">
        <Plus size={15} />
      </span>
      {NODE_TYPES.map((it) => {
        const m = META[it.kind];
        const Icon = m.icon;
        return (
          <button
            key={it.kind}
            title={it.desc}
            onClick={() => onPick(it.kind, it.data)}
            className="flex items-center gap-1.5 rounded-xl border border-transparent px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <Icon size={14} className={m.accent} />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Inspector (right drawer, per-type config) ───────────────────────── */

function Inspector({
  node,
  focusIndex,
  onData,
  onConfig,
  onDelete,
  onClose,
}: {
  node: Node<NodeData>;
  focusIndex: number | null;
  onData: (patch: Partial<NodeData>) => void;
  onConfig: (key: string, value: unknown) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const kind = node.type as NodeKind;
  const m = META[kind];
  const cfg = node.data.config ?? {};
  const s = (k: string, d = "") => String(cfg[k] ?? d);

  // Drag-resizable width (default ~50% of the window).
  const [width, setWidth] = React.useState(560);
  React.useEffect(() => {
    setWidth(Math.round(window.innerWidth * 0.5));
  }, []);
  const startResize = (e: React.PointerEvent) => {
    e.preventDefault();
    const onMove = (ev: PointerEvent) => {
      const w = window.innerWidth - ev.clientX;
      setWidth(Math.max(380, Math.min(window.innerWidth * 0.85, w)));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      style={{ width }}
      className="absolute inset-y-0 right-0 z-20 flex flex-col border-l border-border bg-popover shadow-2xl"
    >
      {/* drag handle to resize width */}
      <div
        onPointerDown={startResize}
        className="absolute inset-y-0 left-[-3px] z-30 w-1.5 cursor-col-resize transition-colors hover:bg-violet-400/40"
      />
      {/* header */}
      <div className="flex items-start justify-between gap-2 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <m.icon size={15} className={m.accent} />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {m.category}
            </span>
          </div>
          <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground/70">
            id: {node.id}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onDelete}
            aria-label="Delete node"
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-rose-400"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* body */}
      <div className="scroll-thin flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <InsField label="Name" hint="A unique label to identify this node in the flow.">
          <InsInput value={node.data.name} onChange={(v) => onData({ name: v })} />
        </InsField>

        {/* LLM fans out to plain string transitions. */}
        {kind === "llm" && (
          <TransitionsEditor
            exits={node.data.exits ?? []}
            focusIndex={focusIndex}
            onChange={(next) => onData({ exits: next })}
          />
        )}

        {/* Condition uses a structured rule builder (If / Else if / Else). */}
        {kind === "logic" && (
          <ConditionRules
            value={clausesFromNode(node.data.exits ?? [], cfg.conditionRules as CondClause[] | undefined)}
            focusIndex={focusIndex}
            onChange={(clauses) => {
              onConfig("conditionRules", clauses);
              onData({ exits: [...clauses.map(clauseLabel), "Else"] });
            }}
          />
        )}

        {/* Start node — routes as LLM or Condition */}
        {node.id === "start" && (
          <InsField label="Start type" hint="How the start node decides which transition to take.">
            <InsSelect
              value={s("startType", "LLM")}
              onChange={(v) => onConfig("startType", v)}
              options={["LLM", "Condition"]}
            />
          </InsField>
        )}

        {/* LLM node — prompt, tools, LLM/Voice overrides */}
        {kind === "llm" && (
          <>
            <div className="relative">
              <InsTextarea
                value={s("prompt")}
                onChange={(v) => onConfig("prompt", v)}
                placeholder="Type your prompt here… use ${ to insert a variable."
                tall
              />
              <button
                onClick={() => toast("Expand editor")}
                aria-label="Expand"
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                <Maximize2 size={13} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Tools</label>
                <button
                  onClick={() => toast("Create new tool")}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary/60"
                >
                  <Plus size={12} /> Create new tool
                </button>
              </div>
              <p className="-mt-0.5 text-[11px] text-muted-foreground">
                Additional tools available to the agent at this step.
              </p>
              <InsSelect
                value={s("tools", "None")}
                onChange={(v) => onConfig("tools", v)}
                options={["None", "get_availability", "book_appointment", "transfer_to_human"]}
              />
            </div>

            <InsToggle
              label="LLM"
              hint="Override the agent's LLM settings for this step."
              checked={Boolean(cfg.llmOverride)}
              onChange={(v) => onConfig("llmOverride", v)}
            />
            <InsToggle
              label="Voice"
              hint="Override the agent's voice settings for this step."
              checked={Boolean(cfg.voiceOverride)}
              onChange={(v) => onConfig("voiceOverride", v)}
            />
          </>
        )}

        {/* Static node — fixed message that plays then moves on */}
        {kind === "fixed" && (
          <>
            <InsField
              label="Message"
              hint="Agent plays this message and immediately moves to the next node."
            >
              <InsTextarea
                value={s("message")}
                onChange={(v) => onConfig("message", v)}
                placeholder="Hello, how are you?"
              />
            </InsField>
            <TransitionBackToStart value={s("backToStart", "false")} onChange={(v) => onConfig("backToStart", v)} />
            <InsToggle
              label="Voice"
              hint="Override the agent's voice settings for this step."
              checked={Boolean(cfg.voiceOverride)}
              onChange={(v) => onConfig("voiceOverride", v)}
            />
          </>
        )}

        {/* Endpoint node — full API/Code config */}
        {kind === "endpoint" && <EndpointBody cfg={cfg} onConfig={onConfig} />}

        <InsField label="Description" optional hint="A short internal note.">
          <InsTextarea value={node.data.desc ?? ""} onChange={(v) => onData({ desc: v })} placeholder="A short internal note about this node." />
        </InsField>
      </div>
    </div>
  );
}

/* ── Inspector field primitives ──────────────────────────────────────── */

const INS_INPUT =
  "w-full rounded-lg border border-border bg-transparent dark:bg-input/30 px-2.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

function InsField({
  label,
  hint,
  optional,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-amber-400">*</span>}
        {optional && <span className="text-[10px] font-normal text-muted-foreground/60">Optional</span>}
      </label>
      {hint && <p className="-mt-1 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
      {children}
      {error && <span className="text-[11px] text-amber-400">This field is required.</span>}
    </div>
  );
}

function InsInput({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(INS_INPUT, "h-9", mono && "font-mono text-xs")}
    />
  );
}

function InsTextarea({
  value,
  onChange,
  placeholder,
  mono,
  tall,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  tall?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(INS_INPUT, "resize-none", tall ? "h-64" : "h-20", mono && "font-mono text-xs")}
    />
  );
}

function InsSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(INS_INPUT, "h-9 cursor-pointer appearance-none pr-8")}
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-popover">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function InsToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-input/30 px-3.5 py-3">
      <div className="min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
    </div>
  );
}

/** Recursive if/else editor. A string branch is a leaf (wired via a port);
    "Nested if" replaces it with a sub-condition (its own leaves = more ports). */
function ConditionEditor({
  cond,
  onChange,
  depth = 0,
}: {
  cond: Condition;
  onChange: (c: Condition) => void;
  depth?: number;
}) {
  const set = (patch: Partial<Condition>) => onChange({ ...cond, ...patch });
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border border-border p-3",
        depth > 0 && "bg-white/[0.02]",
      )}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <InsInput value={cond.property} onChange={(v) => set({ property: v })} placeholder="variable" />
        <InsSelect
          value={cond.operator}
          onChange={(v) => set({ operator: v })}
          options={["==", "!=", ">", "<", "contains"]}
        />
        <InsInput value={cond.value} onChange={(v) => set({ value: v })} placeholder="value" />
      </div>

      {(["yes", "no"] as const).map((branch) => {
        const v = cond[branch];
        const nested = typeof v !== "string";
        return (
          <div key={branch} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">
                {branch === "yes" ? "If true →" : "If false →"}
              </span>
              {nested ? (
                <button
                  onClick={() => set({ [branch]: cond.key } as Partial<Condition>)}
                  className="text-[11px] text-muted-foreground transition-colors hover:text-rose-400"
                >
                  Remove nested
                </button>
              ) : (
                <button
                  onClick={() => set({ [branch]: newCondition() } as Partial<Condition>)}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Plus size={11} /> Nested if
                </button>
              )}
            </div>
            {nested ? (
              <ConditionEditor
                cond={v as Condition}
                onChange={(c) => set({ [branch]: c } as Partial<Condition>)}
                depth={depth + 1}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 bg-black/20 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                Leaf — wire this branch from its port on the node.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Condition rule builder (If / Nested If · Else / Else If) ─────────────
   A clause = conditions joined by AND ("Nested If" adds one). Each clause is
   one output branch; a final implicit "Else" catches the rest. Serialized to
   the node's `exits` (labels → ports) so edges keep working. */
type CondRule = { variable: string; operator: string; type: string; value: string };
type CondClause = { conds: CondRule[] };
const emptyRule = (): CondRule => ({ variable: "", operator: "==", type: "string", value: "" });
const clauseLabel = (c: CondClause) =>
  c.conds.map((r) => `${r.variable || "?"} ${r.operator} ${r.value || "?"}`).join(" and ");

/** Parse a flat exit label (e.g. "Order == Yes") back into a rule so the builder
 *  can reflect branches that were created outside it. */
function parseExitToRule(label: string): CondRule {
  const m = label.trim().match(/^(.+?)\s*(==|!=|>=|<=|>|<|contains)\s*(.+)$/);
  if (m) return { variable: m[1].trim(), operator: m[2], type: "string", value: m[3].trim() };
  return { variable: label.trim(), operator: "==", type: "string", value: "" };
}

/** Reconcile a Condition node's clauses with its exits so EVERY branch shows in
 *  the builder: one clause per branch (all exits except a trailing "Else"),
 *  reusing stored clause detail where present, parsing the label otherwise. */
function clausesFromNode(exits: string[], stored?: CondClause[]): CondClause[] {
  const hasElse = exits.length > 0 && exits[exits.length - 1].trim().toLowerCase() === "else";
  const branches = hasElse ? exits.slice(0, -1) : exits;
  if (branches.length === 0) return stored?.length ? stored : [{ conds: [emptyRule()] }];
  return branches.map((label, i) => stored?.[i] ?? { conds: [parseExitToRule(label)] });
}

function ConditionRules({
  value,
  onChange,
  focusIndex,
}: {
  value: CondClause[];
  onChange: (clauses: CondClause[]) => void;
  focusIndex?: number | null;
}) {
  const clauses = value.length ? value : [{ conds: [emptyRule()] }];
  const setClause = (ci: number, next: CondClause) =>
    onChange(clauses.map((c, i) => (i === ci ? next : c)));
  const setRule = (ci: number, ri: number, patch: Partial<CondRule>) =>
    setClause(ci, { conds: clauses[ci].conds.map((r, i) => (i === ri ? { ...r, ...patch } : r)) });

  // Twilio-style: when opened from a branch on the node, scroll to + highlight it.
  const refs = React.useRef<(HTMLDivElement | null)[]>([]);
  React.useEffect(() => {
    if (focusIndex == null) return;
    refs.current[focusIndex]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusIndex]);

  return (
    <InsField
      label="Conditions"
      hint="Each rule is a branch. The first that matches wins; otherwise the flow takes Else."
    >
      <div className="flex flex-col gap-3">
        {clauses.map((clause, ci) => (
          <div
            key={ci}
            ref={(el) => { refs.current[ci] = el; }}
            className={cn(
              "flex flex-col gap-2.5 rounded-lg border p-3 transition-colors",
              ci === focusIndex ? "border-violet-400/60 bg-violet-500/[0.06]" : "border-border bg-card",
            )}
          >
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="text-foreground">{ci === 0 ? "If" : "Else if"}</span>
              <button
                onClick={() => setClause(ci, { conds: [...clause.conds, emptyRule()] })}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Nested If
              </button>
              {ci > 0 && (
                <button
                  onClick={() => onChange(clauses.filter((_, i) => i !== ci))}
                  aria-label="Remove clause"
                  className="ml-auto text-muted-foreground transition-colors hover:text-rose-400"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            {clause.conds.map((r, ri) => (
              <div key={ri} className="grid grid-cols-[1fr_auto_auto_1fr] items-center gap-2">
                <InsInput value={r.variable} onChange={(v) => setRule(ci, ri, { variable: v })} placeholder="Variable" />
                <InsSelect value={r.operator} onChange={(v) => setRule(ci, ri, { operator: v })} options={["==", "!=", ">", "<", "contains"]} />
                <InsSelect value={r.type} onChange={(v) => setRule(ci, ri, { type: v })} options={["string", "number", "boolean"]} />
                <div className="flex items-center gap-1.5">
                  <InsInput value={r.value} onChange={(v) => setRule(ci, ri, { value: v })} placeholder="Value" />
                  {ri > 0 && (
                    <button
                      onClick={() => setClause(ci, { conds: clause.conds.filter((_, i) => i !== ri) })}
                      aria-label="Remove nested condition"
                      className="shrink-0 text-muted-foreground transition-colors hover:text-rose-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-3 px-1 text-[11px] font-medium">
          <span className="text-foreground">Else</span>
          <button
            onClick={() => onChange([...clauses, { conds: [emptyRule()] }])}
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus size={11} /> Else If
          </button>
        </div>
      </div>
    </InsField>
  );
}

function TransitionsEditor({
  exits,
  onChange,
  focusIndex,
}: {
  exits: string[];
  onChange: (next: string[]) => void;
  focusIndex?: number | null;
}) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  React.useEffect(() => {
    if (focusIndex == null) return;
    const el = refs.current[focusIndex];
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.focus();
  }, [focusIndex]);
  return (
    <InsField
      label="Transitions"
      hint="Where this node can go next. Each becomes an output port + a labeled edge."
    >
      <div className="flex flex-col gap-2">
        {exits.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              ref={(el) => { refs.current[i] = el; }}
              value={label}
              onChange={(e) => {
                const next = exits.slice();
                next[i] = e.target.value;
                onChange(next);
              }}
              placeholder="Condition…"
              className={cn(INS_INPUT, "h-9", i === focusIndex && "border-violet-400/60 ring-3 ring-violet-400/20")}
            />
            <button
              onClick={() => onChange(exits.filter((_, j) => j !== i))}
              aria-label="Remove transition"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-rose-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <AddRowButton label="Add transition" onClick={() => onChange([...exits, ""])} />
      </div>
    </InsField>
  );
}

function TransitionBackToStart({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <InsField
      label="Transition back to start"
      hint="After this node, return the conversation to the start node."
    >
      <InsSelect value={value} onChange={onChange} options={["false", "true"]} />
    </InsField>
  );
}

/* ── Endpoint (API) inspector body ───────────────────────────────────── */

type KV = { key: string; value: string };
type RVar = { name: string; path: string };

function EndpointBody({
  cfg,
  onConfig,
}: {
  cfg: Record<string, unknown>;
  onConfig: (key: string, value: unknown) => void;
}) {
  const s = (k: string, d = "") => String(cfg[k] ?? d);
  const headers = (cfg.headers as KV[]) ?? [
    { key: "Content-Type", value: "application/json" },
  ];
  const vars = (cfg.responseVars as RVar[]) ?? [];

  return (
    <div className="space-y-5">
      <>
          <SectionCard
            title="API call"
            hint="The HTTP request this node makes."
            action={
              <Segmented
                small
                value={s("apiMode", "form")}
                onChange={(v) => onConfig("apiMode", v)}
                options={[
                  { v: "form", l: "Form" },
                  { v: "curl", l: "cURL" },
                ]}
              />
            }
          >
            <div className="grid grid-cols-[104px_1fr] gap-2">
              <InsField label="Method">
                <InsSelect
                  value={s("method", "POST")}
                  onChange={(v) => onConfig("method", v)}
                  options={["GET", "POST", "PUT", "PATCH", "DELETE"]}
                />
              </InsField>
              <InsField label="URL" required error={!s("url")}>
                <InsInput
                  mono
                  value={s("url")}
                  onChange={(v) => onConfig("url", v)}
                  placeholder="https://api.example.com/orders/${orderId}"
                />
              </InsField>
            </div>

            <InsField label="Headers">
              <div className="flex flex-col gap-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={h.key}
                      onChange={(e) => {
                        const next = headers.slice();
                        next[i] = { ...h, key: e.target.value };
                        onConfig("headers", next);
                      }}
                      placeholder="Key"
                      className={cn(INS_INPUT, "h-9")}
                    />
                    <input
                      value={h.value}
                      onChange={(e) => {
                        const next = headers.slice();
                        next[i] = { ...h, value: e.target.value };
                        onConfig("headers", next);
                      }}
                      placeholder="Value"
                      className={cn(INS_INPUT, "h-9")}
                    />
                    <button
                      onClick={() => onConfig("headers", headers.filter((_, j) => j !== i))}
                      aria-label="Remove header"
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <AddRowButton
                  label="Add Header"
                  onClick={() => onConfig("headers", [...headers, { key: "", value: "" }])}
                />
              </div>
            </InsField>

            <InsField label="Body">
              <InsTextarea mono value={s("body")} onChange={(v) => onConfig("body", v)} placeholder="{}" />
            </InsField>

            <InsToggle
              label="Route via static IP"
              hint="Send this request from a fixed IP: 15.206.64.175"
              checked={Boolean(cfg.staticIp)}
              onChange={(v) => onConfig("staticIp", v)}
            />
          </SectionCard>

          <SectionCard
            title="Response variables"
            hint="Pull values from the API response into named variables the agent can use. Paths are dot-paths (e.g. data.id, items[0].name) — not JSONPath."
            action={
              <Segmented
                small
                value={s("respMode", "form")}
                onChange={(v) => onConfig("respMode", v)}
                options={[
                  { v: "form", l: "Form" },
                  { v: "json", l: "JSON" },
                ]}
              />
            }
          >
            <div className="flex flex-col gap-2">
              {vars.map((rv, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={rv.name}
                    onChange={(e) => {
                      const next = vars.slice();
                      next[i] = { ...rv, name: e.target.value };
                      onConfig("responseVars", next);
                    }}
                    placeholder="variable"
                    className={cn(INS_INPUT, "h-9")}
                  />
                  <input
                    value={rv.path}
                    onChange={(e) => {
                      const next = vars.slice();
                      next[i] = { ...rv, path: e.target.value };
                      onConfig("responseVars", next);
                    }}
                    placeholder="data.id"
                    className={cn(INS_INPUT, "h-9 font-mono text-xs")}
                  />
                  <button
                    onClick={() => onConfig("responseVars", vars.filter((_, j) => j !== i))}
                    aria-label="Remove variable"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <AddRowButton
                label="Add Variable"
                onClick={() => onConfig("responseVars", [...vars, { name: "", path: "" }])}
              />
            </div>
          </SectionCard>
        </>

      {/* Code — optional post-processing that runs with the request context */}
      <SectionCard
        title="Code"
        hint="Optional JavaScript that runs with the request context as input. Return any value the agent can use."
      >
        <InsTextarea
          tall
          mono
          value={s("code")}
          onChange={(v) => onConfig("code", v)}
          placeholder="// The request context is available on the input object. return input;"
        />
      </SectionCard>

      {/* Behavior */}
      <SectionCard title="Behavior" hint="Timeout and response-summary settings.">
        <InsField label="Timeout (ms)">
          <input
            type="number"
            value={s("timeout", "15000")}
            onChange={(e) => onConfig("timeout", e.target.value)}
            className={cn(INS_INPUT, "h-9 tabular-nums")}
          />
        </InsField>
        <InsToggle
          label="Enable AI summary"
          hint="A small model turns the raw response into a natural-language summary. Adds latency."
          checked={Boolean(cfg.aiSummary)}
          onChange={(v) => onConfig("aiSummary", v)}
        />
      </SectionCard>

      <TransitionBackToStart value={s("backToStart", "false")} onChange={(v) => onConfig("backToStart", v)} />
    </div>
  );
}

/** Boxed config section: header (title + hint + optional action) then content. */
function SectionCard({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {hint && <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
  full,
  small,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
  full?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-input/30 p-1",
        full && "flex w-full",
        small ? "h-8" : "h-10",
      )}
    >
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors",
            full && "flex-1",
            small ? "h-6 px-2.5 text-[11px]" : "h-8 px-3 text-xs",
            value === o.v
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-8 w-fit items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary/60"
    >
      <Plus size={13} /> {label}
    </button>
  );
}

function MenuItem({
  icon,
  shortcut,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  shortcut?: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-secondary/60"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="rounded border border-border px-1 text-[10px] text-muted-foreground">
          {shortcut}
        </span>
      )}
    </button>
  );
}

export default function AgentBuilderPage() {
  return (
    <AppShell activeNav="Agents">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </AppShell>
  );
}
