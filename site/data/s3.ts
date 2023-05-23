import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import logger from "../utils/logger";

const s3 = new S3Client({ region: "eu-west-2" });

export const putItem = async (
    bucket: string,
    key: string,
    body: string | Blob | Uint8Array | Buffer,
): Promise<void> => {
    logger.info("", {
        context: "data.s3",
        message: "uploading item to s3",
    });

    try {
        const input = {
            Body: body,
            Bucket: bucket,
            Key: key,
        };
        const command = new PutObjectCommand(input);
        await s3.send(command);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to put item into s3: ${error.stack || ""}`);
        }

        throw error;
    }
};
