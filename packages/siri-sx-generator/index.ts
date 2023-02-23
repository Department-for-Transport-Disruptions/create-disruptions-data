import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import { toXML } from "jstoxml";
import { getS3Client, uploadToS3 } from "./util/s3Client";
import xmlFormat from "xml-formatter";

const s3Client = getS3Client();

export const main = async (event: S3Event): Promise<void> => {
    const bucketName = event.Records[0].s3.bucket.name || "";
    const objectKey = event.Records[0].s3.object.key || "";

    const params = { Bucket: bucketName, Key: objectKey };
    const response = await s3Client.send(new GetObjectCommand(params));
    const data = await response.Body?.transformToString();
    const config = {
        indent: "    ",
    };

    if (!data) {
        throw Error("No data found");
    }

    let xmlData = toXML(JSON.parse(data), config);

    if (!xmlData) {
        throw Error("Could not generate XML");
    } else {
        xmlData = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Siri version="2.0" xmlns="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.siri.org.uk/siri http://www.siri.org.uk/schema/2.0/xsd/siri.xsd">
        <ServiceDelivery srsName="">${xmlData}</ServiceDelivery></Siri>`;
    }

    await uploadToS3(xmlFormat(xmlData), "siri-generated-xml.xml", process.env.SIRI_SX_UNVALIDATED_BUCKET_NAME);
};
