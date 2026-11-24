import type { Subject } from "../game/types";
import "./SubjectMenu.css";

interface SubjectMenuProps {
  onChoose: (subject: Subject) => void;
  onDaily: () => void;
  dailyDone: boolean;
  dayStreak: number;
}

const SUBJECTS: { id: Subject; num: string; title: string; desc: string }[] = [
  { id: "math", num: "1", title: "MATHS", desc: "Équations, cible libre, Impossible" },
  { id: "science", num: "2", title: "SCIENCES", desc: "Conversions, chimie, physique" },
  { id: "prog", num: "3", title: "PROGRAMMATION", desc: "72 exos · JS, Python, Java, C++" },
];

export function SubjectMenu({ onChoose, onDaily, dailyDone, dayStreak }: SubjectMenuProps) {
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

      <button type="button" className="subject-menu__daily" onClick={onDaily}>
        <span className="subject-menu__daily-title">
          {dailyDone ? "Énigme du jour terminée ✓" : "Énigme du jour"}
        </span>
        <span className="subject-menu__daily-desc">
          {dailyDone ? "Reviens demain pour la suivante" : "Maths · la même pour tout le monde"}
          {dayStreak > 0 && ` · série ${dayStreak} j`}
        </span>
      </button>

      <p className="subject-menu__hint">ou choisis une matière</p>
      {SUBJECTS.map((s) => (
        <button key={s.id} type="button" className="subject-menu__item" onClick={() => onChoose(s.id)}>
          <span className="subject-menu__num">{s.num}</span>
          <span className="subject-menu__text">
            <span className="subject-menu__title">{s.title}</span>
            <span className="subject-menu__desc">{s.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
