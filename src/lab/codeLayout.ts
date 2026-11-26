export interface CodeLine {
  indent: number;
  idx: number[];
}

const PY_HEADERS = new Set(["def", "if", "elif", "else", "for", "while"]);
const PY_STARTERS = new Set(["def", "if", "elif", "else", "for", "while", "return", "break", "continue", "pass"]);
const PY_OPS = new Set(["=", "+=", "-=", "*=", "/=", "+", "-", "*", "/", "%", "//", "**", "==", "!=", "<", ">", "<=", ">=", "and", "or", "not", "in", "(", "[", ",", ".", ":", "return"]);

export function layoutCode(tokens: string[], lang: string): CodeLine[] {
  return lang === "python" ? layoutPython(tokens) : layoutBraces(tokens);
}

function layoutBraces(t: string[]): CodeLine[] {
  const lines: CodeLine[] = [];
  let cur: number[] = [];
  let indent = 0;
  let paren = 0;
  const flush = (nextIndent: number) => {
    if (cur.length) lines.push({ indent, idx: cur });
    cur = [];
    indent = nextIndent;
  };
  t.forEach((tok, i) => {
    if (tok === "}") {
      flush(Math.max(0, indent - 1));
      cur.push(i);
      if (t[i + 1] !== "else" && t[i + 1] !== "while") flush(indent);
      return;
    }
    cur.push(i);
    if (tok === "(") paren++;
    if (tok === ")") paren = Math.max(0, paren - 1);
    if (tok === "{") flush(indent + 1);
    else if (tok === ";" && paren === 0) flush(indent);
  });
  flush(indent);
  return lines;
}

function layoutPython(t: string[]): CodeLine[] {
  const stmts: { idx: number[]; header: boolean; kw: string }[] = [];
  let cur: number[] = [];
  let depth = 0;
  const push = (header: boolean) => {
    if (cur.length) stmts.push({ idx: cur, header, kw: t[cur[0]] });
    cur = [];
  };
  t.forEach((tok, i) => {
    const prev = t[i - 1];
    const startsStmt =
      depth === 0 &&
      cur.length > 0 &&
      ((PY_STARTERS.has(tok) && !(tok === "if" && prev === "else") && prev !== "else") ||
        (/^[A-Za-z_]\w*$/.test(tok) && /^(=|\+=|-=|\*=|\/=|\.)$/.test(t[i + 1] ?? "") && !PY_OPS.has(prev ?? "") && t[cur[0]] !== "for"));
    if (startsStmt) push(false);
    cur.push(i);
    if (tok === "(" || tok === "[" || tok === "{") depth++;
    if (tok === ")" || tok === "]" || tok === "}") depth = Math.max(0, depth - 1);
    if (tok === ":" && depth === 0 && PY_HEADERS.has(t[cur[0]])) push(true);
  });
  push(false);

  const lines: CodeLine[] = [];
  const stack: number[] = [];
  let level = 0;
  const lastReturn = stmts.map((s) => s.kw).lastIndexOf("return");
  stmts.forEach((s, k) => {
    if (s.kw === "elif" || s.kw === "else") {
      while (stack.length && stack[stack.length - 1] >= level) stack.pop();
      level = Math.max(0, level - 1);
    }
    if (s.kw === "def") {
      stack.length = 0;
      level = 0;
    }
    if (k === lastReturn && k === stmts.length - 1 && level > 1) level = 1;
    lines.push({ indent: level, idx: s.idx });
    if (s.header) {
      stack.push(level);
      level++;
    } else if (s.kw === "return" || s.kw === "break" || s.kw === "continue") {
      if (stack.length > 1) level = stack.pop()!;
    }
  });
  return lines;
}

const NO_SPACE_BEFORE = new Set([")", ",", ";", "]", "."]);
const NO_SPACE_AFTER = new Set(["(", "[", "."]);

export function solutionCode(tokens: string[], lang: string): string {
  return layoutCode(tokens, lang)
    .map((line) => {
      let out = "";
      line.idx.forEach((i, k) => {
        const tok = tokens[i];
        const prev = k > 0 ? tokens[line.idx[k - 1]] : "";
        const call = tok === "(" && /^[A-Za-z_]\w*$/.test(prev) && !/^(if|for|while|return|switch)$/.test(prev);
        const glue = k === 0 || NO_SPACE_BEFORE.has(tok) || (tok === ":" && lang === "python") || NO_SPACE_AFTER.has(prev) || call || (/^\d$/.test(tok) && /^\d$/.test(prev));
        out += (glue ? "" : " ") + tok;
      });
      return "    ".repeat(line.indent) + out;
    })
    .join("\n");
}
