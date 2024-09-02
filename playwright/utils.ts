import { ElementHandle, Locator, Page, expect } from "@playwright/test";

export const checkIfOnDashboard = async (page: Page) => {
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    expect(currentUrl).toContain("/dashboard");
};

export const clickSaveAndContinue = async (page: Page) => {
    await page.getByRole("button", { name: "Save and continue" }).click();
};

export const findSummaryListElementByHeader = async (page: Page, header: string, exact?: boolean): Promise<Locator> => {
    const locator = exact
        ? page.locator(`dt.govuk-summary-list__key:text-is("${header}")`)
        : page.locator(`dt.govuk-summary-list__key:has-text("${header}")`);

    await locator.first().waitFor({ state: "attached" });

    return locator;
};

export const findSummaryListElementByValue = async (page: Page, value: string): Promise<Locator> => {
    const locator = page.locator(`dd.govuk-summary-list__value:has-text("${value}")`);

    await locator.first().waitFor({ state: "attached" });

    return locator;
};

async function randomlySelectCheckboxes(page: Page, idPrefix: string): Promise<string[]> {
    const checkboxes: ElementHandle<HTMLElement | SVGElement>[] = await page.$$(`[id^="${idPrefix}"]`);

    if (checkboxes.length === 0) {
        throw new Error(`No checkboxes found with ID starting with '${idPrefix}'.`);
    }

    const selectedValues: string[] = [];

    // Randomly decide whether to select all, one, or some checkboxes
    const randomChoice = Math.floor(Math.random() * 3); // 0: select one, 1: select some, 2: select all

    if (randomChoice === 0) {
        // Select one random checkbox
        const randomIndex = Math.floor(Math.random() * checkboxes.length);
        const checkbox = checkboxes[randomIndex];
        await checkbox.click();

        const value = await page.evaluate((el) => el.getAttribute("value"), checkbox);
        if (value) selectedValues.push(value);
    } else if (randomChoice === 1) {
        // Select some random checkboxes (between 1 and all)
        const numberOfCheckboxesToSelect = Math.floor(Math.random() * checkboxes.length) + 1;
        const selectedIndexes = new Set<number>();

        while (selectedIndexes.size < numberOfCheckboxesToSelect) {
            const randomIndex = Math.floor(Math.random() * checkboxes.length);
            if (!selectedIndexes.has(randomIndex)) {
                selectedIndexes.add(randomIndex);
                const checkbox = checkboxes[randomIndex];
                await checkbox.click();

                const value = await page.evaluate((el) => el.getAttribute("value"), checkbox);
                if (value) selectedValues.push(value);
            }
        }
    } else {
        // Select all checkboxes
        for (const checkbox of checkboxes) {
            await checkbox.click();

            const value = await page.evaluate((el) => el.getAttribute("value"), checkbox);
            if (value) selectedValues.push(value);
        }
    }

    return selectedValues;
}

export const randomlySelectOptionByLabel = async (page: Page, label: string): Promise<string> => {
    const selectElement = page.getByLabel(label, { exact: true });
    const options = await selectElement.locator("option").all();

    if (options.length === 0) {
        throw new Error(`No options found for dropdown labeled '${label}'.`);
    }

    const shuffledOptions = options.sort(() => 0.5 - Math.random());

    for (const option of shuffledOptions) {
        const optionValue = await option.getAttribute("value");
        const optionText = await option.textContent();

        if (optionValue && optionValue.trim() !== "") {
            // Select the option if its value is not empty
            await selectElement.selectOption({ value: optionValue.trim() });
            return optionText?.trim() || "";
        }
    }

    throw new Error("All options have empty values.");
};

export const selectSearchFromDropdown = async (page: Page, inputId: string, searchText?: string) => {
    await page.locator(`input[id="${inputId}"]`).click();

    // If searchText is provided, fill the search input with the text
    if (searchText) {
        const searchInputSelector = `input[id="${inputId}"]`;
        await page.locator(searchInputSelector).fill(searchText);
        await page.waitForTimeout(1000);
    }

    // Press Enter to select the first matching option
    await page.locator(`input[id="${inputId}"]`).press("Enter");
};

export const fillCreateDisruptionPage = async (page: Page, disruptionSummary?: string) => {
    await page.getByLabel("Planned", { exact: true }).click();
    await page.getByLabel("Summary", { exact: true }).fill(disruptionSummary || "Test");
    await page.getByLabel("Description", { exact: true }).fill("Test");
    const disruptionReason = await randomlySelectOptionByLabel(page, "Reason for disruption");
    await page.getByLabel("Start date", { exact: true }).fill("21/08/2024");
    await page.getByLabel("Start time", { exact: true }).fill("1200");

    await page.getByLabel("No end date/time", { exact: true }).click();

    await expect(page.getByLabel("End date", { exact: true })).toBeDisabled();
    await expect(page.getByLabel("End time", { exact: true })).toBeDisabled();

    await clickSaveAndContinue(page);

    return { disruptionReason: disruptionReason };
};

export const fillTypeOfConsequencePage = async (page: Page, consequenceType: string) => {
    await page.getByLabel(consequenceType, { exact: true }).click();
    await clickSaveAndContinue(page);
};

export const checkReviewPage = async (
    page: Page,
    consequenceType: string,
    modeOfTransport: string,
    disruptionReason: string,
    disruptionsAreas?: string,
    operatorsImpacted?: string,
    servicesImpacted?: string,
    stops?: string,
    journeys?: string,
) => {
    await page.waitForTimeout(1500);

    const consequenceDisruptionReasonHeader = await findSummaryListElementByHeader(page, "Reason for disruption");
    await expect(consequenceDisruptionReasonHeader).toHaveText("Reason for disruption");
    const consequenceDisruptionReasonValue = await findSummaryListElementByValue(page, disruptionReason);
    const actualText = await consequenceDisruptionReasonValue.textContent();
    const actualTextLower = actualText?.toLowerCase() || "";

    const expectedTextLower = disruptionReason.toLowerCase();

    await expect(actualTextLower).toBe(expectedTextLower);

    await page.locator(".govuk-accordion__show-all").first().click();

    const consequenceTypeHeader = await findSummaryListElementByHeader(page, "Consequence type");
    await expect(consequenceTypeHeader).toHaveText("Consequence type");
    const consequenceTypeValue = await findSummaryListElementByValue(page, consequenceType);
    await expect(consequenceTypeValue).toHaveText(consequenceType);

    const consequenceModeOfTransportHeader = await findSummaryListElementByHeader(page, "Mode of transport");
    await expect(consequenceModeOfTransportHeader).toHaveText("Mode of transport");
    const consequenceModeOfTransportValue = await findSummaryListElementByValue(page, modeOfTransport);
    await expect(consequenceModeOfTransportValue).toHaveText(modeOfTransport);

    if (disruptionsAreas) {
        const consequenceDisruptionsAreasHeader = await findSummaryListElementByHeader(page, "Disruption Area");
        await expect(consequenceDisruptionsAreasHeader).toHaveText("Disruption Area");
        const consequenceDisruptionsAreasValue = await findSummaryListElementByValue(page, disruptionsAreas);
        await expect(consequenceDisruptionsAreasValue).toHaveText(disruptionsAreas);
    }

    if (operatorsImpacted) {
        const consequenceDisruptionsAreasHeader = await findSummaryListElementByHeader(page, "Operators affected");
        await expect(consequenceDisruptionsAreasHeader).toHaveText("Operators affected");
        const consequenceDisruptionsAreasValue = await findSummaryListElementByValue(page, operatorsImpacted);
        await expect(consequenceDisruptionsAreasValue).toHaveText(operatorsImpacted);
    }

    if (servicesImpacted) {
        const consequenceDisruptionsAreasHeader = await findSummaryListElementByHeader(page, "Service(s)");
        await expect(consequenceDisruptionsAreasHeader).toHaveText("Service(s)");
        const consequenceDisruptionsAreasValue = await findSummaryListElementByValue(page, servicesImpacted);
        await expect(consequenceDisruptionsAreasValue).toHaveText(servicesImpacted);
    }

    if (stops) {
        const consequenceDisruptionsAreasHeader = await findSummaryListElementByHeader(page, "Stops affected");
        await expect(consequenceDisruptionsAreasHeader).toHaveText("Stops affected");
        const consequenceDisruptionsAreasValue = await findSummaryListElementByValue(page, stops);
        await expect(consequenceDisruptionsAreasValue).toHaveText(stops);
    }

    if (journeys) {
        const consequenceDisruptionsAreasHeader = await findSummaryListElementByHeader(page, "Journeys", true);
        await expect(consequenceDisruptionsAreasHeader).toHaveText("Journeys");
        const consequenceDisruptionsAreasValue = await findSummaryListElementByValue(page, journeys);
        await expect(consequenceDisruptionsAreasValue).toHaveText(journeys);
    }

    if (consequenceType === "Journeys") {
        const consequenceDisruptionsAreasHeader = await findSummaryListElementByHeader(page, "Cancel Journeys", true);
        await expect(consequenceDisruptionsAreasHeader).toHaveText("Cancel Journeys");
    }

    await page.getByRole("button", { name: "Publish disruption" }).click();
};

export const fillConsequenceNetworkPage = async (page: Page) => {
    const disruptionsAreas = await randomlySelectCheckboxes(page, "disruption-area-");
    const modeOfTransport = await randomlySelectOptionByLabel(page, "Mode of transport");
    await page.getByLabel("Consequence description", { exact: true }).fill("Test");
    await page.getByLabel("No", { exact: true }).click();
    const disruptionSeverity = await randomlySelectOptionByLabel(page, "Disruption severity");
    await clickSaveAndContinue(page);
    return { disruptionsAreas: disruptionsAreas.join(", "), modeOfTransport, disruptionSeverity };
};

export const fillConsequenceOperatorPage = async (page: Page) => {
    await page.getByLabel("Mode of transport", { exact: true }).selectOption("Bus");
    await page.waitForTimeout(1000);
    await selectSearchFromDropdown(page, "operator-search-dropdown-value", "A2BV - A2B Travel");
    await page.getByLabel("Consequence description", { exact: true }).fill("Test");
    await page.getByLabel("No", { exact: true }).click();
    const disruptionSeverity = await randomlySelectOptionByLabel(page, "Disruption severity");
    await clickSaveAndContinue(page);
    return { modeOfTransport: "Bus", disruptionSeverity, operatorsImpacted: "A2BV" };
};

export const fillConsequenceServicePage = async (page: Page) => {
    await page.getByLabel("Mode of transport", { exact: true }).selectOption("Bus");
    await page.waitForTimeout(2000);
    await selectSearchFromDropdown(page, "services-input", "1 - Ashford - Canterbury (Stagecoach)");
    await page.waitForTimeout(1000);
    await page.getByLabel("Consequence description", { exact: true }).fill("Test");
    await page.getByLabel("No", { exact: true }).click();
    const disruptionSeverity = await randomlySelectOptionByLabel(page, "Disruption severity");
    await page.getByLabel("All directions", { exact: true }).click();
    await clickSaveAndContinue(page);
    return {
        modeOfTransport: "Bus",
        disruptionSeverity,
        servicesImpacted: "1 - Ashford - Canterbury (Stagecoach)",
        stops: "",
    };
};

export const fillConsequenceStopsPage = async (page: Page) => {
    await page.getByLabel("Mode of transport", { exact: true }).selectOption("Bus");
    await page.waitForTimeout(2000);
    await selectSearchFromDropdown(page, "stops-input", "2400A043350A");
    await page.waitForTimeout(1000);
    await page.getByLabel("Consequence description", { exact: true }).fill("Test");
    await page.getByLabel("No", { exact: true }).click();
    const disruptionSeverity = await randomlySelectOptionByLabel(page, "Disruption severity");
    await clickSaveAndContinue(page);
    return {
        modeOfTransport: "Bus",
        disruptionSeverity,
        stops: "The Black Robin opp 2400A043350A",
    };
};

export const fillConsequenceJourneysPage = async (page: Page) => {
    await page.getByLabel("Mode of transport", { exact: true }).selectOption("Bus");
    await page.waitForTimeout(2000);
    await selectSearchFromDropdown(page, "services-input", "1 - Ashford - Canterbury (Stagecoach)");
    await page.waitForTimeout(1000);
    await selectSearchFromDropdown(page, "journeys-input", "");
    await page.getByLabel("Consequence description", { exact: true }).fill("Test");
    await page.getByLabel("No", { exact: true }).click();
    const disruptionSeverity = await randomlySelectOptionByLabel(page, "Disruption severity");
    await clickSaveAndContinue(page);
    return {
        modeOfTransport: "Bus",
        disruptionSeverity,
        servicesImpacted: "1 - Ashford - Canterbury (Stagecoach)",
        journeys: "06:50:00 outbound",
    };
};
