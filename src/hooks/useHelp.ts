import { useCallback, useState } from "react";
import type { GridRow } from "./useMathdle";

export function useHelp(target: string[], rows: GridRow[]) {
  const [hints, setHints] = useState<number[]>([]);
  const [forTarget, setForTarget] = useState(target);

  if (forTarget !== target) {
    setForTarget(target);
    setHints([]);
  }

  const found = new Set<number>();
  for (const row of rows) row.result.forEach((st, i) => st === "correct" && found.add(i));

  const candidates = target.map((_, i) => i).filter((i) => !found.has(i) && !hints.includes(i));
  const canHint = candidates.length > 1;

  const reveal = useCallback(() => {
    if (!canHint) return;
    const pos = candidates[Math.floor(Math.random() * candidates.length)];
    setHints((h) => [...h, pos].sort((a, b) => a - b));
  }, [canHint, candidates]);

  return { hints, reveal, canHint };
}
