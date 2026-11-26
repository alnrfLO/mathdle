import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalScroll, openSeries, pick } from "./helpers";

const JS: Record<string, string> = {
  somme: "function somme(tab){let s=0;for(const x of tab)s+=x;return s}",
  maximum: "function maximum(tab){let m=tab[0];for(const x of tab)if(x>m)m=x;return m}",
  nbPairs: "function nbPairs(tab){let n=0;for(const x of tab)if(x%2===0)n++;return n}",
  occurrences: "function occurrences(caractere, mot){let n=0;for(const c of mot)if(c===caractere)n++;return n}",
  moyenne: "function moyenne(tab){let s=0;for(const x of tab)s+=x;return s/tab.length}",
  inverser: "function inverser(chaine){let r='';for(const c of chaine)r=c+r;return r}",
  estPalindrome: "function estPalindrome(mot){for(let i=0;i<mot.length/2;i++)if(mot[i]!==mot[mot.length-1-i])return false;return true}",
  factorielle: "function factorielle(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r}",
  indice: "function indice(tab, x){for(let i=0;i<tab.length;i++)if(tab[i]===x)return i;return -1}",
  fibonacci: "function fibonacci(n){let a=0,b=1;for(let i=0;i<n;i++){const t=a+b;a=b;b=t}return a}",
  estTrie: "function estTrie(tab){for(let i=1;i<tab.length;i++)if(tab[i-1]>tab[i])return false;return true}",
  fusion: "function fusion(t1, t2){const r=[];let i=0,j=0;while(i<t1.length&&j<t2.length)r.push(t1[i]<=t2[j]?t1[i++]:t2[j++]);while(i<t1.length)r.push(t1[i++]);while(j<t2.length)r.push(t2[j++]);return r}",
  compteVoyelles: "function compteVoyelles(phrase){let n=0;for(const c of phrase)if('aeiouyAEIOUY'.includes(c))n++;return n}",
};

const PY: Record<string, string> = {
  somme: "def somme(tab):\n    s = 0\n    for x in tab:\n        s += x\n    return s\n",
  maximum: "def maximum(tab):\n    m = tab[0]\n    for x in tab:\n        if x > m:\n            m = x\n    return m\n",
  nb_pairs: "def nb_pairs(tab):\n    return len([x for x in tab if x % 2 == 0])\n",
  occurrences: "def occurrences(caractere, mot):\n    n = 0\n    for c in mot:\n        if c == caractere:\n            n += 1\n    return n\n",
  moyenne: "def moyenne(tab):\n    s = 0\n    for x in tab:\n        s += x\n    return s / len(tab)\n",
  inverser: "def inverser(chaine):\n    r = ''\n    for c in chaine:\n        r = c + r\n    return r\n",
  est_palindrome: "def est_palindrome(mot):\n    for i in range(len(mot) // 2):\n        if mot[i] != mot[len(mot) - 1 - i]:\n            return False\n    return True\n",
  factorielle: "def factorielle(n):\n    r = 1\n    for i in range(2, n + 1):\n        r *= i\n    return r\n",
  indice: "def indice(tab, x):\n    for i in range(len(tab)):\n        if tab[i] == x:\n            return i\n    return -1\n",
  fibonacci: "def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n",
  est_trie: "def est_trie(tab):\n    for i in range(1, len(tab)):\n        if tab[i - 1] > tab[i]:\n            return False\n    return True\n",
  fusion: "def fusion(t1, t2):\n    r = []\n    i = j = 0\n    while i < len(t1) and j < len(t2):\n        if t1[i] <= t2[j]:\n            r.append(t1[i]); i += 1\n        else:\n            r.append(t2[j]); j += 1\n    return r + t1[i:] + t2[j:]\n",
  compte_voyelles: "def compte_voyelles(phrase):\n    n = 0\n    for c in phrase:\n        if c in 'aeiouyAEIOUY':\n            n += 1\n    return n\n",
};

async function run(page: Page, code: string) {
  await page.locator(".code-editor").fill(code);
  await page.locator(".lab").getByRole("button", { name: "Exécuter" }).click();
  const msg = page.locator(".lab > .message");
  await expect(msg).not.toHaveText(/^(…|Chargement.*|Exécution.*)$/, { timeout: 90_000 });
  return msg.innerText();
}

const signature = async (page: Page) => {
  const head = await page.locator(".lab__card b").innerText();
  return { name: head.split("(")[0], params: head.slice(head.indexOf("(") + 1, -1) };
};

async function solveEveryExercise(page: Page, solutions: Record<string, string>) {
  const seen = new Set<string>();
  for (const level of ["Facile", "Moyen", "Difficile"]) {
    await pick(page, ".softkey", level);
    for (let i = 0; i < 25; i++) {
      const { name } = await signature(page);
      if (seen.has(name)) {
        await page.locator(".lab").getByRole("button", { name: "Passer" }).click();
        continue;
      }
      seen.add(name);
      expect(await run(page, solutions[name]), name).toMatch(/tests réussis/);
      await page.getByText("Exercice suivant →").click();
    }
  }
  expect([...seen].sort()).toEqual(Object.keys(solutions).sort());
}

test.describe("JavaScript console", () => {
  test.beforeEach(async ({ page }) => openSeries(page, "PROGRAMMATION", "JAVASCRIPT"));

  test("when a correct solution is written for each of the 13 exercises, every visible and hidden test passes", async ({ page }) => {
    test.setTimeout(180_000);
    await expect(page.locator(".code-editor")).toBeVisible();
    await solveEveryExercise(page, JS);
  });

  test("when the code is broken, renamed, short of a parameter, looping or throwing, it explains what went wrong", async ({ page }) => {
    const { name, params } = await signature(page);
    expect(await run(page, "const x = ;")).toContain("SyntaxError");
    expect(await run(page, "function autre(tab){return 1}")).toContain("introuvable");
    expect(await run(page, `function ${name}(){return 1}`)).toContain("paramètre");
    expect(await run(page, `function ${name}(${params}){while(true){}}`)).toContain("Délai");
    expect(await run(page, `function ${name}(${params}){throw new Error('boom')}`)).toMatch(/^0\//);
    await expect(page.locator(".lab")).toContainText("console.log ne sert");
  });

  test("when the answers are hardcoded, the hidden tests catch it", async ({ page }) => {
    for (let i = 0; i < 25 && (await signature(page)).name !== "occurrences"; i++) {
      await page.locator(".lab").getByRole("button", { name: "Passer" }).click();
    }
    const result = await run(page, 'function occurrences(c, m){ if(m==="sciences") return 2; if(m==="mathdle") return 1; return 0 }');
    expect(result).toContain("caché");
  });

  test("when a forbidden built-in is used, it is blocked, unless it only appears in a comment", async ({ page }) => {
    for (let i = 0; i < 25 && (await signature(page)).name !== "somme"; i++) {
      await page.locator(".lab").getByRole("button", { name: "Passer" }).click();
    }
    expect(await run(page, "function somme(tab){return tab.reduce((a,b)=>a+b,0)}")).toContain("Interdit");
    expect(await run(page, "// reduce\n" + JS.somme)).toContain("tests réussis");
  });

  test("when switching to fill-in-the-blanks, the classic keyboard comes back", async ({ page }) => {
    await pick(page, ".mode-btn", "Extrait à trous");
    await expect(page.locator(".keyboard")).toBeVisible();
    await expect(page.locator(".code-editor")).toHaveCount(0);
  });
});

test.describe("Python console", () => {
  test.beforeEach(async ({ page }) => openSeries(page, "PROGRAMMATION", "PYTHON"));

  test("when a correct solution is written for each of the 13 exercises, every test passes in real Python", async ({ page }) => {
    test.setTimeout(240_000);
    await expect(page.locator(".lab__card")).not.toContainText("Math.max");
    await solveEveryExercise(page, PY);
  });

  test("when Python prints, raises or loops forever, it shows it and recovers afterwards", async ({ page }) => {
    test.setTimeout(180_000);
    const { name, params } = await signature(page);
    expect(await run(page, `def ${name}(${params}):\n    return undefined_var\n`)).toMatch(/^0\//);
    await run(page, `def ${name}(${params}):\n    print('coucou')\n    return 0\n`);
    await expect(page.locator(".code-console")).toContainText("coucou");
    expect(await run(page, `def ${name}(${params}):\n    while True:\n        pass\n`)).toContain("Délai");
    expect(await run(page, `def ${name}(${params}):\n    return 0\n`)).toContain("tests réussis");
  });
});

for (const lang of ["JAVA", "C++"]) {
  test(`when playing ${lang}, the blank page is laid out as real code on several lines`, async ({ page }) => {
    await openSeries(page, "PROGRAMMATION", lang);
    await expect(page.locator(".code-editor")).toHaveCount(0);
    for (const level of ["Facile", "Moyen", "Difficile"]) {
      await pick(page, ".softkey", level);
      expect(await page.locator(".codegrid__try--active .codegrid__line").count()).toBeGreaterThanOrEqual(3);
      await expectNoHorizontalScroll(page);
    }
    await pick(page, ".mode-btn", "Extrait à trous");
    await expect(page.locator(".keyboard")).toBeVisible();
  });
}
