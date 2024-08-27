import { expect, test, Page, ElementHandle, Locator } from "@playwright/test";

test.use({ storageState: "playwright/.auth/publisher.json" });

const clickSaveAndContinue = async (page: Page) => {
    await page.getByRole("button", { name: "Save and continue" }).click();
};

type CheckboxElement = ElementHandle<HTMLInputElement>;
const randomlySelectCheckboxes = async (page: Page, idPrefix: string): Promise<string[]> => {
    const checkboxes = await page.$$(`[id^="${idPrefix}"]`);

    if (checkboxes.length === 0) {
        throw new Error(`No checkboxes found with ID starting with '${idPrefix}'.`);
    }

    const selectedValues: string[] = [];

    // Randomly decide whether to select one, some, or all checkboxes
    const randomChoice = Math.floor(Math.random() * 3); // 0: select one, 1: select some, 2: select all

    if (randomChoice === 0) {
        // Ensure one random checkbox is selected
        const randomIndex = Math.floor(Math.random() * checkboxes.length);
        const checkbox = checkboxes[randomIndex];
        await checkbox.click();

        const value = await page.evaluate((el: CheckboxElement) => el.getAttribute("value"), checkbox);
        if (value) selectedValues.push(value);
    } else if (randomChoice === 1) {
        // Select some random checkboxes (between 1 and all)
        const numberOfCheckboxesToSelect = Math.max(1, Math.floor(Math.random() * checkboxes.length));
        const selectedIndexes = new Set<number>();

        while (selectedIndexes.size < numberOfCheckboxesToSelect) {
            const randomIndex = Math.floor(Math.random() * checkboxes.length);
            if (!selectedIndexes.has(randomIndex)) {
                selectedIndexes.add(randomIndex);
                const checkbox = checkboxes[randomIndex];
                await checkbox.click();

                const value = await page.evaluate((el: CheckboxElement) => el.getAttribute("value"), checkbox);
                if (value) selectedValues.push(value);
            }
        }
    } else {
        // Select all checkboxes
        for (const checkbox of checkboxes) {
            await checkbox.click();

            const value = await page.evaluate((el: CheckboxElement) => el.getAttribute("value"), checkbox);
            if (value) selectedValues.push(value);
        }
    }

    return selectedValues;
};

const findSummaryListElementByHeader = async (page: Page, header: string): Promise<Locator> => {
    const locator = page.locator(`dt.govuk-summary-list__key:has-text("${header}")`);

    await locator.first().waitFor({ state: "attached" });

    return locator;
};

const findSummaryListElementByValue = async (page: Page, value: string): Promise<Locator> => {
    const locator = page.locator(`dd.govuk-summary-list__value:has-text("${value}")`);

    await locator.first().waitFor({ state: "attached" });

    return locator;
};

const fillCreateDisruptionPage = async (page: Page) => {
    await page.getByLabel("Planned", { exact: true }).click();
    await page.getByLabel("Summary", { exact: true }).fill("Test");
    await page.getByLabel("Description", { exact: true }).fill("Test");
    const disruptionReason = await randomlySelectOptionByLabel(page, "Reason for disruption");
    await page.getByLabel("Start date", { exact: true }).fill("21/08/2024");
    await page.getByLabel("Start time", { exact: true }).fill("1200");

    await page.getByLabel("No end date/time", { exact: true }).click();

    await expect(page.getByLabel("End date", { exact: true })).toBeDisabled();
    await expect(page.getByLabel("End time", { exact: true })).toBeDisabled();

    await clickSaveAndContinue(page);

    return { disruptionReason };
};

const fillTypeOfConsequencePage = async (page: Page, consequenceType: string) => {
    await page.getByLabel(consequenceType, { exact: true }).click();
    await clickSaveAndContinue(page);
};

async function randomlySelectOptionByLabel(page: Page, label: string): Promise<string> {
    const selectElement = page.getByLabel(label, { exact: true });
    const options = await selectElement.locator("option").all();

    if (options.length === 0) {
        throw new Error(`No options found for dropdown labeled '${label}'.`);
    }

    const randomIndex = Math.floor(Math.random() * options.length);
    const randomOptionText = await options[randomIndex].textContent();

    if (!randomOptionText) {
        throw new Error("The randomly selected option does not have any text.");
    }

    await selectElement.selectOption({ label: randomOptionText.trim() });

    return randomOptionText.trim();
}

const checkReviewPage = async (
    page: Page,
    disruptionsAreas: string,
    modeOfTransport: string,
    disruptionReason: string,
) => {
    await page.waitForTimeout(1000);

    const consequenceDisruptionReasonHeader = await findSummaryListElementByHeader(page, "Reason for disruption");
    await expect(consequenceDisruptionReasonHeader).toHaveText("Reason for disruption");
    const consequenceDisruptionReasonValue = await findSummaryListElementByValue(page, disruptionReason);
    await expect(consequenceDisruptionReasonValue).toHaveText(disruptionReason);

    await page.locator(".govuk-accordion__show-all").first().click();

    const consequenceTypeHeader = await findSummaryListElementByHeader(page, "Consequence type");
    await expect(consequenceTypeHeader).toHaveText("Consequence type");
    const consequenceTypeValue = await findSummaryListElementByValue(page, "Network wide");
    await expect(consequenceTypeValue).toHaveText("Network wide");

    const consequenceModeOfTransportHeader = await findSummaryListElementByHeader(page, "Mode of transport");
    await expect(consequenceModeOfTransportHeader).toHaveText("Mode of transport");
    const consequenceModeOfTransportValue = await findSummaryListElementByValue(page, modeOfTransport);
    await expect(consequenceModeOfTransportValue).toHaveText(modeOfTransport);

    const consequenceDisruptionsAreasHeader = await findSummaryListElementByHeader(page, "Disruption Area");
    await expect(consequenceDisruptionsAreasHeader).toHaveText("Disruption Area");
    const consequenceDisruptionsAreasValue = await findSummaryListElementByValue(page, disruptionsAreas);
    await expect(consequenceDisruptionsAreasValue).toHaveText(disruptionsAreas);

    await page.getByRole("button", { name: "Publish disruption" }).click();
};

const checkIfOnDashboard = async (page: Page) => {
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    expect(currentUrl).toContain("/dashboard");
};

const fillConsequenceNetworkPage = async (page: Page) => {
    const disruptionsAreas = await randomlySelectCheckboxes(page, "disruption-area-");
    const modeOfTransport = await randomlySelectOptionByLabel(page, "Mode of transport");
    await page.getByLabel("Consequence description", { exact: true }).fill("Test");
    await page.getByLabel("No", { exact: true }).click();
    const disruptionSeverity = await randomlySelectOptionByLabel(page, "Disruption severity");
    await clickSaveAndContinue(page);
    return { disruptionsAreas: disruptionsAreas.join(","), modeOfTransport, disruptionSeverity };
};

test("create network disruption", async ({ page }: { page: Page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Create new disruption" }).click();

    const { disruptionReason } = await fillCreateDisruptionPage(page);
    await fillTypeOfConsequencePage(page, "Network wide");
    const { disruptionsAreas, modeOfTransport } = await fillConsequenceNetworkPage(page);
    await checkReviewPage(page, disruptionsAreas, modeOfTransport, disruptionReason);
    await checkIfOnDashboard(page);
});
