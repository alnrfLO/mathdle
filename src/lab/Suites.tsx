import { useState } from "react";
import type { Difficulty } from "../game/types";
import { LabShell, NO_MSG, err, ok, pick, randInt } from "./LabShell";
import { parseNumber, closeEnough, fmt } from "./expr";
import { recordResult } from "./stats";

interface Suite {
  terms: number[];
  next: number;
  nature: string;
  formule: string;
}

function make(level: Difficulty): Suite {
  const gens: (() => Omit<Suite, "terms" | "next"> & { u: (n: number) => number })[] = [];
  const arith = () => {
    const u0 = randInt(-10, 20);
    const r = pick([2, 3, 4, 5, 7, -2, -3, 6, 9]);
    return { u: (n: number) => u0 + n * r, nature: "arithmétique", formule: `uₙ = ${u0} + ${r}n (raison ${r})` };
  };
  const geo = () => {
    const u0 = pick([1, 2, 3, 5]);
    const q = pick([2, 3]);
    return { u: (n: number) => u0 * q ** n, nature: "géométrique", formule: `uₙ = ${u0} × ${q}ⁿ (raison ${q})` };
  };
  const geoNeg = () => {
    const u0 = pick([1, 2, 3]);
    const q = pick([-2, -3]);
    return { u: (n: number) => u0 * q ** n, nature: "géométrique (raison négative)", formule: `uₙ = ${u0} × (${q})ⁿ` };
  };
  const geoFrac = () => {
    const u0 = pick([64, 81, 128, 243]);
    const q = u0 % 3 === 0 ? 1 / 3 : 1 / 2;
    return { u: (n: number) => u0 * q ** n, nature: "géométrique (raison < 1)", formule: `uₙ = ${u0} × (${q === 0.5 ? "1/2" : "1/3"})ⁿ` };
  };
  const squares = () => {
    const k = pick([0, 1, 2]);
    return { u: (n: number) => (n + k) ** 2, nature: "carrés", formule: `uₙ = (n + ${k})²` };
  };
  const fibo = () => {
    const a = randInt(1, 4);
    const b = randInt(a, 6);
    const memo = [a, b];
    for (let i = 2; i < 8; i++) memo.push(memo[i - 1] + memo[i - 2]);
    return { u: (n: number) => memo[n], nature: "type Fibonacci", formule: `uₙ₊₂ = uₙ₊₁ + uₙ (u₀ = ${a}, u₁ = ${b})` };
  };
  const affine = () => {
    const a = pick([2, 3]);
    const b = pick([1, -1, 2, 3]);
    const u0 = randInt(0, 3);
    const memo = [u0];
    for (let i = 1; i < 8; i++) memo.push(a * memo[i - 1] + b);
    return { u: (n: number) => memo[n], nature: "arithmético-géométrique", formule: `uₙ₊₁ = ${a}uₙ ${b >= 0 ? "+" : "−"} ${Math.abs(b)} (u₀ = ${u0})` };
  };
  const triangular = () => ({ u: (n: number) => ((n + 1) * (n + 2)) / 2, nature: "nombres triangulaires", formule: "uₙ = (n+1)(n+2)/2" });
  const cubes = () => ({ u: (n: number) => (n + 1) ** 3, nature: "cubes", formule: "uₙ = (n + 1)³" });
  const mix = () => {
    const k = pick([1, 2, 3]);
    return { u: (n: number) => 2 ** n + k * n, nature: "somme géométrique + arithmétique", formule: `uₙ = 2ⁿ + ${k}n` };
  };
  const poly = () => ({ u: (n: number) => n * n + n + 1, nature: "polynôme du 2nd degré", formule: "uₙ = n² + n + 1" });

  if (level === "facile") gens.push(arith, geo);
  else if (level === "moyen") gens.push(arith, geoNeg, geoFrac, squares);
  else if (level === "difficile") gens.push(fibo, affine, triangular, cubes);
  else gens.push(mix, poly, affine, fibo);

  const g = pick(gens)();
  const terms = [0, 1, 2, 3, 4].map(g.u);
  return { terms, next: g.u(5), nature: g.nature, formule: g.formule };
}

const MAX = 4;

export function Suites({ level }: { level: Difficulty }) {
  const [suite, setSuite] = useState(() => make(level));
  const [lastLevel, setLastLevel] = useState(level);
  const [input, setInput] = useState("");
  const [tries, setTries] = useState<{ v: number; hint: string }[]>([]);
  const [msg, setMsg] = useState(NO_MSG);
  const [done, setDone] = useState(false);

  if (level !== lastLevel) {
    setLastLevel(level);
    setSuite(make(level));
    setTries([]);
    setInput("");
    setMsg(NO_MSG);
    setDone(false);
  }

  const next = () => {
    setSuite(make(level));
    setTries([]);
    setInput("");
    setMsg(NO_MSG);
    setDone(false);
  };

  const check = () => {
    if (done) return;
    const v = parseNumber(input);
    if (v === null) return setMsg(err("Tape un nombre (ex. 48 ou 0,5)"));
    if (closeEnough(v, suite.next, 1e-9)) {
      setMsg(ok(`Bravo, suite ${suite.nature} : ${suite.formule}`));
      setDone(true);
      recordResult("suites", true);
      return;
    }
    const hint = v < suite.next ? "trop petit ↑" : "trop grand ↓";
    const t = [...tries, { v, hint }];
    setTries(t);
    setInput("");
    if (t.length >= MAX) {
      setMsg(err(`Perdu, c'était ${fmt(suite.next, 8)} (${suite.nature} : ${suite.formule})`));
      setDone(true);
      recordResult("suites", false);
    } else setMsg(err(`Raté, ${hint}`));
  };

  const giveUp = () => {
    setMsg(err(`C'était ${fmt(suite.next, 8)} (${suite.nature} : ${suite.formule})`));
    setDone(true);
    recordResult("suites", false);
  };
  const suiteHint = suite.nature === "carrés" ? "Compare chaque terme à un carré parfait (1, 4, 9, 16…)" : `C'est une suite ${suite.nature}`;

  return (
    <LabShell
      hint={suiteHint}
      onGiveUp={giveUp}
      round={suite}
      eyebrow={`SUITES (ESSAI ${Math.min(tries.length + 1, MAX)}/${MAX})`}
      message={msg}
      done={done}
      onSkip={next}
      onCheck={check}
      onNext={next}
    >
      <div className="lab__card">
        <div className="lab__small">Trouve le terme suivant</div>
        <div className="lab__big">
          {suite.terms.map((t) => fmt(t, 8)).join(" ; ")} ; ?
        </div>
        <div className="lab__small">u₀ ; u₁ ; u₂ ; u₃ ; u₄ ; u₅ = ?</div>
      </div>
      <input
        className="lab__input"
        inputMode="decimal"
        placeholder="u₅ = …"
        value={input}
        disabled={done}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        aria-label="Terme suivant"
      />
      {tries.length > 0 && (
        <ul className="lab__history">
          {tries.map((t, i) => (
            <li key={i}>
              <span>{fmt(t.v, 8)}</span>
              <span className="lab__ko">{t.hint}</span>
            </li>
          ))}
        </ul>
      )}
    </LabShell>
  );
}
