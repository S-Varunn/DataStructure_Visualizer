import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import {
  HeapNode,
  insertMinHeap,
  deleteMinHeap,
  insertMaxHeap,
  deleteMaxHeap,
  genId,
  TreeNodeWithPos,
} from "@/lib/dataStructures";

type HeapType = "min" | "max";

interface Props {
  heapType: HeapType;
}

const INITIAL_MIN = [2, 5, 7, 10, 12, 15, 20];
const INITIAL_MAX = [25, 20, 18, 10, 15, 8, 12];

function buildInitialMinHeap(): HeapNode[] {
  let h: HeapNode[] = [];
  for (const v of INITIAL_MIN) h = insertMinHeap(h, v);
  return h;
}

function buildInitialMaxHeap(): HeapNode[] {
  let h: HeapNode[] = [];
  for (const v of INITIAL_MAX) h = insertMaxHeap(h, v);
  return h;
}

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 72;
const SVG_PADDING = 40;

interface PosNode {
  value: number;
  id: string;
  x: number;
  y: number;
  index: number;
  highlighted?: boolean;
}

function heapToPositions(heap: HeapNode[], svgWidth: number): { nodes: PosNode[]; edges: Array<{ x1: number; y1: number; x2: number; y2: number; id: string }> } {
  const nodes: PosNode[] = [];
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number; id: string }> = [];

  const levels = Math.floor(Math.log2(heap.length)) + 1;

  for (let i = 0; i < heap.length; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const levelStart = Math.pow(2, level) - 1;
    const levelCount = Math.pow(2, level);
    const posInLevel = i - levelStart;
    const totalLevels = Math.max(levels, 1);
    const levelWidth = svgWidth / levelCount;
    const x = levelWidth * (posInLevel + 0.5);
    const y = SVG_PADDING + NODE_RADIUS + level * LEVEL_HEIGHT;

    nodes.push({ value: heap[i].value, id: heap[i].id, x, y, index: i, highlighted: heap[i].highlighted });

    if (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      const parentNode = nodes.find(n => n.index === parent);
      if (parentNode) {
        edges.push({ x1: parentNode.x, y1: parentNode.y, x2: x, y2: y, id: `${parent}-${i}` });
      }
    }
  }

  return { nodes, edges };
}

export default function HeapVisualizer({ heapType }: Props) {
  const [heap, setHeap] = useState<HeapNode[]>(
    heapType === "min" ? buildInitialMinHeap() : buildInitialMaxHeap()
  );
  const [inputVal, setInputVal] = useState("");
  const [mode, setMode] = useState<"add" | "delete-root" | "delete-idx">("add");
  const [indexVal, setIndexVal] = useState("");
  const [lastOp, setLastOp] = useState("");
  const [highlightIndices, setHighlightIndices] = useState<number[]>([]);

  const levels = heap.length > 0 ? Math.floor(Math.log2(heap.length)) + 1 : 1;
  const svgWidth = Math.max(500, Math.pow(2, levels - 1) * NODE_RADIUS * 3.5);
  const svgHeight = levels * LEVEL_HEIGHT + NODE_RADIUS * 2 + SVG_PADDING * 2;

  const { nodes, edges } = useMemo(() => heapToPositions(heap, svgWidth), [heap, svgWidth]);

  const handleAction = () => {
    if (mode === "add") {
      const val = parseInt(inputVal);
      if (isNaN(val)) return;
      const insert = heapType === "min" ? insertMinHeap : insertMaxHeap;
      setHeap(prev => insert(prev, val));
      setLastOp(`Inserted ${val}. Heapify-up: O(log n)`);
      setHighlightIndices([heap.length]);
      setTimeout(() => setHighlightIndices([]), 800);
    } else if (mode === "delete-root") {
      if (heap.length === 0) return;
      const rootVal = heap[0].value;
      const del = heapType === "min" ? deleteMinHeap : deleteMaxHeap;
      setHeap(prev => del(prev, 0));
      setLastOp(`Deleted root (${rootVal}). Heapify-down: O(log n)`);
    } else if (mode === "delete-idx") {
      const idx = parseInt(indexVal);
      if (isNaN(idx) || idx < 0 || idx >= heap.length) return;
      const val = heap[idx].value;
      const del = heapType === "min" ? deleteMinHeap : deleteMaxHeap;
      setHeap(prev => del(prev, idx));
      setLastOp(`Deleted index ${idx} (value: ${val}). Heapify: O(log n)`);
    }
    setInputVal("");
    setIndexVal("");
  };

  const reset = () => {
    setHeap(heapType === "min" ? buildInitialMinHeap() : buildInitialMaxHeap());
    setLastOp("");
    setHighlightIndices([]);
  };

  const heapLabel = heapType === "min" ? "Min Heap" : "Max Heap";
  const heapDesc = heapType === "min"
    ? "Parent always \u2264 children. Root is minimum. O(log n) insert/delete"
    : "Parent always \u2265 children. Root is maximum. O(log n) insert/delete";

  const rootColor = heapType === "min" ? "hsl(48 100% 50%)" : "hsl(217 91% 52%)";
  const rootBorder = heapType === "min" ? "hsl(44 96% 40%)" : "hsl(217 91% 42%)";

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{heapLabel}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{heapDesc}</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-secondary rounded-lg transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {(["add", "delete-root", "delete-idx"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setInputVal(""); setIndexVal(""); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? m === "add" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {m === "add" ? "Insert" : m === "delete-root" ? "Delete Root" : "Delete at Index"}
            </button>
          ))}
        </div>
        {mode === "add" && (
          <input
            type="number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAction()}
            placeholder="Value"
            className="w-32 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
        {mode === "delete-idx" && (
          <input
            type="number"
            value={indexVal}
            onChange={e => setIndexVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAction()}
            placeholder="Index"
            className="w-28 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
        <button
          onClick={handleAction}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 ${
            mode === "add" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
          }`}
        >
          {mode === "add" ? <><Plus size={15} /> Insert</> : <><Trash2 size={15} /> Delete</>}
        </button>
      </div>

      {lastOp && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2.5 bg-accent/40 border border-accent-border rounded-lg text-sm text-accent-foreground font-mono"
        >
          {lastOp}
        </motion.div>
      )}

      <div className="w-full overflow-x-auto rounded-xl bg-card/50 border border-border">
        {heap.length > 0 ? (
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            {edges.map(edge => (
              <motion.line
                key={edge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                stroke="hsl(var(--border))"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            ))}

            {nodes.map((node) => {
              const isRoot = node.index === 0;
              const isHighlighted = highlightIndices.includes(node.index);
              const fillColor = isRoot ? rootColor : isHighlighted ? "hsl(var(--primary))" : "hsl(var(--card))";
              const strokeColor = isRoot ? rootBorder : isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))";

              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ originX: `${node.x}px`, originY: `${node.y}px` }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isRoot ? 2.5 : 1.5}
                    style={{ transition: "all 0.3s" }}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fontSize={node.value > 99 ? 11 : 13}
                    fontWeight={700}
                    fontFamily="monospace"
                    fill={isRoot ? "#fff" : isHighlighted ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"}
                  >
                    {node.value}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + NODE_RADIUS + 12}
                    textAnchor="middle"
                    fontSize={9}
                    fontFamily="monospace"
                    fill="hsl(var(--muted-foreground))"
                  >
                    [{node.index}]
                  </text>
                </motion.g>
              );
            })}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm italic">
            Heap is empty — insert a value
          </div>
        )}
      </div>

      {heap.length > 0 && (
        <div className="flex gap-4 text-xs text-muted-foreground font-mono flex-wrap">
          <span><span className="text-primary font-semibold">Size:</span> {heap.length}</span>
          <span><span className="text-primary font-semibold">Root ({heapType === "min" ? "min" : "max"}):</span> {heap[0]?.value}</span>
          <span><span className="text-primary font-semibold">Height:</span> {levels}</span>
          <span className="text-muted-foreground">Array: [{heap.map(n => n.value).join(", ")}]</span>
        </div>
      )}
    </div>
  );
}
