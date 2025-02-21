import { logger } from "@create-disruptions-data/shared-ts/utils/logger";
import { putObject } from "@create-disruptions-data/shared-ts/utils/s3";
import axios from "axios";

export const getBankHolidaysAndUploadToS3 = async (bankHolidaysBucketName: string) => {
    const url = "https://www.gov.uk/bank-holidays.json";
    const response = await axios.get<object>(url, { responseType: "json" });

    if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error(`Did not receive any data from bank holidays url: ${url}`);
    }

    await putObject({
        Bucket: bankHolidaysBucketName,
        Key: "bank-holidays.json",
        ContentType: "application/json",
        Body: JSON.stringify(response.data),
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
