import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { notEmpty } from "@create-disruptions-data/shared-ts/utils";
import { getLiveDisruptions } from "@create-disruptions-data/shared-ts/utils/db";
import { getServiceCentrePoint } from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { DynamoDBStreamEvent } from "aws-lambda";
import * as logger from "lambda-log";

const s3Client = new S3Client({ region: "eu-west-2" });

const generateDisruptionsAndWriteToS3 = async (orgId: string, disruptionsBucketName: string) => {
    const liveDisruptions = await getLiveDisruptions(orgId);

    const disruptionsFormattedForMap = await Promise.all(
        liveDisruptions.flatMap(async (disruption) => {
            if (!disruption.consequences || disruption.consequences.length === 0) {
                return null;
            }

            const stops = disruption.consequences.flatMap((consequence) => {
                if (consequence.consequenceType === "stops") {
                    return consequence.stops.map((stop) => ({
                        atcoCode: stop.atcoCode,
                        commonName: stop.commonName,
                        bearing: stop.bearing,
                        coordinates: { latitude: stop.latitude, longitude: stop.longitude },
                    }));
                }

                return [];
            });

            const services = await Promise.all(
                disruption.consequences.flatMap((consequence) => {
                    if (consequence.consequenceType === "services") {
                        return consequence.services.map(async (service) => {
                            const serviceCentrePoint = await getServiceCentrePoint(service);

                            return {
                                lineName: service.lineName,
                                destination: service.destination,
                                origin: service.origin,
                                nocCode: service.nocCode,
                                operatorName: service.operatorShortName,
                                coordinates: {
                                    latitude: serviceCentrePoint?.latitude ?? null,
                                    longitude: serviceCentrePoint?.longitude ?? null,
                                },
                            };
                        });
                    }
                    return [];
                }),
            );

            if ((!stops || stops.length === 0) && (!services || services.length === 0)) {
                return null;
            }

            return {
                id: disruption.id,
                disruptionReason: disruption.disruptionReason,
                disruptionStartDate: disruption.disruptionStartDate,
                disruptionStartTime: disruption.disruptionStartTime,
                disruptionEndDate: disruption.disruptionEndDate,
                disruptionEndTime: disruption.disruptionEndTime,
                disruptionNoEndDateTime: disruption.disruptionNoEndDateTime,
                stops: stops,
                services: services,
            };
        }),
    );

    await s3Client.send(
        new PutObjectCommand({
            Bucket: disruptionsBucketName,
            Key: `${orgId}/map-disruptions.json`,
            ContentType: "application/json",
            Body: JSON.stringify(disruptionsFormattedForMap.filter(notEmpty)),
        }),
    );
};

export const main = async (event: DynamoDBStreamEvent) => {
    try {
        logger.options.dev = process.env.NODE_ENV !== "production";
        logger.options.debug = process.env.ENABLE_DEBUG_LOGS === "true" || process.env.NODE_ENV !== "production";

        logger.options.meta = {
            id: randomUUID(),
        };

        const { DISRUPTIONS_TABLE_NAME: disruptionsTableName, ORG_DISRUPTIONS_BUCKET_NAME: orgDisruptionsBucketName } =
            process.env;

        if (!disruptionsTableName || !orgDisruptionsBucketName) {
            throw new Error("Env vars not set");
        }

        logger.info("Starting Org Disruptions Generator...");

        const orgIds = [...new Set(event.Records.map((record) => record.dynamodb?.Keys?.PK?.S).filter(notEmpty))];

        await Promise.all(orgIds.map((id) => generateDisruptionsAndWriteToS3(id, orgDisruptionsBucketName)));
    } catch (e) {
        if (e instanceof Error) {
            logger.error(e);

            throw e;
        }

        throw e;
    }
};
