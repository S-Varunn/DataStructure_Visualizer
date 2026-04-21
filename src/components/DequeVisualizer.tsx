import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import { genId } from "@/lib/dataStructures";

interface DequeItem { value: number; id: string; }

const INITIAL: DequeItem[] = [
  { value: 15, id: genId() },
  { value: 7, id: genId() },
  { value: 28, id: genId() },
  { value: 3, id: genId() },
];

export default function DequeVisualizer() {
  const [deque, setDeque] = useState<DequeItem[]>(INITIAL);
  const [inputVal, setInputVal] = useState("");
  const [mode, setMode] = useState<"front" | "back">("back");
  const [lastOp, setLastOp] = useState("");

  const pushFront = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    setDeque(prev => [{ value: val, id: genId() }, ...prev]);
    setLastOp(`push_front(${val}): O(1) — added to front`);
    setInputVal("");
  };

  const pushBack = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    setDeque(prev => [...prev, { value: val, id: genId() }]);
    setLastOp(`push_back(${val}): O(1) — added to back`);
    setInputVal("");
  };

  const popFront = () => {
    if (deque.length === 0) { setLastOp("Deque is empty"); return; }
    setLastOp(`pop_front() → ${deque[0].value}: O(1) — removed from front`);
    setDeque(prev => prev.slice(1));
  };

  const popBack = () => {
    if (deque.length === 0) { setLastOp("Deque is empty"); return; }
    setLastOp(`pop_back() → ${deque[deque.length - 1].value}: O(1) — removed from back`);
    setDeque(prev => prev.slice(0, -1));
  };

  const reset = () => {
    setDeque(INITIAL.map(i => ({ ...i, id: genId() })));
    setLastOp("");
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Deque (Double-Ended Queue)</h2>
          <p className="text-sm text-muted-foreground mt-0.5">O(1) push/pop at both front and back</p>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-secondary rounded-lg transition-colors">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="number"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (mode === "front" ? pushFront() : pushBack())}
          placeholder="Value"
          className="w-32 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex gap-2">
          <button onClick={pushFront} className="flex items-center gap-1.5 px-3 py-2 bg-primary/80 text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <ArrowLeft size={14} /> Push Front
          </button>
          <button onClick={pushBack} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Push Back <ArrowRight size={14} />
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={popFront} className="flex items-center gap-1.5 px-3 py-2 bg-destructive/80 text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <ArrowLeft size={14} /> Pop Front
          </button>
          <button onClick={popBack} className="flex items-center gap-1.5 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Pop Back <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {lastOp && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-2.5 bg-accent/40 border border-accent-border rounded-lg text-sm text-accent-foreground font-mono">
          {lastOp}
        </motion.div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
            <ArrowLeft size={10} /> front (pop/push)
          </span>
          <div className="flex-1 border-t border-dashed border-border" />
          <span className="px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
            (pop/push) back <ArrowRight size={10} />
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-0 min-w-fit">
            <AnimatePresence mode="popLayout">
              {deque.map((item, idx) => {
                const isFront = idx === 0;
                const isBack = idx === deque.length - 1;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scaleX: 0, width: 0 }}
                    animate={{ opacity: 1, scaleX: 1, width: "auto" }}
                    exit={{ opacity: 0, scaleX: 0, width: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-xs font-mono text-muted-foreground mb-1 h-4 px-1">
                      {isFront && <span className="text-primary">front</span>}
                      {isBack && !isFront && <span className="text-primary">back</span>}
                    </div>
                    <div className={`flex items-center justify-center w-16 h-14 border-t border-b border-r font-mono font-bold text-base transition-colors ${
                      idx === 0 ? "border-l rounded-l-lg" : ""
                    } ${
                      isBack ? "rounded-r-lg" : ""
                    } ${
                      isFront || isBack
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground"
                    }`}>
                      {item.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">[{idx}]</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {deque.length === 0 && (
              <div className="flex items-center justify-center w-full h-14 text-muted-foreground text-sm italic">
                Deque is empty
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Operations</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { op: "push_front(x)", c: "O(1)", note: "Add to front" },
            { op: "push_back(x)", c: "O(1)", note: "Add to back" },
            { op: "pop_front()", c: "O(1)", note: "Remove from front" },
            { op: "pop_back()", c: "O(1)", note: "Remove from back" },
            { op: "front()", c: "O(1)", note: "Peek front" },
            { op: "back()", c: "O(1)", note: "Peek back" },
          ].map(row => (
            <div key={row.op} className="flex items-center gap-2">
              <code className="text-primary font-mono text-xs bg-primary/10 px-2 py-0.5 rounded">{row.op}</code>
              <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">{row.c}</span>
              <span className="text-xs text-muted-foreground hidden sm:block">{row.note}</span>
            </div>
          ))}
        </div>
        {deque.length > 0 && (
          <div className="flex gap-4 text-xs text-muted-foreground font-mono">
            <span><span className="text-primary font-semibold">Size:</span> {deque.length}</span>
            <span><span className="text-primary font-semibold">Front:</span> {deque[0].value}</span>
            <span><span className="text-primary font-semibold">Back:</span> {deque[deque.length - 1].value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
