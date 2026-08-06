import { test, expect } from "@playwright/test";

test.describe("Feature: Multi-Proxy Configuration Compiler Studio", () => {

  test("Scenario: User compiles all targets and views generated proxy configuration files", async ({ page }) => {
    await page.goto("/compiler");

    await expect(page.locator("main h1")).toContainText(/Multi-Proxy Compiler Studio/i);

    await page.click("button:has-text('Compile All Targets')");

    await expect(page.getByText(/Syntax Valid/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "nginx.conf" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "traefik.yaml" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "httpd.conf" }).first()).toBeVisible();
  });

  test("Scenario: User selects specific proxy compiler target", async ({ page }) => {
    await page.goto("/compiler");

    await page.click("button:has-text('Nginx Compiler')");

    await expect(page.getByRole("button", { name: "nginx.conf" }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("pre")).toContainText("events {");
  });

});
