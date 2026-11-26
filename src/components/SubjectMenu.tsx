import type { Subject } from "../game/types";
import "./SubjectMenu.css";

interface SubjectMenuProps {
  onChoose: (subject: Subject) => void;
  onDaily: () => void;
  onStats: () => void;
  dailyDone: boolean;
  dayStreak: number;
}

const DOORS: { id: Subject; icon: string; title: string; desc: string }[] = [
  { id: "math", icon: "∑", title: "MATHS", desc: "Équations, cible π, suites, courbes" },
  { id: "science", icon: "⚗", title: "SCIENCES", desc: "Chimie et physique" },
  { id: "prog", icon: "</>", title: "PROGRAMMATION", desc: "Console Python / JS, extraits à trous" },
];

export function SubjectMenu({ onChoose, onDaily, onStats, dailyDone, dayStreak }: SubjectMenuProps) {
  return (
    <div className="subject-menu">
      <div className="subject-menu__hero">
        <img className="subject-menu__logo" src="/favicon.svg" alt="" width={56} height={56} />
        <div>
          <h1 className="subject-menu__name">MATHDLE</h1>
          <p className="subject-menu__tagline">Devine l'équation.</p>
        </div>
      </div>

      <div className="subject-menu__legend" aria-label="Code couleur">
        <span><i className="dot dot--correct" />bonne place</span>
        <span><i className="dot dot--present" />mal placé</span>
        <span><i className="dot dot--absent" />absent</span>
      </div>

      <div className="doors">
        {DOORS.map((d) => (
          <button key={d.id} type="button" className="door" onClick={() => onChoose(d.id)}>
            <span className="door__icon">{d.icon}</span>
            <span className="door__title">{d.title}</span>
            <span className="door__desc">{d.desc}</span>
          </button>
        ))}
        <button type="button" className="door door--daily" onClick={onDaily}>
          <span className="door__icon">★</span>
          <span className="door__title">ÉNIGME DU JOUR</span>
          <span className="door__desc">
            {dailyDone ? "Maths faite ✓ · " : ""}maths, sciences, code{dayStreak > 0 ? ` · série ${dayStreak} j` : ""}
          </span>
        </button>
      </div>

      <button type="button" className="subject-menu__stats" onClick={onStats}>
        📊 Mes statistiques
      </button>
    </div>
  );
}
