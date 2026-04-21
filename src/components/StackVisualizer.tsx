import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowDown, RotateCcw } from "lucide-react";
import { genId } from "@/lib/dataStructures";

interface StackItem { value: number; id: string; }

const INITIAL: StackItem[] = [
  { value: 3, id: genId() },
  { value: 7, id: genId() },
  { value: 15, id: genId() },
  { value: 22, id: genId() },
];

export default function StackVisualizer() {
  const [stack, setStack] = useState<StackItem[]>(INITIAL);
  const [inputVal, setInputVal] = useState("");
  const [lastOp, setLastOp] = useState("");
  const [poppedVal, setPoppedVal] = useState<number | null>(null);
  const [showPopped, setShowPopped] = useState(false);

  const push = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    setStack(prev => [...prev, { value: val, id: genId() }]);
    setLastOp(`push(${val}) — O(1): added to top`);
    setInputVal("");
  };

  const pop = () => {
    if (stack.length === 0) { setLastOp("Stack is empty — nothing to pop"); return; }
    const top = stack[stack.length - 1];
    setPoppedVal(top.value);
    setShowPopped(true);
    setStack(prev => prev.slice(0, -1));
    setLastOp(`pop() → ${top.value} — O(1): removed from top`);
    setTimeout(() => setShowPopped(false), 1800);
  };

  const peek = () => {
    if (stack.length === 0) { setLastOp("Stack is empty"); return; }
    const top = stack[stack.length - 1].value;
    setLastOp(`peek() → ${top} — O(1): top element (not removed)`);
  };

  const reset = () => {
    setStack(INITIAL.map(i => ({ ...i, id: genId() })));
    setLastOp("");
    setShowPopped(false);
  };

  const top = stack.length > 0 ? stack[stack.length - 1] : null;

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Stack</h2>
          <p className="text-sm text-muted-foreground mt-0.5">LIFO — Last In, First Out. O(1) push/pop/peek</p>
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
          onKeyDown={e => e.key === "Enter" && push()}
          placeholder="Value to push"
          className="w-36 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button onClick={push} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={15} /> Push
        </button>
        <button onClick={pop} className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <ArrowDown size={15} /> Pop
        </button>
        <button onClick={peek} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors">
          Peek
        </button>
      </div>

      {lastOp && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-2.5 bg-accent/40 border border-accent-border rounded-lg text-sm text-accent-foreground font-mono">
          {lastOp}
        </motion.div>
      )}

      <div className="flex gap-8 items-start">
        <div className="flex flex-col items-center gap-1 min-w-[120px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Stack</div>
            {top && <div className="text-xs text-primary font-mono">top={top.value}</div>}
          </div>

          <AnimatePresence>
            {showPopped && (
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -60, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute px-8 py-3 bg-primary/20 border border-primary rounded-lg text-primary font-mono font-bold text-lg"
              >
                {poppedVal}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col-reverse gap-0.5 w-28">
            <div className="h-1.5 w-full bg-border rounded-b-sm" />
            <AnimatePresence mode="popLayout">
              {stack.map((item, idx) => {
                const isTop = idx === stack.length - 1;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scaleY: 0, height: 0 }}
                    animate={{ opacity: 1, scaleY: 1, height: "auto" }}
                    exit={{ opacity: 0, scaleY: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex items-center justify-between px-3 py-2.5 border rounded-sm font-mono text-sm font-semibold ${
                      isTop
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-card border-border text-foreground"
                    }`}
                  >
                    <span>{item.value}</span>
                    {isTop && <span className="text-xs text-primary/60">← top</span>}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {stack.length === 0 && (
              <div className="flex items-center justify-center h-12 text-muted-foreground text-xs italic">empty</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Operations</div>
          {[
            { op: "push(x)", complexity: "O(1)", note: "Add to top" },
            { op: "pop()", complexity: "O(1)", note: "Remove from top" },
            { op: "peek()", complexity: "O(1)", note: "View top element" },
            { op: "isEmpty()", complexity: "O(1)", note: "Check if empty" },
            { op: "size()", complexity: "O(1)", note: "Number of elements" },
          ].map(row => (
            <div key={row.op} className="flex items-center gap-3 text-sm">
              <code className="text-primary font-mono text-xs bg-primary/10 px-2 py-0.5 rounded w-28">{row.op}</code>
              <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">{row.complexity}</span>
              <span className="text-xs text-muted-foreground">{row.note}</span>
            </div>
          ))}
          <div className="mt-3 text-xs font-mono text-muted-foreground">
            <span className="text-primary font-semibold">Size:</span> {stack.length}
            {stack.length > 0 && <><span className="mx-2 text-border">|</span><span className="text-primary font-semibold">Top:</span> {top?.value}</>}
          </div>
        </div>
      </div>
    </div>
  );
}
