// Petit évaluateur d'expressions mathématiques, sans eval().
// Gère : nombres (virgule ou point), x, π / pi, e, + - * / ^, moins unaire,
// parenthèses, multiplication implicite (2x, 3π, 2(x+1), x(x-1)) et les
// fonctions sin cos tan exp ln log sqrt √ abs.
// compile() renvoie une fonction (x) => number, ou lève une erreur lisible.

type Tok =
  | { t: "num"; v: number }
  | { t: "x" }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" }
  | { t: "lp" }
  | { t: "rp" }
  | { t: "fn"; v: string };

const FUNCS: Record<string, (a: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
};

export class ExprError extends Error {}

function tokenize(src: string): Tok[] {
  const s = src
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/√/g, "sqrt")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .toLowerCase();
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.,]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j++;
      const raw = s.slice(i, j).replace(",", ".");
      const v = Number(raw);
      if (!Number.isFinite(v) || (raw.match(/\./g) || []).length > 1) throw new ExprError(`nombre invalide « ${raw} »`);
      out.push({ t: "num", v });
      i = j;
      continue;
    }
    if (c === "π") {
      out.push({ t: "num", v: Math.PI });
      i++;
      continue;
    }
    if (/[a-z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/.test(s[j])) j++;
      let word = s.slice(i, j);
      // On découpe les mots collés du type "xsin" ou "pix"
      while (word.length > 0) {
        const fn = Object.keys(FUNCS).find((f) => word.startsWith(f));
        if (fn) {
          out.push({ t: "fn", v: fn });
          word = word.slice(fn.length);
        } else if (word.startsWith("pi")) {
          out.push({ t: "num", v: Math.PI });
          word = word.slice(2);
        } else if (word[0] === "x") {
          out.push({ t: "x" });
          word = word.slice(1);
        } else if (word[0] === "e") {
          out.push({ t: "num", v: Math.E });
          word = word.slice(1);
        } else {
          throw new ExprError(`symbole inconnu « ${word} »`);
        }
      }
      i = j;
      continue;
    }
    if ("+-*/^".includes(c)) {
      out.push({ t: "op", v: c as "+" });
      i++;
      continue;
    }
    if (c === "(") {
      out.push({ t: "lp" });
      i++;
      continue;
    }
    if (c === ")") {
      out.push({ t: "rp" });
      i++;
      continue;
    }
    throw new ExprError(`caractère interdit « ${c} »`);
  }
  // Multiplication implicite : entre (num|x|rp) et (num|x|lp|fn)
  const res: Tok[] = [];
  for (let k = 0; k < out.length; k++) {
    const a = out[k - 1];
    const b = out[k];
    if (a && (a.t === "num" || a.t === "x" || a.t === "rp") && (b.t === "num" || b.t === "x" || b.t === "lp" || b.t === "fn")) {
      res.push({ t: "op", v: "*" });
    }
    res.push(b);
  }
  return res;
}

type Node =
  | { k: "num"; v: number }
  | { k: "x" }
  | { k: "neg"; a: Node }
  | { k: "bin"; op: "+" | "-" | "*" | "/" | "^"; a: Node; b: Node }
  | { k: "fn"; f: string; a: Node };

function parse(tokens: Tok[]): Node {
  let p = 0;
  const peek = () => tokens[p];
  function expr(): Node {
    let n = term();
    while (peek()?.t === "op" && (peek() as { v: string }).v.match(/[+-]/)) {
      const op = (tokens[p++] as { v: "+" | "-" }).v;
      n = { k: "bin", op, a: n, b: term() };
    }
    return n;
  }
  function term(): Node {
    let n = unary();
    while (peek()?.t === "op" && (peek() as { v: string }).v.match(/[*/]/)) {
      const op = (tokens[p++] as { v: "*" | "/" }).v;
      n = { k: "bin", op, a: n, b: unary() };
    }
    return n;
  }
  function unary(): Node {
    const t = peek();
    if (t?.t === "op" && t.v === "-") {
      p++;
      return { k: "neg", a: unary() };
    }
    if (t?.t === "op" && t.v === "+") {
      p++;
      return unary();
    }
    return power();
  }
  function power(): Node {
    const base = atom();
    if (peek()?.t === "op" && (peek() as { v: string }).v === "^") {
      p++;
      return { k: "bin", op: "^", a: base, b: unary() };
    }
    return base;
  }
  function atom(): Node {
    const t = tokens[p++];
    if (!t) throw new ExprError("expression incomplète");
    if (t.t === "num") return { k: "num", v: t.v };
    if (t.t === "x") return { k: "x" };
    if (t.t === "fn") {
      if (peek()?.t !== "lp") throw new ExprError(`il faut des parenthèses après ${t.v}`);
      p++;
      const a = expr();
      if (tokens[p++]?.t !== "rp") throw new ExprError("parenthèse non fermée");
      return { k: "fn", f: t.v, a };
    }
    if (t.t === "lp") {
      const a = expr();
      if (tokens[p++]?.t !== "rp") throw new ExprError("parenthèse non fermée");
      return a;
    }
    throw new ExprError("expression mal formée");
  }
  const n = expr();
  if (p < tokens.length) throw new ExprError("expression mal formée");
  return n;
}

function evalNode(n: Node, x: number): number {
  switch (n.k) {
    case "num":
      return n.v;
    case "x":
      return x;
    case "neg":
      return -evalNode(n.a, x);
    case "fn":
      return FUNCS[n.f](evalNode(n.a, x));
    case "bin": {
      const a = evalNode(n.a, x);
      const b = evalNode(n.b, x);
      if (n.op === "+") return a + b;
      if (n.op === "-") return a - b;
      if (n.op === "*") return a * b;
      if (n.op === "/") return a / b;
      return Math.pow(a, b);
    }
  }
}

export interface Compiled {
  fn: (x: number) => number;
  usesX: boolean;
  ops: number; // nombre d'opérations (+ - * / ^ et fonctions)
}

export function compile(src: string): Compiled {
  if (!src.trim()) throw new ExprError("écris une expression");
  const tokens = tokenize(src);
  const tree = parse(tokens);
  const usesX = tokens.some((t) => t.t === "x");
  const ops = tokens.filter((t) => t.t === "op" || t.t === "fn").length;
  return { fn: (x: number) => evalNode(tree, x), usesX, ops };
}

// Lecture souple d'un nombre tapé par un joueur : "1,5", "1.5e-3",
// "1,5×10^-3", "1,5 x 10^3", "-2".
export function parseNumber(raw: string): number | null {
  const s = raw
    .trim()
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/[×x*]10\^?/i, "e")
    .replace(/−/g, "-");
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

export function closeEnough(a: number, b: number, rel = 1e-6): boolean {
  return Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));
}

// Affichage compact d'un nombre à la française
export function fmt(n: number, digits = 4): string {
  const r = Number(n.toPrecision(digits));
  return String(r).replace(".", ",");
}
