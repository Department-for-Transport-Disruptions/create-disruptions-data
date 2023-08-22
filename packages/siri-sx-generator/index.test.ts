import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import Mockdate from "mockdate";
import { describe, expect, it, beforeEach, beforeAll, afterAll } from "vitest";
import formatXml from "xml-formatter";
import { dbResponse, orgId } from "./test/testData";
import { generateSiriSxAndUploadToS3 } from ".";

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
            ddbMock as unknown as DynamoDBDocumentClient,
            "test-table",
            "org-table",
            "test-bucket",
            "abcde-fghij-klmno-pqrst",
            "2023-03-06T12:00:00Z",
        );

        const s3PutCommand = s3Mock.commandCalls(PutObjectCommand)[0].args[0];
        const putData = (s3PutCommand.input.Body as string).replace(/(?:\r\n|\r|\n)/g, "");

        expect(s3PutCommand.input.Key).toBe("1678104000000-unvalidated-siri.xml");
        expect(
            formatXml(putData, {
                collapseContent: true,
            }),
        ).toMatchSnapshot();
    });
});
