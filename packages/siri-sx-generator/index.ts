import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import { toXML } from "jstoxml";
import { getS3Client, uploadToS3 } from "util/s3Client";

const s3Client = getS3Client();

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

    if(!xmlData){
        throw Error("Could not generate XML");
    }

    await uploadToS3(xmlData, "siri-generated-xml.xml", process.env.SIRI_SX_BUCKET_NAME)
};