import {
    MiscellaneousReason,
    Progress,
    ServiceDelivery,
    SourceType,
} from "@create-disruptions-data/shared-ts/siriTypes";
import { uploadToS3 } from "../util/s3Client";

export const jsonData: ServiceDelivery = {
    ResponseTimestamp: "2021-05-11T08:51:07.016Z",
    ProducerRef: "TransportAPI",
    ResponseMessageIdentifier: "c6e04baf-fcf4-4d20-91b2-56c28910feb2",
    SituationExchangeDelivery: {
        ResponseTimestamp: "2021-05-11T08:51:07.016Z",
        Situations: {
            PtSituationElement: [
                {
                    CreationTime: "2020-05-01T08:45:58Z",
                    ParticipantRef: "ItoWorld",
                    SituationNumber: "RGlzcnVwdGlvbk5vZGU6MTA3MTQ=",
                    Version: 1,
                    Source: {
                        SourceType: SourceType.feed,
                        TimeOfCommunication: "2021-05-11T08:49:28Z",
                    },
                    Progress: Progress.open,
                    ValidityPeriod: [
                        {
                            StartTime: "2020-05-03T23:00:00Z",
                        },
                    ],
                    PublicationWindow: {
                        StartTime: "2020-04-30T23:00:00Z",
                    },
                    MiscellaneousReason: MiscellaneousReason.routeDiversion,
                    Planned: true,
                    Summary: "Burtonhead Road (St Helens)",
                    Description:
                        "Burtonhead Road will be closed (northbound), between Milverny Way and the Recycling Centre, from Monday 4 May 2020 until further notice.",
                    InfoLinks: {
                        InfoLink: [
                            {
                                Uri: "https://www.merseytravel.gov.uk/travel-updates/burtonhead-road-(st-helens)/",
                            },
                        ],
                    },
                },
            ],
        },
    },
};

const stageName = process.argv.slice(2);

if (!stageName) {
    // eslint-disable-next-line no-console
    console.log("Please provide Serverless Stack Stage name.");
    process.exit(0);
}

uploadToS3(JSON.stringify(jsonData), "s3-upload.json", `cdd-disruptions-json-${stageName[0]}`).catch((e) =>
    // eslint-disable-next-line no-console
    console.error(e),
);
