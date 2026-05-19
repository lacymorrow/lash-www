/**
 * Shipkit.io Regression Tests
 *
 * Guards against recurring failures:
 *   - Checkout link 403/404 (LAC-249, LAC-1450: broke twice)
 *   - Marketing page 404s
 *   - Missing SEO title/description (LAC-1513)
 */
import { expect, test } from "@playwright/test";

const CHECKOUT_URL =
  "https://shipkit.lemonsqueezy.com/checkout/buy/20b5b59e-b4c4-43b0-9979-545f90c76f28";

const MARKETING_ROUTES = ["/", "/pricing", "/features", "/docs"] as const;

test.describe("Marketing pages return 200", () => {
  for (const route of MARKETING_ROUTES) {
    test(`${route} renders successfully`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response, `Failed to navigate to ${route}`).not.toBeNull();
      expect(response!.ok(), `${route} returned status ${response?.status()}`).toBeTruthy();
    });
  }
});

test.describe("Checkout link is reachable", () => {
  test("LemonSqueezy checkout URL returns 200 (not 403/404)", async ({ request }) => {
    // HEAD first to avoid downloading HTML; fall back to GET if HEAD isn't allowed
    let response = await request.fetch(CHECKOUT_URL, { method: "HEAD" });
    if (response.status() === 405 || response.status() === 403) {
      response = await request.get(CHECKOUT_URL);
    }
    expect(
      response.status(),
      `Checkout URL ${CHECKOUT_URL} returned ${response.status()} — expected 200`
    ).toBeLessThan(400);
  });

  test("pricing page contains a valid checkout link", async ({ page }) => {
    await page.goto("/pricing");

    // The buy link should exist and point to the LemonSqueezy checkout URL
    const buyLink = page.locator('a[href*="lemonsqueezy.com/checkout/buy/"]').first();
    await expect(buyLink, "No LemonSqueezy buy link found on /pricing").toBeVisible({
      timeout: 15000,
    });

    const href = await buyLink.getAttribute("href");
    expect(href, "Buy link href is empty").toBeTruthy();
    expect(href, "Buy link is not pointing to checkout endpoint").toContain("/checkout/buy/");
  });
});

test.describe("Demo link is reachable", () => {
  test("/examples page loads", async ({ page }) => {
    const response = await page.goto("/examples");
    expect(response, "/examples failed to navigate").not.toBeNull();
    expect(response!.ok(), `/examples returned status ${response?.status()}`).toBeTruthy();
  });
});

test.describe("SEO: title and meta description present", () => {
  const SEO_ROUTES = ["/", "/pricing", "/features"] as const;

  for (const route of SEO_ROUTES) {
    test(`${route} has <title> and <meta name="description">`, async ({ page }) => {
      await page.goto(route);

      // title must be non-empty
      const title = await page.title();
      expect(title, `${route}: <title> is empty`).toBeTruthy();
      expect(title.length, `${route}: <title> is too short`).toBeGreaterThan(3);

      // meta description must exist and be non-empty
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription, `${route}: missing <meta name="description">`).toHaveCount(1);

      const content = await metaDescription.getAttribute("content");
      expect(content, `${route}: <meta name="description"> content is empty`).toBeTruthy();
      expect(
        content!.length,
        `${route}: <meta name="description"> content is too short`
      ).toBeGreaterThan(10);
    });
  }
});
