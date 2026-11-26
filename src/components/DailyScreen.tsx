import { Grid } from "./Grid";
import type { GridRow, MessageState } from "../hooks/useMathdle";
import "./DailyScreen.css";

const PERDU_SEP = "";
import { ShareButton, StoredShareButton } from "../lab/StatsModal";

interface MathDailyScreenProps {
  kind: "math";
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

export function DailyScreen(props: MathDailyScreenProps) {
  const { target, rows, currentGuess, rowIndex, maxAttempts, gameOver, won, message, alreadyPlayedToday, dayStreak, lastWon } = props;

  if (alreadyPlayedToday && !gameOver) {
    return (
      <div className="daily">
        <p className="daily__eyebrow">ÉNIGME DU JOUR</p>
        <p className={"daily__result" + (lastWon ? " daily__result--won" : "")}>
          {lastWon ? "Déjà réussie aujourd'hui ✓" : "Déjà tentée aujourd'hui, perdu"}
        </p>
        <p className="daily__streak">Série : {dayStreak} jour{dayStreak > 1 ? "s" : ""}</p>
        <StoredShareButton title="Maths" />
        <p className="daily__comeback">Prochaine énigme demain</p>
      </div>
    );
  }

  return (
    <div className="daily">
      <p className="daily__eyebrow">ÉNIGME DU JOUR · SÉRIE {dayStreak} J</p>
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
        isSymbolic={false}
        shakeRow={null}
        popRow={null}
      />
      {gameOver && (
        <p className={"daily__result" + (won ? " daily__result--won" : "")}>
          {won ? "Trouvé. Prochaine énigme demain" : `Perdu, c'était ${target.join(PERDU_SEP)}`}
        </p>
      )}
      {gameOver && <ShareButton title="Maths" won={won} rows={rows} max={maxAttempts} />}
    </div>
  );
}
