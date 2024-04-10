import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Logger } from ".";

const s3 = new S3Client({ region: "eu-west-2" });

export const getObject = async (bucket: string, key: string, logger: Logger): Promise<string | null> => {
    logger.info("Getting item from S3");

    try {
        const input = {
            Bucket: bucket,
            Key: key,
        };
        const command = new GetObjectCommand(input);
        const response = await s3.send(command);
        return (await response.Body?.transformToString()) ?? null;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get item from s3: ${error.stack || ""}`);
        }

        throw error;
    }
};
