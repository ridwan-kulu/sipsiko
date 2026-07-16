import {
  expect,
  test,
} from "@playwright/test";

test.describe("alur publik", () => {
  test("pengguna dapat membuka halaman persetujuan", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /kenali apa yang sedang anda rasakan/i,
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: /mulai skrining/i,
      })
      .first()
      .click();

    await expect(
      page.getByRole("heading", {
        name: /persetujuan dan batasan penggunaan/i,
      }),
    ).toBeVisible();
  });

  test("tombol lanjut tidak aktif sebelum persetujuan", async ({
    page,
  }) => {
    await page.goto(
      "/skrining/persetujuan",
    );

    const continueButton =
      page.getByRole("button", {
        name: /saya setuju, lanjutkan/i,
      });

    await expect(
      continueButton,
    ).toBeDisabled();

    await page
      .getByRole("checkbox")
      .check();

    await expect(
      continueButton,
    ).toBeEnabled();
  });

  test("dashboard mengarahkan pengguna anonim ke login", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(
      /\/masuk/,
    );

    await expect(
      page.getByRole("heading", {
        name: /masuk ke akun/i,
      }),
    ).toBeVisible();
  });

  test("admin mengarahkan pengguna anonim ke login", async ({
    page,
  }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(
      /\/masuk/,
    );
  });
});