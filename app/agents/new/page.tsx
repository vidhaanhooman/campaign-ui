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
  ClipboardPaste,
  Clock,
  Copy,
  Globe,
  ListChecks,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Pencil,
  PhoneIncoming,
  Plus,
  Search,
  Split,
  Sparkles,
  Trash2,
  UserPlus,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";

/* ── Node model ──────────────────────────────────────────────────────── */

type NodeKind =
  | "trigger"
  | "conversation"
  | "preset"
  | "action"
  | "condition"
  | "skill"
  | "assign"
  | "businessHour"
  | "task"
  | "http"
  | "end";

type NodeData = { title: string; desc?: string; invalid?: boolean };

type Meta = {
  category: string;
  icon: LucideIcon;
  accent: string; // icon text color
  dot: string; // status dot bg
  port: string; // handle border tint
  badge?: string;
  terminal?: boolean;
  entry?: boolean;
};

const META: Record<NodeKind, Meta> = {
  trigger: { category: "Trigger", icon: PhoneIncoming, accent: "text-emerald-400", dot: "bg-emerald-400", port: "!border-emerald-400/60", badge: "Trigger", entry: true },
  conversation: { category: "AI Conversation", icon: MessageSquare, accent: "text-emerald-400", dot: "bg-emerald-400", port: "!border-emerald-400/60" },
  preset: { category: "Preset Message", icon: MessageCircle, accent: "text-sky-400", dot: "bg-sky-400", port: "!border-sky-400/60" },
  action: { category: "AI Actions", icon: Zap, accent: "text-violet-400", dot: "bg-violet-400", port: "!border-violet-400/60" },
  condition: { category: "Logic", icon: Split, accent: "text-sky-400", dot: "bg-sky-400", port: "!border-sky-400/60" },
  skill: { category: "Skills", icon: Sparkles, accent: "text-violet-400", dot: "bg-violet-400", port: "!border-violet-400/60" },
  assign: { category: "Assign to Human", icon: UserPlus, accent: "text-amber-400", dot: "bg-amber-400", port: "!border-amber-400/60" },
  businessHour: { category: "Business Hour", icon: Clock, accent: "text-amber-400", dot: "bg-amber-400", port: "!border-amber-400/60" },
  task: { category: "Create Task", icon: ListChecks, accent: "text-amber-400", dot: "bg-amber-400", port: "!border-amber-400/60" },
  http: { category: "HTTP Request", icon: Globe, accent: "text-amber-400", dot: "bg-amber-400", port: "!border-amber-400/60" },
  end: { category: "End Conversation", icon: Ban, accent: "text-rose-400", dot: "bg-rose-400", port: "!border-rose-400/60", terminal: true },
};

const PORT =
  "!h-2.5 !w-2.5 !rounded-full !border-2 !bg-background transition-colors";

/** Lets an in-node kebab open the Canvas-level context menu at a point. */
const OpenMenu = React.createContext<(nodeId: string, x: number, y: number) => void>(
  () => {},
);

/** Lets an in-node "+" open the Select-Node picker, connecting from that node. */
const OpenPicker = React.createContext<(fromId?: string) => void>(() => {});

/** Clean card: icon + title + description, category footer, node "+" add. */
function makeNode(kind: NodeKind) {
  const m = META[kind];
  const Icon = m.icon;
  function FlowNode({ id, data, selected }: NodeProps<Node<NodeData>>) {
    const openMenu = React.useContext(OpenMenu);
    const openPicker = React.useContext(OpenPicker);
    return (
      <div className="group relative">
        {m.badge && (
          <div className="mb-1.5 inline-flex items-center rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-300">
            {m.badge}
          </div>
        )}

        {/* ambient glow — appears on select (and error), doubles as run cue */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-3 rounded-2xl opacity-0 blur-xl transition-opacity duration-300",
            selected && "opacity-100",
          )}
          style={{
            background: data.invalid
              ? "radial-gradient(55% 55% at 50% 50%, rgba(244,63,94,0.16), transparent 70%)"
              : "radial-gradient(55% 55% at 50% 50%, rgba(167,139,250,0.18), transparent 70%)",
          }}
        />

        <div
          className={cn(
            "relative w-[236px] rounded-xl border shadow-lg transition-all duration-200",
            data.invalid
              ? "border-rose-500/40 ring-1 ring-rose-500/25"
              : selected
                ? "border-violet-400/50 ring-1 ring-violet-400/40"
                : "border-border hover:border-white/15",
          )}
          style={{
            backgroundColor: "var(--card)",
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0) 42%)",
          }}
        >
          {!m.entry && (
            <Handle
              type="target"
              position={Position.Left}
              className={cn(PORT, "!left-[-6px] !border-white/40")}
            />
          )}

          {/* header — colored status dot + icon + title */}
          <div className="flex items-start justify-between gap-2 px-3.5 pt-3">
            <span className="inline-flex min-w-0 items-center gap-2">
              <span
                className={cn("size-1.5 shrink-0 rounded-full", m.dot)}
                aria-hidden
              />
              <Icon size={15} className={cn("shrink-0", m.accent)} />
              <span className="truncate text-sm font-medium text-foreground">
                {data.title}
              </span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const r = e.currentTarget.getBoundingClientRect();
                openMenu(id, r.right, r.bottom);
              }}
              className="nodrag shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <MoreVertical size={14} />
            </button>
          </div>

          {data.desc && (
            <p className="line-clamp-2 px-3.5 pt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              {data.desc}
            </p>
          )}

          {/* footer: category + validation */}
          <div className="flex items-center justify-between px-3.5 pb-2.5 pt-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {m.category}
            </span>
            {data.invalid && (
              <AlertTriangle size={13} className="text-amber-400" />
            )}
          </div>

          {!m.terminal && (
            <Handle
              type="source"
              position={Position.Right}
              className={cn(PORT, "!right-[-6px]", m.port)}
            />
          )}
        </div>

        {/* "+" add affordance (right-center) → opens Select Node picker */}
        {!m.terminal && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openPicker(id);
            }}
            title="Click to add a new node"
            className="nodrag absolute right-[-30px] top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 transition-all hover:border-foreground hover:text-foreground group-hover:opacity-100"
          >
            <Plus size={12} />
          </button>
        )}
      </div>
    );
  }
  FlowNode.displayName = `Node_${kind}`;
  return FlowNode;
}

const nodeTypes = {
  trigger: makeNode("trigger"),
  conversation: makeNode("conversation"),
  preset: makeNode("preset"),
  action: makeNode("action"),
  condition: makeNode("condition"),
  skill: makeNode("skill"),
  assign: makeNode("assign"),
  businessHour: makeNode("businessHour"),
  task: makeNode("task"),
  http: makeNode("http"),
  end: makeNode("end"),
};

/* ── Node types — the 4 we support ───────────────────────────────────── */

const NODE_TYPES: { kind: NodeKind; label: string; desc: string; data: NodeData }[] = [
  { kind: "conversation", label: "Conversation", desc: "Understand the caller and decide where to go next", data: { title: "New conversation", desc: "Understands the caller and decides where to go next." } },
  { kind: "action", label: "Action", desc: "Call an API or run an action based on intent", data: { title: "New action", desc: "Execute an action or call an endpoint.", invalid: true } },
  { kind: "condition", label: "Logic", desc: "Branch the flow on a variable", data: { title: "New condition", desc: "Route on a variable." } },
  { kind: "end", label: "End", desc: "End the current conversation", data: { title: "End Conversation", desc: "Ends the current conversation." } },
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

/* ── Floating edge with an editable condition label ──────────────────── */

function ConditionEdge({ id, source, target, markerEnd, data }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode) return null;

  const { sx, sy, tx, ty, sourcePos, targetPos } = edgeParams(
    sourceNode,
    targetNode,
  );
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    borderRadius: 12,
  });
  // A back-edge (target sits left of source) reads as a loop — tint it.
  const isBack = tx < sx - 4;
  const label = (data as { label?: string })?.label;
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: isBack ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.18)",
          strokeWidth: 1.5,
          strokeDasharray: "5 5",
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <button
            onClick={() => toast(`Edit condition: ${label}`)}
            style={{
              position: "absolute",
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className={cn(
              "nodrag nopan inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-0.5 text-[10px] text-foreground shadow-sm transition-colors hover:border-foreground/40",
              isBack ? "border-violet-500/40" : "border-border",
            )}
          >
            {label}
            <Pencil size={9} className="text-muted-foreground" />
          </button>
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

/* ── Seed graph (horizontal, real-estate example) ────────────────────── */

const SEED_NODES: Node<NodeData>[] = [
  { id: "trigger", type: "trigger", position: { x: 40, y: 260 }, data: { title: "Voice Call", desc: "Triggers when an incoming call is received on your number." } },
  { id: "conv", type: "conversation", position: { x: 360, y: 240 }, data: { title: "Real Estate Enquiry", desc: "Understands customer queries and extracts key details." } },
  { id: "end-oos", type: "end", position: { x: 720, y: 40 }, data: { title: "Out Of Scope Close", desc: "Ends the current conversation." } },
  { id: "end-dnc", type: "end", position: { x: 720, y: 200 }, data: { title: "DNC / Wrong Number", desc: "Ends the current conversation." } },
  { id: "action", type: "action", position: { x: 720, y: 360 }, data: { title: "AI actions", desc: "Executes actions based on the user's intent.", invalid: true } },
  { id: "end-followup", type: "end", position: { x: 720, y: 520 }, data: { title: "Followup Arranged", desc: "Ends the current conversation." } },
  { id: "skill", type: "skill", position: { x: 1060, y: 360 }, data: { title: "Skills", desc: "Applies AI to analyze and generate insights.", invalid: true } },
];

const SEED_EDGES: Edge[] = [
  { id: "e0", source: "trigger", target: "conv", ...EDGE_DEFAULTS },
  { id: "e1", source: "conv", target: "end-oos", data: { label: "Out Of Scope" }, ...EDGE_DEFAULTS },
  { id: "e2", source: "conv", target: "end-dnc", data: { label: "Hostile / DNC / Wrong Number" }, ...EDGE_DEFAULTS },
  { id: "e3", source: "conv", target: "action", data: { label: "Enquiry Complete Followup" }, ...EDGE_DEFAULTS },
  { id: "e4", source: "conv", target: "end-followup", data: { label: "Caller Declines Followup" }, ...EDGE_DEFAULTS },
  { id: "e5", source: "action", target: "skill", data: { label: "Action executed" }, ...EDGE_DEFAULTS },
  // Backward/loop transition — flow returns to the conversation node.
  { id: "e6", source: "action", target: "conv", data: { label: "Needs clarification" }, ...EDGE_DEFAULTS },
];

let idSeq = 100;

/* ── Right-click menu ────────────────────────────────────────────────── */

type Menu = { x: number; y: number; nodeId: string } | null;

function Canvas() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(SEED_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(SEED_EDGES);
  const [menu, setMenu] = React.useState<Menu>(null);
  // Select-Node picker: null = closed; { fromId } connects the new node.
  const [picker, setPicker] = React.useState<{ fromId?: string } | null>(null);
  const connectingFrom = React.useRef<string | null>(null);
  const wrap = React.useRef<HTMLDivElement>(null);

  const onConnect = React.useCallback((c: Connection) => {
    connectingFrom.current = null; // a real connection was made
    setEdges((eds) => addEdge({ ...c, data: { label: "new" }, ...EDGE_DEFAULTS }, eds));
  }, [setEdges]);

  const spawn = (kind: NodeKind, data: NodeData, at: { x: number; y: number }, from?: string) => {
    const id = `${kind}-${idSeq++}`;
    setNodes((ns) => [...ns, { id, type: kind, position: at, data }]);
    if (from) {
      setEdges((es) => [
        ...es,
        { id: `e-${id}`, source: from, target: id, data: { label: "new" }, ...EDGE_DEFAULTS },
      ]);
    }
  };

  const openPicker = React.useCallback((fromId?: string) => {
    setPicker({ fromId });
  }, []);

  // Place the new node to the right of its source (or center-ish), then connect.
  const pickNode = (kind: NodeKind, data: NodeData) => {
    const from = picker?.fromId;
    const src = from ? nodes.find((n) => n.id === from) : undefined;
    const at = src
      ? { x: src.position.x + 320, y: src.position.y + (Math.random() * 80 - 40) }
      : { x: 420 + Math.random() * 120, y: 320 + Math.random() * 80 };
    spawn(kind, { ...data }, at, from);
    setPicker(null);
  };

  // Drag off a port and drop on empty canvas → open the picker to add + connect.
  const onConnectStart = React.useCallback(
    (_: unknown, p: { nodeId: string | null }) => {
      connectingFrom.current = p.nodeId ?? null;
    },
    [],
  );
  const onConnectEnd = React.useCallback(
    (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const onPane = target?.classList?.contains("react-flow__pane");
      if (onPane && connectingFrom.current) openPicker(connectingFrom.current);
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
  const duplicate = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    spawn(n.type as NodeKind, { ...(n.data as NodeData) }, { x: n.position.x + 40, y: n.position.y + 60 });
    setMenu(null);
  };

  const publish = () => {
    console.log("agent flow", { nodes, edges });
    toast.success(`Saved — ${nodes.length} nodes, ${edges.length} transitions`);
  };

  return (
    <OpenMenu.Provider value={openMenu}>
    <OpenPicker.Provider value={openPicker}>
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.04] px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/landing")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Agents
          </button>
          <span className="h-4 w-px bg-white/[0.08]" />
          <span className="text-sm font-medium text-foreground">Untitled agent</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Draft
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
      <div ref={wrap} className="relative min-h-0 flex-1" onClick={() => setMenu(null)}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeContextMenu={onNodeContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.10)" />
          <Controls
            showInteractive={false}
            className="!rounded-lg !border !border-border !bg-card [&_button]:!border-white/[0.06] [&_button]:!bg-card [&_button]:!text-foreground [&_button:hover]:!bg-secondary"
          />
        </ReactFlow>

        {/* Add-node button → opens the Select Node picker */}
        <button
          onClick={() => openPicker()}
          className="absolute bottom-6 left-1/2 inline-flex h-10 -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-card/95 px-4 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:bg-secondary/60"
        >
          <Plus size={15} /> Add node
        </button>

        {picker && (
          <NodePicker onPick={pickNode} onClose={() => setPicker(null)} />
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
    </OpenPicker.Provider>
    </OpenMenu.Provider>
  );
}

/* ── Node picker (compact command-palette) ───────────────────────────── */

function NodePicker({
  onPick,
  onClose,
}: {
  onPick: (kind: NodeKind, data: NodeData) => void;
  onClose: () => void;
}) {
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const query = q.trim().toLowerCase();
  const items = NODE_TYPES.filter(
    (it) =>
      !query ||
      it.label.toLowerCase().includes(query) ||
      it.desc.toLowerCase().includes(query),
  );

  React.useEffect(() => setActive(0), [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      onPick(items[active].kind, items[active].data);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[16vh] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-[380px] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* search */}
        <div className="flex h-11 items-center gap-2.5 border-b border-white/[0.06] px-3.5">
          <Search size={15} className="shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Add a node…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* single-column list */}
        <div className="p-1.5">
          {items.map((it, i) => {
            const Icon = META[it.kind].icon;
            const on = i === active;
            return (
              <button
                key={it.kind}
                onMouseEnter={() => setActive(i)}
                onClick={() => onPick(it.kind, it.data)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                  on ? "bg-secondary/70" : "hover:bg-secondary/40",
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-inset ring-white/[0.08]">
                  <Icon size={15} className={META[it.kind].accent} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {it.label}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {it.desc}
                  </span>
                </span>
                {on && (
                  <span className="shrink-0 rounded border border-border px-1 text-[10px] text-muted-foreground">
                    ↵
                  </span>
                )}
              </button>
            );
          })}
          {items.length === 0 && (
            <div className="px-2.5 py-6 text-center text-sm text-muted-foreground">
              No matches
            </div>
          )}
        </div>

        {/* footer hint */}
        <div className="flex items-center gap-3 border-t border-white/[0.06] px-3.5 py-2 text-[10px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ add</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
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
