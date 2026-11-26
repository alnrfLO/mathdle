import { expect, test } from "@playwright/test";
import { door, expectNoHorizontalScroll } from "./helpers";

test("when the home page opens, it shows four doors and the stats button", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".door")).toHaveCount(4);
  await expect(page.getByText("Mes statistiques")).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("when the app is installed as a PWA, its manifest, icons and service worker are served", async ({ page, request }) => {
  await page.goto("/");
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBe(true);
  expect((await request.get("/sw.js")).ok()).toBe(true);
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveCount(1);
});

test("when the legal notice opens, it credits the logo author and Pyodide", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Mentions légales").click();
  await expect(page.locator(".legal-sheet")).toContainText("Sylvain");
  await expect(page.locator(".legal-sheet")).toContainText("Pyodide");
});

test("when navigating back from nested menus, it returns to the home page", async ({ page }) => {
  await page.goto("/");
  await door(page, "ÉNIGME DU JOUR").click();
  await page.getByText("← MENU").click();
  await expect(page.locator(".door")).toHaveCount(4);
  await door(page, "SCIENCES").click();
  await page.getByText("MODE SÉRIE").click();
  await page.getByText("← MENU").click();
  await page.getByText("← MENU").click();
  await expect(page.locator(".door")).toHaveCount(4);
});

test("when played on a desktop screen, it shows the cheat sheet without scrolling sideways", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("/");
  await door(page, "MATHS").click();
  await page.getByText("MODE SÉRIE").click();
  await expect(page.locator(".desk-note")).toBeVisible();
  await expectNoHorizontalScroll(page);
});
