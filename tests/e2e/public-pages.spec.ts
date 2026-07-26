import { test, expect } from "@playwright/test";

test.describe("public pages", () => {
  test("home page renders the hero and nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Descubre algo/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Experiencias" })).toBeVisible();
  });

  test("catalog lists seeded demo experiences and filters by category", async ({ page }) => {
    await page.goto("/experiencias");
    await expect(page.getByRole("heading", { name: "Experiencias" })).toBeVisible();
    await expect(page.getByText(/Demostración/i).first()).toBeVisible();

    await page.getByRole("link", { name: "Recovery" }).click();
    await expect(page).toHaveURL(/categoria=recovery/);
  });

  test("experience detail shows the claim CTA for a logged-out visitor", async ({ page }) => {
    await page.goto("/experiencias/pilates-intro-demo");
    await expect(page.getByRole("heading", { name: /Pilates Intro/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("unknown experience slug renders a 404", async ({ page }) => {
    const response = await page.goto("/experiencias/no-existe-esta-experiencia");
    expect(response?.status()).toBe(404);
  });

  test("legal pages render", async ({ page }) => {
    await page.goto("/terminos");
    await expect(page.getByRole("heading", { name: /Términos/i })).toBeVisible();

    await page.goto("/privacidad");
    await expect(page.getByRole("heading", { name: /privacidad/i })).toBeVisible();
  });
});

test.describe("authentication gating", () => {
  test("mi-pase redirects to /acceso when logged out", async ({ page }) => {
    await page.goto("/mi-pase");
    await expect(page).toHaveURL(/\/acceso\?next=%2Fmi-pase/);
  });

  test("/admin redirects to /acceso when logged out", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/acceso\?next=%2Fadmin/);
  });
});
