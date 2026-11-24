// Banque d'exercices de programmation, façon "Impossible" (comparaison des
// tokens par position, pas de vraie exécution — Java/C++ ne peuvent de toute
// façon pas s'exécuter dans le navigateur sans serveur). Même exercice
// traduit dans les 4 langages, pour que la logique à trouver soit identique.
//
// Deux façons de jouer un même exercice (voir useProgPageBlanche /
// useProgATrous) :
// - "Page blanche" : deviner toute la séquence de tokens, comme le mode
//   Impossible des maths ou les Formules physiques.
// - "Extrait à trous" : le squelette (mots-clés, ponctuation) est déjà
//   affiché, seuls les tokens "intéressants" (identifiants, valeurs,
//   opérateurs) sont à deviner — voir isBlankable().

export type ProgLang = "javascript" | "python" | "java" | "cpp";
export type ProgLevel = "facile" | "moyen" | "difficile";

export interface ProgExercise {
  titre: string;
  enonce: string;
  tokens: string[];
  keys: string[]; // ponctuation / opérateurs
  extraKeys: string[]; // mots-clés / identifiants (hors chiffres, toujours dispo)
}

export const PROG_LANG_LABELS: Record<ProgLang, string> = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
};

// Tokens jamais mis à trou : ponctuation structurelle + mots-clés de
// contrôle. Tout le reste (noms, valeurs, opérateurs) devient un trou.
const ALWAYS_VISIBLE = new Set([
  "(", ")", "{", "}", ",", ";", ":",
  "function", "def", "return", "if", "for", "while", "in", "range", "boolean", "bool", "int", "let",
  "String", "string",
]);

export function isBlankable(token: string): boolean {
  return !ALWAYS_VISIBLE.has(token);
}

export const PROG_BANK: Record<ProgLang, Record<ProgLevel, ProgExercise[]>> = {
  javascript: {
    facile: [
      {
        titre: "Somme de deux nombres",
        enonce: "Fonction qui prend deux nombres a et b et renvoie leur somme.",
        tokens: ["function", "somme", "(", "a", ",", "b", ")", "{", "return", "a", "+", "b", ";", "}"],
        keys: ["(", ")", "{", "}", ",", ";", "+"],
        extraKeys: ["function", "somme", "a", "b", "return"],
      },
      {
        titre: "Nombre pair",
        enonce: "Fonction qui renvoie vrai si n est pair, faux sinon.",
        tokens: ["function", "estPair", "(", "n", ")", "{", "return", "n", "%", "2", "===", "0", ";", "}"],
        keys: ["(", ")", "{", "}", ";", "%", "==="],
        extraKeys: ["function", "estPair", "n", "return"],
      },
      {
        titre: "Carré d'un nombre",
        enonce: "Fonction qui renvoie le carré du nombre n.",
        tokens: ["function", "carre", "(", "n", ")", "{", "return", "n", "*", "n", ";", "}"],
        keys: ["(", ")", "{", "}", ";", "*"],
        extraKeys: ["function", "carre", "n", "return"],
      },
      {
        titre: "Doubler un nombre",
        enonce: "Fonction qui renvoie le double du nombre n.",
        tokens: ["function", "doubler", "(", "n", ")", "{", "return", "n", "*", "2", ";", "}"],
        keys: ["(", ")", "{", "*", ";", "}"],
        extraKeys: ["function", "doubler", "n", "return"],
      },
      {
        titre: "Nombre positif",
        enonce: "Fonction qui renvoie vrai si n est strictement positif, faux sinon.",
        tokens: ["function", "estPositif", "(", "n", ")", "{", "return", "n", ">", "0", ";", "}"],
        keys: ["(", ")", "{", ">", ";", "}"],
        extraKeys: ["function", "estPositif", "n", "return"],
      },
      {
        titre: "Périmètre d'un rectangle",
        enonce: "Fonction qui renvoie le périmètre d'un rectangle de longueur l et de hauteur h.",
        tokens: ["function", "perimetre", "(", "l", ",", "h", ")", "{", "return", "2", "*", "(", "l", "+", "h", ")", ";", "}"],
        keys: ["(", ",", ")", "{", "*", "+", ";", "}"],
        extraKeys: ["function", "perimetre", "l", "h", "return"],
      },
    ],
    moyen: [
      {
        titre: "Maximum de deux valeurs",
        enonce: "Fonction qui renvoie le plus grand des deux nombres a et b.",
        tokens: [
          "function", "maximum", "(", "a", ",", "b", ")", "{",
          "if", "(", "a", ">", "b", ")", "{", "return", "a", ";", "}",
          "return", "b", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ",", ";", ">"],
        extraKeys: ["function", "maximum", "a", "b", "if", "return"],
      },
      {
        titre: "Minimum de deux valeurs",
        enonce: "Fonction qui renvoie le plus petit des deux nombres a et b.",
        tokens: [
          "function", "minimum", "(", "a", ",", "b", ")", "{",
          "if", "(", "a", "<", "b", ")", "{", "return", "a", ";", "}",
          "return", "b", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ",", ";", "<"],
        extraKeys: ["function", "minimum", "a", "b", "if", "return"],
      },
      {
        titre: "Somme de 1 à n",
        enonce: "Fonction qui renvoie la somme des entiers de 1 à n.",
        tokens: [
          "function", "sommeN", "(", "n", ")", "{",
          "let", "total", "=", "0", ";",
          "for", "(", "let", "i", "=", "1", ";", "i", "<=", "n", ";", "i", "++", ")", "{",
          "total", "=", "total", "+", "i", ";",
          "}",
          "return", "total", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "=", "<=", "++", "+"],
        extraKeys: ["function", "sommeN", "n", "let", "total", "for", "i", "return"],
      },
      {
        titre: "Valeur absolue",
        enonce: "Fonction qui renvoie la valeur absolue de n (sans utiliser de fonction toute faite).",
        tokens: ["function", "valeurAbsolue", "(", "n", ")", "{", "if", "(", "n", "<", "0", ")", "{", "return", "-", "n", ";", "}", "return", "n", ";", "}"],
        keys: ["(", ")", "{", "<", "-", ";", "}"],
        extraKeys: ["function", "valeurAbsolue", "n", "if", "return"],
      },
      {
        titre: "Factorielle",
        enonce: "Fonction qui renvoie n! (le produit des entiers de 1 à n).",
        tokens: ["function", "factorielle", "(", "n", ")", "{", "let", "resultat", "=", "1", ";", "for", "(", "let", "i", "=", "2", ";", "i", "<=", "n", ";", "i", "++", ")", "{", "resultat", "=", "resultat", "*", "i", ";", "}", "return", "resultat", ";", "}"],
        keys: ["(", ")", "{", "=", ";", "<=", "++", "*", "}"],
        extraKeys: ["function", "factorielle", "n", "let", "resultat", "for", "i", "return"],
      },
      {
        titre: "Puissance",
        enonce: "Fonction qui renvoie a puissance b (b entier positif), avec une boucle.",
        tokens: ["function", "puissance", "(", "a", ",", "b", ")", "{", "let", "resultat", "=", "1", ";", "for", "(", "let", "i", "=", "0", ";", "i", "<", "b", ";", "i", "++", ")", "{", "resultat", "=", "resultat", "*", "a", ";", "}", "return", "resultat", ";", "}"],
        keys: ["(", ",", ")", "{", "=", ";", "<", "++", "*", "}"],
        extraKeys: ["function", "puissance", "a", "b", "let", "resultat", "for", "i", "return"],
      },
    ],
    difficile: [
      {
        titre: "Nombre premier",
        enonce: "Fonction qui renvoie vrai si n est un nombre premier, faux sinon.",
        tokens: [
          "function", "estPremier", "(", "n", ")", "{",
          "if", "(", "n", "<", "2", ")", "{", "return", "false", ";", "}",
          "for", "(", "let", "i", "=", "2", ";", "i", "<", "n", ";", "i", "++", ")", "{",
          "if", "(", "n", "%", "i", "===", "0", ")", "{", "return", "false", ";", "}",
          "}",
          "return", "true", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "<", "=", "%", "===", "++"],
        extraKeys: ["function", "estPremier", "n", "i", "if", "for", "let", "return", "false", "true"],
      },
      {
        titre: "FizzBuzz",
        enonce: 'Fonction qui renvoie "Fizz" si n est multiple de 3, "Buzz" si multiple de 5, "FizzBuzz" si multiple des deux, sinon n en texte.',
        tokens: [
          "function", "fizzbuzz", "(", "n", ")", "{",
          "if", "(", "n", "%", "1", "5", "===", "0", ")", "{", "return", '"FizzBuzz"', ";", "}",
          "if", "(", "n", "%", "3", "===", "0", ")", "{", "return", '"Fizz"', ";", "}",
          "if", "(", "n", "%", "5", "===", "0", ")", "{", "return", '"Buzz"', ";", "}",
          "return", "String", "(", "n", ")", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "%", "==="],
        extraKeys: ["function", "fizzbuzz", "n", "if", "return", "String", '"FizzBuzz"', '"Fizz"', '"Buzz"'],
      },
      {
        titre: "Fibonacci",
        enonce: "Fonction qui renvoie le n-ième terme de la suite de Fibonacci (0, 1, 1, 2, 3, 5...).",
        tokens: [
          "function", "fibonacci", "(", "n", ")", "{",
          "let", "a", "=", "0", ";",
          "let", "b", "=", "1", ";",
          "for", "(", "let", "i", "=", "0", ";", "i", "<", "n", ";", "i", "++", ")", "{",
          "let", "t", "=", "a", "+", "b", ";",
          "a", "=", "b", ";",
          "b", "=", "t", ";",
          "}",
          "return", "a", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "=", "<", "++", "+"],
        extraKeys: ["function", "fibonacci", "n", "let", "a", "b", "for", "i", "t", "return"],
      },
      {
        titre: "PGCD (Euclide)",
        enonce: "Fonction qui renvoie le plus grand diviseur commun de a et b avec l'algorithme d'Euclide.",
        tokens: ["function", "pgcd", "(", "a", ",", "b", ")", "{", "while", "(", "b", "!==", "0", ")", "{", "let", "r", "=", "a", "%", "b", ";", "a", "=", "b", ";", "b", "=", "r", ";", "}", "return", "a", ";", "}"],
        keys: ["(", ",", ")", "{", "!==", "=", "%", ";", "}"],
        extraKeys: ["function", "pgcd", "a", "b", "while", "let", "r", "return"],
      },
      {
        titre: "Somme des chiffres",
        enonce: "Fonction qui renvoie la somme des chiffres de l'entier positif n (ex : 123 → 6).",
        tokens: ["function", "sommeChiffres", "(", "n", ")", "{", "let", "s", "=", "0", ";", "while", "(", "n", ">", "0", ")", "{", "s", "=", "s", "+", "n", "%", "1", "0", ";", "n", "=", "Math.floor", "(", "n", "/", "1", "0", ")", ";", "}", "return", "s", ";", "}"],
        keys: ["(", ")", "{", "=", ";", ">", "+", "%", "/", "}"],
        extraKeys: ["function", "sommeChiffres", "n", "let", "s", "while", "Math.floor", "return"],
      },
      {
        titre: "Nombre de diviseurs",
        enonce: "Fonction qui renvoie le nombre de diviseurs de n (ex : 6 → 4, car 1, 2, 3 et 6).",
        tokens: ["function", "nombreDiviseurs", "(", "n", ")", "{", "let", "compteur", "=", "0", ";", "for", "(", "let", "i", "=", "1", ";", "i", "<=", "n", ";", "i", "++", ")", "{", "if", "(", "n", "%", "i", "===", "0", ")", "{", "compteur", "=", "compteur", "+", "1", ";", "}", "}", "return", "compteur", ";", "}"],
        keys: ["(", ")", "{", "=", ";", "<=", "++", "%", "===", "+", "}"],
        extraKeys: ["function", "nombreDiviseurs", "n", "let", "compteur", "for", "i", "if", "return"],
      },
    ],
  },
  python: {
    facile: [
      {
        titre: "Somme de deux nombres",
        enonce: "Fonction qui prend deux nombres a et b et renvoie leur somme.",
        tokens: ["def", "somme", "(", "a", ",", "b", ")", ":", "return", "a", "+", "b"],
        keys: ["(", ")", ":", ",", "+"],
        extraKeys: ["def", "somme", "a", "b", "return"],
      },
      {
        titre: "Nombre pair",
        enonce: "Fonction qui renvoie vrai si n est pair, faux sinon.",
        tokens: ["def", "estPair", "(", "n", ")", ":", "return", "n", "%", "2", "==", "0"],
        keys: ["(", ")", ":", "%", "=="],
        extraKeys: ["def", "estPair", "n", "return"],
      },
      {
        titre: "Carré d'un nombre",
        enonce: "Fonction qui renvoie le carré du nombre n.",
        tokens: ["def", "carre", "(", "n", ")", ":", "return", "n", "*", "n"],
        keys: ["(", ")", ":", "*"],
        extraKeys: ["def", "carre", "n", "return"],
      },
      {
        titre: "Doubler un nombre",
        enonce: "Fonction qui renvoie le double du nombre n.",
        tokens: ["def", "doubler", "(", "n", ")", ":", "return", "n", "*", "2"],
        keys: ["(", ")", ":", "*"],
        extraKeys: ["def", "doubler", "n", "return"],
      },
      {
        titre: "Nombre positif",
        enonce: "Fonction qui renvoie vrai si n est strictement positif, faux sinon.",
        tokens: ["def", "estPositif", "(", "n", ")", ":", "return", "n", ">", "0"],
        keys: ["(", ")", ":", ">"],
        extraKeys: ["def", "estPositif", "n", "return"],
      },
      {
        titre: "Périmètre d'un rectangle",
        enonce: "Fonction qui renvoie le périmètre d'un rectangle de longueur l et de hauteur h.",
        tokens: ["def", "perimetre", "(", "l", ",", "h", ")", ":", "return", "2", "*", "(", "l", "+", "h", ")"],
        keys: ["(", ",", ")", ":", "*", "+"],
        extraKeys: ["def", "perimetre", "l", "h", "return"],
      },
    ],
    moyen: [
      {
        titre: "Maximum de deux valeurs",
        enonce: "Fonction qui renvoie le plus grand des deux nombres a et b.",
        tokens: [
          "def", "maximum", "(", "a", ",", "b", ")", ":",
          "if", "a", ">", "b", ":", "return", "a",
          "return", "b",
        ],
        keys: ["(", ")", ":", ",", ">"],
        extraKeys: ["def", "maximum", "a", "b", "if", "return"],
      },
      {
        titre: "Minimum de deux valeurs",
        enonce: "Fonction qui renvoie le plus petit des deux nombres a et b.",
        tokens: [
          "def", "minimum", "(", "a", ",", "b", ")", ":",
          "if", "a", "<", "b", ":", "return", "a",
          "return", "b",
        ],
        keys: ["(", ")", ":", ",", "<"],
        extraKeys: ["def", "minimum", "a", "b", "if", "return"],
      },
      {
        titre: "Somme de 1 à n",
        enonce: "Fonction qui renvoie la somme des entiers de 1 à n.",
        tokens: [
          "def", "sommeN", "(", "n", ")", ":",
          "total", "=", "0",
          "for", "i", "in", "range", "(", "1", ",", "n", "+", "1", ")", ":",
          "total", "=", "total", "+", "i",
          "return", "total",
        ],
        keys: ["(", ")", ":", ",", "=", "+"],
        extraKeys: ["def", "sommeN", "n", "total", "for", "i", "in", "range", "return"],
      },
      {
        titre: "Valeur absolue",
        enonce: "Fonction qui renvoie la valeur absolue de n (sans utiliser de fonction toute faite).",
        tokens: ["def", "valeurAbsolue", "(", "n", ")", ":", "if", "n", "<", "0", ":", "return", "-", "n", "return", "n"],
        keys: ["(", ")", ":", "<", "-"],
        extraKeys: ["def", "valeurAbsolue", "n", "if", "return"],
      },
      {
        titre: "Factorielle",
        enonce: "Fonction qui renvoie n! (le produit des entiers de 1 à n).",
        tokens: ["def", "factorielle", "(", "n", ")", ":", "resultat", "=", "1", "for", "i", "in", "range", "(", "2", ",", "n", "+", "1", ")", ":", "resultat", "=", "resultat", "*", "i", "return", "resultat"],
        keys: ["(", ")", ":", "=", ",", "+", "*"],
        extraKeys: ["def", "factorielle", "n", "resultat", "for", "i", "in", "range", "return"],
      },
      {
        titre: "Puissance",
        enonce: "Fonction qui renvoie a puissance b (b entier positif), avec une boucle.",
        tokens: ["def", "puissance", "(", "a", ",", "b", ")", ":", "resultat", "=", "1", "for", "i", "in", "range", "(", "b", ")", ":", "resultat", "=", "resultat", "*", "a", "return", "resultat"],
        keys: ["(", ",", ")", ":", "=", "*"],
        extraKeys: ["def", "puissance", "a", "b", "resultat", "for", "i", "in", "range", "return"],
      },
    ],
    difficile: [
      {
        titre: "Nombre premier",
        enonce: "Fonction qui renvoie vrai si n est un nombre premier, faux sinon.",
        tokens: [
          "def", "estPremier", "(", "n", ")", ":",
          "if", "n", "<", "2", ":", "return", "False",
          "for", "i", "in", "range", "(", "2", ",", "n", ")", ":",
          "if", "n", "%", "i", "==", "0", ":", "return", "False",
          "return", "True",
        ],
        keys: ["(", ")", ":", ",", "<", "%", "=="],
        extraKeys: ["def", "estPremier", "n", "i", "if", "for", "in", "range", "return", "False", "True"],
      },
      {
        titre: "FizzBuzz",
        enonce: 'Fonction qui renvoie "Fizz" si n est multiple de 3, "Buzz" si multiple de 5, "FizzBuzz" si multiple des deux, sinon n en texte.',
        tokens: [
          "def", "fizzbuzz", "(", "n", ")", ":",
          "if", "n", "%", "1", "5", "==", "0", ":", "return", '"FizzBuzz"',
          "if", "n", "%", "3", "==", "0", ":", "return", '"Fizz"',
          "if", "n", "%", "5", "==", "0", ":", "return", '"Buzz"',
          "return", "str", "(", "n", ")",
        ],
        keys: ["(", ")", ":", "%", "=="],
        extraKeys: ["def", "fizzbuzz", "n", "if", "return", "str", '"FizzBuzz"', '"Fizz"', '"Buzz"'],
      },
      {
        titre: "Fibonacci",
        enonce: "Fonction qui renvoie le n-ième terme de la suite de Fibonacci (0, 1, 1, 2, 3, 5...).",
        tokens: [
          "def", "fibonacci", "(", "n", ")", ":",
          "a", "=", "0",
          "b", "=", "1",
          "for", "i", "in", "range", "(", "n", ")", ":",
          "t", "=", "a", "+", "b",
          "a", "=", "b",
          "b", "=", "t",
          "return", "a",
        ],
        keys: ["(", ")", ":", "=", "+"],
        extraKeys: ["def", "fibonacci", "n", "a", "b", "for", "i", "in", "range", "t", "return"],
      },
      {
        titre: "PGCD (Euclide)",
        enonce: "Fonction qui renvoie le plus grand diviseur commun de a et b avec l'algorithme d'Euclide.",
        tokens: ["def", "pgcd", "(", "a", ",", "b", ")", ":", "while", "b", "!=", "0", ":", "r", "=", "a", "%", "b", "a", "=", "b", "b", "=", "r", "return", "a"],
        keys: ["(", ",", ")", ":", "!=", "=", "%"],
        extraKeys: ["def", "pgcd", "a", "b", "while", "r", "return"],
      },
      {
        titre: "Somme des chiffres",
        enonce: "Fonction qui renvoie la somme des chiffres de l'entier positif n (ex : 123 → 6).",
        tokens: ["def", "sommeChiffres", "(", "n", ")", ":", "s", "=", "0", "while", "n", ">", "0", ":", "s", "=", "s", "+", "n", "%", "1", "0", "n", "=", "n", "//", "1", "0", "return", "s"],
        keys: ["(", ")", ":", "=", ">", "+", "%", "//"],
        extraKeys: ["def", "sommeChiffres", "n", "s", "while", "return"],
      },
      {
        titre: "Nombre de diviseurs",
        enonce: "Fonction qui renvoie le nombre de diviseurs de n (ex : 6 → 4, car 1, 2, 3 et 6).",
        tokens: ["def", "nombreDiviseurs", "(", "n", ")", ":", "compteur", "=", "0", "for", "i", "in", "range", "(", "1", ",", "n", "+", "1", ")", ":", "if", "n", "%", "i", "==", "0", ":", "compteur", "=", "compteur", "+", "1", "return", "compteur"],
        keys: ["(", ")", ":", "=", ",", "+", "%", "=="],
        extraKeys: ["def", "nombreDiviseurs", "n", "compteur", "for", "i", "in", "range", "if", "return"],
      },
    ],
  },
  java: {
    facile: [
      {
        titre: "Somme de deux nombres",
        enonce: "Fonction qui prend deux nombres a et b et renvoie leur somme.",
        tokens: ["int", "somme", "(", "int", "a", ",", "int", "b", ")", "{", "return", "a", "+", "b", ";", "}"],
        keys: ["(", ")", "{", "}", ",", ";", "+"],
        extraKeys: ["int", "somme", "a", "b", "return"],
      },
      {
        titre: "Nombre pair",
        enonce: "Fonction qui renvoie vrai si n est pair, faux sinon.",
        tokens: ["boolean", "estPair", "(", "int", "n", ")", "{", "return", "n", "%", "2", "==", "0", ";", "}"],
        keys: ["(", ")", "{", "}", ";", "%", "=="],
        extraKeys: ["boolean", "estPair", "int", "n", "return"],
      },
      {
        titre: "Carré d'un nombre",
        enonce: "Fonction qui renvoie le carré du nombre n.",
        tokens: ["int", "carre", "(", "int", "n", ")", "{", "return", "n", "*", "n", ";", "}"],
        keys: ["(", ")", "{", "}", ";", "*"],
        extraKeys: ["int", "carre", "n", "return"],
      },
      {
        titre: "Doubler un nombre",
        enonce: "Fonction qui renvoie le double du nombre n.",
        tokens: ["int", "doubler", "(", "int", "n", ")", "{", "return", "n", "*", "2", ";", "}"],
        keys: ["(", ")", "{", "*", ";", "}"],
        extraKeys: ["int", "doubler", "n", "return"],
      },
      {
        titre: "Nombre positif",
        enonce: "Fonction qui renvoie vrai si n est strictement positif, faux sinon.",
        tokens: ["boolean", "estPositif", "(", "int", "n", ")", "{", "return", "n", ">", "0", ";", "}"],
        keys: ["(", ")", "{", ">", ";", "}"],
        extraKeys: ["boolean", "estPositif", "int", "n", "return"],
      },
      {
        titre: "Périmètre d'un rectangle",
        enonce: "Fonction qui renvoie le périmètre d'un rectangle de longueur l et de hauteur h.",
        tokens: ["int", "perimetre", "(", "int", "l", ",", "int", "h", ")", "{", "return", "2", "*", "(", "l", "+", "h", ")", ";", "}"],
        keys: ["(", ",", ")", "{", "*", "+", ";", "}"],
        extraKeys: ["int", "perimetre", "l", "h", "return"],
      },
    ],
    moyen: [
      {
        titre: "Maximum de deux valeurs",
        enonce: "Fonction qui renvoie le plus grand des deux nombres a et b.",
        tokens: [
          "int", "maximum", "(", "int", "a", ",", "int", "b", ")", "{",
          "if", "(", "a", ">", "b", ")", "{", "return", "a", ";", "}",
          "return", "b", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ",", ";", ">"],
        extraKeys: ["int", "maximum", "a", "b", "if", "return"],
      },
      {
        titre: "Minimum de deux valeurs",
        enonce: "Fonction qui renvoie le plus petit des deux nombres a et b.",
        tokens: [
          "int", "minimum", "(", "int", "a", ",", "int", "b", ")", "{",
          "if", "(", "a", "<", "b", ")", "{", "return", "a", ";", "}",
          "return", "b", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ",", ";", "<"],
        extraKeys: ["int", "minimum", "a", "b", "if", "return"],
      },
      {
        titre: "Somme de 1 à n",
        enonce: "Fonction qui renvoie la somme des entiers de 1 à n.",
        tokens: [
          "int", "sommeN", "(", "int", "n", ")", "{",
          "int", "total", "=", "0", ";",
          "for", "(", "int", "i", "=", "1", ";", "i", "<=", "n", ";", "i", "++", ")", "{",
          "total", "=", "total", "+", "i", ";",
          "}",
          "return", "total", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "=", "<=", "++", "+"],
        extraKeys: ["int", "sommeN", "n", "total", "for", "i", "return"],
      },
      {
        titre: "Valeur absolue",
        enonce: "Fonction qui renvoie la valeur absolue de n (sans utiliser de fonction toute faite).",
        tokens: ["int", "valeurAbsolue", "(", "int", "n", ")", "{", "if", "(", "n", "<", "0", ")", "{", "return", "-", "n", ";", "}", "return", "n", ";", "}"],
        keys: ["(", ")", "{", "<", "-", ";", "}"],
        extraKeys: ["int", "valeurAbsolue", "n", "if", "return"],
      },
      {
        titre: "Factorielle",
        enonce: "Fonction qui renvoie n! (le produit des entiers de 1 à n).",
        tokens: ["int", "factorielle", "(", "int", "n", ")", "{", "int", "resultat", "=", "1", ";", "for", "(", "int", "i", "=", "2", ";", "i", "<=", "n", ";", "i", "++", ")", "{", "resultat", "=", "resultat", "*", "i", ";", "}", "return", "resultat", ";", "}"],
        keys: ["(", ")", "{", "=", ";", "<=", "++", "*", "}"],
        extraKeys: ["int", "factorielle", "n", "resultat", "for", "i", "return"],
      },
      {
        titre: "Puissance",
        enonce: "Fonction qui renvoie a puissance b (b entier positif), avec une boucle.",
        tokens: ["int", "puissance", "(", "int", "a", ",", "int", "b", ")", "{", "int", "resultat", "=", "1", ";", "for", "(", "int", "i", "=", "0", ";", "i", "<", "b", ";", "i", "++", ")", "{", "resultat", "=", "resultat", "*", "a", ";", "}", "return", "resultat", ";", "}"],
        keys: ["(", ",", ")", "{", "=", ";", "<", "++", "*", "}"],
        extraKeys: ["int", "puissance", "a", "b", "resultat", "for", "i", "return"],
      },
    ],
    difficile: [
      {
        titre: "Nombre premier",
        enonce: "Fonction qui renvoie vrai si n est un nombre premier, faux sinon.",
        tokens: [
          "boolean", "estPremier", "(", "int", "n", ")", "{",
          "if", "(", "n", "<", "2", ")", "{", "return", "false", ";", "}",
          "for", "(", "int", "i", "=", "2", ";", "i", "<", "n", ";", "i", "++", ")", "{",
          "if", "(", "n", "%", "i", "==", "0", ")", "{", "return", "false", ";", "}",
          "}",
          "return", "true", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "<", "=", "%", "==", "++"],
        extraKeys: ["boolean", "estPremier", "int", "n", "i", "if", "for", "return", "false", "true"],
      },
      {
        titre: "FizzBuzz",
        enonce: 'Fonction qui renvoie "Fizz" si n est multiple de 3, "Buzz" si multiple de 5, "FizzBuzz" si multiple des deux, sinon n en texte.',
        tokens: [
          "String", "fizzbuzz", "(", "int", "n", ")", "{",
          "if", "(", "n", "%", "1", "5", "==", "0", ")", "{", "return", '"FizzBuzz"', ";", "}",
          "if", "(", "n", "%", "3", "==", "0", ")", "{", "return", '"Fizz"', ";", "}",
          "if", "(", "n", "%", "5", "==", "0", ")", "{", "return", '"Buzz"', ";", "}",
          "return", "String", ".", "valueOf", "(", "n", ")", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "%", "==", "."],
        extraKeys: ["String", "fizzbuzz", "int", "n", "if", "return", "valueOf", '"FizzBuzz"', '"Fizz"', '"Buzz"'],
      },
      {
        titre: "Fibonacci",
        enonce: "Fonction qui renvoie le n-ième terme de la suite de Fibonacci (0, 1, 1, 2, 3, 5...).",
        tokens: [
          "int", "fibonacci", "(", "int", "n", ")", "{",
          "int", "a", "=", "0", ";",
          "int", "b", "=", "1", ";",
          "for", "(", "int", "i", "=", "0", ";", "i", "<", "n", ";", "i", "++", ")", "{",
          "int", "t", "=", "a", "+", "b", ";",
          "a", "=", "b", ";",
          "b", "=", "t", ";",
          "}",
          "return", "a", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "=", "<", "++", "+"],
        extraKeys: ["int", "fibonacci", "n", "a", "b", "for", "i", "t", "return"],
      },
      {
        titre: "PGCD (Euclide)",
        enonce: "Fonction qui renvoie le plus grand diviseur commun de a et b avec l'algorithme d'Euclide.",
        tokens: ["int", "pgcd", "(", "int", "a", ",", "int", "b", ")", "{", "while", "(", "b", "!=", "0", ")", "{", "int", "r", "=", "a", "%", "b", ";", "a", "=", "b", ";", "b", "=", "r", ";", "}", "return", "a", ";", "}"],
        keys: ["(", ",", ")", "{", "!=", "=", "%", ";", "}"],
        extraKeys: ["int", "pgcd", "a", "b", "while", "r", "return"],
      },
      {
        titre: "Somme des chiffres",
        enonce: "Fonction qui renvoie la somme des chiffres de l'entier positif n (ex : 123 → 6).",
        tokens: ["int", "sommeChiffres", "(", "int", "n", ")", "{", "int", "s", "=", "0", ";", "while", "(", "n", ">", "0", ")", "{", "s", "=", "s", "+", "n", "%", "1", "0", ";", "n", "=", "n", "/", "1", "0", ";", "}", "return", "s", ";", "}"],
        keys: ["(", ")", "{", "=", ";", ">", "+", "%", "/", "}"],
        extraKeys: ["int", "sommeChiffres", "n", "s", "while", "return"],
      },
      {
        titre: "Nombre de diviseurs",
        enonce: "Fonction qui renvoie le nombre de diviseurs de n (ex : 6 → 4, car 1, 2, 3 et 6).",
        tokens: ["int", "nombreDiviseurs", "(", "int", "n", ")", "{", "int", "compteur", "=", "0", ";", "for", "(", "int", "i", "=", "1", ";", "i", "<=", "n", ";", "i", "++", ")", "{", "if", "(", "n", "%", "i", "==", "0", ")", "{", "compteur", "=", "compteur", "+", "1", ";", "}", "}", "return", "compteur", ";", "}"],
        keys: ["(", ")", "{", "=", ";", "<=", "++", "%", "==", "+", "}"],
        extraKeys: ["int", "nombreDiviseurs", "n", "compteur", "for", "i", "if", "return"],
      },
    ],
  },
  cpp: {
    facile: [
      {
        titre: "Somme de deux nombres",
        enonce: "Fonction qui prend deux nombres a et b et renvoie leur somme.",
        tokens: ["int", "somme", "(", "int", "a", ",", "int", "b", ")", "{", "return", "a", "+", "b", ";", "}"],
        keys: ["(", ")", "{", "}", ",", ";", "+"],
        extraKeys: ["int", "somme", "a", "b", "return"],
      },
      {
        titre: "Nombre pair",
        enonce: "Fonction qui renvoie vrai si n est pair, faux sinon.",
        tokens: ["bool", "estPair", "(", "int", "n", ")", "{", "return", "n", "%", "2", "==", "0", ";", "}"],
        keys: ["(", ")", "{", "}", ";", "%", "=="],
        extraKeys: ["bool", "estPair", "int", "n", "return"],
      },
      {
        titre: "Carré d'un nombre",
        enonce: "Fonction qui renvoie le carré du nombre n.",
        tokens: ["int", "carre", "(", "int", "n", ")", "{", "return", "n", "*", "n", ";", "}"],
        keys: ["(", ")", "{", "}", ";", "*"],
        extraKeys: ["int", "carre", "n", "return"],
      },
      {
        titre: "Doubler un nombre",
        enonce: "Fonction qui renvoie le double du nombre n.",
        tokens: ["int", "doubler", "(", "int", "n", ")", "{", "return", "n", "*", "2", ";", "}"],
        keys: ["(", ")", "{", "*", ";", "}"],
        extraKeys: ["int", "doubler", "n", "return"],
      },
      {
        titre: "Nombre positif",
        enonce: "Fonction qui renvoie vrai si n est strictement positif, faux sinon.",
        tokens: ["bool", "estPositif", "(", "int", "n", ")", "{", "return", "n", ">", "0", ";", "}"],
        keys: ["(", ")", "{", ">", ";", "}"],
        extraKeys: ["bool", "estPositif", "int", "n", "return"],
      },
      {
        titre: "Périmètre d'un rectangle",
        enonce: "Fonction qui renvoie le périmètre d'un rectangle de longueur l et de hauteur h.",
        tokens: ["int", "perimetre", "(", "int", "l", ",", "int", "h", ")", "{", "return", "2", "*", "(", "l", "+", "h", ")", ";", "}"],
        keys: ["(", ",", ")", "{", "*", "+", ";", "}"],
        extraKeys: ["int", "perimetre", "l", "h", "return"],
      },
    ],
    moyen: [
      {
        titre: "Maximum de deux valeurs",
        enonce: "Fonction qui renvoie le plus grand des deux nombres a et b.",
        tokens: [
          "int", "maximum", "(", "int", "a", ",", "int", "b", ")", "{",
          "if", "(", "a", ">", "b", ")", "{", "return", "a", ";", "}",
          "return", "b", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ",", ";", ">"],
        extraKeys: ["int", "maximum", "a", "b", "if", "return"],
      },
      {
        titre: "Minimum de deux valeurs",
        enonce: "Fonction qui renvoie le plus petit des deux nombres a et b.",
        tokens: [
          "int", "minimum", "(", "int", "a", ",", "int", "b", ")", "{",
          "if", "(", "a", "<", "b", ")", "{", "return", "a", ";", "}",
          "return", "b", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ",", ";", "<"],
        extraKeys: ["int", "minimum", "a", "b", "if", "return"],
      },
      {
        titre: "Somme de 1 à n",
        enonce: "Fonction qui renvoie la somme des entiers de 1 à n.",
        tokens: [
          "int", "sommeN", "(", "int", "n", ")", "{",
          "int", "total", "=", "0", ";",
          "for", "(", "int", "i", "=", "1", ";", "i", "<=", "n", ";", "i", "++", ")", "{",
          "total", "=", "total", "+", "i", ";",
          "}",
          "return", "total", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "=", "<=", "++", "+"],
        extraKeys: ["int", "sommeN", "n", "total", "for", "i", "return"],
      },
      {
        titre: "Valeur absolue",
        enonce: "Fonction qui renvoie la valeur absolue de n (sans utiliser de fonction toute faite).",
        tokens: ["int", "valeurAbsolue", "(", "int", "n", ")", "{", "if", "(", "n", "<", "0", ")", "{", "return", "-", "n", ";", "}", "return", "n", ";", "}"],
        keys: ["(", ")", "{", "<", "-", ";", "}"],
        extraKeys: ["int", "valeurAbsolue", "n", "if", "return"],
      },
      {
        titre: "Factorielle",
        enonce: "Fonction qui renvoie n! (le produit des entiers de 1 à n).",
        tokens: ["int", "factorielle", "(", "int", "n", ")", "{", "int", "resultat", "=", "1", ";", "for", "(", "int", "i", "=", "2", ";", "i", "<=", "n", ";", "i", "++", ")", "{", "resultat", "=", "resultat", "*", "i", ";", "}", "return", "resultat", ";", "}"],
        keys: ["(", ")", "{", "=", ";", "<=", "++", "*", "}"],
        extraKeys: ["int", "factorielle", "n", "resultat", "for", "i", "return"],
      },
      {
        titre: "Puissance",
        enonce: "Fonction qui renvoie a puissance b (b entier positif), avec une boucle.",
        tokens: ["int", "puissance", "(", "int", "a", ",", "int", "b", ")", "{", "int", "resultat", "=", "1", ";", "for", "(", "int", "i", "=", "0", ";", "i", "<", "b", ";", "i", "++", ")", "{", "resultat", "=", "resultat", "*", "a", ";", "}", "return", "resultat", ";", "}"],
        keys: ["(", ",", ")", "{", "=", ";", "<", "++", "*", "}"],
        extraKeys: ["int", "puissance", "a", "b", "resultat", "for", "i", "return"],
      },
    ],
    difficile: [
      {
        titre: "Nombre premier",
        enonce: "Fonction qui renvoie vrai si n est un nombre premier, faux sinon.",
        tokens: [
          "bool", "estPremier", "(", "int", "n", ")", "{",
          "if", "(", "n", "<", "2", ")", "{", "return", "false", ";", "}",
          "for", "(", "int", "i", "=", "2", ";", "i", "<", "n", ";", "i", "++", ")", "{",
          "if", "(", "n", "%", "i", "==", "0", ")", "{", "return", "false", ";", "}",
          "}",
          "return", "true", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "<", "=", "%", "==", "++"],
        extraKeys: ["bool", "estPremier", "int", "n", "i", "if", "for", "return", "false", "true"],
      },
      {
        titre: "FizzBuzz",
        enonce: 'Fonction qui renvoie "Fizz" si n est multiple de 3, "Buzz" si multiple de 5, "FizzBuzz" si multiple des deux, sinon n en texte.',
        tokens: [
          "string", "fizzbuzz", "(", "int", "n", ")", "{",
          "if", "(", "n", "%", "1", "5", "==", "0", ")", "{", "return", '"FizzBuzz"', ";", "}",
          "if", "(", "n", "%", "3", "==", "0", ")", "{", "return", '"Fizz"', ";", "}",
          "if", "(", "n", "%", "5", "==", "0", ")", "{", "return", '"Buzz"', ";", "}",
          "return", "to_string", "(", "n", ")", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "%", "=="],
        extraKeys: ["string", "fizzbuzz", "int", "n", "if", "return", "to_string", '"FizzBuzz"', '"Fizz"', '"Buzz"'],
      },
      {
        titre: "Fibonacci",
        enonce: "Fonction qui renvoie le n-ième terme de la suite de Fibonacci (0, 1, 1, 2, 3, 5...).",
        tokens: [
          "int", "fibonacci", "(", "int", "n", ")", "{",
          "int", "a", "=", "0", ";",
          "int", "b", "=", "1", ";",
          "for", "(", "int", "i", "=", "0", ";", "i", "<", "n", ";", "i", "++", ")", "{",
          "int", "t", "=", "a", "+", "b", ";",
          "a", "=", "b", ";",
          "b", "=", "t", ";",
          "}",
          "return", "a", ";", "}",
        ],
        keys: ["(", ")", "{", "}", ";", "=", "<", "++", "+"],
        extraKeys: ["int", "fibonacci", "n", "a", "b", "for", "i", "t", "return"],
      },
      {
        titre: "PGCD (Euclide)",
        enonce: "Fonction qui renvoie le plus grand diviseur commun de a et b avec l'algorithme d'Euclide.",
        tokens: ["int", "pgcd", "(", "int", "a", ",", "int", "b", ")", "{", "while", "(", "b", "!=", "0", ")", "{", "int", "r", "=", "a", "%", "b", ";", "a", "=", "b", ";", "b", "=", "r", ";", "}", "return", "a", ";", "}"],
        keys: ["(", ",", ")", "{", "!=", "=", "%", ";", "}"],
        extraKeys: ["int", "pgcd", "a", "b", "while", "r", "return"],
      },
      {
        titre: "Somme des chiffres",
        enonce: "Fonction qui renvoie la somme des chiffres de l'entier positif n (ex : 123 → 6).",
        tokens: ["int", "sommeChiffres", "(", "int", "n", ")", "{", "int", "s", "=", "0", ";", "while", "(", "n", ">", "0", ")", "{", "s", "=", "s", "+", "n", "%", "1", "0", ";", "n", "=", "n", "/", "1", "0", ";", "}", "return", "s", ";", "}"],
        keys: ["(", ")", "{", "=", ";", ">", "+", "%", "/", "}"],
        extraKeys: ["int", "sommeChiffres", "n", "s", "while", "return"],
      },
      {
        titre: "Nombre de diviseurs",
        enonce: "Fonction qui renvoie le nombre de diviseurs de n (ex : 6 → 4, car 1, 2, 3 et 6).",
        tokens: ["int", "nombreDiviseurs", "(", "int", "n", ")", "{", "int", "compteur", "=", "0", ";", "for", "(", "int", "i", "=", "1", ";", "i", "<=", "n", ";", "i", "++", ")", "{", "if", "(", "n", "%", "i", "==", "0", ")", "{", "compteur", "=", "compteur", "+", "1", ";", "}", "}", "return", "compteur", ";", "}"],
        keys: ["(", ")", "{", "=", ";", "<=", "++", "%", "==", "+", "}"],
        extraKeys: ["int", "nombreDiviseurs", "n", "compteur", "for", "i", "if", "return"],
      },
    ],
  },
};

export function pickProgExercise(lang: ProgLang, level: ProgLevel): ProgExercise {
  const bank = PROG_BANK[lang][level];
  return bank[Math.floor(Math.random() * bank.length)];
}
