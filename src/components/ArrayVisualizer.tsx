import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { ArrayElement, genId } from "@/lib/dataStructures";

export default function ArrayVisualizer() {
  const [elements, setElements] = useState<ArrayElement[]>([
    { value: 42, id: genId() },
    { value: 17, id: genId() },
    { value: 88, id: genId() },
    { value: 5, id: genId() },
    { value: 63, id: genId() },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [indexVal, setIndexVal] = useState("");
  const [mode, setMode] = useState<"push" | "insert" | "delete-val" | "delete-idx">("push");
  const [lastOp, setLastOp] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;

    if (mode === "push") {
      setElements(prev => [...prev, { value: val, id: genId(), isNew: true }]);
      setLastOp(`Pushed ${val} to end. O(1) amortized`);
    } else if (mode === "insert") {
      const idx = parseInt(indexVal);
      if (isNaN(idx) || idx < 0 || idx > elements.length) return;
      const newEl: ArrayElement = { value: val, id: genId(), isNew: true };
      setElements(prev => {
        const arr = [...prev];
        arr.splice(idx, 0, newEl);
        return arr;
      });
      setLastOp(`Inserted ${val} at index ${idx}. O(n) — shifted ${elements.length - idx} elements`);
    }
    setInputVal("");
    setIndexVal("");
  };

  const handleDelete = () => {
    if (mode === "delete-val") {
      const val = parseInt(inputVal);
      if (isNaN(val)) return;
      const idx = elements.findIndex(e => e.value === val);
      if (idx === -1) { setLastOp(`Value ${val} not found`); return; }
      setElements(prev => prev.filter((_, i) => i !== idx));
      setLastOp(`Deleted value ${val} at index ${idx}. O(n) — shifted elements`);
    } else if (mode === "delete-idx") {
      const idx = parseInt(indexVal);
      if (isNaN(idx) || idx < 0 || idx >= elements.length) return;
      const val = elements[idx].value;
      setElements(prev => prev.filter((_, i) => i !== idx));
      setLastOp(`Deleted index ${idx} (value: ${val}). O(n) — shifted elements`);
    }
    setInputVal("");
    setIndexVal("");
  };

  const reset = () => {
    setElements([
      { value: 42, id: genId() },
      { value: 17, id: genId() },
      { value: 88, id: genId() },
      { value: 5, id: genId() },
      { value: 63, id: genId() },
    ]);
    setLastOp("");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Array</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Linear structure with O(1) index access, O(n) insert/delete
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-secondary rounded-lg transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["push", "insert", "delete-val", "delete-idx"] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setInputVal(""); setIndexVal(""); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {m === "push" ? "Push" : m === "insert" ? "Insert at Index" : m === "delete-val" ? "Delete by Value" : "Delete at Index"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="number"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (mode.startsWith("delete") ? handleDelete() : handleAdd())}
          placeholder={mode.startsWith("delete-val") ? "Value to delete" : "Value"}
          className="w-36 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {(mode === "insert" || mode === "delete-idx") && (
          <input
            type="number"
            value={indexVal}
            onChange={e => setIndexVal(e.target.value)}
            placeholder="Index"
            className="w-28 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}
        {mode.startsWith("delete") ? (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Trash2 size={15} />
            Delete
          </button>
        ) : (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Add
          </button>
        )}
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

      <div className="overflow-x-auto pb-4">
        <div className="flex items-stretch gap-0 min-w-fit">
          <AnimatePresence mode="popLayout">
            {elements.map((el, idx) => (
              <motion.div
                key={el.id}
                initial={{ opacity: 0, scaleX: 0, width: 0 }}
                animate={{ opacity: 1, scaleX: 1, width: "auto" }}
                exit={{ opacity: 0, scaleX: 0, width: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-col items-center"
              >
                <div className="text-xs text-muted-foreground mb-1 font-mono px-1">{idx}</div>
                <div
                  className={`relative flex items-center justify-center w-14 h-14 border-r border-t border-b ${
                    idx === 0 ? "border-l rounded-l-lg" : ""
                  } ${
                    idx === elements.length - 1 ? "rounded-r-lg" : ""
                  } border-border bg-card text-foreground font-mono font-bold text-base cursor-pointer hover:bg-accent/30 transition-colors group`}
                >
                  <motion.span
                    initial={el.isNew ? { scale: 0, color: "hsl(var(--primary))" } : {}}
                    animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                    transition={{ delay: 0.1, type: "spring" }}
                  >
                    {el.value}
                  </motion.span>
                  <button
                    onClick={() => {
                      setElements(prev => prev.filter((_, i) => i !== idx));
                      setLastOp(`Deleted index ${idx} (value: ${el.value})`);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex z-10"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {elements.length === 0 && (
            <div className="flex items-center justify-center w-full h-14 text-muted-foreground text-sm italic">
              Array is empty — add some elements
            </div>
          )}
        </div>

        {elements.length > 0 && (
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground font-mono">
            <span className="text-primary font-semibold">Length:</span>
            <span>{elements.length}</span>
            <span className="mx-2 text-border">|</span>
            <span className="text-primary font-semibold">Range:</span>
            <span>[{Math.min(...elements.map(e => e.value))}, {Math.max(...elements.map(e => e.value))}]</span>
          </div>
        )}
      </div>
    </div>
  );
}
