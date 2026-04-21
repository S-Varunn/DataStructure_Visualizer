import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, RotateCcw } from "lucide-react";
import { genId } from "@/lib/dataStructures";

interface QueueItem { value: number; id: string; }

const INITIAL: QueueItem[] = [
  { value: 10, id: genId() },
  { value: 25, id: genId() },
  { value: 8, id: genId() },
  { value: 33, id: genId() },
];

export default function QueueVisualizer() {
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL);
  const [inputVal, setInputVal] = useState("");
  const [lastOp, setLastOp] = useState("");
  const [dequeuedVal, setDequeuedVal] = useState<number | null>(null);
  const [showDequeued, setShowDequeued] = useState(false);

  const enqueue = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;
    setQueue(prev => [...prev, { value: val, id: genId() }]);
    setLastOp(`enqueue(${val}) — O(1): added to rear`);
    setInputVal("");
  };

  const dequeue = () => {
    if (queue.length === 0) { setLastOp("Queue is empty — nothing to dequeue"); return; }
    const front = queue[0];
    setDequeuedVal(front.value);
    setShowDequeued(true);
    setQueue(prev => prev.slice(1));
    setLastOp(`dequeue() → ${front.value} — O(1): removed from front`);
    setTimeout(() => setShowDequeued(false), 1800);
  };

  const front = () => {
    if (queue.length === 0) { setLastOp("Queue is empty"); return; }
    setLastOp(`front() → ${queue[0].value} — O(1): front element (not removed)`);
  };

  const rear = () => {
    if (queue.length === 0) { setLastOp("Queue is empty"); return; }
    setLastOp(`rear() → ${queue[queue.length - 1].value} — O(1): rear element (not removed)`);
  };

  const reset = () => {
    setQueue(INITIAL.map(i => ({ ...i, id: genId() })));
    setLastOp("");
    setShowDequeued(false);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Queue</h2>
          <p className="text-sm text-muted-foreground mt-0.5">FIFO — First In, First Out. O(1) enqueue/dequeue</p>
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
          onKeyDown={e => e.key === "Enter" && enqueue()}
          placeholder="Value to enqueue"
          className="w-36 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button onClick={enqueue} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={15} /> Enqueue
        </button>
        <button onClick={dequeue} className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <ArrowRight size={15} /> Dequeue
        </button>
        <button onClick={front} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors">
          Front
        </button>
        <button onClick={rear} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-accent transition-colors">
          Rear
        </button>
      </div>

      {lastOp && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-2.5 bg-accent/40 border border-accent-border rounded-lg text-sm text-accent-foreground font-mono">
          {lastOp}
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="px-2 py-1 rounded bg-destructive/20 text-destructive border border-destructive/30">← dequeue (front)</span>
          <div className="flex-1 border-t border-dashed border-border" />
          <span className="px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30">enqueue (rear) →</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-0 min-w-fit relative">
            <AnimatePresence>
              {showDequeued && (
                <motion.div
                  initial={{ x: 0, opacity: 1 }}
                  animate={{ x: -80, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute -left-16 top-0 flex items-center justify-center w-14 h-14 rounded-lg border border-destructive bg-destructive/20 text-destructive font-mono font-bold"
                >
                  {dequeuedVal}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {queue.map((item, idx) => {
                const isFront = idx === 0;
                const isRear = idx === queue.length - 1;
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
                    <div className="text-xs text-muted-foreground mb-1 font-mono px-1 h-4">
                      {isFront && <span className="text-destructive">front</span>}
                      {isRear && !isFront && <span className="text-primary">rear</span>}
                    </div>
                    <div className={`flex items-center justify-center w-14 h-14 border-t border-b border-r ${
                      idx === 0 ? "border-l rounded-l-lg" : ""
                    } ${
                      isRear ? "rounded-r-lg" : ""
                    } font-mono font-bold text-base ${
                      isFront
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : isRear
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground"
                    }`}>
                      {item.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono px-1">{idx}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {queue.length === 0 && (
              <div className="flex items-center justify-center w-full h-14 text-muted-foreground text-sm italic">
                Queue is empty
              </div>
            )}
          </div>
        </div>

        {queue.length > 0 && (
          <div className="flex gap-4 text-xs text-muted-foreground font-mono">
            <span><span className="text-primary font-semibold">Size:</span> {queue.length}</span>
            <span><span className="text-primary font-semibold">Front:</span> {queue[0].value}</span>
            <span><span className="text-primary font-semibold">Rear:</span> {queue[queue.length - 1].value}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Operations</div>
        <div className="flex gap-3 flex-wrap">
          {[
            { op: "enqueue(x)", c: "O(1)" },
            { op: "dequeue()", c: "O(1)" },
            { op: "front()", c: "O(1)" },
            { op: "rear()", c: "O(1)" },
            { op: "isEmpty()", c: "O(1)" },
          ].map(r => (
            <div key={r.op} className="flex items-center gap-2">
              <code className="text-primary font-mono text-xs bg-primary/10 px-2 py-0.5 rounded">{r.op}</code>
              <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">{r.c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
