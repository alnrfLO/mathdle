import { useState } from "react";
import type { Difficulty } from "../game/types";
import { LabShell, NO_MSG, err, ok, pick } from "./LabShell";
import { ELEMENTS, atomCounts, findElement, molarMass, type El } from "./elements";
import { parseNumber, fmt } from "./expr";
import { recordResult } from "./stats";

const POOL: Record<Difficulty, number> = { facile: 18, moyen: 20, difficile: 36, impossible: 54 };
const EL_MAX = 6;

export function ElementMystere({ level }: { level: Difficulty }) {
  const [target, setTarget] = useState<El>(() => pick(ELEMENTS.slice(0, POOL[level])));
  const [lastLevel, setLastLevel] = useState(level);
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<El[]>([]);
  const [msg, setMsg] = useState(NO_MSG);
  const [done, setDone] = useState(false);

  const next = () => {
    setTarget(pick(ELEMENTS.slice(0, POOL[level])));
    setRows([]);
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
    const el = findElement(input);
    if (!el) return setMsg(err("Élément inconnu (tape un symbole, un nom ou un numéro de 1 à 54)"));
    if (rows.some((r) => r.z === el.z)) return setMsg(err("Déjà essayé"));
    const r = [...rows, el];
    setRows(r);
    setInput("");
    if (el.z === target.z) {
      setMsg(ok(`Bravo, c'est ${target.nom} (${target.sym}), Z = ${target.z}`));
      setDone(true);
      recordResult("element", true);
    } else if (r.length >= EL_MAX) {
      setMsg(err(`Perdu, c'était ${target.nom} (${target.sym}), Z = ${target.z}`));
      setDone(true);
      recordResult("element", false);
    } else setMsg(NO_MSG);
  };

  const cmp = (a: number, b: number, tol: number) => (a === b ? "cell-ok" : Math.abs(a - b) <= tol ? "cell-near" : "cell-no");
  const arrow = (a: number, b: number) => (a === b ? "" : a < b ? " ↑" : " ↓");

  const giveUp = () => {
    setMsg(err(`C'était ${target.nom} (${target.sym}), Z = ${target.z}`));
    setDone(true);
    recordResult("element", false);
  };

  return (
    <LabShell hint={`Il est dans la période ${target.period} du tableau`} onGiveUp={giveUp} round={target} eyebrow={`ÉLÉMENT MYSTÈRE (ESSAI ${Math.min(rows.length + 1, EL_MAX)}/${EL_MAX}, Z ≤ ${POOL[level]})`} message={msg} done={done} onSkip={next} onCheck={check} onNext={next}>
      <div className="lab__small" style={{ textAlign: "center" }}>
        Vert = exact, jaune = proche. Les flèches disent si la cible est plus haut ou plus bas.
      </div>
      <input
        className="lab__input"
        placeholder="Symbole, nom ou Z (ex. Fe, fer, 26)"
        value={input}
        disabled={done}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        aria-label="Élément"
      />
      {rows.length > 0 && (
        <table className="lab__table">
          <thead>
            <tr>
              <th>Élément</th>
              <th>Z</th>
              <th>Masse</th>
              <th>Colonne</th>
              <th>Ligne</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.z}>
                <td className={r.z === target.z ? "cell-ok" : "cell-no"}>{r.sym}</td>
                <td className={cmp(r.z, target.z, 3)}>{r.z + arrow(r.z, target.z)}</td>
                <td className={cmp(Math.round(r.mass), Math.round(target.mass), 6)}>{Math.round(r.mass) + arrow(r.mass, target.mass)}</td>
                <td className={cmp(r.group, target.group, 1)}>{r.group + arrow(r.group, target.group)}</td>
                <td className={cmp(r.period, target.period, 0)}>{r.period + arrow(r.period, target.period)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </LabShell>
  );
}

const FORMULAS: Record<Difficulty, string[]> = {
  facile: ["H2O", "CO2", "O2", "N2", "NaCl", "CH4", "HCl", "NH3"],
  moyen: ["C6H12O6", "H2SO4", "CaCO3", "NaOH", "C2H5OH", "HNO3", "KMnO4", "Fe2O3"],
  difficile: ["Ca(OH)2", "Mg(NO3)2", "Al2(SO4)3", "(NH4)2SO4", "Ca3(PO4)2", "C12H22O11", "Cu(OH)2"],
  impossible: ["CuSO4·5H2O", "K4Fe(CN)6", "Na2CO3·10H2O", "Fe2(SO4)3", "(NH4)3PO4", "MgSO4·7H2O"],
};

const sub = (f: string) => f.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]).replace(/·₅/, "·5").replace(/·₁₀/, "·10").replace(/·₇/, "·7");

export function MasseMolaire({ level }: { level: Difficulty }) {
  const [f, setF] = useState(() => pick(FORMULAS[level]));
  const [lastLevel, setLastLevel] = useState(level);
  const [input, setInput] = useState("");
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState(NO_MSG);
  const [done, setDone] = useState(false);
  const M = molarMass(f);

  const next = () => {
    setF(pick(FORMULAS[level]));
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
    if (v === null) return setMsg(err("Tape un nombre en g/mol (ex. 18 ou 18,02)"));
    const t = tries + 1;
    setTries(t);
    if (Math.abs(v - M) <= Math.max(0.3, M * 0.005)) {
      setMsg(ok(`Exact : M(${f}) = ${fmt(M, 5)} g/mol`));
      setDone(true);
      recordResult("masse", true);
    } else if (t >= 3) {
      setMsg(err(`Perdu, M(${f}) = ${fmt(M, 5)} g/mol`));
      setDone(true);
      recordResult("masse", false);
    } else setMsg(err(`${v < M ? "Trop petit" : "Trop grand"} (essai ${t}/3)`));
  };

  const used = Array.from(new Set(f.match(/[A-Z][a-z]?/g) ?? []));

  const giveUp = () => {
    setMsg(err(`M(${f}) = ${fmt(M, 5)} g/mol`));
    setDone(true);
    recordResult("masse", false);
  };
  const masseHint = `${sub(f)} contient ${atomCounts(f).map(([s, n]) => `${n} ${s}`).join(", ")}. Multiplie chaque masse par son nombre d'atomes, puis additionne`;

  return (
    <LabShell hint={masseHint} onGiveUp={giveUp} round={f} eyebrow="MASSE MOLAIRE (3 ESSAIS)" message={msg} done={done} onSkip={next} onCheck={check} onNext={next}>
      <div className="lab__card">
        <div className="lab__small">Calcule la masse molaire de</div>
        <div className="lab__big">{sub(f)}</div>
        <div className="lab__small">
          {used.map((s) => {
            const e = findElement(s);
            return e ? `M(${s}) = ${fmt(e.mass, 4)}` : "";
          }).join(", ")}{" "}
          g/mol
        </div>
      </div>
      <div className="lab__row">
        <input
          className="lab__input"
          inputMode="decimal"
          placeholder="M = …"
          value={input}
          disabled={done}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          aria-label="Masse molaire"
        />
        <span className="lab__small">g/mol</span>
      </div>
    </LabShell>
  );
}

type Term = [number, string];
interface Half {
  couple: string;
  left: Term[];
  right: Term[];
}

const HALVES: Half[] = [
  { couple: "MnO₄⁻ / Mn²⁺", left: [[1, "MnO₄⁻"], [8, "H⁺"], [5, "e⁻"]], right: [[1, "Mn²⁺"], [4, "H₂O"]] },
  { couple: "Cr₂O₇²⁻ / Cr³⁺", left: [[1, "Cr₂O₇²⁻"], [14, "H⁺"], [6, "e⁻"]], right: [[2, "Cr³⁺"], [7, "H₂O"]] },
  { couple: "O₂ / H₂O", left: [[1, "O₂"], [4, "H⁺"], [4, "e⁻"]], right: [[2, "H₂O"]] },
  { couple: "H₂O₂ / H₂O", left: [[1, "H₂O₂"], [2, "H⁺"], [2, "e⁻"]], right: [[2, "H₂O"]] },
  { couple: "NO₃⁻ / NO", left: [[1, "NO₃⁻"], [4, "H⁺"], [3, "e⁻"]], right: [[1, "NO"], [2, "H₂O"]] },
  { couple: "I₂ / I⁻", left: [[1, "I₂"], [2, "e⁻"]], right: [[2, "I⁻"]] },
  { couple: "S₄O₆²⁻ / S₂O₃²⁻", left: [[1, "S₄O₆²⁻"], [2, "e⁻"]], right: [[2, "S₂O₃²⁻"]] },
  { couple: "SO₄²⁻ / SO₂", left: [[1, "SO₄²⁻"], [4, "H⁺"], [2, "e⁻"]], right: [[1, "SO₂"], [2, "H₂O"]] },
  { couple: "ClO⁻ / Cl⁻", left: [[1, "ClO⁻"], [2, "H⁺"], [2, "e⁻"]], right: [[1, "Cl⁻"], [1, "H₂O"]] },
  { couple: "Cu²⁺ / Cu", left: [[1, "Cu²⁺"], [2, "e⁻"]], right: [[1, "Cu"]] },
  { couple: "Cl₂ / Cl⁻", left: [[1, "Cl₂"], [2, "e⁻"]], right: [[2, "Cl⁻"]] },
];

export function Redox({ level }: { level: Difficulty }) {
  const pool = level === "facile" ? HALVES.filter((h) => !h.left.some((t) => t[1] === "H⁺")) : level === "moyen" ? HALVES.slice(2, 10) : HALVES;
  const [h, setH] = useState(() => pick(pool));
  const [lastLevel, setLastLevel] = useState(level);
  const terms = [...h.left, ...h.right];
  const [vals, setVals] = useState<string[]>(() => terms.map(() => ""));
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState(NO_MSG);
  const [done, setDone] = useState(false);

  const reset = (nh: Half) => {
    setH(nh);
    setVals([...nh.left, ...nh.right].map(() => ""));
    setTries(0);
    setMsg(NO_MSG);
    setDone(false);
  };
  const next = () => reset(pick(pool));
  if (level !== lastLevel) {
    setLastLevel(level);
    next();
  }

  const check = () => {
    if (done) return;
    const given = vals.map((v) => (v.trim() === "" ? 1 : Number(v)));
    if (given.some((n) => !Number.isInteger(n) || n < 1)) return setMsg(err("Coefficients entiers positifs (vide = 1)"));
    const wrong = terms.filter((t, i) => given[i] !== t[0]).length;
    const t = tries + 1;
    setTries(t);
    if (wrong === 0) {
      setMsg(ok("Demi-équation équilibrée"));
      setDone(true);
      recordResult("redox", true);
    } else if (t >= 4) {
      setVals(terms.map((x) => String(x[0])));
      setMsg(err("Perdu, voici la bonne demi-équation"));
      setDone(true);
      recordResult("redox", false);
    } else setMsg(err(`${wrong} coefficient${wrong > 1 ? "s" : ""} faux (essai ${t}/4). Pense à O avec H₂O, puis H avec H⁺, puis les charges avec e⁻`));
  };

  const render = (list: Term[], offset: number) =>
    list.map((t, i) => (
      <span key={offset + i} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        {i > 0 && <span>+</span>}
        <input
          className="lab__coef"
          inputMode="numeric"
          value={vals[offset + i]}
          disabled={done}
          placeholder="1"
          onChange={(e) => setVals((v) => v.map((x, k) => (k === offset + i ? e.target.value.replace(/\D/g, "") : x)))}
          onKeyDown={(e) => e.key === "Enter" && check()}
          aria-label={`Coefficient de ${t[1]}`}
        />
        <span>{t[1]}</span>
      </span>
    ));

  const giveUp = () => {
    setVals(terms.map((x) => String(x[0])));
    setMsg(err("Voici la bonne demi-équation"));
    setDone(true);
    recordResult("redox", false);
  };
  const electrons = terms.find((t) => t[1] === "e⁻")?.[0] ?? 0;

  return (
    <LabShell hint={`Il faut ${electrons} électron${electrons > 1 ? "s" : ""} (e⁻)`} onGiveUp={giveUp} round={h} eyebrow={`OXYDORÉDUCTION, COUPLE ${h.couple}`} message={msg} done={done} onSkip={next} onCheck={check} onNext={next}>
      <div className="lab__card">
        <div className="lab__small">Équilibre la demi-équation (milieu acide). Case vide = 1.</div>
        <div className="lab__eq">
          {render(h.left, 0)}
          <span>⇌</span>
          {render(h.right, h.left.length)}
        </div>
      </div>
    </LabShell>
  );
}
