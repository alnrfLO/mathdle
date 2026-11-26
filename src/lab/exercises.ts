// Exercices du mode Console, inspirés de la banque publique d'épreuves
// pratiques de NSI (adaptés, pas recopiés). Chaque exercice a :
// - une solution de référence en JS, qui calcule les résultats attendus ;
// - des tests visibles (dont des cas limites) ;
// - un générateur de tests cachés aléatoires, différents à chaque essai,
//   pour qu'un résultat écrit « en dur » ne passe pas.

import type { ProgLevel } from "../game/programming";

export interface Exercise {
  id: string;
  level: ProgLevel;
  py: string; // nom Python
  js: string; // nom JS
  params: string[];
  enonce: string;
  ref: (...args: never[]) => unknown;
  visible: unknown[][];
  hidden: () => unknown[][];
  banned?: string[]; // fonctions natives interdites
}

const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const list = (n: number, a = -20, b = 50) => Array.from({ length: n }, () => ri(a, b));
const word = (n: number, alpha = "abcdefghijklmnopqrstuvwxyz") => Array.from({ length: n }, () => alpha[ri(0, alpha.length - 1)]).join("");
const times = <T,>(n: number, f: () => T) => Array.from({ length: n }, f);
const sorted = (t: number[]) => [...t].sort((x, y) => x - y);

export const EXERCISES: Exercise[] = [
  {
    id: "somme",
    level: "facile",
    py: "somme",
    js: "somme",
    params: ["tab"],
    enonce: "Renvoie la somme des éléments du tableau tab (0 si tab est vide).",
    ref: (t: number[]) => t.reduce((s, x) => s + x, 0),
    visible: [[[1, 2, 3]], [[]], [[-4, 10]]],
    hidden: () => times(3, () => [list(ri(1, 9))]),
    banned: ["sum", "reduce"],
  },
  {
    id: "maximum",
    level: "facile",
    py: "maximum",
    js: "maximum",
    params: ["tab"],
    enonce: "Renvoie le plus grand élément de tab (non vide), sans utiliser max.",
    ref: (t: number[]) => t.reduce((m, x) => (x > m ? x : m)),
    visible: [[[3, 9, 2]], [[-5, -2, -8]], [[7]]],
    hidden: () => times(3, () => [list(ri(1, 9), -60, 60)]),
    banned: ["max", "Math.max", "sorted", "sort"],
  },
  {
    id: "nb_pairs",
    level: "facile",
    py: "nb_pairs",
    js: "nbPairs",
    params: ["tab"],
    enonce: "Renvoie le nombre d'entiers pairs dans tab.",
    ref: (t: number[]) => t.filter((x) => x % 2 === 0).length,
    visible: [[[1, 2, 3, 4]], [[]], [[0, -2, 7]]],
    hidden: () => times(3, () => [list(ri(0, 10))]),
  },
  {
    id: "occurrences",
    level: "facile",
    py: "occurrences",
    js: "occurrences",
    params: ["caractere", "mot"],
    enonce: "Renvoie le nombre de fois où caractere apparaît dans mot.",
    ref: (c: string, m: string) => m.split("").filter((x) => x === c).length,
    visible: [["e", "sciences"], ["a", "mathdle"], ["z", ""]],
    hidden: () => times(3, () => ["abc"[ri(0, 2)], word(ri(3, 12), "abcd")]),
    banned: ["count"],
  },
  {
    id: "moyenne",
    level: "moyen",
    py: "moyenne",
    js: "moyenne",
    params: ["tab"],
    enonce: "Renvoie la moyenne des éléments de tab (non vide), sous forme de nombre décimal.",
    ref: (t: number[]) => t.reduce((s, x) => s + x, 0) / t.length,
    visible: [[[10, 12, 14]], [[5]], [[1, 2]]],
    hidden: () => times(3, () => [list(ri(1, 8), 0, 20)]),
    banned: ["mean", "statistics"],
  },
  {
    id: "inverser",
    level: "moyen",
    py: "inverser",
    js: "inverser",
    params: ["chaine"],
    enonce: "Renvoie chaine écrite à l'envers.",
    ref: (s: string) => s.split("").reverse().join(""),
    visible: [["bonjour"], [""], ["a"]],
    hidden: () => times(3, () => [word(ri(2, 10))]),
    banned: ["reversed", "reverse", "[::-1]"],
  },
  {
    id: "palindrome",
    level: "moyen",
    py: "est_palindrome",
    js: "estPalindrome",
    params: ["mot"],
    enonce: "Renvoie True (true en JS) si mot se lit pareil dans les deux sens, sinon False.",
    ref: (s: string) => s === s.split("").reverse().join(""),
    visible: [["radar"], ["mathdle"], [""]],
    hidden: () =>
      times(4, () => {
        const w = word(ri(1, 5), "abc");
        return [Math.random() < 0.5 ? w + w.split("").reverse().join("") : w + "x" + word(2, "abc")];
      }),
  },
  {
    id: "factorielle",
    level: "moyen",
    py: "factorielle",
    js: "factorielle",
    params: ["n"],
    enonce: "Renvoie n! = 1 × 2 × … × n (avec 0! = 1).",
    ref: (n: number) => {
      let r = 1;
      for (let i = 2; i <= n; i++) r *= i;
      return r;
    },
    visible: [[0], [1], [5]],
    hidden: () => times(3, () => [ri(2, 15)]),
    banned: ["factorial", "math.prod"],
  },
  {
    id: "indice",
    level: "moyen",
    py: "indice",
    js: "indice",
    params: ["tab", "x"],
    enonce: "Renvoie l'indice de la première apparition de x dans tab, ou -1 si x n'y est pas.",
    ref: (t: number[], x: number) => t.indexOf(x),
    visible: [[[4, 7, 7, 2], 7], [[1, 2, 3], 9], [[], 1]],
    hidden: () =>
      times(4, () => {
        const t = list(ri(1, 8), 0, 9);
        return [t, Math.random() < 0.7 ? t[ri(0, t.length - 1)] : 42];
      }),
    banned: ["index", "indexOf", "findIndex"],
  },
  {
    id: "fibonacci",
    level: "difficile",
    py: "fibonacci",
    js: "fibonacci",
    params: ["n"],
    enonce: "Renvoie le n-ième terme de Fibonacci : F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2). Doit rester rapide pour n = 40.",
    ref: (n: number) => {
      let a = 0;
      let b = 1;
      for (let i = 0; i < n; i++) [a, b] = [b, a + b];
      return a;
    },
    visible: [[0], [1], [10]],
    hidden: () => [[ri(15, 30)], [ri(31, 40)], [2]],
  },
  {
    id: "est_trie",
    level: "difficile",
    py: "est_trie",
    js: "estTrie",
    params: ["tab"],
    enonce: "Renvoie True si tab est trié dans l'ordre croissant (au sens large), sinon False.",
    ref: (t: number[]) => t.every((x, i) => i === 0 || t[i - 1] <= x),
    visible: [[[1, 2, 2, 5]], [[3, 1]], [[]]],
    hidden: () => times(4, () => [Math.random() < 0.5 ? sorted(list(ri(2, 8))) : list(ri(2, 8))]),
    banned: ["sorted", "sort"],
  },
  {
    id: "fusion",
    level: "difficile",
    py: "fusion",
    js: "fusion",
    params: ["t1", "t2"],
    enonce: "t1 et t2 sont triés. Renvoie un nouveau tableau trié contenant tous leurs éléments, sans utiliser de fonction de tri.",
    ref: (a: number[], b: number[]) => sorted([...a, ...b]),
    visible: [[[1, 4, 9], [2, 3, 10]], [[], [1, 2]], [[5], []]],
    hidden: () => times(3, () => [sorted(list(ri(0, 6))), sorted(list(ri(0, 6)))]),
    banned: ["sorted", "sort"],
  },
  {
    id: "voyelles",
    level: "difficile",
    py: "compte_voyelles",
    js: "compteVoyelles",
    params: ["phrase"],
    enonce: "Renvoie le nombre de voyelles (a, e, i, o, u, y, minuscules ou majuscules) dans phrase.",
    ref: (s: string) => s.split("").filter((c) => "aeiouyAEIOUY".includes(c)).length,
    visible: [["Mathdle"], [""], ["AEIOU y"]],
    hidden: () => times(3, () => [word(ri(4, 14), "abcdeiouyxzAEB ")]),
  },
];

export const STARTER = {
  python: (e: Exercise) => `def ${e.py}(${e.params.join(", ")}):\n    # ${e.enonce}\n    pass\n`,
  javascript: (e: Exercise) => `function ${e.js}(${e.params.join(", ")}) {\n  // ${e.enonce}\n}\n`,
};

// Détecte un appel à une fonction native interdite (hors commentaires)
export function bannedUsed(e: Exercise, code: string, lang: "python" | "javascript"): string | null {
  if (!e.banned) return null;
  const clean = code
    .split("\n")
    .map((l) => l.replace(lang === "python" ? /#.*$/ : /\/\/.*$/, ""))
    .join("\n");
  for (const b of e.banned) {
    if (b.startsWith("[")) {
      if (clean.includes(b)) return b;
      continue;
    }
    const re = new RegExp(`(^|[^\\w])${b.replace(".", "\\.")}\\s*\\(`);
    if (re.test(clean)) return b;
    if (lang === "python" && b === "statistics" && /import\s+statistics|from\s+statistics/.test(clean)) return b;
  }
  return null;
}
