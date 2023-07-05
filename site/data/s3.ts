import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

export const getItem = async (bucket: string, key: string, originalFilename: string): Promise<string> => {
    logger.info("", {
        context: "data.s3",
        message: "getting item from s3",
    });

    try {
        const input = {
            Bucket: bucket,
            Key: key,
            ResponseContentDisposition: 'attachment; filename ="' + originalFilename + '"',
        };
        const command = new GetObjectCommand(input);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return url;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get item from s3: ${error.stack || ""}`);
        }

        throw error;
    }
};

export const getObject = async (bucket: string, key: string, originalFilename: string): Promise<Uint8Array | null> => {
    logger.info("", {
        context: "data.s3",
        message: "getting item from s3",
    });

    try {
        const input = {
            Bucket: bucket,
            Key: key,
            ResponseContentDisposition: 'attachment; filename ="' + originalFilename + '"',
        };
        const command = new GetObjectCommand(input);
        const response = await s3.send(command);
        return response.Body?.transformToByteArray() ?? null;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get item from s3: ${error.stack || ""}`);
        }

        throw error;
    }
};
