import { logger } from "@create-disruptions-data/shared-ts/utils/logger";
import { putObject } from "@create-disruptions-data/shared-ts/utils/s3";
import axios from "axios";

interface Event {
    title: string;
    date: string;
    notes: string;
    bunting: boolean;
}

interface Division {
    division: string;
    events: Event[];
}

export interface BankHolidaysJson {
    "england-and-wales": Division;
    scotland: Division;
    "northern-ireland": Division;
}

export const getBankHolidaysAndUploadToS3 = async (bankHolidaysBucketName: string) => {
    const url = "https://www.gov.uk/bank-holidays.json";
    const response = await axios.get<object>(url, { responseType: "json" });

    if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error(`Did not receive any data from bank holidays url: ${url}`);
    }

    const ukBankHolidays = response.data as BankHolidaysJson;

    const mappedScottishHolidays = [...ukBankHolidays.scotland.events].map((holiday) => {
        if (holiday.title === "Summer bank holiday") {
            return {
                ...holiday,
                title: "Scotland Summer bank holiday",
            };
        }
        return holiday;
    });

    const bankHolidays = [...ukBankHolidays["england-and-wales"].events, ...mappedScottishHolidays]
        .filter(
            (value, index, self) => index === self.findIndex((t) => t.date === value.date && t.title === value.title),
        )
        .sort((a, b) => a.date.localeCompare(b.date));

    await putObject({
        Bucket: bankHolidaysBucketName,
        Key: "bank-holidays.json",
        ContentType: "application/json",
        Body: JSON.stringify(bankHolidays),
    });
};

export const main = async () => {
    const { BANK_HOLIDAYS_BUCKET_NAME: bankHolidaysBucketName } = process.env;

    if (!bankHolidaysBucketName) {
        throw new Error("Missing env vars - BANK_HOLIDAYS_BUCKET_NAME must be set");
    }

    try {
        logger.info("Starting retrieval of bank holidays data");

        await getBankHolidaysAndUploadToS3(bankHolidaysBucketName);

        logger.info("Bank Holidays retrieval complete");
    } catch (e) {
        if (e instanceof Error) {
            logger.error("There was an error retrieving Bank Holidays data", e);
        }

        throw e;
    }
};
