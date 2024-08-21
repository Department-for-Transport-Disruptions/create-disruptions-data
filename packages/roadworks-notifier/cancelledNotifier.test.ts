import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { MiscellaneousReason, PublishStatus } from "@create-disruptions-data/shared-ts/enums";
import * as cognito from "@create-disruptions-data/shared-ts/utils/cognito";
import * as dynamo from "@create-disruptions-data/shared-ts/utils/dynamo";
import * as refDataApi from "@create-disruptions-data/shared-ts/utils/refDataApi";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { main } from "./cancelledNotifier";

const sesMock = mockClient(SESClient);

describe("roadWorksCancelledNotification", () => {
    beforeAll(() => {
        process.env.DISRUPTIONS_TABLE_NAME = "test-table";
        process.env.ORGANISATIONS_TABLE_NAME = "org-test-table";
        process.env.DOMAIN_NAME = "http://localhost:3000";
        process.env.STAGE = "sandbox";
    });

    beforeEach(() => {
        sesMock.reset();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("should send an email when there is a cancelled roadwork", async () => {
        vi.spyOn(refDataApi, "getRecentlyCancelledRoadworks").mockResolvedValue([
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
                workStatus: "Works cancelled",
                activityType: "Utility repair and maintenance works",
                permitStatus: "cancelled",
                town: "SALFORD",
                administrativeAreaCode: "083",
            },
        ]);

        vi.spyOn(dynamo, "getDisruptionsWithRoadworks").mockResolvedValue([
            {
                id: "d29b9753-d804-4912-9b90-07100ff35cfd",
                disruptionType: "unplanned",
                summary: "Farringdon Street - Utility repair and maintenance works",
                description: "oh no ",
                associatedLink: "",
                disruptionReason: MiscellaneousReason.roadworks,
                publishStartDate: "01/12/2023",
                publishStartTime: "0930",
                publishEndDate: "",
                publishEndTime: "",
                disruptionStartDate: "01/12/2023",
                disruptionStartTime: "0930",
                disruptionEndDate: "",
                disruptionEndTime: "",
                disruptionNoEndDateTime: "true",
                disruptionRepeats: "doesntRepeat",
                disruptionRepeatsEndDate: "",
                validity: [],
                displayId: "a10807",
                orgId: "242ff2b2-19a0-421f-976f-22905262ebda",
                creationTime: "2024-02-07T16:12:17.370Z",
                permitReferenceNumber: "HZ73101328453-2339467-02",
                consequences: [],
                publishStatus: PublishStatus.published,
                template: false,
                lastUpdated: "2024-02-07T16:12:17.370Z",
                history: [],
            },
        ]);

        vi.spyOn(cognito, "getAllUsersEmailsInGroups").mockResolvedValue([
            {
                email: "test_email@.ac.uk",
                orgId: "242ff2b2-19a0-421f-976f-22905262ebda",
            },
            {
                email: "test_email@hotmail.com",
                orgId: "242ff2b2-19a0-421f-976f-22905262ebda",
            },
        ]);

        await main();

        expect(sesMock.send.calledOnce).toBeTruthy();
        expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.Destination).toEqual({
            BccAddresses: ["test_email@.ac.uk", "test_email@hotmail.com"],
        });
    });

    it("should send an email when there is a cancelled roadwork and use ToAddresses when there is only one email", async () => {
        vi.spyOn(refDataApi, "getRecentlyCancelledRoadworks").mockResolvedValue([
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
                workStatus: "Works cancelled",
                activityType: "Utility repair and maintenance works",
                permitStatus: "cancelled",
                town: "SALFORD",
                administrativeAreaCode: "083",
            },
        ]);

        vi.spyOn(dynamo, "getDisruptionsWithRoadworks").mockResolvedValue([
            {
                id: "d29b9753-d804-4912-9b90-07100ff35cfd",
                disruptionType: "unplanned",
                summary: "Farringdon Street - Utility repair and maintenance works",
                description: "oh no ",
                associatedLink: "",
                disruptionReason: MiscellaneousReason.roadworks,
                publishStartDate: "01/12/2023",
                publishStartTime: "0930",
                publishEndDate: "",
                publishEndTime: "",
                disruptionStartDate: "01/12/2023",
                disruptionStartTime: "0930",
                disruptionEndDate: "",
                disruptionEndTime: "",
                disruptionNoEndDateTime: "true",
                disruptionRepeats: "doesntRepeat",
                disruptionRepeatsEndDate: "",
                validity: [],
                displayId: "a10807",
                orgId: "242ff2b2-19a0-421f-976f-22905262ebda",
                creationTime: "2024-02-07T16:12:17.370Z",
                permitReferenceNumber: "HZ73101328453-2339467-02",
                consequences: [],
                publishStatus: PublishStatus.published,
                template: false,
                lastUpdated: "2024-02-07T16:12:17.370Z",
                history: [],
            },
        ]);

        vi.spyOn(cognito, "getAllUsersEmailsInGroups").mockResolvedValue([
            {
                email: "test_email@.ac.uk",
                orgId: "242ff2b2-19a0-421f-976f-22905262ebda",
            },
        ]);

        await main();

        expect(sesMock.send.calledOnce).toBeTruthy();
        expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.Destination).toEqual({
            ToAddresses: ["test_email@.ac.uk"],
        });
    });

    it("should not send an email when there is no cancelled roadwork", async () => {
        vi.spyOn(refDataApi, "getRecentlyCancelledRoadworks").mockResolvedValue([]);

        vi.spyOn(dynamo, "getDisruptionsWithRoadworks").mockResolvedValue([]);

        vi.spyOn(cognito, "getAllUsersEmailsInGroups").mockResolvedValue([]);

        await main();

        expect(sesMock.send.calledOnce).toBeFalsy();
    });

    it("should send an email when there is a cancelled roadwork and correctly split SES requests into batches of 50", async () => {
        vi.spyOn(refDataApi, "getRecentlyCancelledRoadworks").mockResolvedValue([
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
                workStatus: "Works cancelled",
                activityType: "Utility repair and maintenance works",
                permitStatus: "cancelled",
                town: "SALFORD",
                administrativeAreaCode: "083",
            },
        ]);

        vi.spyOn(dynamo, "getDisruptionsWithRoadworks").mockResolvedValue([
            {
                id: "d29b9753-d804-4912-9b90-07100ff35cfd",
                disruptionType: "unplanned",
                summary: "Farringdon Street - Utility repair and maintenance works",
                description: "oh no ",
                associatedLink: "",
                disruptionReason: MiscellaneousReason.roadworks,
                publishStartDate: "01/12/2023",
                publishStartTime: "0930",
                publishEndDate: "",
                publishEndTime: "",
                disruptionStartDate: "01/12/2023",
                disruptionStartTime: "0930",
                disruptionEndDate: "",
                disruptionEndTime: "",
                disruptionNoEndDateTime: "true",
                disruptionRepeats: "doesntRepeat",
                disruptionRepeatsEndDate: "",
                validity: [],
                displayId: "a10807",
                orgId: "242ff2b2-19a0-421f-976f-22905262ebda",
                creationTime: "2024-02-07T16:12:17.370Z",
                permitReferenceNumber: "HZ73101328453-2339467-02",
                consequences: [],
                publishStatus: PublishStatus.published,
                template: false,
                lastUpdated: "2024-02-07T16:12:17.370Z",
                history: [],
            },
        ]);

        const listOfSixtyUsers: { email: string; orgId: string }[] = Array(60)
            .fill("")
            .map(() => ({
                email: "test_email@.ac.uk",
                orgId: "242ff2b2-19a0-421f-976f-22905262ebda",
            }));

        vi.spyOn(cognito, "getAllUsersEmailsInGroups").mockResolvedValue(listOfSixtyUsers);

        const expectedToAddresses = listOfSixtyUsers.map((user) => user.email);

        await main();

        expect(sesMock.send.calledTwice).toBeTruthy();
        expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.Destination).toEqual({
            BccAddresses: expectedToAddresses.slice(0, 50),
        });
        expect(sesMock.commandCalls(SendEmailCommand)[1].args[0].input.Destination).toEqual({
            BccAddresses: expectedToAddresses.slice(50, 60),
        });
    });
});
