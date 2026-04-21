import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrayVisualizer from "@/components/ArrayVisualizer";
import TreeVisualizer from "@/components/TreeVisualizer";
import HeapVisualizer from "@/components/HeapVisualizer";
import StackVisualizer from "@/components/StackVisualizer";
import QueueVisualizer from "@/components/QueueVisualizer";
import LinkedListVisualizer from "@/components/LinkedListVisualizer";
import DequeVisualizer from "@/components/DequeVisualizer";
import GraphVisualizer from "@/components/GraphVisualizer";
import HashMapVisualizer from "@/components/HashMapVisualizer";

type Tab =
  | "array" | "stack" | "queue" | "deque"
  | "singly" | "doubly"
  | "binary" | "bst"
  | "minheap" | "maxheap"
  | "graph" | "hashmap";

interface TabDef {
  id: Tab;
  label: string;
  badge: string;
  group: string;
}

const TABS: TabDef[] = [
  { id: "array",   label: "Array",       badge: "O(1)",     group: "Linear" },
  { id: "stack",   label: "Stack",       badge: "LIFO",     group: "Linear" },
  { id: "queue",   label: "Queue",       badge: "FIFO",     group: "Linear" },
  { id: "deque",   label: "Deque",       badge: "2-ended",  group: "Linear" },
  { id: "singly",  label: "Linked List", badge: "Singly",   group: "Linked" },
  { id: "doubly",  label: "Doubly LL",   badge: "Doubly",   group: "Linked" },
  { id: "binary",  label: "Bin. Tree",   badge: "Level",    group: "Trees"  },
  { id: "bst",     label: "BST",         badge: "O(log n)", group: "Trees"  },
  { id: "minheap", label: "Min Heap",    badge: "O(1) min", group: "Trees"  },
  { id: "maxheap", label: "Max Heap",    badge: "O(1) max", group: "Trees"  },
  { id: "graph",   label: "Graph",       badge: "BFS/DFS",  group: "Other"  },
  { id: "hashmap", label: "Hash Map",    badge: "O(1) avg", group: "Other"  },
];

const GROUPS = ["Linear", "Linked", "Trees", "Other"];

const GROUP_COLORS: Record<string, string> = {
  Linear: "hsl(217 91% 52%)",
  Linked: "hsl(199 89% 44%)",
  Trees:  "hsl(48 100% 46%)",
  Other:  "hsl(230 80% 58%)",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("array");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── single sticky header + nav block ── */}
      <div className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">

        {/* header row */}
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(32 95% 56%), hsl(22 85% 58%))" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="6" width="3" height="9" rx="1" fill="white" opacity="0.95" />
                <rect x="6" y="3" width="3" height="12" rx="1" fill="white" opacity="0.95" />
                <rect x="11" y="1" width="3" height="14" rx="1" fill="white" opacity="0.95" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight leading-none">DS Visualizer</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">Interactive Data Structure Explorer</p>
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono bg-secondary px-2 py-1 rounded-md">
            {TABS.length} structures
          </span>
        </div>

        {/* nav row — single scrollable strip with dividers between groups */}
        <div className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-3">
            <div className="flex items-stretch overflow-x-auto scrollbar-none">
              {GROUPS.map((group, gi) => {
                const groupTabs = TABS.filter(t => t.group === group);
                const color = GROUP_COLORS[group];
                return (
                  <div key={group} className="flex items-stretch flex-shrink-0">
                    {/* divider between groups */}
                    {gi > 0 && (
                      <div className="flex items-center px-1">
                        <div className="w-px h-5 bg-border rounded-full" />
                      </div>
                    )}

                    {/* group label pill */}
                    <div className="flex items-center px-2 py-2.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                        style={{ color: color + "cc" }}
                      >
                        {group}
                      </span>
                    </div>

                    {/* tabs */}
                    {groupTabs.map(tab => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className="relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none"
                          style={{ color: isActive ? color : "hsl(var(--muted-foreground))" }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="tab-active"
                              className="absolute inset-0"
                              style={{
                                background: color + "14",
                                borderBottom: `2px solid ${color}`,
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{tab.label}</span>
                          <span
                            className="relative z-10 text-[10px] px-1.5 py-0.5 rounded font-mono"
                            style={isActive
                              ? { background: color + "22", color }
                              : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }
                            }
                          >
                            {tab.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── main content ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.17, ease: "easeInOut" }}
          >
            {activeTab === "array"   && <ArrayVisualizer />}
            {activeTab === "stack"   && <StackVisualizer />}
            {activeTab === "queue"   && <QueueVisualizer />}
            {activeTab === "deque"   && <DequeVisualizer />}
            {activeTab === "singly"  && <LinkedListVisualizer listType="singly" />}
            {activeTab === "doubly"  && <LinkedListVisualizer listType="doubly" />}
            {activeTab === "binary"  && <TreeVisualizer treeType="binary" />}
            {activeTab === "bst"     && <TreeVisualizer treeType="bst" />}
            {activeTab === "minheap" && <HeapVisualizer heapType="min" />}
            {activeTab === "maxheap" && <HeapVisualizer heapType="max" />}
            {activeTab === "graph"   && <GraphVisualizer />}
            {activeTab === "hashmap" && <HashMapVisualizer />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        All operations display time complexity. Click, type, and drag to interact.
      </footer>
    </div>
  );
}
