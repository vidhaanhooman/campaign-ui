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
  ChevronDown,
  ClipboardPaste,
  Clock,
  Copy,
  CornerDownRight,
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

type Meta = {
  category: string;
  icon: LucideIcon;
  accent: string; // icon text color
  dot: string; // status dot bg
  port: string; // handle border tint
};

const META: Record<NodeKind, Meta> = {
  llm: { category: "LLM", icon: Sparkles, accent: "text-sky-400", dot: "bg-sky-400", port: "!border-sky-400/60" },
  fixed: { category: "Static", icon: MessageSquare, accent: "text-violet-400", dot: "bg-violet-400", port: "!border-violet-400/60" },
  logic: { category: "Condition", icon: Network, accent: "text-amber-400", dot: "bg-amber-400", port: "!border-amber-400/60" },
  endpoint: { category: "Endpoint", icon: PlugZap, accent: "text-emerald-400", dot: "bg-emerald-400", port: "!border-emerald-400/60" },
};

const PORT =
  "!h-3 !w-3 !rounded-full !border-2 !bg-background transition-all duration-150 hover:!scale-125 hover:!shadow-[0_0_0_4px_rgba(167,139,250,0.18)]";

/** Lets an in-node kebab open the Canvas-level context menu at a point. */
const OpenMenu = React.createContext<(nodeId: string, x: number, y: number) => void>(
  () => {},
);

/** Lets an in-node "+" open the Select-Node picker, connecting from that node. */
const OpenPicker = React.createContext<(fromId?: string) => void>(() => {});

/** The node currently hovered — used to highlight its in/out edges. */
const HoverNode = React.createContext<string | null>(null);

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
  function FlowNode({ id, data, selected }: NodeProps<Node<NodeData>>) {
    const openMenu = React.useContext(OpenMenu);
    const openPicker = React.useContext(OpenPicker);
    const isStart = id === "start"; // the entry node — no incoming port
    const exits = data.exits ?? [];
    const multi = exits.length > 1;

    return (
      <div className="group relative">
        {/* ambient glow — appears on select (and error) */}
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
            "rf-node-in relative w-[240px] rounded-xl border shadow-lg transition-all duration-200",
            "group-hover:-translate-y-[2px] group-hover:shadow-2xl",
            data.invalid
              ? "border-rose-500/40 ring-1 ring-rose-500/25"
              : selected
                ? "border-violet-400/50 ring-1 ring-violet-400/40"
                : "border-border hover:border-white/15",
          )}
          style={{
            backgroundColor: "var(--card)",
            backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0) 42%)",
            // Give room for stacked output ports on multi-branch nodes.
            minHeight: multi ? 52 + exits.length * 20 : undefined,
          }}
        >
          {!isStart && (
            <Handle
              type="target"
              position={Position.Left}
              className={cn(PORT, "!left-[-6px] !border-white/40", multi && "!top-6")}
            />
          )}

          {/* header — dot + icon + title + kebab */}
          <div className="flex items-start justify-between gap-2 px-3.5 pt-3">
            <span className="inline-flex min-w-0 items-center gap-2">
              <span className={cn("size-1.5 shrink-0 rounded-full", m.dot)} aria-hidden />
              <Icon size={15} className={cn("shrink-0", m.accent)} />
              <span className="truncate text-sm font-medium text-foreground">{data.name}</span>
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
            {data.invalid && <AlertTriangle size={13} className="text-amber-400" />}
          </div>

          {/* output ports */}
          {multi ? (
              exits.map((_, i) => {
                const top = `${((i + 1) / (exits.length + 1)) * 100}%`;
                return (
                  <Handle
                    key={i}
                    id={`t-${i}`}
                    type="source"
                    position={Position.Right}
                    style={{ top }}
                    className={cn(PORT, "!right-[-6px]", m.port)}
                  />
                );
              })
            ) : (
              <Handle
                type="source"
                position={Position.Right}
                className={cn(PORT, "!right-[-6px]", m.port)}
              />
            )}
        </div>

        {/* "+" add affordance for single-exit nodes */}
        {!multi && (
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
  llm: makeNode("llm"),
  fixed: makeNode("fixed"),
  logic: makeNode("logic"),
  endpoint: makeNode("endpoint"),
};

/* ── Node types — the 4 we support ───────────────────────────────────── */

const NODE_TYPES: { kind: NodeKind; label: string; desc: string; data: NodeData }[] = [
  { kind: "llm", label: "LLM", desc: "Understands the caller and decides where to go next", data: { name: "new_prompt", desc: "Understands the caller and decides where to go next." } },
  { kind: "fixed", label: "Static", desc: "Plays a fixed message, then moves on", data: { name: "new_static", desc: "Plays a fixed message, then moves on." } },
  { kind: "logic", label: "Condition", desc: "Branch the flow on a variable", data: { name: "new_condition", desc: "Route on a variable." } },
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

/* ── Floating edge with an editable condition label ──────────────────── */

function ConditionEdge({
  id,
  source,
  target,
  sourceHandleId,
  markerEnd,
  data,
}: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const hovered = React.useContext(HoverNode);
  if (!sourceNode || !targetNode) return null;

  const { sx, sy, tx, ty, sourcePos, targetPos } = edgeParams(sourceNode, targetNode);
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    borderRadius: 12,
  });

  // A back-edge (target sits left of source) reads as a loop — tint it violet.
  const isBack = tx < sx - 4;

  // Label = the branch label from the source node's exits (fallback to edge data).
  const exits = (sourceNode.data as NodeData).exits;
  const idx = sourceHandleId?.startsWith("t-")
    ? parseInt(sourceHandleId.slice(2), 10)
    : null;
  const label = (idx != null ? exits?.[idx] : undefined) ?? (data as { label?: string })?.label;

  // Hover focus: connected edges light up, the rest dim.
  const connected = hovered === source || hovered === target;
  const dim = hovered != null && !connected;

  const stroke = isBack
    ? connected
      ? "rgba(167,139,250,0.95)"
      : "rgba(167,139,250,0.5)"
    : connected
      ? "rgba(255,255,255,0.6)"
      : "rgba(255,255,255,0.18)";

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        className={connected ? "rf-flow-anim" : undefined}
        style={{
          stroke,
          strokeWidth: connected ? 2 : 1.5,
          strokeDasharray: "5 5",
          strokeLinecap: "round",
          opacity: dim ? 0.25 : 1,
          transition: "opacity 150ms, stroke 150ms, stroke-width 150ms",
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
              opacity: dim ? 0.25 : 1,
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

/* ── Seed graph — a single Start node on a blank canvas ──────────────── */

const SEED_NODES: Node<NodeData>[] = [
  {
    id: "start",
    type: "llm",
    position: { x: 80, y: 220 },
    data: { name: "Start", config: { startType: "LLM" }, exits: [""] },
  },
];

const SEED_EDGES: Edge[] = [];

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
      const key = `condition_${n.id}`;
      data = {
        name: d.name,
        type: "logic",
        condition: {
          property: s("variable"),
          operator: s("op", "=="),
          value: s("value"),
          type: "string",
          yes: targetFor(edges, n.id, "t-0") || key,
          no: targetFor(edges, n.id, "t-1") || key,
          output: "",
          key,
        },
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
  // Select-Node picker: null = closed; { fromId } connects the new node.
  const [picker, setPicker] = React.useState<{ fromId?: string } | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);
  const connectingFrom = React.useRef<string | null>(null);
  const wrap = React.useRef<HTMLDivElement>(null);

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  // Collapse the app sidebar while editing a node so canvas + inspector get room.
  const { setCollapsed } = useSidebar();
  React.useEffect(() => {
    setCollapsed(selectedId != null);
    return () => setCollapsed(false);
  }, [selectedId, setCollapsed]);

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
    const payload = serialize(nodes as Node<NodeData>[], edges);
    console.log("agent flow → fNodes/fEdges", payload);
    toast.success(`Saved — ${payload.fNodes.length} nodes, ${payload.fEdges.length} transitions`);
  };

  return (
    <OpenMenu.Provider value={openMenu}>
    <OpenPicker.Provider value={openPicker}>
    <HoverNode.Provider value={hoveredNode}>
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
        {/* ambient depth — faint radial vignette behind the graph */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 42%, rgba(255,255,255,0.03), transparent 70%)",
          }}
        />
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
          onNodeClick={(_, n) => setSelectedId(n.id)}
          onNodeMouseEnter={(_, n) => setHoveredNode(n.id)}
          onNodeMouseLeave={() => setHoveredNode(null)}
          onPaneClick={() => setSelectedId(null)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.10)" />
          <Controls
            showInteractive={false}
            className="!rounded-lg !border !border-border !bg-card/80 !shadow-lg backdrop-blur [&_button]:!border-white/[0.06] [&_button]:!bg-transparent [&_button]:!text-foreground [&_button:hover]:!bg-secondary"
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

        {selected && (
          <Inspector
            key={selected.id}
            node={selected as Node<NodeData>}
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
    </HoverNode.Provider>
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

/* ── Inspector (right drawer, per-type config) ───────────────────────── */

function Inspector({
  node,
  onData,
  onConfig,
  onDelete,
  onClose,
}: {
  node: Node<NodeData>;
  onData: (patch: Partial<NodeData>) => void;
  onConfig: (key: string, value: unknown) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const kind = node.type as NodeKind;
  const m = META[kind];
  const cfg = node.data.config ?? {};
  const s = (k: string, d = "") => String(cfg[k] ?? d);

  return (
    <div className="absolute inset-y-0 right-0 z-20 flex w-[460px] flex-col border-l border-border bg-popover shadow-2xl">
      {/* header */}
      <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] px-5 py-4">
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

        {/* Branch editing — LLM & Condition fan out to multiple transitions;
            Static/Endpoint have a single next (bare port, no editor). */}
        {(kind === "llm" || kind === "logic") && (
          <TransitionsEditor
            exits={node.data.exits ?? []}
            onChange={(next) => onData({ exits: next })}
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

        {/* Condition node — variable / operator / value (nested tree: Phase C) */}
        {kind === "logic" && (
          <InsField label="If" hint="Branch when this expression is true.">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <InsInput value={s("variable")} onChange={(v) => onConfig("variable", v)} placeholder="variable" />
              <InsSelect value={s("op", "==")} onChange={(v) => onConfig("op", v)} options={["==", "!=", ">", "<", "contains"]} />
              <InsInput value={s("value")} onChange={(v) => onConfig("value", v)} placeholder="value" />
            </div>
          </InsField>
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
  "w-full rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

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
        {required && <span className="text-rose-400">*</span>}
        {optional && <span className="text-[10px] font-normal text-muted-foreground/60">Optional</span>}
      </label>
      {hint && <p className="-mt-1 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
      {children}
      {error && <span className="text-[11px] text-rose-400">This field is required.</span>}
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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-3.5 py-3">
      <div className="min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function TransitionsEditor({
  exits,
  onChange,
}: {
  exits: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <InsField
      label="Transitions"
      hint="Where this node can go next. Each becomes an output port + a labeled edge."
    >
      <div className="flex flex-col gap-2">
        {exits.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={label}
              onChange={(e) => {
                const next = exits.slice();
                next[i] = e.target.value;
                onChange(next);
              }}
              placeholder="Condition…"
              className={cn(INS_INPUT, "h-9")}
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
  const [tab, setTab] = React.useState<"api" | "code">("api");
  const s = (k: string, d = "") => String(cfg[k] ?? d);
  const headers = (cfg.headers as KV[]) ?? [
    { key: "Content-Type", value: "application/json" },
  ];
  const vars = (cfg.responseVars as RVar[]) ?? [];

  return (
    <div className="space-y-5">
      <Segmented
        full
        value={tab}
        onChange={(v) => setTab(v as "api" | "code")}
        options={[
          { v: "api", l: "API" },
          { v: "code", l: "Code" },
        ]}
      />

      {tab === "api" ? (
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
      ) : (
        <SectionCard
          title="Code"
          hint="JavaScript that runs with the request context as input. Return any value the agent can use."
        >
          <InsTextarea
            tall
            mono
            value={s("code")}
            onChange={(v) => onConfig("code", v)}
            placeholder="// The request context is available on the input object. return input;"
          />
        </SectionCard>
      )}

      {/* Behavior — shared by both tabs */}
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
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-start justify-between gap-3 bg-white/[0.02] px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {hint && <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="space-y-4 border-t border-white/[0.04] p-4">{children}</div>
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
        "inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1",
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
              ? "bg-secondary text-foreground shadow-sm"
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
