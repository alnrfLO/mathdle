import "./HelpBar.css";

interface HelpBarProps {
  hints: number[];
  canHint: boolean;
  onHint: () => void;
  onSolution: () => void;
}

export function HelpBar({ hints, canHint, onHint, onSolution }: HelpBarProps) {
  return (
    <div className="helpbar">
      <div className="helpbar__actions">
        <button type="button" className="helpbar__btn" onClick={onHint} disabled={!canHint}>
          Indice
        </button>
        <button type="button" className="helpbar__btn helpbar__btn--ghost" onClick={onSolution}>
          Voir la solution
        </button>
      </div>
      {hints.length > 0 && (
        <p className="helpbar__note">
          {hints.length} indice{hints.length > 1 ? "s" : ""} en pointillés dans ta ligne
        </p>
      )}
    </div>
  );
}
