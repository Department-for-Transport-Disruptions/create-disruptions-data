import path from "path";
import { fileURLToPath } from "url";
import { expect, test as setup } from "@playwright/test";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env.playwright") });

const publisherFile = "playwright/.auth/publisher.json";

setup("authenticate as publisher", async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto("/login");
    await page.getByLabel("Email address").fill(process.env.PUBLISHER_USERNAME || "");
    await page.getByLabel("Password").fill(process.env.PUBLISHER_PASSWORD || "");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByRole("button", { name: "Create new disruption" })).toBeVisible({
        timeout: 10000,
    });

    // End of authentication steps.

    await page.context().storageState({ path: publisherFile });
});
