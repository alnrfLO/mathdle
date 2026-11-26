export interface Solution {
  hint: string;
  js: string;
  py: string;
}

export const SOLUTIONS: Record<string, Solution> = {
  somme: {
    hint: "Garde un total qui démarre à 0 et ajoute chaque élément en parcourant le tableau",
    js: `function somme(tab) {
  let total = 0;
  for (const x of tab) {
    total += x;
  }
  return total;
}`,
    py: `def somme(tab):
    total = 0
    for x in tab:
        total += x
    return total`,
  },
  maximum: {
    hint: "Pars du premier élément, puis remplace-le chaque fois que tu trouves plus grand",
    js: `function maximum(tab) {
  let m = tab[0];
  for (const x of tab) {
    if (x > m) m = x;
  }
  return m;
}`,
    py: `def maximum(tab):
    m = tab[0]
    for x in tab:
        if x > m:
            m = x
    return m`,
  },
  nb_pairs: {
    hint: "Un entier est pair quand x % 2 vaut 0. Compte-les avec un compteur",
    js: `function nbPairs(tab) {
  let n = 0;
  for (const x of tab) {
    if (x % 2 === 0) n++;
  }
  return n;
}`,
    py: `def nb_pairs(tab):
    n = 0
    for x in tab:
        if x % 2 == 0:
            n += 1
    return n`,
  },
  occurrences: {
    hint: "Parcours mot lettre par lettre et ajoute 1 au compteur quand la lettre est égale à caractere",
    js: `function occurrences(caractere, mot) {
  let n = 0;
  for (const c of mot) {
    if (c === caractere) n++;
  }
  return n;
}`,
    py: `def occurrences(caractere, mot):
    n = 0
    for c in mot:
        if c == caractere:
            n += 1
    return n`,
  },
  moyenne: {
    hint: "Fais la somme des éléments, puis divise par le nombre d'éléments",
    js: `function moyenne(tab) {
  let total = 0;
  for (const x of tab) {
    total += x;
  }
  return total / tab.length;
}`,
    py: `def moyenne(tab):
    total = 0
    for x in tab:
        total += x
    return total / len(tab)`,
  },
  inverser: {
    hint: "Construis une nouvelle chaîne en ajoutant chaque lettre devant celles déjà mises",
    js: `function inverser(chaine) {
  let r = "";
  for (const c of chaine) {
    r = c + r;
  }
  return r;
}`,
    py: `def inverser(chaine):
    r = ""
    for c in chaine:
        r = c + r
    return r`,
  },
  palindrome: {
    hint: "Compare la première lettre avec la dernière, la deuxième avec l'avant-dernière, et ainsi de suite",
    js: `function estPalindrome(mot) {
  for (let i = 0; i < mot.length / 2; i++) {
    if (mot[i] !== mot[mot.length - 1 - i]) return false;
  }
  return true;
}`,
    py: `def est_palindrome(mot):
    for i in range(len(mot) // 2):
        if mot[i] != mot[len(mot) - 1 - i]:
            return False
    return True`,
  },
  factorielle: {
    hint: "Pars de 1 et multiplie par 2, puis 3, jusqu'à n",
    js: `function factorielle(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) {
    r *= i;
  }
  return r;
}`,
    py: `def factorielle(n):
    r = 1
    for i in range(2, n + 1):
        r *= i
    return r`,
  },
  indice: {
    hint: "Parcours les positions avec une boucle sur i et renvoie i dès que tab[i] vaut x. Après la boucle, renvoie -1",
    js: `function indice(tab, x) {
  for (let i = 0; i < tab.length; i++) {
    if (tab[i] === x) return i;
  }
  return -1;
}`,
    py: `def indice(tab, x):
    for i in range(len(tab)):
        if tab[i] == x:
            return i
    return -1`,
  },
  fibonacci: {
    hint: "Pas de récursion, c'est trop lent pour n = 40. Garde les deux derniers termes a et b et avance n fois",
    js: `function fibonacci(n) {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    const suivant = a + b;
    a = b;
    b = suivant;
  }
  return a;
}`,
    py: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
  },
  est_trie: {
    hint: "Compare chaque élément au précédent. Si un seul est plus petit que le précédent, ce n'est pas trié",
    js: `function estTrie(tab) {
  for (let i = 1; i < tab.length; i++) {
    if (tab[i - 1] > tab[i]) return false;
  }
  return true;
}`,
    py: `def est_trie(tab):
    for i in range(1, len(tab)):
        if tab[i - 1] > tab[i]:
            return False
    return True`,
  },
  fusion: {
    hint: "Garde un curseur dans chaque tableau et prends à chaque fois le plus petit des deux éléments pointés",
    js: `function fusion(t1, t2) {
  const r = [];
  let i = 0;
  let j = 0;
  while (i < t1.length && j < t2.length) {
    if (t1[i] <= t2[j]) r.push(t1[i++]);
    else r.push(t2[j++]);
  }
  while (i < t1.length) r.push(t1[i++]);
  while (j < t2.length) r.push(t2[j++]);
  return r;
}`,
    py: `def fusion(t1, t2):
    r = []
    i = j = 0
    while i < len(t1) and j < len(t2):
        if t1[i] <= t2[j]:
            r.append(t1[i])
            i += 1
        else:
            r.append(t2[j])
            j += 1
    return r + t1[i:] + t2[j:]`,
  },
  voyelles: {
    hint: "Mets toutes les voyelles dans une chaîne \"aeiouyAEIOUY\" et teste si chaque lettre en fait partie",
    js: `function compteVoyelles(phrase) {
  let n = 0;
  for (const c of phrase) {
    if ("aeiouyAEIOUY".includes(c)) n++;
  }
  return n;
}`,
    py: `def compte_voyelles(phrase):
    n = 0
    for c in phrase:
        if c in "aeiouyAEIOUY":
            n += 1
    return n`,
  },
};
