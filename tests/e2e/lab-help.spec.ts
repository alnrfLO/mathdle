import { expect, test } from "@playwright/test";
import { openSeries, pick } from "./helpers";

const modes: [string, "MATHS" | "SCIENCES", string[]][] = [
  ["sequences", "MATHS", ["Suites"]],
  ["pi target", "MATHS", ["Cible π"]],
  ["curves", "MATHS", ["Courbes"]],
  ["mystery element", "SCIENCES", ["Chimie", "Élément mystère"]],
  ["molar mass", "SCIENCES", ["Chimie", "Masse molaire"]],
  ["redox", "SCIENCES", ["Chimie", "Oxydoréduction"]],
  ["units", "SCIENCES", ["Physique", "Unités"]],
  ["numerical applications", "SCIENCES", ["Physique", "Applications num."]],
  ["chained conversions", "SCIENCES", ["Physique", "Conversions en chaîne"]],
];

for (const [name, subject, path] of modes) {
  test(`when the ${name} hint and solution are used, the hint appears and the round ends`, async ({ page }) => {
    await openSeries(page, subject);
    if (path.length === 2) {
      await pick(page, ".mode-btn", path[0]);
      await pick(page, ".sub-switch button", path[1]);
    } else await pick(page, ".sub-switch button", path[0]);
    await page.locator(".lab").getByRole("button", { name: "Indice" }).click();
    await expect(page.locator(".lab__hint")).not.toBeEmpty();
    await page.locator(".lab").getByRole("button", { name: "Voir la solution" }).click();
    await expect(page.locator(".lab > .message")).not.toBeEmpty();
    await expect(page.locator(".lab").getByRole("button", { name: /Suivant/ })).toBeVisible();
    await page.locator(".lab").getByRole("button", { name: /Suivant/ }).click();
    await expect(page.locator(".lab__hint")).toHaveCount(0);
  });
}

test("when the JavaScript console hint and solution are used, it shows advice then readable code", async ({ page }) => {
  await openSeries(page, "PROGRAMMATION", "JAVASCRIPT");
  await page.locator(".lab").getByRole("button", { name: "Indice" }).click();
  await expect(page.locator(".lab__hint")).not.toBeEmpty();
  await page.locator(".lab").getByRole("button", { name: "Voir la solution" }).click();
  await expect(page.locator(".solution-code")).toContainText("function");
  await expect(page.locator(".solution-code")).toContainText("return");
});
