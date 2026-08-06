import { test, expect } from "@playwright/test";

test.describe("Feature: OCSP Stapling Engine Control Center", () => {

  test("Scenario: User views OCSP policy defaults and edge status", async ({ page }) => {
    await page.goto("/ocsp");

    await expect(page.locator("main h1")).toContainText(/OCSP Stapling Engine Control Center/i);
    await expect(page.getByText(/Active on Edge/i)).toBeVisible();
    await expect(page.getByText("8.8.8.8")).toBeVisible();
    await expect(page.getByText("300s")).toBeVisible();
  });

  test("Scenario: User toggles verification setting and inspects proxy directives", async ({ page }) => {
    await page.goto("/ocsp");

    await page.click("button:has-text('NGINX')");
    await expect(page.locator("pre")).toContainText("ssl_stapling on;");

    await page.click("button:has-text('TRAEFIK')");
    await expect(page.locator("pre")).toContainText("ocsp_stapling: true");

    await page.click("button:has-text('APACHE')");
    await expect(page.locator("pre")).toContainText("SSLUseStapling On");
  });

});
