import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Datasource, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { mockClient } from "aws-sdk-client-mock";
import Mockdate from "mockdate";
import { describe, expect, it, beforeEach, beforeAll, afterAll } from "vitest";
import formatXml from "xml-formatter";
import { dbResponse, orgId } from "./test/testData";
import {
    CleanedConsequence,
    generateSiriSxAndUploadToS3,
    getAffectedModesList,
    getAffectedOperatorsList,
    getAffectedServicesCount,
    getAffectedStopsCount,
} from ".";

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

describe("SIRI-SX Generator", () => {
    Mockdate.set("2023-08-17");

    beforeAll(() => {
        process.env.DISRUPTIONS_TABLE_NAME = "test-table";
        process.env.ORGANISATIONS_TABLE_NAME = "org-table";
        process.env.SIRI_SX_UNVALIDATED_BUCKET_NAME = "test-bucket";
    });

    beforeEach(() => {
        ddbMock.reset();
        s3Mock.reset();
    });

    afterAll(() => {
        Mockdate.reset();
    });

    it("correctly generates SIRI-SX XML", async () => {
        ddbMock.on(ScanCommand).resolves({ Items: dbResponse });
        ddbMock.on(GetCommand).resolves({ Item: { PK: orgId, name: "Test Org" } });

        await generateSiriSxAndUploadToS3(
            s3Mock as unknown as S3Client,
            "test-table",
            "org-table",
            "test-bucket",
            "disruptions-json-bucket",
            "disruptions-csv-bucket",
            "abcde-fghij-klmno-pqrst",
            "2023-03-06T12:00:00Z",
        );

        const s3PutSiriCommand = s3Mock.commandCalls(PutObjectCommand)[0].args[0];
        const putData = (s3PutSiriCommand.input.Body as string).replace(/(?:\r\n|\r|\n)/g, "");

        expect(s3PutSiriCommand.input.Key).toBe("1678104000000-unvalidated-siri.xml");
        expect(
            formatXml(putData, {
                collapseContent: true,
            }),
        ).toMatchSnapshot();
    });

    it("correctly generates Disruptions JSON", async () => {
        ddbMock.on(ScanCommand).resolves({ Items: dbResponse });
        ddbMock.on(GetCommand).resolves({ Item: { PK: orgId, name: "Test Org" } });

        await generateSiriSxAndUploadToS3(
            s3Mock as unknown as S3Client,
            "test-table",
            "org-table",
            "test-bucket",
            "disruptions-json-bucket",
            "disruptions-csv-bucket",
            "abcde-fghij-klmno-pqrst",
            "2023-03-06T12:00:00Z",
        );

        const s3PutJsonCommand = s3Mock.commandCalls(PutObjectCommand)[1].args[0];
        const putData = s3PutJsonCommand.input.Body as string;

        expect(s3PutJsonCommand.input.Key).toBe("disruptions.json");
        expect(JSON.parse(putData)).toMatchSnapshot();
    });

    it("correctly generates Disruptions CSV", async () => {
        ddbMock.on(ScanCommand).resolves({ Items: dbResponse });
        ddbMock.on(GetCommand).resolves({ Item: { PK: orgId, name: "Test Org" } });

        await generateSiriSxAndUploadToS3(
            s3Mock as unknown as S3Client,
            "test-table",
            "org-table",
            "test-bucket",
            "disruptions-json-bucket",
            "disruptions-csv-bucket",
            "abcde-fghij-klmno-pqrst",
            "2023-03-06T12:00:00Z",
        );

        const s3PutCsvCommand = s3Mock.commandCalls(PutObjectCommand)[2].args[0];
        const putData = s3PutCsvCommand.input.Body as string;

        expect(s3PutCsvCommand.input.Key).toBe("disruptions.csv");
        expect(putData).toMatchSnapshot();
    });
});

const testConsequnces: CleanedConsequence[] = [
    {
        consequenceType: "operatorWide",
        description: "Test operator consequence 1",
        vehicleMode: VehicleMode.bus,
        consequenceOperators: [
            {
                operatorNoc: "NOC1",
                operatorPublicName: "Operator 1",
            },
            {
                operatorNoc: "NOC2",
                operatorPublicName: "Operator 2",
            },
        ],
        disruptionDelay: undefined,
        disruptionSeverity: Severity.normal,
        removeFromJourneyPlanners: "no",
    },
    {
        consequenceType: "networkWide",
        description: "Test network consequence 1",
        vehicleMode: VehicleMode.tram,
        disruptionDelay: "20",
        disruptionSeverity: Severity.severe,
        removeFromJourneyPlanners: "no",
    },
    {
        consequenceType: "operatorWide",
        description: "Test operator consequence 2",
        vehicleMode: VehicleMode.rail,
        consequenceOperators: [
            {
                operatorNoc: "NOC2",
                operatorPublicName: "Operator 2",
            },
            {
                operatorNoc: "NOC3",
                operatorPublicName: "Operator 3",
            },
        ],
        disruptionDelay: undefined,
        disruptionSeverity: Severity.normal,
        removeFromJourneyPlanners: "yes",
    },
    {
        consequenceType: "services",
        description: "Test services consequence 1",
        vehicleMode: VehicleMode.ferryService,
        disruptionDelay: "20",
        disruptionSeverity: Severity.slight,
        removeFromJourneyPlanners: "no",
        disruptionDirection: "allDirections",
        services: [
            {
                id: 1,
                dataSource: Datasource.bods,
                destination: "Test dest",
                startDate: "2023-10-01",
                endDate: "2024-02-03",
                lineId: "line1",
                lineName: "Line 1",
                nocCode: "NOC3",
                operatorShortName: "Op",
                origin: "Leeds",
                serviceCode: "code1",
            },
            {
                id: 2,
                dataSource: Datasource.tnds,
                destination: "Test dest 2",
                startDate: "2022-09-11",
                endDate: "2023-12-05",
                lineId: "line2",
                lineName: "Line 2",
                nocCode: "NOC4",
                operatorShortName: "Op2",
                origin: "Manchester",
                serviceCode: "code2",
            },
            {
                id: 2,
                dataSource: Datasource.tnds,
                destination: "Test dest 2",
                startDate: "2022-09-11",
                endDate: "2023-12-05",
                lineId: "line2",
                lineName: "Line 2",
                nocCode: "NOC4",
                operatorShortName: "Op2",
                origin: "Manchester",
                serviceCode: "code2",
            },
        ],
        stops: [
            {
                atcoCode: "ATCO1",
                commonName: "Stop1",
                latitude: -1.234,
                longitude: 1.234,
            },
        ],
    },
    {
        consequenceType: "stops",
        description: "Test stops consequence 1",
        vehicleMode: VehicleMode.bus,
        stops: [
            {
                atcoCode: "ATCO1",
                commonName: "Stop1",
                latitude: -1.234,
                longitude: 1.234,
            },
            {
                atcoCode: "ATCO2",
                commonName: "Stop2",
                latitude: -1.234,
                longitude: 1.234,
            },
            {
                atcoCode: "ATCO3",
                commonName: "Stop3",
                latitude: -1.234,
                longitude: 1.234,
            },
        ],
        disruptionDelay: undefined,
        disruptionSeverity: Severity.normal,
        removeFromJourneyPlanners: "yes",
    },
];

describe("getAffectedModesList", () => {
    it("correctly concatenates all modes", () => {
        expect(getAffectedModesList(testConsequnces)).toBe("bus;tram;rail;ferryService");
    });
});

describe("getAffectedOperatorsList", () => {
    it("correctly concatenates all operators", () => {
        expect(getAffectedOperatorsList(testConsequnces)).toBe("NOC1;NOC2;NOC3");
    });
});

describe("getAffectedServicesCount", () => {
    it("correctly counts all services", () => {
        expect(getAffectedServicesCount(testConsequnces)).toBe(2);
    });
});

describe("getAffectedStopsCount", () => {
    it("correctly counts all stops", () => {
        expect(getAffectedStopsCount(testConsequnces)).toBe(3);
    });
});
