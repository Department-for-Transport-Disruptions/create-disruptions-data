import { S3Event } from "aws-lambda";
import { S3 } from "aws-sdk";

export const main = async (event: S3Event): Promise<void> => {
    const bucketName = event.Records[0].s3.bucket.name || "";
    const objectKey = event.Records[0].s3.object.key || "";

    const s3 = new S3();
    const params = { Bucket: bucketName, Key: objectKey };
    const response = await s3.getObject(params).promise();
    const data = response.Body?.toString("utf-8") || "";

    // eslint-disable-next-line no-console
    console.log("file contents:", data);
};
