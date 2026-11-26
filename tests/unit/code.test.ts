import { describe, expect, it } from "vitest";
import { layoutCode } from "../../src/lab/codeLayout";
import { bannedFor, bannedUsed, EXERCISES, STARTER } from "../../src/lab/exercises";
import { deepEqual } from "../../src/lab/runner";
import { PROG_BANK, type ProgLang } from "../../src/game/programming";

const render = (tokens: string[], lang: string) =>
  layoutCode(tokens, lang).map((l) => "    ".repeat(l.indent) + l.idx.map((i) => tokens[i]).join(" "));

describe("code layout", () => {
  it("when a Python function has an if block, it indents the body and dedents after return", () => {
    const tokens = ["def", "valeurAbsolue", "(", "n", ")", ":", "if", "n", "<", "0", ":", "return", "-", "n", "return", "n"];
    expect(render(tokens, "python")).toEqual([
      "def valeurAbsolue ( n ) :",
      "    if n < 0 :",
      "        return - n",
      "    return n",
    ]);
  });

  it("when a brace language has a for loop, the semicolons inside the parentheses stay on one line", () => {
    const tokens = ["function", "f", "(", "n", ")", "{", "for", "(", "let", "i", "=", "0", ";", "i", "<", "n", ";", "i", "++", ")", "{", "n", "--", ";", "}", "return", "n", ";", "}"];
    expect(render(tokens, "javascript")).toEqual([
      "function f ( n ) {",
      "    for ( let i = 0 ; i < n ; i ++ ) {",
      "        n -- ;",
      "    }",
      "    return n ;",
      "}",
    ]);
  });

  it("when laying out all 72 exercises, every token appears exactly once and in order", () => {
    for (const lang of Object.keys(PROG_BANK) as ProgLang[]) {
      for (const level of ["facile", "moyen", "difficile"] as const) {
        for (const ex of PROG_BANK[lang][level]) {
          const lines = layoutCode(ex.tokens, lang);
          const order = lines.flatMap((l) => l.idx);
          expect(order, `${lang} ${ex.titre}`).toEqual(ex.tokens.map((_, i) => i));
          expect(lines.length, `${lang} ${ex.titre}`).toBeGreaterThanOrEqual(2);
          expect(lines[0].indent).toBe(0);
        }
      }
    }
  });
});

describe("console exercises", () => {
  it("when generating hidden tests, the reference solution always returns a value", () => {
    for (const ex of EXERCISES) {
      for (let round = 0; round < 20; round++) {
        for (const args of [...ex.visible, ...ex.hidden()]) {
          const out = (ex.ref as (...a: unknown[]) => unknown)(...structuredClone(args));
          expect(out, ex.id).not.toBeUndefined();
        }
      }
    }
  });

  it("when two runs generate hidden tests, they are usually different", () => {
    const ex = EXERCISES.find((e) => e.id === "somme")!;
    const runs = new Set(Array.from({ length: 10 }, () => JSON.stringify(ex.hidden())));
    expect(runs.size).toBeGreaterThan(1);
  });

  it("when building the starter code, it uses the right name and parameters for each language", () => {
    const ex = EXERCISES.find((e) => e.id === "palindrome")!;
    expect(STARTER.python(ex)).toMatch(/^def est_palindrome\(mot\):/);
    expect(STARTER.javascript(ex)).toMatch(/^function estPalindrome\(mot\) \{/);
  });

  it("when the code calls a forbidden built-in, it is detected, but not inside a comment", () => {
    const somme = EXERCISES.find((e) => e.id === "somme")!;
    expect(bannedUsed(somme, "def somme(tab):\n    return sum(tab)", "python")).toBe("sum");
    expect(bannedUsed(somme, "function somme(t){return t.reduce((a,b)=>a+b,0)}", "javascript")).toBe("reduce");
    expect(bannedUsed(somme, "def somme(tab):\n    # sum() est interdit\n    return 0", "python")).toBeNull();
    const inv = EXERCISES.find((e) => e.id === "inverser")!;
    expect(bannedUsed(inv, "def inverser(c):\n    return c[::-1]", "python")).toBe("[::-1]");
  });

  it("when showing forbidden built-ins, each language only sees its own names", () => {
    const max = EXERCISES.find((e) => e.id === "maximum")!;
    expect(bannedFor(max, "python")).not.toContain("Math.max");
    expect(bannedFor(max, "javascript")).not.toContain("max");
    expect(bannedFor(max, "javascript")).toContain("Math.max");
  });

  it("when comparing results, it tolerates float noise and compares lists deeply", () => {
    expect(deepEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual(true, 1)).toBe(false);
  });
});

describe("solution display", () => {
  it("when a lost code answer is shown, it reads like real indented code", async () => {
    const { solutionCode } = await import("../../src/lab/codeLayout");
    const tokens = ["def", "f", "(", "n", ")", ":", "return", "n", "+", "1"];
    expect(solutionCode(tokens, "python")).toBe("def f(n):\n    return n + 1");
  });
});

describe("console solutions", () => {
  it("when any exercise is opened, it has a hint and a solution in both languages", async () => {
    const { SOLUTIONS } = await import("../../src/lab/solutions");
    for (const e of EXERCISES) {
      expect(SOLUTIONS[e.id], e.id).toBeDefined();
      expect(SOLUTIONS[e.id].js).toContain(`function ${e.js}(`);
      expect(SOLUTIONS[e.id].py).toContain(`def ${e.py}(`);
    }
  });

  it("when a shown solution is checked against the rules, it never uses a banned function", async () => {
    const { SOLUTIONS } = await import("../../src/lab/solutions");
    for (const e of EXERCISES) {
      expect(bannedUsed(e, SOLUTIONS[e.id].js, "javascript"), e.id).toBeNull();
      expect(bannedUsed(e, SOLUTIONS[e.id].py, "python"), e.id).toBeNull();
    }
  });

  it("when a JavaScript solution runs on the visible and hidden tests, every answer matches the reference", async () => {
    const { SOLUTIONS } = await import("../../src/lab/solutions");
    for (const e of EXERCISES) {
      const fn = new Function(`${SOLUTIONS[e.id].js}; return ${e.js};`)();
      for (const args of [...e.visible, ...e.hidden()]) {
        const expected = (e.ref as (...a: unknown[]) => unknown)(...structuredClone(args));
        expect(fn(...structuredClone(args)), `${e.id}(${JSON.stringify(args)})`).toEqual(expected);
      }
    }
  });
});
