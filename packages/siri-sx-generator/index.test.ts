import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { describe, expect, it, beforeEach, beforeAll } from "vitest";
import formatXml from "xml-formatter";
import { ZodError } from "zod";
import { invalidDisruptionJsonExamples, testDisruptionsJson } from "./test/testData";
import { generateSiriSxAndUploadToS3 } from ".";

const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

describe("SIRI-SX Generator", () => {
    beforeAll(() => {
        process.env.TABLE_NAME = "test-table";
        process.env.SIRI_SX_UNVALIDATED_BUCKET_NAME = "test-bucket";
    });

    beforeEach(() => {
        ddbMock.reset();
        s3Mock.reset();
    });

    it("correctly generates SIRI-SX XML", async () => {
        ddbMock.on(ScanCommand).resolves({ Items: testDisruptionsJson });

        await generateSiriSxAndUploadToS3(
            s3Mock as unknown as S3Client,
            ddbMock as unknown as DynamoDBDocumentClient,
            "test-table",
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

    it.each(invalidDisruptionJsonExamples)("handles invalid disruptions JSON - %s", async (_description, input) => {
        ddbMock.on(ScanCommand).resolves({ Items: [input] });

        await expect(
            generateSiriSxAndUploadToS3(
                s3Mock as unknown as S3Client,
                ddbMock as unknown as DynamoDBDocumentClient,
                "test-table",
                "test-bucket",
                "abcde-fghij-klmno-pqrst",
                "2023-03-06T12:00:00Z",
            ),
        ).rejects.toThrowError(ZodError);

        await expect(
            generateSiriSxAndUploadToS3(
                s3Mock as unknown as S3Client,
                ddbMock as unknown as DynamoDBDocumentClient,
                "test-table",
                "test-bucket",
                "abcde-fghij-klmno-pqrst",
                "2023-03-06T12:00:00Z",
            ),
        ).rejects.toThrowErrorMatchingSnapshot();
    });
});
