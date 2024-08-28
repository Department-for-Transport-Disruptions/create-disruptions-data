import { test, Page } from "@playwright/test";
import {
    checkIfOnDashboard,
    checkReviewPage,
    fillConsequenceNetworkPage,
    fillConsequenceOperatorPage,
    fillCreateDisruptionPage,
    fillTypeOfConsequencePage,
} from "./utils";

test.use({ storageState: "playwright/.auth/publisher.json" });

test("create network disruption", async ({ page }: { page: Page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    const { disruptionReason } = await fillCreateDisruptionPage(page, "Consequence Network Disruption");
    await fillTypeOfConsequencePage(page, "Network wide");
    const { disruptionsAreas, modeOfTransport } = await fillConsequenceNetworkPage(page);
    await checkReviewPage(page, "Network wide", modeOfTransport, disruptionReason, disruptionsAreas);
    await checkIfOnDashboard(page);
});

test("create operator disruption", async ({ page }: { page: Page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    const { disruptionReason } = await fillCreateDisruptionPage(page, "Consequence Operator Disruption");
    await fillTypeOfConsequencePage(page, "Operator wide");
    const { modeOfTransport, operatorsImpacted } = await fillConsequenceOperatorPage(page);
    await checkReviewPage(page, "Operator wide", modeOfTransport, disruptionReason, "", operatorsImpacted);
    await checkIfOnDashboard(page);
});
