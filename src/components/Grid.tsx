import { Cell } from "./Cell";
import type { GridRow } from "../hooks/useMathdle";
import "./Cell.css";
import "./Grid.css";

interface GridProps {
  target: string[];
  rows: GridRow[];
  currentGuess: string[];
  rowIndex: number;
  maxAttempts: number;
  gameOver: boolean;
  isSymbolic: boolean;
  shakeRow: number | null;
  popRow: number | null;
  hints?: number[];
}

export function Grid({
  target,
  rows,
  currentGuess,
  rowIndex,
  maxAttempts,
  gameOver,
  isSymbolic,
  shakeRow,
  popRow,
  hints = [],
}: GridProps) {
  const len = target.length;
  const visibleRows = gameOver ? rowIndex : Math.min(rowIndex + 1, maxAttempts);

  return (
    <div className="grid">
      {Array.from({ length: visibleRows }, (_, r) => {
        const rowData = rows[r];
        const isCurrentRow = r === rowIndex;
        const rowClasses = [
          "grid-row",
          isSymbolic && "grid-row--wrap",
          shakeRow === r && "grid-row--shake",
          popRow === r && "grid-row--pop",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div className={rowClasses} key={r}>
            {Array.from({ length: len }, (_, c) => {
              if (rowData) {
                return (
                  <Cell
                    key={c}
                    value={rowData.guess[c]}
                    state={rowData.result[c]}
                    isToken={isSymbolic}
                  />
                );
              }
              if (isCurrentRow && currentGuess[c] !== undefined) {
                return <Cell key={c} value={currentGuess[c]} state="filled" isToken={isSymbolic} />;
              }
              const hint = isCurrentRow && hints.includes(c) ? target[c] : undefined;
              return <Cell key={c} isToken={isSymbolic} hint={hint} />;
            })}
          </div>
        );
      })}
    </div>
  );
}
