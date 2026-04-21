import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RotateCcw, Search } from "lucide-react";

interface HashEntry { key: string; value: string; id: string; }
interface Bucket { index: number; entries: HashEntry[]; }

const TABLE_SIZE = 8;
let entryId = 0;
const makeId = () => `he-${++entryId}`;

function hashFn(key: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % size;
  return hash;
}

const INITIAL_ENTRIES: Array<{ key: string; value: string }> = [
  { key: "name", value: "Alice" },
  { key: "age", value: "30" },
  { key: "city", value: "NYC" },
  { key: "lang", value: "Rust" },
  { key: "job", value: "Engineer" },
];

function buildTable(entries: Array<{ key: string; value: string }>): Bucket[] {
  const buckets: Bucket[] = Array.from({ length: TABLE_SIZE }, (_, i) => ({ index: i, entries: [] }));
  for (const { key, value } of entries) {
    const idx = hashFn(key, TABLE_SIZE);
    buckets[idx].entries.push({ key, value, id: makeId() });
  }
  return buckets;
}

export default function HashMapVisualizer() {
  const [buckets, setBuckets] = useState<Bucket[]>(buildTable(INITIAL_ENTRIES));
  const [keyInput, setKeyInput] = useState("");
  const [valInput, setValInput] = useState("");
  const [mode, setMode] = useState<"put" | "get" | "delete">("put");
  const [lastOp, setLastOp] = useState("");
  const [highlightBucket, setHighlightBucket] = useState<number | null>(null);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  const highlight = (idx: number, key: string | null = null, ms = 1500) => {
    setHighlightBucket(idx);
    setHighlightKey(key);
    setTimeout(() => { setHighlightBucket(null); setHighlightKey(null); }, ms);
  };

  const put = () => {
    const key = keyInput.trim();
    const val = valInput.trim();
    if (!key || !val) return;
    const idx = hashFn(key, TABLE_SIZE);
    setBuckets(prev => {
      const next = prev.map(b => ({ ...b, entries: [...b.entries] }));
      const bucket = next[idx];
      const existing = bucket.entries.findIndex(e => e.key === key);
      if (existing >= 0) {
        bucket.entries[existing] = { ...bucket.entries[existing], value: val };
        setLastOp(`put("${key}", "${val}"): O(1) avg — updated at bucket ${idx}`);
      } else {
        bucket.entries.push({ key, value: val, id: makeId() });
        setLastOp(`put("${key}", "${val}"): O(1) avg — inserted at bucket ${idx}${bucket.entries.length > 1 ? ` (collision! chain length: ${bucket.entries.length})` : ""}`);
      }
      return next;
    });
    highlight(idx, key);
    setKeyInput(""); setValInput("");
  };

  const get = () => {
    const key = keyInput.trim();
    if (!key) return;
    const idx = hashFn(key, TABLE_SIZE);
    const entry = buckets[idx].entries.find(e => e.key === key);
    if (entry) {
      setLastOp(`get("${key}") → "${entry.value}": O(1) avg — found at bucket ${idx}`);
      highlight(idx, key);
    } else {
      setLastOp(`get("${key}") → undefined: key not found (bucket ${idx} checked)`);
      highlight(idx);
    }
  };

  const del = () => {
    const key = keyInput.trim();
    if (!key) return;
    const idx = hashFn(key, TABLE_SIZE);
    const found = buckets[idx].entries.find(e => e.key === key);
    if (!found) { setLastOp(`delete("${key}"): key not found`); return; }
    setBuckets(prev => prev.map((b, i) => i === idx ? { ...b, entries: b.entries.filter(e => e.key !== key) } : b));
    setLastOp(`delete("${key}"): O(1) avg — removed from bucket ${idx}`);
    highlight(idx);
    setKeyInput("");
  };

  const reset = () => {
    setBuckets(buildTable(INITIAL_ENTRIES));
    setLastOp("");
    setHighlightBucket(null);
    setHighlightKey(null);
  };

  const totalEntries = buckets.reduce((s, b) => s + b.entries.length, 0);
  const loadFactor = (totalEntries / TABLE_SIZE).toFixed(2);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Hash Map</h2>
          <p className="text-sm text-muted-foreground mt-0.5">O(1) avg put/get/delete. Chaining for collision resolution. Table size: {TABLE_SIZE}</p>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-secondary rounded-lg transition-colors">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["put", "get", "delete"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            mode === m
              ? m === "delete" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}>
            {m === "put" ? "put(key, val)" : m === "get" ? "get(key)" : "delete(key)"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input type="text" value={keyInput} onChange={e => setKeyInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (mode === "put" ? put() : mode === "get" ? get() : del())} placeholder="Key (string)" className="w-36 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        {mode === "put" && (
          <input type="text" value={valInput} onChange={e => setValInput(e.target.value)} onKeyDown={e => e.key === "Enter" && put()} placeholder="Value (string)" className="w-36 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        )}
        <button
          onClick={mode === "put" ? put : mode === "get" ? get : del}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity ${
            mode === "delete" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {mode === "put" ? <><Plus size={15} /> Put</> : mode === "get" ? <><Search size={15} /> Get</> : <><Trash2 size={15} /> Delete</>}
        </button>
      </div>

      {lastOp && (
        <motion.div key={lastOp} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-2.5 bg-accent/40 border border-accent-border rounded-lg text-sm text-accent-foreground font-mono">
          {lastOp}
        </motion.div>
      )}

      <div className="grid gap-1.5">
        {buckets.map((bucket) => {
          const isHighlighted = highlightBucket === bucket.index;
          return (
            <motion.div
              key={bucket.index}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 border transition-all ${
                isHighlighted ? "border-primary/50 bg-primary/10" : "border-border bg-card/40"
              }`}
              animate={isHighlighted ? { scale: 1.01 } : { scale: 1 }}
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-secondary font-mono text-xs font-bold text-muted-foreground flex-shrink-0">
                [{bucket.index}]
              </div>
              <div className="w-px h-8 bg-border flex-shrink-0" />
              <div className="flex items-center gap-2 flex-wrap min-h-8">
                <AnimatePresence mode="popLayout">
                  {bucket.entries.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-mono ${
                        highlightKey === entry.key
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border bg-secondary text-foreground"
                      }`}
                    >
                      <span className="font-semibold">{entry.key}</span>
                      <span className="text-muted-foreground">:</span>
                      <span className="text-accent-foreground">{entry.value}</span>
                      {i < bucket.entries.length - 1 && (
                        <span className="text-muted-foreground ml-1">→</span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {bucket.entries.length === 0 && (
                  <span className="text-xs text-muted-foreground/40 font-mono italic">empty</span>
                )}
                {bucket.entries.length > 1 && (
                  <span className="text-xs text-destructive/70 font-mono">⚠ collision</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground font-mono">
        <span><span className="text-primary font-semibold">Entries:</span> {totalEntries}</span>
        <span><span className="text-primary font-semibold">Buckets:</span> {TABLE_SIZE}</span>
        <span><span className={`font-semibold ${parseFloat(loadFactor) > 0.75 ? "text-destructive" : "text-primary"}`}>Load Factor:</span> {loadFactor}</span>
        <span className="text-muted-foreground/60">hash(key) = sum(charCodes × 31^i) mod {TABLE_SIZE}</span>
      </div>
    </div>
  );
}
