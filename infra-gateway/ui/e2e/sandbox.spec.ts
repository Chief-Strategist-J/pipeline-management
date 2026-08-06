import { test, expect } from "@playwright/test";

test.describe("Feature: Dynamic Sandbox Environment Provisioner", () => {

  test("Scenario: User lists active sandbox test environments", async ({ page }) => {
    await page.goto("/sandbox");

    await expect(page.locator("main h1")).toContainText(/Dynamic Sandbox Environment Provisioner/i);

    await expect(page.getByText("integration-test-env-1").first()).toBeVisible();
    await expect(page.getByText("sbx-8f92a10", { exact: true })).toBeVisible();
  });

  test("Scenario: User provisions a new isolated sandbox environment", async ({ page }) => {
    await page.goto("/sandbox");

    await page.click("button:has-text('New Sandbox')");
    await expect(page.getByText("Provision New Sandbox")).toBeVisible();

    await page.fill("input[placeholder='e.g. integration-test-env-1']", "bdd-test-sandbox");
    await page.click("button:has-text('Provision Sandbox')");

    await expect(page.getByText("bdd-test-sandbox").first()).toBeVisible();
  });

});
