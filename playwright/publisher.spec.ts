import { expect, test } from "@playwright/test";

test.use({ storageState: "playwright/.auth/publisher.json" });

test("create network disruption", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    await page.getByLabel("Planned", { exact: true }).click();
    await page.getByLabel("Summary", { exact: true }).fill("Test");
    await page.getByLabel("Description", { exact: true }).fill("Test");
    await page.getByLabel("Reason for disruption", { exact: true }).selectOption("Accident");
    await page.getByLabel("Start date", { exact: true }).fill("21/08/2024");
    await page.getByLabel("Start time", { exact: true }).fill("1200");

    await page.getByLabel("No end date/time", { exact: true }).click();

    await expect(page.getByLabel("End date", { exact: true })).toBeDisabled();
    await expect(page.getByLabel("End time", { exact: true })).toBeDisabled();

    await page.getByRole("button", { name: "Save and continue" }).click();
});
