import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import * as cognito from "@create-disruptions-data/shared-ts/utils/cognito";
import * as dynamo from "@create-disruptions-data/shared-ts/utils/dynamo";
import * as refDataApi from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { mockClient } from "aws-sdk-client-mock";
import { describe, it, vi, beforeAll, beforeEach, afterEach, expect } from "vitest";
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
            ToAddresses: ["test_email@.ac.uk", "test_email@hotmail.com"],
        });
    });

    it("should not send an email when there is no new roadwork", async () => {
        vi.spyOn(refDataApi, "getRecentlyNewRoadworks").mockResolvedValue([]);
        vi.spyOn(cognito, "getUsersByAttributeByOrgIds").mockResolvedValue(null);

        await main();

        expect(sesMock.send.calledOnce).toBeFalsy();
    });
});
