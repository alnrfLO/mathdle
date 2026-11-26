import type { GridRow } from "../hooks/useMathdle";
import type { CellState } from "../game/types";
import "./Keyboard.css";

interface KeyboardProps {
  opKeys: string[];
  extraKeys?: string[];
  onKey: (ch: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitLabel: string;
  rows?: GridRow[];
}

const RANK: Record<CellState, number> = { empty: 0, absent: 1, present: 2, correct: 3 };

export function keyStates(rows: GridRow[] = []): Map<string, CellState> {
  const out = new Map<string, CellState>();
  for (const row of rows) {
    row.guess.forEach((tok, i) => {
      const st = row.result[i];
      const prev = out.get(tok);
      if (!prev || RANK[st] > RANK[prev]) out.set(tok, st);
    });
  }
  return out;
}

const DIGITS_ROW_1 = ["1", "2", "3", "4", "5"];
const DIGITS_ROW_2 = ["6", "7", "8", "9", "0"];

export function Keyboard({
  opKeys,
  extraKeys,
  onKey,
  onBackspace,
  onSubmit,
  submitLabel,
  rows,
}: KeyboardProps) {
  const states = keyStates(rows);
  const cls = (k: string, base: string) => {
    const st = states.get(k);
    return base + (st && st !== "empty" ? ` key--${st}` : "");
  };
  return (
    <div className="keyboard">
      <div className="kb-row">
        {DIGITS_ROW_1.map((k) => (
          <button key={k} type="button" className={cls(k, "key")} data-state={states.get(k)} onClick={() => onKey(k)}>
            {k}
          </button>
        ))}
      </div>
      <div className="kb-row">
        {DIGITS_ROW_2.map((k) => (
          <button key={k} type="button" className={cls(k, "key")} data-state={states.get(k)} onClick={() => onKey(k)}>
            {k}
          </button>
        ))}
      </div>
      <div className="kb-row">
        {opKeys.map((k) => (
          <button key={k} type="button" className={cls(k, "key key--op")} data-state={states.get(k)} onClick={() => onKey(k)}>
            {k}
          </button>
        ))}
      </div>
      {extraKeys && extraKeys.length > 0 && (
        <div className="kb-row">
          {extraKeys.map((k) => (
            <button key={k} type="button" className={cls(k, "key key--symbol" + (k.length > 7 ? " key--long" : ""))} data-state={states.get(k)} onClick={() => onKey(k)}>
              {k}
            </button>
          ))}
        </div>
      )}
      <div className="kb-row">
        <button type="button" className="key key--wide" onClick={onBackspace}>
          Effacer
        </button>
        <button type="button" className="key key--wide key--enter" onClick={onSubmit}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
