import {
  expect,
  test,
} from "@playwright/test";

test("halaman utama dapat digunakan dengan keyboard", async ({
  page,
}) => {
  await page.goto("/");

  await page.keyboard.press("Tab");

  const focusedElement =
    page.locator(":focus");

  await expect(
    focusedElement,
  ).toBeVisible();

  await expect(
    page.locator("h1"),
  ).toHaveCount(1);

  await expect(
    page.getByRole("main"),
  ).toBeVisible();

  await expect(
    page.getByRole("navigation"),
  ).toBeVisible();
});