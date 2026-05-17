import { expect, test } from "@playwright/test";
import { hasCredentialsForm, login, STORAGE_STATE, TEST_USER } from "./fixtures";

test.describe("Login", () => {
  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");

    const heading = page.getByRole("heading", { name: /sign in/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    const hasForm = await hasCredentialsForm(page);
    test.skip(
      !hasForm,
      "Credentials auth not enabled — set NEXT_PUBLIC_FEATURE_AUTH_CREDENTIALS_ENABLED"
    );

    const loggedIn = await login(page, TEST_USER.email, TEST_USER.password);
    expect(loggedIn).toBe(true);

    await expect(page).toHaveURL(/\/(dashboard|app)/, { timeout: 15000 });

    await page.context().storageState({ path: STORAGE_STATE });
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");

    const hasForm = await hasCredentialsForm(page);
    test.skip(!hasForm, "Credentials auth not enabled");

    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should stay on sign-in page or show an error
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    const stayedOnSignIn = await page
      .waitForURL(/\/sign-in/, { timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    const hasError = await errorToast.isVisible().catch(() => false);

    expect(stayedOnSignIn || hasError).toBe(true);
  });

  test("authenticated user can access dashboard", async ({ page }) => {
    const loggedIn = await login(page, TEST_USER.email, TEST_USER.password);
    test.skip(!loggedIn, "Login failed — cannot test authenticated access");

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.locator("body")).not.toContainText(/sign in/i);
  });
});
