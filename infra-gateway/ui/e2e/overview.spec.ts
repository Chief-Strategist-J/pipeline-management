import { test, expect } from "@playwright/test";

test.describe("Feature: Gateway Dashboard Overview & Roadmap Matrix", () => {

  test("Scenario: User views system overview metrics and 25 roadmap features", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("main h1")).toContainText(/Infrastructure Gateway Overview/i);
    await expect(page.getByText(/25 Enterprise Critical Features Matrix/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "OCSP Stapling Engine" })).toBeVisible();
  });

  test("Scenario: User filters features matrix by completed status", async ({ page }) => {
    await page.goto("/");

    await page.click("button:has-text('COMPLETED')");
    await expect(page.getByRole("heading", { name: "OCSP Stapling Engine" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dynamic Sandbox Generator" })).toBeVisible();
  });

});
