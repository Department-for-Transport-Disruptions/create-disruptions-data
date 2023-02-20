import { GetObjectCommand, S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import { toXML } from "jstoxml";

const s3Client = new S3Client({ region: "eu-west-2" });

const uploadToS3 = async (data: string, filename: string) => {
    // Unique bucket name
    const bucketName = process.env.SIRI_SX_BUCKET_ARN?.replace("arn:aws:s3:::", "") || "";
    // Name for uploaded object
    const keyName = filename;

    const putCommand: PutObjectCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: keyName,
        Body: data,
    });

    await s3Client.send(putCommand);
    console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
};

export const main = async (event: S3Event): Promise<void> => {
    const bucketName = event.Records[0].s3.bucket.name || "";
    const objectKey = event.Records[0].s3.object.key || "";

    const params = { Bucket: bucketName, Key: objectKey };
    const response = await s3Client.send(new GetObjectCommand(params));
    const data = (await response.Body?.transformToString()) || "";
    const config = {
        indent: "    ",
    };

    if (!data) {
        throw Error("No data found");
    }

    const xmlData = toXML(JSON.parse(data), config);

    if (!xmlData) {
        throw Error("Could not generate XML");
    }

    await uploadToS3(xmlData, "siri-generated-xml.xml");
};
