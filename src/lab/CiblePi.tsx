import { useState } from "react";
import type { Difficulty } from "../game/types";
import { LabShell, NO_MSG, err, ok, pick, randInt } from "./LabShell";
import { compile, ExprError, closeEnough } from "./expr";
import { recordResult } from "./stats";

// Cible libre avec π : on vise une valeur du type pπ/q et le joueur
// construit une expression qui tombe dessus (comparaison numérique,
// donc 5π/10 et π/2 sont acceptés tous les deux).

interface Target {
  p: number;
  q: number;
  label: string;
  value: number;
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function makeTarget(level: Difficulty): Target {
  const qs = level === "facile" ? [1, 2, 4] : level === "moyen" ? [3, 4, 5, 6] : [5, 6, 8, 10, 12];
  let p = randInt(1, level === "facile" ? 3 : 7);
  let q = pick(qs);
  if (level !== "facile" && Math.random() < 0.3) p = -p;
  const g = gcd(p, q);
  p /= g;
  q /= g;
  const num = p === 1 ? "π" : p === -1 ? "−π" : `${p < 0 ? "−" : ""}${Math.abs(p)}π`;
  const label = q === 1 ? num : `${num}/${q}`;
  return { p, q, label, value: (p * Math.PI) / q };
}

const MIN_OPS: Record<Difficulty, number> = { facile: 1, moyen: 2, difficile: 3, impossible: 4 };
const PAD = ["π", "+", "-", "*", "/", "(", ")", "^", "√("];

export function CiblePi({ level }: { level: Difficulty }) {
  const [target, setTarget] = useState(() => makeTarget(level));
  const [lastLevel, setLastLevel] = useState(level);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState(NO_MSG);
  const [done, setDone] = useState(false);
  const minOps = MIN_OPS[level];

  const next = () => {
    setTarget(makeTarget(level));
    setInput("");
    setMsg(NO_MSG);
    setDone(false);
  };
  if (level !== lastLevel) {
    setLastLevel(level);
    next();
  }

  const check = () => {
    if (done) return;
    try {
      const c = compile(input);
      if (c.usesX) return setMsg(err("Pas de x ici, uniquement des nombres et π"));
      if (!/π|pi/i.test(input)) return setMsg(err("Ton expression doit utiliser π"));
      if (c.ops < minOps) return setMsg(err(`Il faut au moins ${minOps} opération${minOps > 1 ? "s" : ""}`));
      const norm = input.replace(/\s/g, "").replace(/pi/gi, "π").replace(/−/g, "-");
      if (norm === target.label.replace(/−/g, "-")) return setMsg(err("Trop facile : recopier la cible ne compte pas 😄"));
      const v = c.fn(0);
      if (!Number.isFinite(v)) return setMsg(err("Résultat impossible (division par 0 ?)"));
      if (closeEnough(v, target.value, 1e-9)) {
        setMsg(ok(`Exact ! ${input} = ${target.label}`));
        setDone(true);
        recordResult("pi", true);
      } else {
        const diff = v - target.value;
        setMsg(err(`Ça fait ${v.toFixed(4).replace(".", ",")} : ${diff > 0 ? "trop grand" : "trop petit"} (cible ≈ ${target.value.toFixed(4).replace(".", ",")})`));
      }
    } catch (e) {
      setMsg(err(e instanceof ExprError ? `Expression invalide : ${e.message}` : "Expression invalide"));
    }
  };

  return (
    <LabShell eyebrow={`CIBLE π · AU MOINS ${minOps} OPÉRATION${minOps > 1 ? "S" : ""}`} message={msg} done={done} onSkip={next} onCheck={check} onNext={next}>
      <div className="lab__card">
        <div className="lab__small">Construis une expression égale à</div>
        <div className="lab__big">{target.label}</div>
        <div className="lab__small">ex. pour π/2 : 3π/6, π/4 + π/4, (π+π)/4…</div>
      </div>
      <input
        className="lab__input"
        placeholder="ton expression avec π"
        value={input}
        disabled={done}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        aria-label="Expression"
      />
      <div className="lab__pad">
        {PAD.map((k) => (
          <button key={k} type="button" onClick={() => setInput((s) => s + k)}>
            {k}
          </button>
        ))}
        <button type="button" onClick={() => setInput((s) => s.slice(0, -1))}>
          ⌫
        </button>
      </div>
    </LabShell>
  );
}
