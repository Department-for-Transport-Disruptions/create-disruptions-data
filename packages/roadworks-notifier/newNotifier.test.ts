import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import * as cognito from "@create-disruptions-data/shared-ts/utils/cognito";
import * as dynamo from "@create-disruptions-data/shared-ts/utils/dynamo";
import * as refDataApi from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { main } from "./newNotifier";

const sesMock = mockClient(SESClient);

describe("roadWorksCancelledNotification", () => {
    beforeAll(() => {
        process.env.DOMAIN_NAME = "http://localhost:3000";
        process.env.STAGE = "sandbox";
        process.env.ORGANISATIONS_TABLE_NAME = "org-test-table";
    });

    beforeEach(() => {
        sesMock.reset();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should send an email when there is a new roadwork", async () => {
        vi.spyOn(refDataApi, "getRecentlyNewRoadworks").mockResolvedValue([
            {
                permitReferenceNumber: "HZ73101328453-2339467-02",
                highwayAuthoritySwaCode: 4230,
                worksLocationCoordinates: "POINT(380416.24 399082.69)",
                streetName: "FARRINGDON STREET",
                areaName: "",
                proposedStartDateTime: "2023-12-01T00:00:00.000Z",
                proposedEndDateTime: "2023-12-01T00:00:00.000Z",
                actualStartDateTime: "2023-12-01T09:30:00.000Z",
                actualEndDateTime: null,
                workStatus: "Works in progress",
                activityType: "Utility repair and maintenance works",
                permitStatus: "granted",
                town: "SALFORD",
                administrativeAreaCode: "083",
            },
        ]);

        vi.spyOn(dynamo, "getOrgIdsFromDynamoByAdminAreaCodes").mockResolvedValue({
            "242ff2b2-19a0-421f-976f-22905262ebda": ["083"],
        });
        vi.spyOn(cognito, "getUsersByAttributeByOrgIds").mockResolvedValue({
            "242ff2b2-19a0-421f-976f-22905262ebda": {
                emails: ["test_email@.ac.uk", "test_email@hotmail.com"],
                adminAreaCodes: ["083"],
            },
        });

        await main();

        expect(sesMock.send.calledOnce).toBeTruthy();
        expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.Destination).toEqual({
            BccAddresses: ["test_email@.ac.uk", "test_email@hotmail.com"],
        });
    });

    it("should send an email when there is a new roadwork and use ToAddresses when there is only one email", async () => {
        vi.spyOn(refDataApi, "getRecentlyNewRoadworks").mockResolvedValue([
            {
                permitReferenceNumber: "HZ73101328453-2339467-02",
                highwayAuthoritySwaCode: 4230,
                worksLocationCoordinates: "POINT(380416.24 399082.69)",
                streetName: "FARRINGDON STREET",
                areaName: "",
                proposedStartDateTime: "2023-12-01T00:00:00.000Z",
                proposedEndDateTime: "2023-12-01T00:00:00.000Z",
                actualStartDateTime: "2023-12-01T09:30:00.000Z",
                actualEndDateTime: null,
                workStatus: "Works in progress",
                activityType: "Utility repair and maintenance works",
                permitStatus: "granted",
                town: "SALFORD",
                administrativeAreaCode: "083",
            },
        ]);

        vi.spyOn(dynamo, "getOrgIdsFromDynamoByAdminAreaCodes").mockResolvedValue({
            "242ff2b2-19a0-421f-976f-22905262ebda": ["083"],
        });
        vi.spyOn(cognito, "getUsersByAttributeByOrgIds").mockResolvedValue({
            "242ff2b2-19a0-421f-976f-22905262ebda": {
                emails: ["test_email@.ac.uk"],
                adminAreaCodes: ["083"],
            },
        });

        await main();

        expect(sesMock.send.calledOnce).toBeTruthy();
        expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.Destination).toEqual({
            ToAddresses: ["test_email@.ac.uk"],
        });
    });

    it("should not send an email when there is no new roadwork", async () => {
        vi.spyOn(refDataApi, "getRecentlyNewRoadworks").mockResolvedValue([]);
        vi.spyOn(cognito, "getUsersByAttributeByOrgIds").mockResolvedValue(null);

        await main();

        expect(sesMock.send.calledOnce).toBeFalsy();
    });

    it("should send an email when there is a new roadwork and split calls into batches of 50", async () => {
        vi.spyOn(refDataApi, "getRecentlyNewRoadworks").mockResolvedValue([
            {
                permitReferenceNumber: "HZ73101328453-2339467-02",
                highwayAuthoritySwaCode: 4230,
                worksLocationCoordinates: "POINT(380416.24 399082.69)",
                streetName: "FARRINGDON STREET",
                areaName: "",
                proposedStartDateTime: "2023-12-01T00:00:00.000Z",
                proposedEndDateTime: "2023-12-01T00:00:00.000Z",
                actualStartDateTime: "2023-12-01T09:30:00.000Z",
                actualEndDateTime: null,
                workStatus: "Works in progress",
                activityType: "Utility repair and maintenance works",
                permitStatus: "granted",
                town: "SALFORD",
                administrativeAreaCode: "083",
            },
        ]);

        vi.spyOn(dynamo, "getOrgIdsFromDynamoByAdminAreaCodes").mockResolvedValue({
            "242ff2b2-19a0-421f-976f-22905262ebda": ["083"],
        });

        const listOfSixtyEmails: string[] = Array(60)
            .fill("")
            .map(() => "test_email@.ac.uk");

        vi.spyOn(cognito, "getUsersByAttributeByOrgIds").mockResolvedValue({
            "242ff2b2-19a0-421f-976f-22905262ebda": {
                emails: listOfSixtyEmails,
                adminAreaCodes: ["083"],
            },
        });

        await main();

        expect(sesMock.send.calledTwice).toBeTruthy();
        expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.Destination).toEqual({
            BccAddresses: listOfSixtyEmails.slice(0, 50),
        });
        expect(sesMock.commandCalls(SendEmailCommand)[1].args[0].input.Destination).toEqual({
            BccAddresses: listOfSixtyEmails.slice(50, 60),
        });
    });
});
