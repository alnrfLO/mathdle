import { Grid } from "./Grid";
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
  // gameOver : la partie vient de finir, on garde la grille et le bouton partager
  if (alreadyPlayedToday && !gameOver) {
    return (
      <div className="daily">
        <p className="daily__eyebrow">ÉNIGME DU JOUR · {langLabel.toUpperCase()}</p>
        <p className={"daily__result" + (lastWon ? " daily__result--won" : "")}>
          {lastWon ? "Déjà réussie aujourd'hui ✓" : "Déjà tentée aujourd'hui — perdu"}
        </p>
        <p className="daily__streak">Série de jours : {dayStreak} 🔥</p>
        <StoredShareButton title={`Code ${langLabel}`} />
        <p className="daily__comeback">Reviens demain pour la prochaine !</p>
      </div>
    );
  }

  return (
    <div className="daily">
      <p className="daily__eyebrow">ÉNIGME DU JOUR · {langLabel.toUpperCase()} · SÉRIE {dayStreak} 🔥</p>
      <p className="chem__hint">{enonce}</p>
      <div className={"message" + (message.variant ? ` message--${message.variant}` : "")}>
        {message.text}
      </div>
      <Grid
        target={target}
        rows={rows}
        currentGuess={currentGuess}
        rowIndex={rowIndex}
        maxAttempts={maxAttempts}
        gameOver={gameOver}
        isSymbolic
        shakeRow={null}
        popRow={null}
      />
      {gameOver && (
        <p className={"daily__result" + (won ? " daily__result--won" : "")}>
          {won ? "Trouvé ! Reviens demain 🔥" : "Perdu — reviens demain pour la suivante"}
        </p>
      )}
      {gameOver && <ShareButton title={`Code ${langLabel}`} won={won} rows={rows} max={maxAttempts} />}
    </div>
  );
}
