import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import {
  TreeNode,
  TreeNodeWithPos,
  buildBST,
  deleteBSTNode,
  insertBinaryTree,
  deleteBinaryTreeNode,
  computeTreePositions,
  treeHeight,
  genId,
} from "@/lib/dataStructures";

type TreeType = "bst" | "binary";

interface Props {
  treeType: TreeType;
}

const INITIAL_BST_VALUES = [50, 30, 70, 20, 40, 60, 80];
const INITIAL_BT_VALUES = [1, 2, 3, 4, 5, 6, 7];

function buildInitialBST(): TreeNode | undefined {
  let root: TreeNode | undefined;
  for (const v of INITIAL_BST_VALUES) root = buildBST(root, v);
  return root;
}

function buildInitialBT(): TreeNode | undefined {
  let root: TreeNode | undefined;
  for (const v of INITIAL_BT_VALUES) root = insertBinaryTree(root, v);
  return root;
}

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 70;
const SVG_PADDING = 40;

function collectNodes(node: TreeNodeWithPos | undefined, result: TreeNodeWithPos[] = []): TreeNodeWithPos[] {
  if (!node) return result;
  result.push(node);
  collectNodes(node.left, result);
  collectNodes(node.right, result);
  return result;
}

function collectEdges(node: TreeNodeWithPos | undefined, result: Array<{ x1: number; y1: number; x2: number; y2: number; id: string }> = []) {
  if (!node) return result;
  if (node.left) {
    result.push({ x1: node.x, y1: node.y, x2: node.left.x, y2: node.left.y, id: `${node.id}-${node.left.id}` });
    collectEdges(node.left, result);
  }
  if (node.right) {
    result.push({ x1: node.x, y1: node.y, x2: node.right.x, y2: node.right.y, id: `${node.id}-${node.right.id}` });
    collectEdges(node.right, result);
  }
  return result;
}

export default function TreeVisualizer({ treeType }: Props) {
  const [root, setRoot] = useState<TreeNode | undefined>(
    treeType === "bst" ? buildInitialBST() : buildInitialBT()
  );
  const [inputVal, setInputVal] = useState("");
  const [mode, setMode] = useState<"add" | "delete">("add");
  const [lastOp, setLastOp] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const height = treeHeight(root);
  const svgWidth = Math.max(600, Math.pow(2, height) * NODE_RADIUS * 2.5);
  const svgHeight = height * LEVEL_HEIGHT + NODE_RADIUS * 2 + SVG_PADDING * 2;
  const centerX = svgWidth / 2;

  const posTree = useMemo(() => {
    if (!root) return undefined;
    const spread = svgWidth / 4;
    return computeTreePositions(root, centerX, SVG_PADDING + NODE_RADIUS, spread, LEVEL_HEIGHT);
  }, [root, svgWidth, centerX]);

  const nodes = useMemo(() => posTree ? collectNodes(posTree) : [], [posTree]);
  const edges = useMemo(() => posTree ? collectEdges(posTree) : [], [posTree]);

  const handleAction = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;

    if (mode === "add") {
      let newRoot: TreeNode;
      if (treeType === "bst") {
        newRoot = buildBST(root, val);
        setLastOp(`Inserted ${val} into BST. O(log n) avg, O(n) worst`);
      } else {
        newRoot = insertBinaryTree(root, val);
        setLastOp(`Inserted ${val} into Binary Tree (level-order). O(n)`);
      }
      setRoot(newRoot);
      const allNodes: TreeNode[] = [];
      function collect(n: TreeNode | undefined) {
        if (!n) return;
        allNodes.push(n);
        collect(n.left);
        collect(n.right);
      }
      collect(newRoot);
      const newNode = allNodes.find(n => n.value === val && n.isNew);
      if (newNode) {
        setHighlightId(newNode.id);
        setTimeout(() => setHighlightId(null), 1200);
      }
    } else {
      const newRoot = treeType === "bst"
        ? deleteBSTNode(root, val)
        : deleteBinaryTreeNode(root, val);
      setRoot(newRoot);
      setLastOp(`Deleted ${val} from ${treeType === "bst" ? "BST (in-order successor replacement)" : "Binary Tree (deepest rightmost node)"}`);
    }
    setInputVal("");
  };

  const reset = () => {
    setRoot(treeType === "bst" ? buildInitialBST() : buildInitialBT());
    setLastOp("");
    setHighlightId(null);
  };

  const label = treeType === "bst" ? "Binary Search Tree" : "Binary Tree";
  const description = treeType === "bst"
    ? "Left < Parent < Right. O(log n) search/insert/delete avg"
    : "Each node has at most 2 children. Inserted level-by-level";

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{label}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
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
        <div className="flex gap-2">
          {(["add", "delete"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? m === "add" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {m === "add" ? "Insert" : "Delete"}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAction()}
          placeholder="Value"
          className="w-32 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleAction}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 ${
            mode === "add"
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
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
        {root ? (
          <svg
            width={svgWidth}
            height={svgHeight}
            className="min-w-full"
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <circle cx="4" cy="4" r="2" fill="hsl(var(--border))" />
              </marker>
            </defs>

            {edges.map(edge => (
              <motion.line
                key={edge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="hsl(var(--border))"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            ))}

            {nodes.map(node => {
              const isHighlighted = node.id === highlightId;
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
                    fill={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--card))"}
                    stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))"}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    style={{ transition: "all 0.3s" }}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fontSize={node.value > 99 ? 11 : 13}
                    fontWeight={600}
                    fontFamily="monospace"
                    fill={isHighlighted ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"}
                  >
                    {node.value}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm italic">
            Tree is empty — insert a value
          </div>
        )}
      </div>

      {root && (
        <div className="flex gap-4 text-xs text-muted-foreground font-mono">
          <span><span className="text-primary font-semibold">Height:</span> {height}</span>
          <span><span className="text-primary font-semibold">Nodes:</span> {nodes.length}</span>
          {treeType === "bst" && nodes.length > 0 && (
            <>
              <span><span className="text-primary font-semibold">Min:</span> {Math.min(...nodes.map(n => n.value))}</span>
              <span><span className="text-primary font-semibold">Max:</span> {Math.max(...nodes.map(n => n.value))}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
