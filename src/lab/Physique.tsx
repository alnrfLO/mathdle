import { useState } from "react";
import type { Difficulty } from "../game/types";
import { LabShell, NO_MSG, err, ok, pick, randInt } from "./LabShell";
import { parseNumber, fmt } from "./expr";
import { recordResult } from "./stats";

const relOk = (v: number, target: number, tol = 0.02) => Math.abs(v - target) <= tol * Math.abs(target) + 1e-12;

interface UnitQ {
  q: string;
  answer: string;
  accept: string[];
}

const UNITS: Record<Difficulty, UnitQ[]> = {
  facile: [
    { q: "Une force", answer: "N (newton)", accept: ["n", "newton", "kg.m/s2", "kgm/s2", "kg·m·s-2"] },
    { q: "Une énergie", answer: "J (joule)", accept: ["j", "joule"] },
    { q: "Une puissance", answer: "W (watt)", accept: ["w", "watt"] },
    { q: "Une tension électrique", answer: "V (volt)", accept: ["v", "volt"] },
    { q: "Une intensité électrique", answer: "A (ampère)", accept: ["a", "ampere", "ampère"] },
    { q: "Une résistance électrique", answer: "Ω (ohm)", accept: ["ω", "ohm", "ohms"] },
    { q: "Une fréquence", answer: "Hz (hertz)", accept: ["hz", "hertz", "s-1", "1/s"] },
    { q: "Une pression", answer: "Pa (pascal)", accept: ["pa", "pascal", "n/m2", "n.m-2"] },
  ],
  moyen: [
    { q: "Une vitesse", answer: "m/s", accept: ["m/s", "m.s-1", "m·s-1", "ms-1"] },
    { q: "Une accélération", answer: "m/s²", accept: ["m/s2", "m/s²", "m.s-2", "m·s-2", "ms-2"] },
    { q: "Une masse volumique", answer: "kg/m³", accept: ["kg/m3", "kg/m³", "kg.m-3", "kg·m-3", "g/l", "g/cm3"] },
    { q: "Une concentration molaire", answer: "mol/L", accept: ["mol/l", "mol.l-1", "mol·l-1", "m"] },
    { q: "Une concentration massique", answer: "g/L", accept: ["g/l", "g.l-1", "g·l-1"] },
    { q: "Une masse molaire", answer: "g/mol", accept: ["g/mol", "g.mol-1", "g·mol-1"] },
    { q: "Une charge électrique", answer: "C (coulomb)", accept: ["c", "coulomb", "a.s", "as"] },
    { q: "Une quantité de matière", answer: "mol", accept: ["mol", "mole"] },
  ],
  difficile: [
    { q: "Le produit U × I", answer: "W (watt)", accept: ["w", "watt", "v.a", "va"] },
    { q: "Le produit P × t", answer: "J (joule)", accept: ["j", "joule", "w.s", "ws"] },
    { q: "Le rapport U / I", answer: "Ω (ohm)", accept: ["ω", "ohm"] },
    { q: "Une quantité de mouvement p = m·v", answer: "kg·m/s", accept: ["kg.m/s", "kgm/s", "kg·m/s", "kg.m.s-1", "n.s", "ns"] },
    { q: "Le rapport F / S", answer: "Pa (pascal)", accept: ["pa", "pascal", "n/m2", "n/m²"] },
    { q: "Une capacité électrique", answer: "F (farad)", accept: ["f", "farad"] },
    { q: "Le produit m × g × h", answer: "J (joule)", accept: ["j", "joule", "n.m", "nm"] },
  ],
  impossible: [
    { q: "Le joule en unités de base SI", answer: "kg·m²/s²", accept: ["kg.m2/s2", "kg.m²/s²", "kgm2/s2", "kg·m²·s-2", "kg.m2.s-2", "kgm2s-2"] },
    { q: "Le watt en unités de base SI", answer: "kg·m²/s³", accept: ["kg.m2/s3", "kg.m²/s³", "kgm2/s3", "kg.m2.s-3", "kgm2s-3"] },
    { q: "Le volt en unités de base SI", answer: "kg·m²/(A·s³)", accept: ["kg.m2/(a.s3)", "kg.m2.a-1.s-3", "kgm2a-1s-3", "kg.m2.s-3.a-1", "kgm2s-3a-1"] },
    { q: "Le pascal en unités de base SI", answer: "kg/(m·s²)", accept: ["kg/(m.s2)", "kg.m-1.s-2", "kgm-1s-2"] },
    { q: "La constante G (F = G·m·m'/d²)", answer: "N·m²/kg²", accept: ["n.m2/kg2", "n.m2.kg-2", "nm2kg-2", "m3/(kg.s2)", "m3.kg-1.s-2", "m3kg-1s-2"] },
  ],
};

const normUnit = (s: string) =>
  s.toLowerCase().replace(/\s+/g, "").replace(/[·×*]/g, ".").replace(/²/g, "2").replace(/³/g, "3").replace(/⁻¹/g, "-1").replace(/⁻²/g, "-2").replace(/ohms?$/, "ohm");

export function Unites({ level }: { level: Difficulty }) {
  const [q, setQ] = useState(() => pick(UNITS[level]));
  const [lastLevel, setLastLevel] = useState(level);
  const [input, setInput] = useState("");
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState(NO_MSG);
  const [done, setDone] = useState(false);

  const next = () => {
    setQ(pick(UNITS[level]));
    setInput("");
    setTries(0);
    setMsg(NO_MSG);
    setDone(false);
  };
  if (level !== lastLevel) {
    setLastLevel(level);
    next();
  }

  const check = () => {
    if (done || !input.trim()) return;
    const n = normUnit(input);
    const t = tries + 1;
    setTries(t);
    if (q.accept.map(normUnit).includes(n)) {
      setMsg(ok(`Oui : ${q.answer}`));
      setDone(true);
      recordResult("unites", true);
    } else if (t >= 3) {
      setMsg(err(`Perdu, c'était ${q.answer}`));
      setDone(true);
      recordResult("unites", false);
    } else setMsg(err(`Non (essai ${t}/3)`));
  };

  return (
    <LabShell eyebrow="TROUVER L'UNITÉ (3 ESSAIS)" message={msg} done={done} onSkip={next} onCheck={check} onNext={next}>
      <div className="lab__card">
        <div className="lab__small">Dans quelle unité SI s'exprime…</div>
        <div className="lab__big">{q.q}</div>
        <div className="lab__small">ex. N, m/s², kg·m/s, mol/L</div>
      </div>
      <input
        className="lab__input"
        placeholder="unité"
        value={input}
        disabled={done}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        aria-label="Unité"
        autoCapitalize="none"
      />
      <div className="lab__pad">
        {["²", "³", "/", "·", "Ω", "⁻¹"].map((k) => (
          <button key={k} type="button" onClick={() => setInput((s) => s + k)}>
            {k}
          </button>
        ))}
      </div>
    </LabShell>
  );
}

interface AN {
  text: string;
  value: number;
  unit: string;
  units: string[];
  hint: string;
}

function makeAN(level: Difficulty): AN {
  const gens: (() => AN)[] = [
    () => {
      const d = randInt(2, 30) * 10;
      const t = randInt(2, 10);
      return { text: `Une voiture parcourt ${d} km en ${t} h. Quelle est sa vitesse moyenne ?`, value: d / t, unit: "km/h", units: ["km/h", "m/s"], hint: "v = d / t" };
    },
    () => {
      const m = randInt(2, 80);
      return { text: `Quel est le poids d'un objet de ${m} kg ? (g = 9,8 N/kg)`, value: m * 9.8, unit: "N", units: ["N", "kg", "J"], hint: "P = m × g" };
    },
    () => {
      const R = pick([10, 22, 47, 100, 220]);
      const I = pick([0.1, 0.2, 0.5, 1, 2]);
      return { text: `Une résistance de ${R} Ω est traversée par ${fmt(I)} A. Quelle est la tension à ses bornes ?`, value: R * I, unit: "V", units: ["V", "A", "W", "Ω"], hint: "U = R × I" };
    },
    () => {
      const P = pick([60, 100, 1000, 2000]);
      const t = pick([2, 3, 5, 10]);
      return { text: `Un appareil de ${P} W fonctionne ${t} min. Quelle énergie consomme-t-il en joules ?`, value: P * t * 60, unit: "J", units: ["J", "W", "kWh"], hint: "E = P × t (t en secondes)" };
    },
  ];
  if (level !== "facile")
    gens.push(
      () => {
        const m = randInt(2, 20) / 10;
        const v = pick([2, 4, 5, 10, 20]);
        return { text: `Un objet de ${fmt(m)} kg roule à ${v} m/s. Quelle est son énergie cinétique ?`, value: 0.5 * m * v * v, unit: "J", units: ["J", "N", "W"], hint: "Ec = ½ m v²" };
      },
      () => {
        const n = pick([0.1, 0.2, 0.5, 2]);
        const V = pick([0.5, 0.25, 0.1, 2]);
        return { text: `On dissout ${fmt(n)} mol de soluté dans ${fmt(V)} L. Quelle est la concentration molaire ?`, value: n / V, unit: "mol/L", units: ["mol/L", "g/L", "mol"], hint: "C = n / V" };
      },
      () => {
        const m = randInt(5, 30) * 10;
        const h = randInt(2, 20);
        return { text: `Quelle est l'énergie potentielle de pesanteur d'une masse de ${m} g placée à ${h} m ? (g = 9,8 N/kg)`, value: (m / 1000) * 9.8 * h, unit: "J", units: ["J", "N", "W"], hint: "Epp = m g h (m en kg)" };
      },
    );
  if (level === "difficile" || level === "impossible")
    gens.push(
      () => {
        const f = pick([440, 500, 1000, 2000]);
        return { text: `Quelle est la longueur d'onde d'un son de ${f} Hz dans l'air ? (v = 340 m/s)`, value: 340 / f, unit: "m", units: ["m", "Hz", "s"], hint: "λ = v / f" };
      },
      () => {
        const q = pick([1, 2, 5]);
        const d = pick([0.1, 0.2, 0.5]);
        return {
          text: `Deux charges de ${q} µC sont distantes de ${fmt(d)} m. Quelle est la force électrique ? (k = 9×10⁹)`,
          value: (9e9 * (q * 1e-6) ** 2) / (d * d),
          unit: "N",
          units: ["N", "C", "J"],
          hint: "F = k q² / d²",
        };
      },
      () => {
        const m = randInt(2, 10);
        const c = 4180;
        const dT = randInt(10, 60);
        return { text: `Quelle énergie faut-il pour chauffer ${m} kg d'eau de ${dT} °C ? (c = 4180 J/kg/°C)`, value: m * c * dT, unit: "J", units: ["J", "W", "°C"], hint: "Q = m c ΔT" };
      },
    );
  return pick(gens)();
}

export function Applications({ level }: { level: Difficulty }) {
  const [p, setP] = useState(() => makeAN(level));
  const [lastLevel, setLastLevel] = useState(level);
  const [input, setInput] = useState("");
  const [unit, setUnit] = useState("");
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState(NO_MSG);
  const [done, setDone] = useState(false);
  const unitChoices = Array.from(new Set(p.units));

  const next = () => {
    setP(makeAN(level));
    setInput("");
    setUnit("");
    setTries(0);
    setMsg(NO_MSG);
    setDone(false);
  };
  if (level !== lastLevel) {
    setLastLevel(level);
    next();
  }

  const check = () => {
    if (done) return;
    const v = parseNumber(input);
    if (v === null) return setMsg(err("Tape un nombre (ex. 12,5 ou 1,5×10^3)"));
    if (!unit) return setMsg(err("Choisis l'unité"));
    const t = tries + 1;
    setTries(t);
    let target = p.value;
    if (p.unit === "km/h" && unit === "m/s") target = p.value / 3.6;
    const unitOk = unit === p.unit || (p.unit === "km/h" && unit === "m/s");
    if (unitOk && relOk(v, target)) {
      setMsg(ok(`Exact : ${fmt(target, 4)} ${unit} (${p.hint})`));
      setDone(true);
      recordResult("an", true);
    } else if (t >= 3) {
      setMsg(err(`Perdu : ${fmt(p.value, 4)} ${p.unit} (${p.hint})`));
      setDone(true);
      recordResult("an", false);
    } else setMsg(err(!unitOk ? `Mauvaise unité (essai ${t}/3)` : `Valeur fausse, ${v < target ? "trop petite" : "trop grande"} (essai ${t}/3)`));
  };

  return (
    <LabShell eyebrow="APPLICATION NUMÉRIQUE, VALEUR ET UNITÉ" message={msg} done={done} onSkip={next} onCheck={check} onNext={next}>
      <div className="lab__card">
        <div style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{p.text}</div>
        <div className="lab__small" style={{ marginTop: 6 }}>Précision acceptée : 2 %</div>
      </div>
      <div className="lab__row">
        <input
          className="lab__input"
          inputMode="decimal"
          placeholder="valeur"
          value={input}
          disabled={done}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          aria-label="Valeur"
        />
        <select className="lab__select" value={unit} disabled={done} onChange={(e) => setUnit(e.target.value)} aria-label="Unité">
          <option value="">unité</option>
          {unitChoices.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </LabShell>
  );
}

interface Chain {
  from: string;
  to: string;
  value: number;
  answer: number;
  steps: string;
}

function makeChain(level: Difficulty): Chain {
  const gens: (() => Chain)[] = [
    () => {
      const v = pick([36, 72, 90, 108, 54, 18, 130]);
      return { from: `${v} km/h`, to: "m/s", value: v, answer: v / 3.6, steps: "÷ 3,6 (1 km = 1000 m, 1 h = 3600 s)" };
    },
    () => {
      const v = pick([5, 10, 20, 25, 30]);
      return { from: `${v} m/s`, to: "km/h", value: v, answer: v * 3.6, steps: "× 3,6" };
    },
    () => {
      const v = pick([250, 500, 750, 1500, 33]);
      return { from: `${v} mL`, to: "L", value: v, answer: v / 1000, steps: "1 L = 1000 mL" };
    },
  ];
  if (level !== "facile")
    gens.push(
      () => {
        const v = pick([250, 500, 750, 1500, 330]);
        return { from: `${v} mL`, to: "m³", value: v, answer: v * 1e-6, steps: "1 mL = 1 cm³ = 10⁻⁶ m³" };
      },
      () => {
        const v = pick([2, 5, 12, 40]);
        return { from: `${v} cm²`, to: "m²", value: v, answer: v * 1e-4, steps: "1 cm² = 10⁻⁴ m²" };
      },
      () => {
        const v = pick([1.5, 2, 3.2, 7.8]);
        return { from: `${fmt(v)} g/cm³`, to: "kg/m³", value: v, answer: v * 1000, steps: "× 1000" };
      },
    );
  if (level === "difficile" || level === "impossible")
    gens.push(
      () => {
        const v = pick([2, 3, 5, 12]);
        return { from: `${v} kWh`, to: "J", value: v, answer: v * 3.6e6, steps: "1 kWh = 1000 W × 3600 s = 3,6×10⁶ J" };
      },
      () => {
        const v = pick([1, 2, 5]);
        return { from: `${v} bar`, to: "Pa", value: v, answer: v * 1e5, steps: "1 bar = 10⁵ Pa" };
      },
      () => {
        const v = pick([0.5, 2, 4.5]);
        return { from: `${fmt(v)} mg/mL`, to: "g/L", value: v, answer: v, steps: "mg/mL = g/L (× 1000 / 1000)" };
      },
      () => {
        const v = pick([3, 12, 45]);
        return { from: `${v} µm³`, to: "m³", value: v, answer: v * 1e-18, steps: "1 µm = 10⁻⁶ m donc 1 µm³ = 10⁻¹⁸ m³" };
      },
    );
  return pick(gens)();
}

export function Chaine({ level }: { level: Difficulty }) {
  const [c, setC] = useState(() => makeChain(level));
  const [lastLevel, setLastLevel] = useState(level);
  const [input, setInput] = useState("");
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState(NO_MSG);
  const [done, setDone] = useState(false);

  const next = () => {
    setC(makeChain(level));
    setInput("");
    setTries(0);
    setMsg(NO_MSG);
    setDone(false);
  };
  if (level !== lastLevel) {
    setLastLevel(level);
    next();
  }

  const check = () => {
    if (done) return;
    const v = parseNumber(input);
    if (v === null) return setMsg(err("Tape un nombre (ex. 2,5×10^-4 ou 2,5e-4)"));
    const t = tries + 1;
    setTries(t);
    if (relOk(v, c.answer, 0.01)) {
      setMsg(ok(`Exact : ${c.from} = ${fmt(c.answer, 4)} ${c.to} (${c.steps})`));
      setDone(true);
      recordResult("chaine", true);
    } else if (t >= 3) {
      setMsg(err(`Perdu : ${c.from} = ${fmt(c.answer, 4)} ${c.to} (${c.steps})`));
      setDone(true);
      recordResult("chaine", false);
    } else {
      const ratio = v / c.answer;
      const pow = Math.round(Math.log10(Math.abs(ratio)));
      setMsg(err(ratio > 0 && pow !== 0 && relOk(ratio, 10 ** pow, 0.01) ? `Presque : tu es à un facteur 10^${pow} (essai ${t}/3)` : `Faux (essai ${t}/3)`));
    }
  };

  return (
    <LabShell eyebrow="CONVERSIONS EN CHAÎNE (3 ESSAIS)" message={msg} done={done} onSkip={next} onCheck={check} onNext={next}>
      <div className="lab__card">
        <div className="lab__small">Convertis</div>
        <div className="lab__big">
          {c.from} → ? {c.to}
        </div>
        <div className="lab__small">Puissances : 2,5e-4 ou 2,5×10^-4</div>
      </div>
      <div className="lab__row">
        <input
          className="lab__input"
          inputMode="decimal"
          placeholder="résultat"
          value={input}
          disabled={done}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          aria-label="Résultat"
        />
        <span className="lab__small">{c.to}</span>
      </div>
    </LabShell>
  );
}
