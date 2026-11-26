import { expect, type Page } from "@playwright/test";

export const door = (page: Page, title: string) =>
  page.locator(".door", { has: page.locator(".door__title", { hasText: new RegExp(`^${title}$`) }) });

export async function openSeries(page: Page, title: "MATHS" | "SCIENCES" | "PROGRAMMATION", lang?: string) {
  await page.goto("/");
  await door(page, title).click();
  if (lang) await page.getByText(lang, { exact: true }).click();
  await page.getByText("MODE SÉRIE").click();
}

export const message = (page: Page) => page.locator(".lab .message").last();

export async function answer(page: Page, value: string) {
  await page.locator(".lab__input").fill(value);
  await page.locator(".lab").getByRole("button", { name: "Valider" }).click();
}

export async function pick(page: Page, selector: ".softkey" | ".sub-switch button" | ".mode-btn", label: string) {
  await page.locator(selector, { hasText: label }).first().click();
}

export async function pressKey(page: Page, label: string) {
  await page.locator(".keyboard").getByRole("button", { name: label, exact: true }).first().click();
}

export async function expectNoHorizontalScroll(page: Page) {
  const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scroll).toBeLessThanOrEqual(width + 1);
}
