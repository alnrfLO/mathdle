import { useEffect, useRef, useState } from "react";
import type { Difficulty } from "../game/types";
import { LabShell, NO_MSG, err, ok, pick, randInt } from "./LabShell";
import { compile, ExprError, fmt } from "./expr";
import { recordResult } from "./stats";

interface Target {
  src: string;
  fn: (x: number) => number;
}

function makeTarget(level: Difficulty): Target {
  const nz = (a: number, b: number) => {
    let v = 0;
    while (v === 0) v = randInt(a, b);
    return v;
  };
  const sgn = (n: number) => (n < 0 ? `- ${-n}` : `+ ${n}`);
  let src: string;
  if (level === "facile") {
    const a = nz(-3, 3);
    const b = randInt(-3, 3);
    src = pick([`${a}x ${sgn(b)}`, `${a}x`, `x ${sgn(b === 0 ? 2 : b)}`]);
  } else if (level === "moyen") {
    const a = pick([1, -1, 2, -2]);
    const h = randInt(-2, 2);
    const k = randInt(-3, 2);
    src = pick([
      `${a}(x ${sgn(-h)})^2 ${sgn(k)}`,
      `x^2 ${sgn(k)}`,
      `abs(x ${sgn(-h)}) ${sgn(k)}`,
      `${a}x^2`,
    ]);
  } else if (level === "difficile") {
    const a = pick([1, 2, 3]);
    const b = randInt(-2, 2);
    src = pick([`${a}sin(x) ${sgn(b)}`, `cos(${a}x)`, `exp(x) ${sgn(b)}`, `sqrt(x ${sgn(a)})`, `${a}/x`, `x^3 ${sgn(b)}`]);
  } else {
    src = pick(["x sin(x)", "exp(-x^2)*4", "ln(x^2+1)", "sin(x)+cos(x)", "x^3 - 3x", "2sin(x/2)", "1/(x^2+1)*3"]);
  }
  return { src: src.replace(/\+ 0$|- 0$/, "").replace(/^1x/, "x").replace(/^-1x/, "-x").replace(/ 1x/, " x").trim(), fn: compile(src).fn };
}

function courbeHint(t: Target): string {
  const s = t.src;
  const family = /sin|cos/.test(s)
    ? "C'est une fonction trigonométrique (sin ou cos)"
    : /exp/.test(s)
      ? "Il y a une exponentielle"
      : /ln/.test(s)
        ? "Il y a un logarithme (ln)"
        : /sqrt/.test(s)
          ? "Il y a une racine carrée"
          : /abs/.test(s)
            ? "Il y a une valeur absolue (courbe en V)"
            : /\/x|\/\(/.test(s)
              ? "Il y a une division par x"
              : /\^3/.test(s)
                ? "Il y a un x au cube"
                : /\^2/.test(s)
                  ? "C'est une parabole (x²)"
                  : "C'est une droite : f(x) = ax + b";
  const y0 = t.fn(0);
  return Number.isFinite(y0) ? `${family}. Elle passe par f(0) = ${fmt(y0, 3)}` : family;
}

const XMIN = -5;
const XMAX = 5;
const YMIN = -5;
const YMAX = 5;
const MAX = 6;
const PAD = ["x", "^2", "^", "(", ")", "sin(", "cos(", "exp(", "ln(", "sqrt(", "abs(", "π"];

function draw(canvas: HTMLCanvasElement, curves: { fn: (x: number) => number; color: string; width: number }[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const sx = (x: number) => ((x - XMIN) / (XMAX - XMIN)) * W;
  const sy = (y: number) => H - ((y - YMIN) / (YMAX - YMIN)) * H;
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(41,51,31,0.15)";
  ctx.lineWidth = 1;
  for (let i = XMIN; i <= XMAX; i++) {
    ctx.beginPath();
    ctx.moveTo(sx(i), 0);
    ctx.lineTo(sx(i), H);
    ctx.stroke();
  }
  for (let j = YMIN; j <= YMAX; j++) {
    ctx.beginPath();
    ctx.moveTo(0, sy(j));
    ctx.lineTo(W, sy(j));
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(41,51,31,0.7)";
  ctx.beginPath();
  ctx.moveTo(sx(0), 0);
  ctx.lineTo(sx(0), H);
  ctx.moveTo(0, sy(0));
  ctx.lineTo(W, sy(0));
  ctx.stroke();
  ctx.fillStyle = "rgba(41,51,31,0.7)";
  ctx.font = "11px monospace";
  ctx.fillText("1", sx(1) - 3, sy(0) + 12);
  ctx.fillText("1", sx(0) + 4, sy(1) + 4);
  for (const c of curves) {
    ctx.strokeStyle = c.color;
    ctx.lineWidth = c.width;
    ctx.beginPath();
    let pen = false;
    for (let px = 0; px <= W; px++) {
      const x = XMIN + (px / W) * (XMAX - XMIN);
      const y = c.fn(x);
      if (!Number.isFinite(y) || y < YMIN - 20 || y > YMAX + 20) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(px, sy(y));
      else ctx.moveTo(px, sy(y));
      pen = true;
    }
    ctx.stroke();
  }
}

function same(f: (x: number) => number, g: (x: number) => number): boolean {
  let compared = 0;
  for (let i = 0; i <= 200; i++) {
    const x = XMIN + (i / 200) * (XMAX - XMIN) + 0.0137;
    const a = f(x);
    if (!Number.isFinite(a)) continue;
    const b = g(x);
    if (!Number.isFinite(b)) return false;
    if (Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(a))) return false;
    compared++;
  }
  return compared > 20;
}

export function Courbes({ level }: { level: Difficulty }) {
  const [target, setTarget] = useState(() => makeTarget(level));
  const [lastLevel, setLastLevel] = useState(level);
  const [input, setInput] = useState("");
  const [guesses, setGuesses] = useState<{ src: string; fn: (x: number) => number }[]>([]);
  const [msg, setMsg] = useState(NO_MSG);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLCanvasElement>(null);

  const next = () => {
    setTarget(makeTarget(level));
    setInput("");
    setGuesses([]);
    setMsg(NO_MSG);
    setDone(false);
  };
  if (level !== lastLevel) {
    setLastLevel(level);
    next();
  }

  useEffect(() => {
    if (!ref.current) return;
    const curves = [{ fn: target.fn, color: "#29331f", width: 3 }];
    guesses.forEach((g, i) => curves.push({ fn: g.fn, color: i === guesses.length - 1 ? "#e3a23c" : "rgba(111,155,214,0.6)", width: 2 }));
    draw(ref.current, curves);
  }, [target, guesses]);

  const check = () => {
    if (done) return;
    try {
      const c = compile(input);
      if (!c.usesX) return setMsg(err("Ta fonction doit dépendre de x"));
      const g = [...guesses, { src: input, fn: c.fn }];
      setGuesses(g);
      if (same(target.fn, c.fn)) {
        setMsg(ok(`Trouvé : f(x) = ${input}`));
        setDone(true);
        recordResult("courbes", true);
      } else if (g.length >= MAX) {
        setMsg(err(`Perdu, c'était f(x) = ${target.src}`));
        setDone(true);
        recordResult("courbes", false);
      } else setMsg(err(`Pas encore (ta courbe en orange). Essai ${g.length}/${MAX}`));
    } catch (e) {
      setMsg(err(e instanceof ExprError ? `Expression invalide : ${e.message}` : "Expression invalide"));
    }
  };

  const giveUp = () => {
    setMsg(err(`C'était f(x) = ${target.src}`));
    setDone(true);
    recordResult("courbes", false);
  };

  return (
    <LabShell hint={courbeHint(target)} onGiveUp={giveUp} round={target} eyebrow={`COURBES (ESSAI ${Math.min(guesses.length + 1, MAX)}/${MAX})`} message={msg} done={done} onSkip={next} onCheck={check} onNext={next}>
      <canvas ref={ref} className="lab__canvas" width={320} height={320} aria-label="Courbe à deviner" />
      <div className="lab__row">
        <span className="lab__small">f(x) =</span>
        <input
          className="lab__input"
          placeholder="ex. 2x + 1, x^2 - 3, sin(x)"
          value={input}
          disabled={done}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          aria-label="Fonction"
        />
      </div>
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
