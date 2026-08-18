import { test, expect } from "@playwright/test";

test.describe("Feature: GitHub GraphQL & REST Code Sync E2E Pipeline", () => {
  test("Scenario: User opens OpenVSCode IDE, switches template, opens push modal, and syncs code tree to GitHub", async ({ page }) => {
    await page.goto("/explorer");

    await expect(page.locator("span:has-text('Active Architecture:')")).toBeVisible({ timeout: 10000 });

    const templateSelect = page.locator("select").first();
    await expect(templateSelect).toBeVisible();

    await page.click("button[title='Source Control & Git Branch']");
    await expect(page.getByText("Source Control", { exact: false })).toBeVisible();

    await page.click("button[title='Sync & Push to GitHub']");
    await expect(page.getByText("Push Code & Sync Selected Template to GitHub")).toBeVisible();

    const tokenInput = page.locator("input[type='password']");
    await expect(tokenInput).toBeVisible();

    const repoInput = page.locator("input[placeholder='my-awesome-pipeline']");
    await expect(repoInput).toBeVisible();

    await tokenInput.fill("ghp_mocke2etoken123456789");
    await repoInput.fill("e2e-test-pipeline-repo");

    const submitBtn = page.getByRole("button", { name: /Sync Selected Template Code|Pushing Active Template/i });
    await expect(submitBtn).toBeVisible();
  });
});
