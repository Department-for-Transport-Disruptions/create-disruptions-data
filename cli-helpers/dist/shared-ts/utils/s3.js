import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: "eu-west-2" });
export const getObject = async (bucket, key, logger) => {
    logger.info("Getting item from S3");
    try {
        const input = {
            Bucket: bucket,
            Key: key,
        };
        const command = new GetObjectCommand(input);
        const response = await s3.send(command);
        return (await response.Body?.transformToString()) ?? null;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get item from s3: ${error.stack || ""}`);
        }
        throw error;
    }
};
