import type { ReactNode } from "react";
import { CodeGrid } from "../lab/CodeGrid";
import { solutionCode } from "../lab/codeLayout";
import type { GridRow, MessageState } from "../hooks/useMathdle";
import "./PhysicsScreen.css";

interface ProgScreenProps {
  lang: string;
  titre: string;
  enonce: string;
  target: string[];
  rows: GridRow[];
  currentGuess: string[];
  rowIndex: number;
  maxAttempts: number;
  gameOver: boolean;
  won: boolean;
  message: MessageState;
  onSkip: () => void;
  onSubmit: () => void;
  help?: ReactNode;
  hints?: number[];
}

export function ProgScreen({
  lang,
  titre,
  enonce,
  target,
  rows,
  currentGuess,
  rowIndex,
  maxAttempts,
  gameOver,
  won,
  message,
  onSkip,
  onSubmit,
  help,
  hints,
}: ProgScreenProps) {
  return (
    <div className="physics">
      <p className="chem__eyebrow">{titre.toUpperCase()}</p>

      <p className="chem__hint">{enonce}</p>

      <div
        className={"message" + (message.variant ? ` message--${message.variant}` : "")}
      >
        {message.text}
      </div>

      <CodeGrid
        target={target}
        rows={rows}
        currentGuess={currentGuess}
        rowIndex={rowIndex}
        maxAttempts={maxAttempts}
        gameOver={gameOver}
        hints={hints}
        lang={lang}
      />

      {!gameOver && help}

      {gameOver && (
        <div className="physics__reveal">
          <p className={won ? "physics__reveal-text physics__reveal-text--won" : "physics__reveal-text"}>
            {won ? "Trouvé" : "Perdu, voici la solution"}
          </p>
          {!won && <pre className="solution-code">{solutionCode(target, lang)}</pre>}
          <button type="button" className="science-btn science-btn--primary" onClick={onSkip}>
            Nouvel exercice
          </button>
        </div>
      )}

      {!gameOver && (
        <div className="science__actions">
          <button type="button" className="science-btn" onClick={onSkip}>
            Passer
          </button>
          <button type="button" className="science-btn science-btn--primary" onClick={onSubmit}>
            Valider
          </button>
        </div>
      )}
    </div>
  );
}
