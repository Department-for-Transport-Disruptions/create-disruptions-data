import { test, Page } from "@playwright/test";
import {
    checkIfOnDashboard,
    checkReviewPage,
    fillConsequenceNetworkPage,
    fillCreateDisruptionPage,
    fillTypeOfConsequencePage,
} from "./utils";

test.use({ storageState: "playwright/.auth/publisher.json" });

test("create network disruption", async ({ page }: { page: Page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    const { disruptionReason } = await fillCreateDisruptionPage(page);
    await fillTypeOfConsequencePage(page, "Network wide");
    const { disruptionsAreas, modeOfTransport } = await fillConsequenceNetworkPage(page);
    await checkReviewPage(page, "Network wide", modeOfTransport, disruptionReason, disruptionsAreas);
    await checkIfOnDashboard(page);
});
