import { useMemo } from "react";
import type { GridRow } from "../hooks/useMathdle";
import { layoutCode } from "./codeLayout";
import "./codegrid.css";

export function CodeGrid({
  target,
  rows,
  currentGuess,
  rowIndex,
  maxAttempts,
  gameOver,
  lang,
  hints = [],
}: {
  target: string[];
  rows: GridRow[];
  currentGuess: string[];
  rowIndex: number;
  maxAttempts: number;
  gameOver: boolean;
  lang: string;
  hints?: number[];
}) {
  const lines = useMemo(() => layoutCode(target, lang), [target, lang]);
  const visible = gameOver ? rowIndex : Math.min(rowIndex + 1, maxAttempts);

  return (
    <div className="codegrid">
      {Array.from({ length: visible }, (_, r) => {
        const row = rows[r];
        const active = !row && r === rowIndex;
        const cursor = active ? currentGuess.length : -1;
        return (
          <div key={r} className={"codegrid__try" + (active ? " codegrid__try--active" : " codegrid__try--done")}>
            <span className="codegrid__num">{r + 1}</span>
            <div className="codegrid__code">
              {lines.map((l, li) => (
                <div key={li} className="codegrid__line" style={{ paddingLeft: `${l.indent * 1.4}em` }}>
                  {l.idx.map((i, k) => {
                    const value = row ? row.guess[i] : currentGuess[i];
                    const hinted = active && value === undefined && hints.includes(i);
                    const state = row ? row.result[i] : value !== undefined ? "filled" : hinted ? "hint" : "empty";
                    const tight = k > 0 && /^\d$/.test(target[i]) && /^\d$/.test(target[l.idx[k - 1]]);
                    return (
                      <span
                        key={i}
                        className={`ctok ctok--${state}` + (i === cursor ? " ctok--cursor" : "") + (tight ? " ctok--tight" : "")}
                      >
                        {value ?? (hinted ? target[i] : " ")}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
