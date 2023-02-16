import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";

const s3Client = new S3Client({ region: "eu-west-2" });

export const main = async (event: S3Event): Promise<void> => {
    const bucketName = event.Records[0].s3.bucket.name || "";
    const objectKey = event.Records[0].s3.object.key || "";

    const params = { Bucket: bucketName, Key: objectKey };
    const response = await s3Client.send(new GetObjectCommand(params));
    const data = response.Body?.toString() || "";

    // eslint-disable-next-line no-console
    console.log("file contents:", data);
};
