import { test } from "@playwright/test";
import {
    checkIfOnDashboard,
    checkReviewPage,
    fillConsequenceJourneysPage,
    fillConsequenceNetworkPage,
    fillConsequenceOperatorPage,
    fillConsequenceServicePage,
    fillConsequenceStopsPage,
    fillCreateDisruptionPage,
    fillTypeOfConsequencePage,
} from "./utils";

test.use({ storageState: "playwright/.auth/publisher.json" });

test("create network disruption", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    const { disruptionReason } = await fillCreateDisruptionPage(page, "Consequence Network Disruption");
    await fillTypeOfConsequencePage(page, "Network wide");
    const { disruptionsAreas, modeOfTransport } = await fillConsequenceNetworkPage(page);
    await checkReviewPage(page, "Network wide", modeOfTransport, disruptionReason, disruptionsAreas);
    await checkIfOnDashboard(page);
});

test("create operator disruption", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    const { disruptionReason } = await fillCreateDisruptionPage(page, "Consequence Operator Disruption");
    await fillTypeOfConsequencePage(page, "Operator wide");
    const { modeOfTransport, operatorsImpacted } = await fillConsequenceOperatorPage(page);
    await checkReviewPage(page, "Operator wide", modeOfTransport, disruptionReason, "", operatorsImpacted);
    await checkIfOnDashboard(page);
});

test("create service disruption", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    const { disruptionReason } = await fillCreateDisruptionPage(page, "Consequence Service Disruption");
    await fillTypeOfConsequencePage(page, "Services");
    const { modeOfTransport, servicesImpacted, stops } = await fillConsequenceServicePage(page);
    await checkReviewPage(page, "Services", modeOfTransport, disruptionReason, "", "", servicesImpacted, stops);
    await checkIfOnDashboard(page);
});

test("create stop disruption", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    const { disruptionReason } = await fillCreateDisruptionPage(page, "Consequence Stop Disruption");
    await fillTypeOfConsequencePage(page, "Stops");
    const { modeOfTransport, stops } = await fillConsequenceStopsPage(page);
    await checkReviewPage(page, "Stops", modeOfTransport, disruptionReason, "", "", "", stops);
    await checkIfOnDashboard(page);
});

test("create journey disruption", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    const { disruptionReason } = await fillCreateDisruptionPage(page, "Consequence Journey Disruption");
    await fillTypeOfConsequencePage(page, "Journeys");
    const { modeOfTransport, servicesImpacted, journeys } = await fillConsequenceJourneysPage(page);
    await checkReviewPage(page, "Journeys", modeOfTransport, disruptionReason, "", "", servicesImpacted, "", journeys);
    await checkIfOnDashboard(page);
});
