import { expect, test } from "@playwright/test";
import { door, openSeries, pick } from "./helpers";

const keyFor = (page: import("@playwright/test").Page, label: string) =>
  page.locator(".keyboard").getByRole("button", { name: label, exact: true }).first();

test.describe("keyboard colors", () => {
  test("when a guess is submitted, each used key takes the color of its best result", async ({ page }) => {
    await openSeries(page, "MATHS");
    const len = await page.locator(".grid-row").first().locator(".cell").count();
    const tries: Record<number, string> = { 5: "1+2=3", 6: "10-4=6", 7: "1+2+3=6", 8: "10+20=30", 9: "10+20+3=33", 10: "100-90=10" };
    const pickTry = tries[len];
    await page.keyboard.type(pickTry);
    await page.keyboard.press("Enter");
    const cells = page.locator(".grid-row").first().locator(".cell");
    await expect(cells.first()).toHaveClass(/cell--(correct|present|absent)/);
    for (let i = 0; i < len; i++) {
      const tok = (await cells.nth(i).innerText()).trim();
      const state = await keyFor(page, tok).getAttribute("data-state");
      expect(["correct", "present", "absent"]).toContain(state);
    }
    const untouched = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].find((d) => !pickTry.includes(d))!;
    expect(await keyFor(page, untouched).getAttribute("data-state")).toBeNull();
  });
});

test.describe("help", () => {
  test("when the hint button is pressed, it reveals one cell of the answer", async ({ page }) => {
    await openSeries(page, "MATHS");
    await page.getByRole("button", { name: "Indice" }).click();
    await expect(page.locator(".cell--hint")).toHaveCount(1);
    await expect(page.locator(".helpbar__note")).toContainText("1 indice");
  });

  test("when the solution is shown, the game ends, the answer appears and a life is lost", async ({ page }) => {
    await openSeries(page, "MATHS");
    await page.getByRole("button", { name: "Voir la solution" }).click();
    await expect(page.locator(".banner")).toContainText("L'équation était");
    await expect(page.locator(".calculator__lives")).toContainText("VIES 2/3");
    await expect(page.locator(".helpbar")).toHaveCount(0);
  });

  test("when a physics formula is given up, it shows the formula", async ({ page }) => {
    await openSeries(page, "SCIENCES");
    await pick(page, ".mode-btn", "Physique");
    await pick(page, ".sub-switch button", "Formules");
    await page.getByRole("button", { name: "Indice" }).click();
    await expect(page.locator(".cell--hint")).toHaveCount(1);
    await page.getByRole("button", { name: "Voir la solution" }).click();
    await expect(page.locator(".physics__reveal")).toContainText("c'était");
  });

  test("when a Java blank page is given up, it shows the code", async ({ page }) => {
    await openSeries(page, "PROGRAMMATION", "JAVA");
    await pick(page, ".mode-btn", "Page blanche");
    await page.getByRole("button", { name: "Indice" }).click();
    await expect(page.locator(".ctok--hint")).toHaveCount(1);
    await page.getByRole("button", { name: "Voir la solution" }).click();
    await expect(page.locator(".physics__reveal")).toContainText("voici la solution");
    await expect(page.locator(".solution-code")).toContainText("return");
  });

  test("when today's puzzle is played, there is no hint or solution button", async ({ page }) => {
    await page.goto("/");
    await door(page, "MATHS").click();
    await page.getByText("ÉNIGME DU JOUR").first().click();
    await expect(page.locator(".helpbar")).toHaveCount(0);
  });
});

test.describe("daily hub navigation", () => {
  for (const [subject, label] of [["MATHS", "math"], ["SCIENCES", "science"], ["CODE", "prog"]] as const) {
    test(`when a ${label} puzzle is opened from the hub, the back button returns to the hub`, async ({ page }) => {
      await page.goto("/");
      await door(page, "ÉNIGME DU JOUR").click();
      await page.locator(".daily-hub button", { hasText: subject }).click();
      if (label === "prog") await page.getByText("PYTHON", { exact: true }).click();
      await page.getByRole("button", { name: "← MENU" }).click();
      await expect(page.locator(".daily-hub")).toBeVisible();
      await page.getByRole("button", { name: "← MENU" }).click();
      await expect(page.locator(".door").first()).toBeVisible();
    });
  }

  test("when a subject is opened from the home screen, the back button still goes to the mode choice", async ({ page }) => {
    await openSeries(page, "MATHS");
    await page.getByRole("button", { name: "← MENU" }).click();
    await expect(page.getByText("MODE SÉRIE")).toBeVisible();
  });
});

test.describe("phone sizing", () => {
  test("when on an iPhone, the keys are at least 44px tall and nothing scrolls sideways", async ({ page }) => {
    await openSeries(page, "MATHS");
    const box = await keyFor(page, "5").boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll).toBeLessThanOrEqual(width + 1);
  });
});
