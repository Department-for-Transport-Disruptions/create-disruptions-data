import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import * as util from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { mockClient } from "aws-sdk-client-mock";
import Mockdate from "mockdate";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import formatXml from "xml-formatter";
import { generateSiriSxAndUploadToS3 } from ".";
import { dbResponse, dbResponseWithCreationTime, orgId } from "./test/testData";

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

describe("SIRI-SX Generator", () => {
    Mockdate.set("2023-08-17");

    beforeAll(() => {
        process.env.DISRUPTIONS_TABLE_NAME = "test-table";
        process.env.ORGANISATIONS_TABLE_NAME = "org-table";
        process.env.SIRI_SX_UNVALIDATED_BUCKET_NAME = "test-bucket";
        process.env.STAGE = "dev";
    });

    beforeEach(() => {
        ddbMock.reset();
        s3Mock.reset();
        vi.spyOn(util, "fetchAdminAreas").mockResolvedValue([
            { administrativeAreaCode: "082", name: "Area 1", shortName: "A1" },
            { administrativeAreaCode: "002", name: "Area 2", shortName: "A2" },
            { administrativeAreaCode: "051", name: "Area 51", shortName: "A51" },
        ]);
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
            "2023-08-17T00:00:00Z",
        );

        const s3PutSiriCommand = s3Mock.commandCalls(PutObjectCommand)[0].args[0];
        const putData = (s3PutSiriCommand.input.Body as string).replace(/(?:\r\n|\r|\n)/g, "");

        expect(s3PutSiriCommand.input.Key).toBe("1692230400000-unvalidated-siri.xml");
        expect(
            formatXml(putData, {
                collapseContent: true,
            }),
        ).toMatchSnapshot();
    });

    it("correctly generates SIRI-SX XML where creationDate is present", async () => {
        ddbMock.on(ScanCommand).resolves({ Items: dbResponseWithCreationTime });
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
