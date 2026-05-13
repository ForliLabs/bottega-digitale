import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("should display the login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Bottega Digitale/i);
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
    await expect(page.locator("input[type='password'], input[name='password']")).toBeVisible();
  });

  test("should show error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email'], input[name='email']", "invalid@example.com");
    await page.fill("input[type='password'], input[name='password']", "wrongpassword");
    await page.click("button[type='submit']");

    // Expect an error message to appear
    await expect(
      page.locator("text=/credenziali|errore|invalid|error/i"),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should redirect to dashboard on valid login", async ({ page }) => {
    // Uses seeded demo credentials — update if seed data changes
    const email = process.env.E2E_USER_EMAIL || "demo@bottega.test";
    const password = process.env.E2E_USER_PASSWORD || "password123";

    await page.goto("/login");
    await page.fill("input[type='email'], input[name='email']", email);
    await page.fill("input[type='password'], input[name='password']", password);
    await page.click("button[type='submit']");

    await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
    await expect(page.url()).toContain("/dashboard");
  });
});
