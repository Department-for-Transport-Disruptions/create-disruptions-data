import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import { toXML, XmlElement } from "jstoxml";
import * as logger from "lambda-log";
import xmlFormat from "xml-formatter";
import { randomUUID } from "crypto";
import { getS3Client, uploadToS3 } from "./util/s3Client";

const s3Client = getS3Client();

export const main = async (event: S3Event): Promise<void> => {
    logger.options.dev = process.env.NODE_ENV !== "production";
    logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

    logger.options.meta = {
        id: randomUUID(),
    };

    const bucketName = event.Records[0].s3.bucket.name || "";
    const objectKey = event.Records[0].s3.object.key || "";

    logger.info(`Processing JSON input file: ${objectKey}`);
    const params = { Bucket: bucketName, Key: objectKey };

    // Read the file from S3 using GetObject API
    const response = await s3Client.send(new GetObjectCommand(params));

    // Method transformToString is invoked to convert stream data to string
    const data = await response.Body?.transformToString();
    const config = {
        indent: "    ",
    };

    if (!data) {
        throw Error("No data found");
    }

    let xmlData = toXML(JSON.parse(data) as XmlElement, config);

    if (!xmlData) {
        throw Error("Could not generate XML");
    } else {
        xmlData = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Siri version="2.0" xmlns="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.siri.org.uk/siri http://www.siri.org.uk/schema/2.0/xsd/siri.xsd">
        <ServiceDelivery srsName="">${xmlData}</ServiceDelivery></Siri>`;
    }

    await uploadToS3(
        xmlFormat(xmlData),
        `${Date.now()}-unvalidated-siri.xml`,
        process.env.SIRI_SX_UNVALIDATED_BUCKET_NAME,
    );

    logger.info("Unvalidated Siri SX XML created and published to S3");
};
