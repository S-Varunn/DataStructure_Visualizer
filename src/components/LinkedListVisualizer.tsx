import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { genId } from "@/lib/dataStructures";

interface ListNode { value: number; id: string; }
type ListType = "singly" | "doubly";

interface Props { listType: ListType; }

const INITIAL_VALUES = [10, 20, 30, 40, 50];

function makeInitial(): ListNode[] {
  return INITIAL_VALUES.map(v => ({ value: v, id: genId() }));
}

export default function LinkedListVisualizer({ listType }: Props) {
  const [nodes, setNodes] = useState<ListNode[]>(makeInitial());
  const [inputVal, setInputVal] = useState("");
  const [indexVal, setIndexVal] = useState("");
  const [mode, setMode] = useState<"head" | "tail" | "index" | "delete-val" | "delete-idx">("tail");
  const [lastOp, setLastOp] = useState("");

  const handle = () => {
    const val = parseInt(inputVal);
    if (isNaN(val) && !mode.startsWith("delete")) return;

    if (mode === "head") {
      setNodes(prev => [{ value: val, id: genId() }, ...prev]);
      setLastOp(`Insert at head (${val}): O(1) — update head pointer`);
    } else if (mode === "tail") {
      setNodes(prev => [...prev, { value: val, id: genId() }]);
      setLastOp(`Insert at tail (${val}): O(n) — traverse to end`);
    } else if (mode === "index") {
      const idx = parseInt(indexVal);
      if (isNaN(idx) || idx < 0 || idx > nodes.length) return;
      setNodes(prev => {
        const arr = [...prev];
        arr.splice(idx, 0, { value: val, id: genId() });
        return arr;
      });
      setLastOp(`Insert at index ${idx} (${val}): O(n) — traverse ${idx} nodes`);
    } else if (mode === "delete-val") {
      const idx = nodes.findIndex(n => n.value === val);
      if (idx === -1) { setLastOp(`Value ${val} not found`); return; }
      setNodes(prev => prev.filter((_, i) => i !== idx));
      setLastOp(`Delete value ${val} at index ${idx}: O(n) — traverse and unlink`);
    } else if (mode === "delete-idx") {
      const idx = parseInt(indexVal);
      if (isNaN(idx) || idx < 0 || idx >= nodes.length) return;
      const val2 = nodes[idx].value;
      setNodes(prev => prev.filter((_, i) => i !== idx));
      setLastOp(`Delete index ${idx} (value: ${val2}): ${idx === 0 ? "O(1) — update head" : "O(n) — traverse to node"}`);
    }
    setInputVal("");
    setIndexVal("");
  };

  const reset = () => { setNodes(makeInitial()); setLastOp(""); };

  const isDelete = mode.startsWith("delete");
  const label = listType === "singly" ? "Singly Linked List" : "Doubly Linked List";
  const desc = listType === "singly"
    ? "Each node has value + next pointer. O(1) head insert, O(n) tail/search"
    : "Each node has value + next + prev pointers. O(1) head/tail with tail ref";

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{label}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-secondary rounded-lg transition-colors">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {([
          { id: "head", label: "Insert Head" },
          { id: "tail", label: "Insert Tail" },
          { id: "index", label: "Insert at Index" },
          { id: "delete-val", label: "Delete by Value" },
          { id: "delete-idx", label: "Delete at Index" },
        ] as const).map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setInputVal(""); setIndexVal(""); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === m.id
                ? m.id.startsWith("delete") ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {!mode.startsWith("delete") || mode === "delete-val" ? (
          <input
            type="number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
            placeholder={mode === "delete-val" ? "Value to delete" : "Value"}
            className="w-36 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : null}
        {(mode === "index" || mode === "delete-idx") && (
          <input
            type="number"
            value={indexVal}
            onChange={e => setIndexVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
            placeholder="Index"
            className="w-28 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
        <button
          onClick={handle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity ${
            isDelete ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {isDelete ? <><Trash2 size={15} /> Delete</> : <><Plus size={15} /> Insert</>}
        </button>
      </div>

      {lastOp && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-2.5 bg-accent/40 border border-accent-border rounded-lg text-sm text-accent-foreground font-mono">
          {lastOp}
        </motion.div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex items-center gap-0 min-w-fit">
          {nodes.length === 0 ? (
            <div className="text-muted-foreground text-sm italic">List is empty — insert a value</div>
          ) : (
            <>
              <div className="text-xs font-mono text-muted-foreground mr-2">NULL</div>
              <div className="w-4 h-px bg-border" />
              {listType === "doubly" && <div className="text-xs text-muted-foreground">↔</div>}
              <AnimatePresence mode="popLayout">
                {nodes.map((node, idx) => (
                  <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0, scale: 0.5, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: "auto" }}
                    exit={{ opacity: 0, scale: 0.5, width: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground mb-1 font-mono">[{idx}]</div>
                      <div className={`relative flex border rounded-lg overflow-hidden ${
                        idx === 0 ? "border-primary/40" : idx === nodes.length - 1 ? "border-accent-foreground/30" : "border-border"
                      }`}>
                        <div className={`w-12 h-10 flex items-center justify-center font-mono font-bold text-sm ${
                          idx === 0 ? "bg-primary/10 text-primary" : idx === nodes.length - 1 ? "bg-accent/30 text-accent-foreground" : "bg-card text-foreground"
                        }`}>
                          {node.value}
                        </div>
                        {listType === "doubly" && (
                          <div className="w-5 h-10 flex items-center justify-center bg-secondary/50 border-l border-border">
                            <div className="flex flex-col gap-0.5">
                              <div className="w-2 h-px bg-muted-foreground/60" />
                              <div className="w-2 h-px bg-muted-foreground/60" />
                            </div>
                          </div>
                        )}
                        <div className="w-7 h-10 flex items-center justify-center bg-secondary/50 border-l border-border">
                          <svg width="14" height="10" viewBox="0 0 14 10">
                            {idx < nodes.length - 1 ? (
                              <>
                                <line x1="0" y1="5" x2="10" y2="5" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" />
                                <polygon points="10,2 14,5 10,8" fill="hsl(var(--muted-foreground))" />
                              </>
                            ) : (
                              <text x="0" y="8" fontSize="8" fill="hsl(var(--muted-foreground))" fontFamily="monospace">∅</text>
                            )}
                          </svg>
                        </div>
                      </div>
                      <div className="text-xs font-mono mt-1 text-muted-foreground/50">
                        {idx === 0 ? "head" : idx === nodes.length - 1 ? "tail" : ""}
                      </div>
                    </div>
                    {idx < nodes.length - 1 && (
                      <div className="flex items-center mx-0">
                        {listType === "doubly" && (
                          <svg width="12" height="10" viewBox="0 0 12 10" className="opacity-40">
                            <polygon points="0,5 4,2 4,8" fill="hsl(var(--muted-foreground))" />
                          </svg>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}
        </div>

        {nodes.length > 0 && (
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground font-mono">
            <span><span className="text-primary font-semibold">Length:</span> {nodes.length}</span>
            <span><span className="text-primary font-semibold">Head:</span> {nodes[0].value}</span>
            <span><span className="text-primary font-semibold">Tail:</span> {nodes[nodes.length - 1].value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
