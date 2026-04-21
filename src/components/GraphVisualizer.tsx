import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, RotateCcw, GitBranch } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight?: number;
}

type Mode = "add-node" | "add-edge" | "delete-node" | "delete-edge" | "bfs" | "dfs";

const COLORS = [
  "hsl(217 91% 52%)", "hsl(48 100% 50%)", "hsl(199 89% 44%)",
  "hsl(230 80% 60%)", "hsl(44 96% 54%)", "hsl(210 80% 58%)"
];

const NODE_R = 22;

const INITIAL_NODES: GraphNode[] = [
  { id: "A", label: "A", x: 300, y: 100 },
  { id: "B", label: "B", x: 150, y: 220 },
  { id: "C", label: "C", x: 450, y: 220 },
  { id: "D", label: "D", x: 80, y: 350 },
  { id: "E", label: "E", x: 250, y: 350 },
  { id: "F", label: "F", x: 400, y: 350 },
];

const INITIAL_EDGES: GraphEdge[] = [
  { id: "A-B", from: "A", to: "B" },
  { id: "A-C", from: "A", to: "C" },
  { id: "B-D", from: "B", to: "D" },
  { id: "B-E", from: "B", to: "E" },
  { id: "C-F", from: "C", to: "F" },
  { id: "E-F", from: "E", to: "F" },
];

export default function GraphVisualizer() {
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [mode, setMode] = useState<Mode>("add-node");
  const [nodeLabel, setNodeLabel] = useState("");
  const [edgeFrom, setEdgeFrom] = useState("");
  const [edgeTo, setEdgeTo] = useState("");
  const [edgeWeight, setEdgeWeight] = useState("");
  const [deleteTarget, setDeleteTarget] = useState("");
  const [lastOp, setLastOp] = useState("");
  const [visitOrder, setVisitOrder] = useState<string[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const addNode = () => {
    const label = nodeLabel.trim().toUpperCase() || String.fromCharCode(65 + nodes.length);
    if (nodes.find(n => n.id === label)) { setLastOp(`Node ${label} already exists`); return; }
    const x = 100 + Math.random() * 400;
    const y = 100 + Math.random() * 250;
    setNodes(prev => [...prev, { id: label, label, x, y }]);
    setLastOp(`Added node ${label}`);
    setNodeLabel("");
  };

  const addEdge = () => {
    const from = edgeFrom.trim().toUpperCase();
    const to = edgeTo.trim().toUpperCase();
    if (!from || !to) return;
    if (!nodes.find(n => n.id === from)) { setLastOp(`Node ${from} not found`); return; }
    if (!nodes.find(n => n.id === to)) { setLastOp(`Node ${to} not found`); return; }
    const edgeId = `${from}-${to}`;
    if (edges.find(e => e.id === edgeId || e.id === `${to}-${from}`)) { setLastOp(`Edge ${from}↔${to} already exists`); return; }
    const w = parseInt(edgeWeight);
    setEdges(prev => [...prev, { id: edgeId, from, to, weight: isNaN(w) ? undefined : w }]);
    setLastOp(`Added edge ${from} — ${to}${isNaN(w) ? "" : ` (weight: ${w})`}`);
    setEdgeFrom(""); setEdgeTo(""); setEdgeWeight("");
  };

  const deleteNode = () => {
    const id = deleteTarget.trim().toUpperCase();
    if (!nodes.find(n => n.id === id)) { setLastOp(`Node ${id} not found`); return; }
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    setLastOp(`Deleted node ${id} and all its edges`);
    setDeleteTarget("");
  };

  const deleteEdge = () => {
    const [from, to] = deleteTarget.split(/[-–]/).map(s => s.trim().toUpperCase());
    const edgeId1 = `${from}-${to}`;
    const edgeId2 = `${to}-${from}`;
    const found = edges.find(e => e.id === edgeId1 || e.id === edgeId2);
    if (!found) { setLastOp(`Edge ${from}—${to} not found`); return; }
    setEdges(prev => prev.filter(e => e.id !== found.id));
    setLastOp(`Deleted edge ${from} — ${to}`);
    setDeleteTarget("");
  };

  const runBFS = (startId: string) => {
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });

    const visited = new Set<string>();
    const queue = [startId];
    const order: string[] = [];
    visited.add(startId);

    while (queue.length > 0) {
      const node = queue.shift()!;
      order.push(node);
      for (const neighbor of (adj[node] || [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    animateVisit(order, "BFS");
  };

  const runDFS = (startId: string) => {
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => { adj[e.from].push(e.to); adj[e.to].push(e.from); });

    const visited = new Set<string>();
    const order: string[] = [];

    function dfs(id: string) {
      visited.add(id);
      order.push(id);
      for (const neighbor of (adj[id] || [])) {
        if (!visited.has(neighbor)) dfs(neighbor);
      }
    }
    dfs(startId);
    animateVisit(order, "DFS");
  };

  const animateVisit = (order: string[], algoName: string) => {
    setVisitOrder(order);
    setHighlightedNodes(new Set());
    setCurrentNode(null);
    setLastOp(`${algoName} from ${order[0]}: ${order.join(" → ")}`);

    order.forEach((nodeId, i) => {
      setTimeout(() => {
        setCurrentNode(nodeId);
        setHighlightedNodes(prev => new Set([...prev, nodeId]));
      }, i * 500);
    });
    setTimeout(() => setCurrentNode(null), order.length * 500 + 200);
  };

  const handleMouseDown = (nodeId: string) => (e: React.MouseEvent) => {
    if (mode !== "add-node") { setDragNode(nodeId); e.preventDefault(); }
  };

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNodes(prev => prev.map(n => n.id === dragNode ? { ...n, x, y } : n));
  }, [dragNode]);

  const handleSvgMouseUp = useCallback(() => setDragNode(null), []);

  const colorFor = (id: string) => COLORS[id.charCodeAt(0) % COLORS.length];

  const reset = () => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setHighlightedNodes(new Set());
    setVisitOrder([]);
    setCurrentNode(null);
    setLastOp("");
  };

  const startNodeForTraversal = nodes[0]?.id || "A";

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Undirected Graph</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Drag nodes to rearrange. Supports BFS & DFS traversal</p>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-secondary rounded-lg transition-colors">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {([
          { id: "add-node", label: "Add Node" },
          { id: "add-edge", label: "Add Edge" },
          { id: "delete-node", label: "Delete Node" },
          { id: "delete-edge", label: "Delete Edge" },
          { id: "bfs", label: "BFS" },
          { id: "dfs", label: "DFS" },
        ] as const).map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setVisitOrder([]); setHighlightedNodes(new Set()); setCurrentNode(null); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === m.id
                ? m.id.startsWith("delete") ? "bg-destructive text-destructive-foreground"
                  : m.id === "bfs" || m.id === "dfs" ? "bg-chart-2 text-primary-foreground"
                  : "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
            style={mode === m.id && (m.id === "bfs" || m.id === "dfs") ? { backgroundColor: "hsl(48 100% 50%)", color: "hsl(220 20% 12%)" } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {mode === "add-node" && (
          <>
            <input type="text" value={nodeLabel} onChange={e => setNodeLabel(e.target.value.slice(0, 3).toUpperCase())} onKeyDown={e => e.key === "Enter" && addNode()} placeholder="Label (A-Z)" className="w-32 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={addNode} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"><Plus size={15} /> Add Node</button>
          </>
        )}
        {mode === "add-edge" && (
          <>
            <input type="text" value={edgeFrom} onChange={e => setEdgeFrom(e.target.value.toUpperCase())} placeholder="From (e.g. A)" className="w-24 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="text" value={edgeTo} onChange={e => setEdgeTo(e.target.value.toUpperCase())} placeholder="To (e.g. B)" className="w-24 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="number" value={edgeWeight} onChange={e => setEdgeWeight(e.target.value)} placeholder="Weight (opt)" className="w-28 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={addEdge} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"><Plus size={15} /> Add Edge</button>
          </>
        )}
        {(mode === "delete-node" || mode === "delete-edge") && (
          <>
            <input type="text" value={deleteTarget} onChange={e => setDeleteTarget(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && (mode === "delete-node" ? deleteNode() : deleteEdge())} placeholder={mode === "delete-node" ? "Node label" : "e.g. A-B"} className="w-36 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={mode === "delete-node" ? deleteNode : deleteEdge} className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90"><Trash2 size={15} /> Delete</button>
          </>
        )}
        {(mode === "bfs" || mode === "dfs") && (
          <>
            <select value={startNodeForTraversal} onChange={() => {}} className="px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
            <button
              onClick={() => mode === "bfs" ? runBFS(nodes[0]?.id || "A") : runDFS(nodes[0]?.id || "A")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: "hsl(48 100% 50%)", color: "hsl(220 20% 12%)" }}
            >
              <GitBranch size={15} /> Run {mode.toUpperCase()} from {nodes[0]?.label}
            </button>
          </>
        )}
      </div>

      {lastOp && (
        <motion.div key={lastOp} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-2.5 bg-accent/40 border border-accent-border rounded-lg text-sm text-accent-foreground font-mono">
          {lastOp}
        </motion.div>
      )}

      <div className="w-full rounded-xl bg-card/50 border border-border overflow-hidden select-none">
        <svg
          ref={svgRef}
          width="100%"
          height="420"
          viewBox="0 0 600 420"
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseUp}
          className="cursor-default"
        >
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            const isHighlighted = highlightedNodes.has(edge.from) && highlightedNodes.has(edge.to);
            return (
              <g key={edge.id}>
                <line
                  x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
                  stroke={isHighlighted ? "hsl(48 100% 48%)" : "hsl(var(--border))"}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeLinecap="round"
                  style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                />
                {edge.weight !== undefined && (
                  <text x={midX} y={midY - 5} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="hsl(var(--muted-foreground))">
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map((node, i) => {
            const isHighlighted = highlightedNodes.has(node.id);
            const isCurrent = currentNode === node.id;
            const col = colorFor(node.id);
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ cursor: "grab" }}
                onMouseDown={handleMouseDown(node.id) as any}
              >
                <circle
                  cx={node.x} cy={node.y} r={NODE_R + (isCurrent ? 5 : 0)}
                  fill={isCurrent ? col : isHighlighted ? col + "88" : "hsl(var(--card))"}
                  stroke={isHighlighted || isCurrent ? col : "hsl(var(--border))"}
                  strokeWidth={isCurrent ? 3 : isHighlighted ? 2 : 1.5}
                  style={{ transition: "all 0.3s" }}
                />
                <text
                  x={node.x} y={node.y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={700}
                  fontFamily="monospace"
                  fill={isCurrent ? "#fff" : "hsl(var(--foreground))"}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {node.label}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {visitOrder.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">Visit order:</span>
          {visitOrder.map((id, i) => (
            <span key={i} className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: highlightedNodes.has(id) ? colorFor(id) + "33" : "hsl(var(--secondary))", color: highlightedNodes.has(id) ? colorFor(id) : "hsl(var(--muted-foreground))" }}>
              {id}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-4 text-xs text-muted-foreground font-mono">
        <span><span className="text-primary font-semibold">Nodes:</span> {nodes.length}</span>
        <span><span className="text-primary font-semibold">Edges:</span> {edges.length}</span>
        <span className="text-muted-foreground/60">Drag nodes to reposition</span>
      </div>
    </div>
  );
}
