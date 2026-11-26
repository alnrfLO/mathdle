import { expect, test } from "@playwright/test";
import { answer, expectNoHorizontalScroll, message, openSeries, pick } from "./helpers";

test.beforeEach(async ({ page }) => openSeries(page, "MATHS"));

test("when playing the grid, the physical keyboard fills the row and the on-screen keyboard is shown", async ({ page }) => {
  await expect(page.locator(".keyboard")).toBeVisible();
  await page.keyboard.type("1+2=3");
  await expect(page.locator(".grid")).toContainText("1+2=3");
});

test("when switching to free target, its screen replaces the grid", async ({ page }) => {
  await pick(page, ".mode-btn", "Cible libre");
  await expect(page.locator(".calculator__screen")).toContainText("Cible");
});

test.describe("sequences", () => {
  test.beforeEach(async ({ page }) => pick(page, ".sub-switch button", "Suites"));

  test("when each level is chosen, it shows five terms and hides the grid keyboard", async ({ page }) => {
    await expect(page.locator(".keyboard")).toHaveCount(0);
    for (const level of ["Facile", "Moyen", "Difficile", "Impossible"]) {
      await pick(page, ".softkey", level);
      expect((await page.locator(".lab__big").innerText()).split(";")).toHaveLength(6);
    }
  });

  test("when four wrong answers are given, it reveals the formula", async ({ page }) => {
    for (let i = 0; i < 4; i++) await answer(page, "999999");
    await expect(message(page)).toContainText("Perdu");
    await expect(message(page)).toContainText("uₙ");
  });

  test("when the next term of an arithmetic or geometric sequence is entered, the player wins and the input locks", async ({ page }) => {
    let next: number | null = null;
    for (let i = 0; i < 30 && next === null; i++) {
      const terms = (await page.locator(".lab__big").innerText())
        .split(";")
        .slice(0, 5)
        .map((t) => Number(t.trim().replace(",", ".")));
      const diffs = terms.slice(1).map((t, k) => t - terms[k]);
      const ratios = terms.slice(1).map((t, k) => t / terms[k]);
      if (diffs.every((d) => d === diffs[0])) next = terms[4] + diffs[0];
      else if (ratios.every((r) => Math.abs(r - ratios[0]) < 1e-9)) next = terms[4] * ratios[0];
      else await page.locator(".lab").getByRole("button", { name: "Passer" }).click();
    }
    await answer(page, String(next).replace(".", ","));
    await expect(message(page)).toContainText("Bravo");
    await expect(page.locator(".lab__input")).toBeDisabled();
  });
});

test.describe("pi target", () => {
  test.beforeEach(async ({ page }) => pick(page, ".sub-switch button", "Cible π"));

  test("when the pi target is open, there is no difficulty choice", async ({ page }) => {
    await expect(page.locator(".softkey")).toHaveCount(0);
    await expect(page.locator(".lab__eyebrow")).toContainText("2 OPÉRATIONS MINIMUM");
  });

  test("when an equivalent expression is entered, it wins and one without π is refused", async ({ page }) => {
    const target = await page.locator(".lab__big").innerText();
    const m = target.match(/(−?)(\d*)π(?:\/(\d+))?/)!;
    const p = (m[1] ? -1 : 1) * Number(m[2] || 1);
    const q = Number(m[3] || 1);
    await answer(page, "3");
    await expect(message(page)).toContainText("π");
    await answer(page, `(${p}*π)/${q}+0*π`);
    await expect(message(page)).toContainText("Exact");
  });

  test("when the expression is too short, broken or wrong, it explains why", async ({ page }) => {
    await answer(page, "π");
    await expect(message(page)).toContainText("au moins");
    await answer(page, "π/0+");
    await expect(message(page)).toContainText("invalide");
    await answer(page, "π*π*π");
    await expect(message(page)).toContainText("trop");
  });
});

test.describe("curves", () => {
  test.beforeEach(async ({ page }) => pick(page, ".sub-switch button", "Courbes"));

  test("when the curve is drawn, the axes have the same scale", async ({ page }) => {
    const box = await page.locator(".lab__canvas").boundingBox();
    expect(Math.abs(box!.width - box!.height)).toBeLessThan(2);
    await expectNoHorizontalScroll(page);
  });

  test("when the guess does not depend on x, it is refused", async ({ page }) => {
    await answer(page, "3");
    await expect(message(page)).toContainText("dépendre de x");
  });

  for (const level of ["Facile", "Moyen", "Difficile", "Impossible"]) {
    test(`when six wrong curves are tried at ${level}, it reveals the function`, async ({ page }) => {
      await pick(page, ".softkey", level);
      for (let i = 0; i < 6; i++) await answer(page, `${i + 7}x+1000`);
      await expect(message(page)).toContainText("Perdu");
      await expect(message(page)).toContainText("f(x) =");
    });
  }
});
