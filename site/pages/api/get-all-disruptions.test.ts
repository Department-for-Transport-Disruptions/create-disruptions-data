import { MiscellaneousReason, PublishStatus, Severity, VehicleMode } from "@create-disruptions-data/shared-ts/enums";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { randomUUID } from "crypto";
import getAllDisruptions, { formatSortedDisruption } from "./get-all-disruptions.api";
import * as dynamo from "../../data/dynamo";
import { Disruption } from "../../schemas/disruption.schema";
import { getMockRequestAndResponse, mockSession, sortedDisruption } from "../../testData/mockData";
import * as utils from "../../utils";
import * as session from "../../utils/apiUtils/auth";

describe("getAllDisruptions", () => {
    const writeHeadMock = vi.fn();

    vi.mock("../../data/dynamo", () => ({
        getDisruptionsDataFromDynamo: vi.fn(),
    }));

    const getDisruptionsDataFromDynamoSpy = vi.spyOn(dynamo, "getDisruptionsDataFromDynamo");
    const sortDisruptionsByStartDateSpy = vi.spyOn(utils, "sortDisruptionsByStartDate");
    const getSessionSpy = vi.spyOn(session, "getSession");

    beforeEach(() => {
        getSessionSpy.mockImplementation(() => {
            return mockSession;
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    const disruptions: Disruption[] = [
        {
            associatedLink: "",
            consequences: [
                {
                    consequenceIndex: 0,
                    consequenceType: "networkWide",
                    description: "testpending81",
                    disruptionDelay: "",
                    disruptionId: "00831a54-0ecb-4b0c-8d73-310888968747",
                    disruptionSeverity: Severity.unknown,
                    removeFromJourneyPlanners: "no",
                    vehicleMode: VehicleMode.bus,
                },
            ],
            description: "testpending81",
            displayId: "415351",
            disruptionId: "00831a54-0ecb-4b0c-8d73-310888968747",
            disruptionNoEndDateTime: "true",
            disruptionReason: MiscellaneousReason.accident,
            disruptionRepeats: "doesntRepeat",
            disruptionRepeatsEndDate: "",
            disruptionStartDate: "07/03/2023",
            disruptionStartTime: "1000",
            disruptionType: "planned",
            publishStartDate: "07/03/2023",
            publishStartTime: "1000",
            publishStatus: PublishStatus.draft,
            socialMediaPosts: [],
            summary: "testpending81",
            validity: [],
        },
        {
            associatedLink: "",
            consequences: [
                {
                    consequenceIndex: 0,
                    consequenceType: "networkWide",
                    description: "testfilter3",
                    disruptionDelay: "",
                    disruptionId: "01b15519-41b5-4ace-a212-5331a1622771",
                    disruptionSeverity: Severity.unknown,
                    removeFromJourneyPlanners: "no",
                    vehicleMode: VehicleMode.bus,
                },
            ],
            description: "testfilter3",
            displayId: "124b84",
            disruptionId: "01b15519-41b5-4ace-a212-5331a1622771",
            disruptionNoEndDateTime: "true",
            disruptionReason: MiscellaneousReason.accident,
            disruptionRepeats: "doesntRepeat",
            disruptionRepeatsEndDate: "",
            disruptionStartDate: "08/03/2023",
            disruptionStartTime: "1000",
            disruptionType: "planned",
            publishStartDate: "07/03/2023",
            publishStartTime: "1000",
            publishStatus: PublishStatus.published,
            socialMediaPosts: [],
            summary: "testfilter3",
            validity: [],
        },
    ];

    it("should be successful when session is set", async () => {
        getDisruptionsDataFromDynamoSpy.mockResolvedValue(disruptions);

        const { req, res } = getMockRequestAndResponse({
            query: {
                orgId: randomUUID(),
            },
            mockWriteHeadFn: writeHeadMock,
        });

        res.status = vi.fn().mockImplementation(() => ({
            json: vi.fn(),
        }));

        await getAllDisruptions(req, res);

        expect(getDisruptionsDataFromDynamoSpy).toHaveBeenCalledOnce();
        expect(sortDisruptionsByStartDateSpy).toHaveBeenCalledOnce();

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should redirect to error page when no session set", async () => {
        getSessionSpy.mockReturnValue(null);

        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        res.status = vi.fn().mockImplementation(() => ({
            json: vi.fn(),
        }));

        await getAllDisruptions(req, res);

        expect(getDisruptionsDataFromDynamoSpy).not.toHaveBeenCalledOnce();
        expect(sortDisruptionsByStartDateSpy).not.toHaveBeenCalledOnce();

        expect(res.status).toHaveBeenCalledWith(403);
    });

    describe("formatSortedDisruptions", () => {
        it("correctly formats disruptions", () => {
            const formatted = formatSortedDisruption(sortedDisruption);

            expect(formatted).toMatchSnapshot();
        });
    });
});