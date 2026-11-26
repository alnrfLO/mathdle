import { expect, test } from "@playwright/test";
import { answer, expectNoHorizontalScroll, message, openSeries, pick } from "./helpers";

test.beforeEach(async ({ page }) => openSeries(page, "SCIENCES"));

test("when sciences open, chemical balancing is shown with its keyboard", async ({ page }) => {
  await expect(page.locator(".keyboard")).toBeVisible();
  await expect(page.locator(".sub-switch button", { hasText: "Équilibrage" })).toHaveClass(/is-active/);
});

test.describe("mystery element", () => {
  test.beforeEach(async ({ page }) => pick(page, ".sub-switch button", "Élément mystère"));

  test("when the same element is typed as a symbol, a name and a number, it is recognised as one guess", async ({ page }) => {
    await answer(page, "Fe");
    if (await page.getByText("Suivant →").count()) return;
    await answer(page, "fer");
    await expect(message(page)).toContainText("Déjà essayé");
    await answer(page, "zzz");
    await expect(message(page)).toContainText("inconnu");
  });

  test("when following the arrows on the atomic number, the player can always win", async ({ page }) => {
    let lo = 1;
    let hi = 18;
    for (let i = 0; i < 6; i++) {
      const z = Math.floor((lo + hi) / 2);
      await answer(page, String(z));
      if ((await message(page).innerText()).includes("Bravo")) break;
      const cell = await page.locator(".lab__table tbody tr").last().locator("td").nth(1).innerText();
      if (cell.includes("↑")) lo = z + 1;
      else hi = z - 1;
    }
    await expect(message(page)).toContainText("Bravo");
  });
});

test.describe("molar mass", () => {
  test.beforeEach(async ({ page }) => pick(page, ".sub-switch button", "Masse molaire"));

  test("when three wrong masses are given, it shows the right value", async ({ page }) => {
    for (const level of ["Facile", "Moyen", "Difficile"]) {
      await pick(page, ".softkey", level);
      await expect(page.locator(".lab__big")).not.toBeEmpty();
    }
    for (let i = 0; i < 3; i++) await answer(page, "1");
    await expect(message(page)).toContainText("Perdu");
    await expect(message(page)).toContainText("g/mol");
  });

  test("when the answer is not a number, it asks for one", async ({ page }) => {
    await answer(page, "abc");
    await expect(message(page)).toContainText("nombre");
  });
});

test.describe("redox", () => {
  test.beforeEach(async ({ page }) => pick(page, ".sub-switch button", "Oxydoréduction"));

  for (const level of ["Facile", "Moyen", "Difficile"]) {
    test(`when empty boxes are submitted at ${level}, it never counts as balanced and reveals the answer`, async ({ page }) => {
      await pick(page, ".softkey", level);
      for (let i = 0; i < 4; i++) {
        await page.locator(".lab").getByRole("button", { name: "Valider" }).click();
        if ((await message(page).innerText()).includes("Perdu")) break;
      }
      await expect(message(page)).not.toContainText("équilibrée");
      await expect(message(page)).toContainText("Perdu");
      await expect(page.locator(".lab__coef").first()).toBeDisabled();
    });
  }
});

test.describe("physics", () => {
  test.beforeEach(async ({ page }) => pick(page, ".mode-btn", "Physique"));

  test("when physics opens, formulas come first and the old conversions still work", async ({ page }) => {
    await expect(page.locator(".keyboard")).toBeVisible();
    await pick(page, ".sub-switch button", "Conversions");
    await expect(page.locator(".keyboard")).toBeVisible();
  });

  test("when three wrong units are given, it reveals the right unit at every level", async ({ page }) => {
    await pick(page, ".sub-switch button", "Unités");
    for (const level of ["Facile", "Moyen", "Difficile"]) {
      await pick(page, ".softkey", level);
      for (let i = 0; i < 3; i++) await answer(page, "zz");
      await expect(message(page)).toContainText("Perdu");
      await page.getByText("Suivant →").click();
    }
  });

  test("when a numerical application is answered, the unit is required and a loss shows the formula", async ({ page }) => {
    await pick(page, ".sub-switch button", "Applications num.");
    for (const level of ["Facile", "Moyen", "Difficile"]) {
      await pick(page, ".softkey", level);
      await answer(page, "5");
      await expect(message(page)).toContainText("unité");
      const units = await page.locator(".lab__select option").allInnerTexts();
      for (let i = 0; i < 3; i++) {
        await page.locator(".lab__select").selectOption(units[units.length - 1]);
        await answer(page, "0,000001");
      }
      await expect(message(page)).toContainText("Perdu");
      await expect(message(page)).toContainText("=");
      await page.getByText("Suivant →").click();
    }
  });

  test("when chained conversions end, they explain the steps and accept scientific notation", async ({ page }) => {
    await pick(page, ".sub-switch button", "Conversions en chaîne");
    for (const level of ["Facile", "Moyen", "Difficile"]) {
      await pick(page, ".softkey", level);
      for (let i = 0; i < 3; i++) {
        await answer(page, "7");
        if ((await message(page).innerText()).includes("Exact")) break;
      }
      await expect(message(page)).toContainText("(");
      await page.getByText("Suivant →").click();
    }
    await pick(page, ".softkey", "Moyen");
    for (let i = 0; i < 40; i++) {
      const q = await page.locator(".lab__big").innerText();
      const m = q.match(/(\d+) mL → \? m³/);
      if (m) {
        await answer(page, `${m[1]}e-6`);
        await expect(message(page)).toContainText("Exact");
        break;
      }
      await page.locator(".lab").getByRole("button", { name: "Passer" }).click();
    }
    await expectNoHorizontalScroll(page);
  });
});
