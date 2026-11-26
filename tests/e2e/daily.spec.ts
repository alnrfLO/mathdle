import { expect, test, type Page } from "@playwright/test";
import { todaySeed, withSeed } from "../../src/game/seededRandom";
import { generateEquation } from "../../src/game/generator";
import { generateConversion } from "../../src/science/conversions";
import { pickProgExercise, type ProgLang } from "../../src/game/programming";
import { door, expectNoHorizontalScroll, pressKey } from "./helpers";

const mathAnswer = withSeed(todaySeed(1), () => generateEquation("moyen"));
const scienceAnswer = withSeed(todaySeed(2), () => generateConversion("moyen")).answer;
const SALT: Record<ProgLang, number> = { javascript: 10, python: 11, java: 12, cpp: 13 };
const codeAnswer = (lang: ProgLang) => withSeed(todaySeed(SALT[lang]), () => pickProgExercise(lang, "moyen")).tokens;

const FIRST_GUESS: Record<number, string> = { 5: "1+2=3", 6: "10-4=6", 7: "1+2+3=6", 8: "10+20=30", 9: "10+20+3=33", 10: "100-90=10" };

async function openDaily(page: Page, subject: "MATHS" | "SCIENCES" | "CODE", lang?: string) {
  await door(page, "ÉNIGME DU JOUR").click();
  await page.locator(".daily-hub button", { hasText: subject }).click();
  if (lang) await page.getByText(lang, { exact: true }).click();
}

test("when the maths puzzle is solved on the second try, the share text and the done state survive a reload", async ({ page }) => {
  await page.goto("/");
  await openDaily(page, "MATHS");
  await page.keyboard.type(FIRST_GUESS[mathAnswer.length]);
  await page.keyboard.press("Enter");
  await page.keyboard.type(mathAnswer);
  await page.keyboard.press("Enter");
  await expect(page.locator(".daily")).toContainText("Trouvé");

  await page.getByText("Partager mon résultat").click();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(shared).toContain("2/6");
  expect(shared).toContain("🟩");
  expect(shared.split("\n")).toHaveLength(4);

  await page.reload();
  await door(page, "ÉNIGME DU JOUR").click();
  await expect(page.locator(".daily-hub")).toContainText("Terminée");
  await page.locator(".daily-hub button", { hasText: "MATHS" }).click();
  await expect(page.locator(".daily")).toContainText("Déjà réussie");
  await expect(page.getByText("Partager mon résultat")).toBeVisible();
});

test("when the sciences puzzle is answered, it is won and can be shared", async ({ page }) => {
  await page.goto("/");
  await openDaily(page, "SCIENCES");
  for (const ch of String(scienceAnswer).replace(".", ",")) await page.keyboard.press(ch);
  await page.keyboard.press("Enter");
  await expect(page.locator(".calculator__screen")).toContainText("Trouvé");
  await page.getByText("Partager mon résultat").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Sciences");
});

for (const [label, lang] of [["JAVASCRIPT", "javascript"], ["PYTHON", "python"], ["JAVA", "java"], ["C++", "cpp"]] as const) {
  test(`when the ${label} code puzzle is typed token by token, it is laid out as indented code and won`, async ({ page }) => {
    await page.goto("/");
    await openDaily(page, "CODE", label);
    const lines = page.locator(".codegrid__try--active .codegrid__line");
    expect(await lines.count()).toBeGreaterThanOrEqual(3);
    const indents = await lines.evaluateAll((els) => els.map((e) => parseFloat((e as HTMLElement).style.paddingLeft) || 0));
    expect(Math.max(...indents)).toBeGreaterThan(0);
    await expectNoHorizontalScroll(page);

    const tokens = codeAnswer(lang);
    for (const token of tokens) await pressKey(page, token);
    await pressKey(page, "Valider");
    await expect(page.locator(".daily")).toContainText("Trouvé");
    await expect(page.locator(".ctok--correct")).toHaveCount(tokens.length);
  });
}

test("when every daily puzzle is played, the stats count each one", async ({ page }) => {
  await page.goto("/");
  await openDaily(page, "MATHS");
  await page.keyboard.type(mathAnswer);
  await page.keyboard.press("Enter");
  await page.goto("/");
  await page.getByText("Mes statistiques").click();
  await expect(page.locator(".legal-sheet")).toContainText("Énigme du jour · Maths");
  await expect(page.locator(".legal-sheet")).toContainText("100 %");
});

test.describe("day streak", () => {
  const day = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  async function playAfter(page: Page, record: { streak: number; lastDate: string; lastWon: boolean }) {
    await page.goto("/");
    await page.evaluate((r) => localStorage.setItem("mathdle_daily_math", JSON.stringify(r)), record);
    await page.reload();
    await door(page, "ÉNIGME DU JOUR").click();
    const shown = (await page.locator(".daily-hub button").first().innerText()).match(/série (\d+) j/);
    await page.locator(".daily-hub button", { hasText: "MATHS" }).click();
    await page.keyboard.type(mathAnswer);
    await page.keyboard.press("Enter");
    await expect(page.locator(".daily")).toContainText("Trouvé");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("mathdle_daily_math")!).streak);
    return { shown: shown ? Number(shown[1]) : 0, saved };
  }

  test("when yesterday was won, the streak continues", async ({ page }) => {
    expect(await playAfter(page, { streak: 5, lastDate: day(-1), lastWon: true })).toEqual({ shown: 5, saved: 6 });
  });

  test("when a day was skipped, the streak shows zero and restarts at one", async ({ page }) => {
    expect(await playAfter(page, { streak: 5, lastDate: day(-3), lastWon: true })).toEqual({ shown: 0, saved: 1 });
  });

  test("when yesterday was lost, the streak restarts at one", async ({ page }) => {
    expect((await playAfter(page, { streak: 5, lastDate: day(-1), lastWon: false })).saved).toBe(1);
  });
});
