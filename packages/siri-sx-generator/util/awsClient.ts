import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const getDdbClient = (): DynamoDBClient => new DynamoDBClient({ region: "eu-west-2" });

export const getDdbDocumentClient = (ddbClient = getDdbClient()): DynamoDBDocumentClient =>
    DynamoDBDocumentClient.from(ddbClient);

export const getS3Client = (): S3Client => new S3Client({ region: "eu-west-2" });

export const uploadToS3 = async (s3Client: S3Client, data: string, keyName: string, bucketName: string | undefined) => {
    if (!bucketName) {
        throw Error("No bucket name provided");
    }

    const putCommand: PutObjectCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: keyName,
        Body: data,
    });

    await s3Client.send(putCommand);
    // eslint-disable-next-line no-console
    console.log(`Successfully uploaded data to ${bucketName}/${keyName}`);
};
