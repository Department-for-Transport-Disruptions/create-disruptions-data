import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";
import { describe, it, vi, beforeAll, beforeEach, afterEach, expect } from "vitest";
import * as cognito from "@create-disruptions-data/shared-ts/utils/cognito";
import * as refDataApi from "@create-disruptions-data/shared-ts/utils/refDataApi";

const sesMock = mockClient(SESClient);

describe("roadWorksCancelledNotification", () => {
    beforeAll(() => {
        process.env.DOMAIN_NAME = "http://localhost:3000";
        process.env.STAGE = "sandbox";
    });

    beforeEach(() => {
        sesMock.reset();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("It should send an email when there is a cancelled roadwork", () => {
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
                workStatus: "Works planned",
                activityType: "Utility repair and maintenance works",
                permitStatus: "granted",
                town: "SALFORD",
                administrativeAreaCode: "083",
            },
        ]);

        vi.spyOn(cognito, "getUsersEmailsByAttribute").mockResolvedValue([
            "test_email@.ac.uk",
            "test_email@hotmail.com",
        ]);

        expect(sesMock.send.calledOnce).toBeTruthy();
        expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.Destination).toEqual({
            ToAddresses: ["test_email@.ac.uk", "test_email@hotmail.com"],
        });
    });

    it("It should not send an email when there is no cancelled roadwork", () => {
        vi.spyOn(refDataApi, "getRecentlyNewRoadworks").mockResolvedValue([]);

        vi.spyOn(cognito, "getUsersEmailsByAttribute").mockResolvedValue([]);

        expect(sesMock.send.calledOnce).toBeFalsy();
    });
});
