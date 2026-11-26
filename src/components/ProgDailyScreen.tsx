import { CodeGrid } from "../lab/CodeGrid";
import { solutionCode } from "../lab/codeLayout";
import type { GridRow, MessageState } from "../hooks/useMathdle";
import "./DailyScreen.css";
import { ShareButton, StoredShareButton } from "../lab/StatsModal";


interface ProgDailyScreenProps {
  langLabel: string;
  enonce: string;
  target: string[];
  rows: GridRow[];
  currentGuess: string[];
  rowIndex: number;
  maxAttempts: number;
  gameOver: boolean;
  won: boolean;
  message: MessageState;
  alreadyPlayedToday: boolean;
  dayStreak: number;
  lastWon: boolean;
}

export function ProgDailyScreen({
  langLabel,
  enonce,
  target,
  rows,
  currentGuess,
  rowIndex,
  maxAttempts,
  gameOver,
  won,
  message,
  alreadyPlayedToday,
  dayStreak,
  lastWon,
}: ProgDailyScreenProps) {
  if (alreadyPlayedToday && !gameOver) {
    return (
      <div className="daily">
        <p className="daily__eyebrow">ÉNIGME DU JOUR EN {langLabel.toUpperCase()}</p>
        <p className={"daily__result" + (lastWon ? " daily__result--won" : "")}>
          {lastWon ? "Déjà réussie aujourd'hui" : "Déjà tentée aujourd'hui, perdu"}
        </p>
        <p className="daily__streak">Série : {dayStreak} jour{dayStreak > 1 ? "s" : ""}</p>
        <StoredShareButton title={`Code ${langLabel}`} />
        <p className="daily__comeback">Prochaine énigme demain</p>
      </div>
    );
  }

  return (
    <div className="daily">
      <p className="daily__eyebrow">ÉNIGME DU JOUR EN {langLabel.toUpperCase()}</p>
      <p className="chem__hint">{enonce}</p>
      <div className={"message" + (message.variant ? ` message--${message.variant}` : "")}>
        {message.text}
      </div>
      <CodeGrid
        target={target}
        rows={rows}
        currentGuess={currentGuess}
        rowIndex={rowIndex}
        maxAttempts={maxAttempts}
        gameOver={gameOver}
        lang={langLabel.toLowerCase()}
      />
      {gameOver && (
        <p className={"daily__result" + (won ? " daily__result--won" : "")}>
          {won ? "Trouvé. Prochaine énigme demain" : "Perdu, voici la solution"}
        </p>
      )}
      {gameOver && !won && <pre className="solution-code">{solutionCode(target, langLabel.toLowerCase())}</pre>}
      {gameOver && <ShareButton title={`Code ${langLabel}`} won={won} rows={rows} max={maxAttempts} />}
    </div>
  );
}
